'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 화면 움직임 두 가지 — 머리말 유리 전환, 스크롤 등장 (2026-09-28 따뜻한 테마, app/theme-warm.css).
 *
 * ★ 검색 재료는 절대 가리지 않는다.
 *   · 대상은 장식 구획뿐(REVEAL). 글 본문(.art-main)·사진 카드 줄(.card-row = 네이버 캐러셀 재료)·히어로는 뺀다.
 *   · 처음 그릴 때 이미 화면 안에 있는 요소는 손대지 않는다 — 깜빡임도, 숨김도 없다.
 *   · 첫 화면 **아래**에 있던 요소만 잠깐 숨겼다가 들어올 때 보여 준다. JS 가 없으면 전부 그냥 보인다.
 *   · 움직임 줄이기 설정·IntersectionObserver 미지원이면 아무것도 안 한다.
 */
const REVEAL = [
  '.sec .sec-head',
  '.sec .grid > *',
  '.why-item',
  '.why-photo',
  '.feature',
  '.team-photo',
  '.team-cards > *',
  '.visit-box',
  '.sec .list-links',
  '.grid > .card',
].join(',');
const SKIP = '.art-main, .card-row, .hero';

export function Motion() {
  const path = usePathname();

  useEffect(() => {
    const hd = document.querySelector('.hd');
    if (!hd) return;
    const on = () => hd.classList.toggle('is-scrolled', window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, [path]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const vh = window.innerHeight;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.remove('rv-pre');
          el.classList.add('rv-in');
          io.unobserve(el);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
    );
    const els = Array.from(document.querySelectorAll<HTMLElement>(REVEAL)).filter((el) => !el.closest(SKIP));
    for (const el of els) {
      if (el.getBoundingClientRect().top < vh * 0.94) continue; // 이미 보이는 것은 그대로
      const i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--rv-d', `${Math.min(i, 5) * 70}ms`);
      el.classList.add('rv-pre');
      io.observe(el);
    }
    return () => {
      io.disconnect();
      for (const el of els) el.classList.remove('rv-pre');
    };
  }, [path]);

  return null;
}
