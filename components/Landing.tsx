import Link from 'next/link';
import type { ReactNode } from 'react';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { IMG } from '@/lib/assets';
import { fmtDate } from '@/lib/text';
import type { Doc } from '@/lib/catalog';
import { OpenNow } from './OpenNow';
import { Crumbs, Icon, type Crumb } from './ui';

/*
 * 환자가 보는 첫 화면 — 검색으로 들어온 사람이 '여기 가도 되겠다' 를 먼저 판단하게 한다 (2026-09-28 오너:
 * "SEO 만을 위한 느낌이라 바로 이탈할 것 같다 · 디자인뿐 아니라 구조도").
 * 순서 = 환자가 묻는 순서: 어디서 얼마나 가나 → 믿을 만한가 → 무슨 진료 → 어떻게 가나 → 누가 보나 → 병원은 어떤가 → 언제 가나.
 * ★ 검색 재료는 그대로 둔다: h1 글자(doc.title)·JSON-LD·사진 카드(ItemList 와 같은 사진)는 페이지 쪽에서 바꾸지 않는다.
 * ★ 모든 병원 공통 문구는 짧은 이름표로만 — 긴 설명 단락을 쪽마다 되풀이하지 않는다(지역 쪽 중복 줄인 것 유지).
 */

/** h1 은 글자를 바꾸지 않고 앞(검색어)과 뒤(설명)만 크기를 나눈다 */
export function SplitTitle({ title }: { title: string }) {
  const i = title.indexOf(' — ');
  if (i < 0) return <h1 className="lp-h1"><span className="lp-h1-main">{title}</span></h1>;
  return (
    <h1 className="lp-h1">
      <span className="lp-h1-main">{title.slice(0, i)}</span>
      <span className="lp-h1-sub"><span className="lp-dash"> — </span>{title.slice(i + 3)}</span>
    </h1>
  );
}

export function LandingHero({ doc, crumbs, eyebrow, lead, facts, photo }: {
  doc: Doc;
  crumbs: Crumb[];
  eyebrow: string;
  lead: string;
  facts: Array<{ k: string; v: string }>;
  photo: { src: string; alt: string };
}) {
  return (
    <section className="lp-hero" aria-label="소개">
      <div className="wrap lp-hero-in">
        <div className="lp-copy">
          <Crumbs items={crumbs} />
          <span className="eyebrow lp-in">{eyebrow}</span>
          <div className="lp-in lp-in-2"><SplitTitle title={doc.title} /></div>
          <p className="lp-lead lp-in lp-in-3">{lead}</p>
          <ul className="lp-facts lp-in lp-in-3">
            {facts.map((f) => (
              <li key={f.k}><small>{f.k}</small><b>{f.v}</b></li>
            ))}
          </ul>
          <div className="lp-cta lp-in lp-in-4">
            <a className="btn btn--primary btn--lg" href={CLINIC.phoneHref}>{Icon.phone} 전화 상담 {CLINIC.phone}</a>
            <a className="btn btn--ghost btn--lg" href={CLINIC.booking.naver} target="_blank" rel="noopener">{Icon.calendar} 네이버 예약</a>
          </div>
          <p className="lp-open lp-in lp-in-4"><OpenNow withDot /> · 화·목 20:30까지</p>
        </div>
        <figure className="lp-photo">
          <img src={photo.src} alt={photo.alt} fetchPriority="high" decoding="async" width={1200} height={900} />
          <figcaption>
            <b>{photo.alt}</b>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

const TRUST = [
  { k: 'doc', t: '전문의 3인', s: '보건복지부인증 통합치의학과' },
  { k: 'ct', t: '저선량 CT · 구강스캐너', s: '사진을 보며 설명' },
  { k: 'night', t: '화·목 야간 진료', s: '저녁 8시 30분까지' },
  { k: 'park', t: '건물 내 주차 무료', s: '큰 차량은 전화 문의' },
];
const TRUST_ICON: Record<string, ReactNode> = {
  doc: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" /><path d="M16.5 14.5 18 17l2.5-1" /></svg>,
  ct: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /><path d="M8 11c1-2 2-2 4 0s3 2 4 0" /></svg>,
  night: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>,
  park: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3" /><path d="M10 17V7h3a3 3 0 0 1 0 6h-3" /></svg>,
};
export function TrustStrip() {
  return (
    <div className="lp-trust" aria-label="병원 한눈에">
      <div className="wrap lp-trust-in">
        {TRUST.map((x) => (
          <div key={x.k} className="lp-trust-item">
            <span className="lp-ico">{TRUST_ICON[x.k]}</span>
            <span><b>{x.t}</b><small>{x.s}</small></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 3호선 노선 그림 — 역 이름은 글자 그대로(움직이는 건 선뿐) */
export function LineMap({ path, walkM }: { path: string[]; walkM: string }) {
  return (
    <div className="lp-line" role="img" aria-label={`3호선 ${path.join(', ')} 순서, 화정역에서 병원까지 걸어서 ${walkM}`}>
      <div className="lp-line-track">
        {path.map((s, i) => (
          <div key={s} className={`lp-stop${i === path.length - 1 ? ' is-end' : i === 0 ? ' is-start' : ''}`} style={{ ['--i' as string]: i }}>
            <i />
            <span>{s}</span>
          </div>
        ))}
        <div className="lp-stop is-clinic" style={{ ['--i' as string]: path.length }}>
          <i />
          <span>병원</span>
        </div>
      </div>
      <p className="lp-line-note">화정역에서 병원까지 걸어서 {walkM} · 덕양구청 방면</p>
    </div>
  );
}

export function DoctorStrip() {
  return (
    <div className="lp-docs">
      {DOCTORS.map((d) => (
        <Link key={d.slug} href={`/about/doctors/${d.slug}`} className="lp-doc">
          <span className="lp-doc-ph"><img src={d.photo} alt={`${d.name} ${d.role}`} loading="lazy" decoding="async" width={625} height={670} /></span>
          <b>{d.name} <small>{d.role}</small></b>
        </Link>
      ))}
    </div>
  );
}

/** 병원 사진 네 장 — 쪽마다 다른 네 장(지역 순서로 돌려 고른다) */
export function ClinicGallery({ offset, exclude }: { offset: number; exclude?: string }) {
  const pool = IMG.interior.filter((x) => x.src !== exclude);
  const pics = Array.from({ length: 4 }, (_, k) => pool[(offset + k * 3) % pool.length]);
  return (
    <div className="lp-gallery">
      {pics.map((p, i) => (
        <figure key={p.src} className={`lp-g lp-g-${i}`}>
          <img src={p.src} alt={p.alt} loading="lazy" decoding="async" />
        </figure>
      ))}
    </div>
  );
}

export function VisitBlock({ title }: { title: string }) {
  const h = UNVERIFIED.hours;
  return (
    <div className="lp-visit">
      <div className="lp-visit-copy">
        <h2>{title}</h2>
        <ul className="lp-hours">
          {h.display.map((d) => (
            <li key={d.label} className={d.note ? 'is-night' : undefined}><span>{d.label}</span><b>{d.time}</b>{d.note && <em>{d.note}</em>}</li>
          ))}
          <li className="is-off"><span>휴진</span><b>{h.closed.replace(' 휴진', '')}</b></li>
        </ul>
        <p className="lp-addr">{Icon.pin}<span>{CLINIC.address.full}</span></p>
      </div>
      <div className="lp-visit-cta">
        <a className="btn btn--white btn--lg" href={CLINIC.phoneHref}>{Icon.phone} {CLINIC.phone}</a>
        <a className="btn btn--ghost-light btn--lg" href={CLINIC.booking.naver} target="_blank" rel="noopener">{Icon.calendar} 네이버 예약</a>
        <a className="btn btn--ghost-light btn--lg" href={CLINIC.booking.kakao} target="_blank" rel="noopener">{Icon.chat} 카카오톡 상담</a>
        <a className="lp-map" href={`https://map.naver.com/p/search/${encodeURIComponent('동그라미치과의원 화정동')}`} target="_blank" rel="noopener">네이버 지도에서 보기 {Icon.arrow}</a>
      </div>
    </div>
  );
}

/** 누가 검토했는지 — 글 끝에 사진과 함께(예전엔 머리에 날짜와 섞여 문서처럼 보였다) */
export function Byline({ doc }: { doc: Doc }) {
  const d = DOCTORS[0];
  return (
    <div className="lp-byline">
      <img src={d.photo} alt="" width={56} height={56} loading="lazy" />
      <p>
        <b>{d.name} {d.role}</b>이 검토한 안내입니다
        <small>발행 {fmtDate(doc.publishAt)}{doc.updated !== doc.publishAt ? ` · 수정 ${fmtDate(doc.updated)}` : ''}</small>
      </p>
    </div>
  );
}

export function LpSection({ id, eyebrow, title, children, tone }: { id?: string; eyebrow?: string; title: string; children: ReactNode; tone?: 'alt' }) {
  return (
    <section className={`lp-sec${tone === 'alt' ? ' lp-sec--alt' : ''}`} aria-labelledby={id}>
      <div className="wrap">
        <div className="lp-sec-h">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2 id={id}>{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}
