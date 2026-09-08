import Link from 'next/link';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { TREATMENTS } from '@/lib/treatments';
import { DOCTORS } from '@/lib/doctors';
import { REGIONS } from '@/lib/regions';
import { MAIN_SITE_URL } from '@/lib/site';
import { Icon } from './ui';

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
          <div>
            <h4>진료</h4>
            <ul>
              {TREATMENTS.map((t) => (
                <li key={t.slug}>
                  <Link href={`/treatment/${t.slug}`}>{t.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>미리 알아두기</h4>
            <ul>
              <li><Link href="/symptom">증상으로 찾기</Link></li>
              <li><Link href="/condition">질환 안내</Link></li>
              <li><Link href="/qa">진료실 문답</Link></li>
              <li><Link href="/journey">치료 기간·횟수</Link></li>
              <li><Link href="/cost">비용 기준</Link></li>
              <li><Link href="/glossary">용어 사전</Link></li>
              <li><Link href="/emergency">응급 상황</Link></li>
              <li><Link href="/blog">칼럼</Link></li>
            </ul>
          </div>
          <div>
            <h4>병원</h4>
            <ul>
              <li><Link href="/about">병원 소개</Link></li>
              {DOCTORS.map((d) => (
                <li key={d.slug}>
                  <Link href={`/about/doctors/${d.slug}`}>
                    {d.name} {d.role}
                  </Link>
                </li>
              ))}
              <li><Link href="/visit">오시는 길·진료시간</Link></li>
              <li><Link href="/faq">자주 묻는 질문</Link></li>
              <li><a href={MAIN_SITE_URL} target="_blank" rel="noopener">본원 홈페이지</a></li>
              <li><a href={CLINIC.social.naverBlog} target="_blank" rel="noopener">네이버 블로그</a></li>
              <li><a href={CLINIC.social.instagram} target="_blank" rel="noopener">인스타그램</a></li>
            </ul>
          </div>
        </div>
        <nav className="ft-regions" aria-label="지역별 안내">
          {REGIONS.map((r) => (
            <Link key={r.slug} href={`/area/${r.slug}`}>
              {r.keyword}
            </Link>
          ))}
        </nav>
        <div className="ft-legal">
          {CLINIC.name} · 대표 {CLINIC.director} · 사업자등록번호 {CLINIC.bizNo}
          <br />
          {CLINIC.address.full} · 전화 {CLINIC.phone} · 이메일 {CLINIC.email}
          <br />
          본 사이트의 의료 정보는 일반적인 안내이며 개별 진단·치료를 대신하지 않습니다. 모든 의료 행위에는 부작용이 따를 수 있으며, 정확한 진단은 내원 후 검사를 통해 이루어집니다.
          <br />© {new Date().getFullYear()} {CLINIC.name}. <Link href="/privacy">개인정보처리방침</Link> · <a href="/feed">RSS</a>
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
