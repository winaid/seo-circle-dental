import Link from 'next/link';
import { CLINIC } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { Icon } from './ui';

export const NAV = [
  { label: '진료', href: '/treatment', desc: '자연치아·임플란트·신경치료' },
  { label: '증상', href: '/symptom', desc: '지금 느끼는 불편으로 찾기' },
  { label: '질환', href: '/condition', desc: '병명으로 이해하기' },
  { label: '문답', href: '/qa', desc: '진료실에서 받는 질문' },
  { label: '칼럼', href: '/blog', desc: '원장이 쓰는 글' },
  { label: '지역', href: '/area', desc: '동네별 오시는 길' },
  { label: '병원 소개', href: '/about', desc: '의료진·장비·원칙' },
  { label: '오시는 길', href: '/visit', desc: '진료시간·주차·예약' },
];

export function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  return (
    <header className={`hd${overlay ? ' hd--overlay' : ''}`}>
      <div className="wrap hd-in">
        <Link href="/" className="hd-brand" aria-label="동그라미치과의원 홈">
          <img src={IMG.logo} alt="동그라미치과의원" width={160} height={34} />
          <small>화정치과 · 3호선 화정역</small>
        </Link>
        <nav className="hd-nav" aria-label="주 메뉴">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hd-cta">
          <a className={`btn btn--sm hd-phone ${overlay ? 'btn--white' : 'btn--primary'}`} href={CLINIC.phoneHref}>
            {Icon.phone} {CLINIC.phone}
          </a>
          <details className="hd-menu">
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
          </details>
        </div>
      </div>
    </header>
  );
}
