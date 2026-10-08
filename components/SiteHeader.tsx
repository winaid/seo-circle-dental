import Link from 'next/link';
import { CLINIC } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { Icon } from './ui';

/**
 * ★ 2026-10-08 오후 한 쪽 판(오너: "줄이고 한 페이지로 하라고 한 건데") — 화정역·화정동·덕양구 쪽과 진료·의료진·오시는 길 쪽을 지우고
 *   모두 홈으로 301(lib/focus.ts). 메뉴에는 글 목록만 남는다. 홈은 메뉴를 그리지 않는다(nav=false).
 */
export const NAV = [{ label: '화정치과 이야기', href: '/blog', desc: '진료 전에 읽어 보는 글' }];

/**
 * 홈 바닥 '안내' 칸의 글자(링크 없음) — 홈은 손대지 않는다(10-08 홈 동결: 홈이 다시 읽힐 때마다 통합에서 흔들렸다).
 * 예전 메뉴 이름 그대로라 홈 HTML 이 바뀌지 않는다. 홈을 고칠 때 같이 정리할 것.
 */
export const HOME_FOOTER_LABELS = ['화정역 치과', '화정동 치과', '덕양구 치과', '진료 안내', '의료진', '오시는 길', '이야기'];

/**
 * nav=false 는 홈 전용 — 홈 첫 링크 묶음이 메뉴가 아니라 바로가기 타일이 되게 한다.
 * ★ 실측(2026-09-22): 네이버 웹사이트 결과의 사이트링크가 우리 헤더 메뉴 앞 6개(진료·증상·질환·문답·칼럼·지역)를 글자로 가져갔다.
 *   이미지 띠가 붙은 사이트들(gwanghwamundental.co.kr, blog.hjudh.com, lawcanvas.kr)은 홈에 메뉴 링크 줄이 없거나 1~2개뿐이고
 *   첫 링크가 그림+제목 카드였다. 그래서 홈에서만 메뉴(데스크톱 줄·햄버거 패널)를 DOM 에서 뺀다. 다른 쪽은 그대로.
 */
export function SiteHeader({ overlay = false, nav = true }: { overlay?: boolean; nav?: boolean }) {
  return (
    <header className={`hd${overlay ? ' hd--overlay' : ''}`}>
      <div className="wrap hd-in">
        <Link href="/" className="hd-brand" aria-label="동그라미치과의원 홈">
          <img src={IMG.logo} alt="동그라미치과의원" width={160} height={34} />
          <small>화정치과 · 3호선 화정역</small>
        </Link>
        {nav && (
          <nav className="hd-nav" aria-label="주 메뉴">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="hd-cta">
          <a className={`btn btn--sm hd-phone ${overlay ? 'btn--white' : 'btn--primary'}`} href={CLINIC.phoneHref}>
            {Icon.phone} {CLINIC.phone}
          </a>
          {nav && <details className="hd-menu">
            <summary aria-label="메뉴 열기">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <div className="hd-menu-panel">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}>
                  {n.label}
                  <small>{n.desc}</small>
                </Link>
              ))}
              <hr />
              <a href={CLINIC.phoneHref}>
                전화 {CLINIC.phone}
                <small>화·목 20:30까지</small>
              </a>
              <a href={CLINIC.booking.naver} target="_blank" rel="noopener">
                네이버 예약<small>시간 선택 후 확정</small>
              </a>
            </div>
          </details>}
        </div>
      </div>
    </header>
  );
}
