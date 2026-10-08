import Link from 'next/link';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { TREATMENTS } from '@/lib/treatments';
import { MAIN_SITE_URL } from '@/lib/site';
import { Icon } from './ui';
import { HOME_FOOTER_LABELS, NAV } from './SiteHeader';
import { NotOnHome } from './NotOnHome';

export function SiteFooter() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft-grid">
          <div className="ft-brand">
            <img src={IMG.logo} alt="동그라미치과의원" width={140} height={30} />
            <p>{CLINIC.description}</p>
            <p style={{ marginTop: 12 }}>
              {UNVERIFIED.hours.display.map((d) => `${d.label} ${d.time}`).join(' · ')}
              <br />
              {UNVERIFIED.hours.closed}
            </p>
          </div>
          {/* ★ 2026-10-08 한 쪽 판(lib/focus.ts) — 바닥 링크는 홈과 글 목록뿐. 홈에서는 글자만(홈 첫 링크 묶음 = 카드 6장, components/NotOnHome.tsx) */}
          <div>
            <h4>안내</h4>
            <NotOnHome fallback={<ul>{HOME_FOOTER_LABELS.map((l) => <li key={l}>{l}</li>)}</ul>}>
              <ul>
                <li><Link href="/">화정치과 동그라미치과의원</Link></li>
                {NAV.map((n) => (
                  <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
                ))}
              </ul>
            </NotOnHome>
          </div>
          <div>
            <h4>진료</h4>
            <ul>
              {TREATMENTS.map((t) => (
                <li key={t.slug}>{t.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>병원</h4>
            <ul>
              <li>{CLINIC.address.full}</li>
              <li>전화 {CLINIC.phone}</li>
              <li><a href={MAIN_SITE_URL} target="_blank" rel="noopener">본원 홈페이지</a></li>
              <li><a href={CLINIC.social.naverBlog} target="_blank" rel="noopener">네이버 블로그</a></li>
              <li><a href={CLINIC.social.instagram} target="_blank" rel="noopener">인스타그램</a></li>
            </ul>
          </div>
        </div>
        <div className="ft-legal">
          {/* 사람에게도 관계를 분명히 (2026-09-11 오너): 구조화 데이터는 본원=co.kr 로 되어 있지만 화면에는 없었다. */}
          이 사이트는 {CLINIC.name}이 운영하는 진료 안내 사이트입니다. 공식 홈페이지는{' '}
          <a href={MAIN_SITE_URL} target="_blank" rel="noopener">{MAIN_SITE_URL.replace(/^https?:\/\//, '')}</a> 입니다.
          <br />
          {CLINIC.name} · 대표 {CLINIC.director} · 사업자등록번호 {CLINIC.bizNo}
          <br />
          {CLINIC.address.full} · 전화 {CLINIC.phone} · 이메일 {CLINIC.email}
          <br />
          본 사이트의 의료 정보는 일반적인 안내이며 개별 진단·치료를 대신하지 않습니다. 모든 의료 행위에는 부작용이 따를 수 있으며, 정확한 진단은 내원 후 검사를 통해 이루어집니다.
          <br />© {new Date().getFullYear()} {CLINIC.name}. <Link href="/privacy">개인정보처리방침</Link>
          <NotOnHome>
            {' '}· <a href="/feed">RSS</a>
          </NotOnHome>
        </div>
      </div>
    </footer>
  );
}

export function StickyCta() {
  return (
    <nav className="sticky-cta" aria-label="빠른 연락">
      <a href={CLINIC.phoneHref} className="is-primary">
        {Icon.phone}
        전화
      </a>
      <a href={CLINIC.booking.naver} target="_blank" rel="noopener">
        {Icon.calendar}
        네이버 예약
      </a>
      <a href={CLINIC.booking.kakao} target="_blank" rel="noopener">
        {Icon.chat}
        카카오톡
      </a>
    </nav>
  );
}
