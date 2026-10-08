import Link from 'next/link';
import type { ReactNode } from 'react';
import { CLINIC, UNVERIFIED, MEDICAL_DISCLAIMER } from '@/lib/clinic';
import { DOCTORS, type Doctor } from '@/lib/doctors';
import { isLivePath, type Doc } from '@/lib/catalog';
import { fmtDate } from '@/lib/text';
import { serialize } from '@/lib/schema';
import { probeCrumbs } from '@/lib/crawlProbe';
import { OpenNow } from './OpenNow';
import { SplitTitle, TrustStrip, VisitBlock } from './Landing';

/* ───── 구조화 데이터 ───── */
export function JsonLd({ nodes }: { nodes: unknown[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serialize(nodes) }} />;
}

/* ───── 아이콘 ───── */
export const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>
  ),
  calendar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-8 8H8l-5 3 1.2-4A8 8 0 1 1 21 12z" /></svg>
  ),
  arrow: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
  ),
};

/* ───── 단추 ───── */
export function Btn({ href, kind = 'primary', size, children, external }: { href: string; kind?: 'primary' | 'white' | 'ghost' | 'ghost-light'; size?: 'sm' | 'lg'; children: ReactNode; external?: boolean }) {
  const cls = `btn btn--${kind}${size ? ` btn--${size}` : ''}`;
  if (external || href.startsWith('tel:') || href.startsWith('http')) {
    return (
      <a className={cls} href={href} {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {})}>
        {children}
      </a>
    );
  }
  return (
    <Link className={cls} href={href}>
      {children}
    </Link>
  );
}

/* ───── 빵부스러기 ───── */
export type Crumb = { name: string; path: string };
export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <ol className="crumbs" aria-label="현재 위치">
      {probeCrumbs(items).map((c, i) => (
        <li key={c.path}>{i === items.length - 1 ? <span aria-current="page">{c.name}</span> : <Link href={c.path}>{c.name}</Link>}</li>
      ))}
    </ol>
  );
}

/* ───── 먼저 답부터 ───── */
export function AnswerFirst({ children, label = '먼저 답부터' }: { children: ReactNode; label?: string }) {
  return (
    <div className="answer">
      <span className="ring" aria-hidden="true">A</span>
      <div>
        <div className="answer-label">{label}</div>
        <p>{children}</p>
      </div>
    </div>
  );
}

/* ───── 카드 ───── */
export function DocCard({ doc }: { doc: Doc }) {
  return (
    <Link href={doc.path} className="card">
      {doc.image ? (
        <div className="card-img">
          <img src={doc.image.src} alt={doc.image.alt} loading="lazy" decoding="async" />
        </div>
      ) : (
        <div className="card-mark" aria-hidden="true">
          <span className="ring">{doc.kind === 'qa' ? 'Q' : doc.kind === 'cost' ? '₩' : doc.kind === 'glossary' ? '語' : 'A'}</span>
        </div>
      )}
      <div className="card-body">
        <span className="card-tag">{doc.category}</span>
        <h3>{doc.title}</h3>
        <p>{doc.excerpt}</p>
        <span className="card-more">읽기 {Icon.arrow}</span>
      </div>
    </Link>
  );
}

export function DocGrid({ docs, cols = 3 }: { docs: Doc[]; cols?: 2 | 3 | 4 }) {
  return (
    <div className={`grid grid--${cols}`}>
      {docs.map((d) => (
        <DocCard key={d.path} doc={d} />
      ))}
    </div>
  );
}

/* ★ LinkList·Chips·Faq 는 아직 발행 안 된 문서로 가는 링크를 그리지 않는다 (lib/catalog.ts isLivePath 주석). */
export function LinkList({ items, mark }: { items: Array<{ label: string; href: string; meta?: string }>; mark?: string }) {
  const live = items.filter((it) => isLivePath(it.href));
  if (live.length === 0) return null;
  return (
    <div className="list-links">
      {live.map((it) => (
        <Link key={it.href} href={it.href}>
          <span>
            {mark && <span className="ring">{mark}</span>}
            {it.label}
          </span>
          {it.meta && <small>{it.meta}</small>}
        </Link>
      ))}
    </div>
  );
}

export function Chips({ items, current }: { items: Array<{ label: string; href: string }>; current?: string }) {
  const live = items.filter((it) => isLivePath(it.href));
  if (live.length === 0) return null;
  return (
    <div className="chips">
      {live.map((it) => (
        <Link key={it.href} href={it.href} className={it.href === current ? 'is-on' : undefined}>
          {it.label}
        </Link>
      ))}
    </div>
  );
}

/* ───── 문답 ───── */
export function Faq({ items, openFirst = true }: { items: Array<{ q: string; a: ReactNode; href?: string }>; openFirst?: boolean }) {
  return (
    <div className="faq">
      {items.map((it, i) => (
        <details key={i} open={openFirst && i === 0}>
          <summary>
            <span className="ring">Q</span>
            <span>{it.q}</span>
          </summary>
          <div className="faq-a">
            {it.a}
            {it.href && isLivePath(it.href) && (
              <>
                {' '}
                <Link href={it.href}>자세히 보기</Link>
              </>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}

/* ───── 진료시간 ───── */
export function HoursTable() {
  const h = UNVERIFIED.hours;
  return (
    <table className="hours">
      <tbody>
        {h.display.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td>
              {row.time}
              {row.note && <span className="note">{row.note}</span>}
            </td>
          </tr>
        ))}
        <tr>
          <td>휴진</td>
          <td className="closed">{h.closed}</td>
        </tr>
      </tbody>
    </table>
  );
}

/* ───── 의료진 카드 ───── */
/** link=false 는 홈 전용 — 홈의 사진 링크는 진료 카드 6장뿐이어야 한다(app/page.tsx 홈 카드 줄 주석). */
export function DoctorCard({ d, sub, link = true }: { d: Doctor; sub?: string; link?: boolean }) {
  const inner = (
    <>
      <img src={d.photo} alt={`${d.name} ${d.role}`} loading="lazy" width={76} height={76} />
      <span>
        <b>
          {d.name} {d.role}
        </b>
        <small>{sub ?? d.license}</small>
        <small>{d.keyCareer[0]}</small>
      </span>
    </>
  );
  return link ? (
    <Link href="/about" className="doc-card">
      {inner}
    </Link>
  ) : (
    <div className="doc-card">{inner}</div>
  );
}

/* ───── 글 끝 행동 블록 ───── */
export function CtaBlock({ title = '궁금한 점은 진료실에서 직접 확인해 드립니다', sub }: { title?: string; sub?: string }) {
  return (
    <div className="cta-block">
      <div>
        <h3>{title}</h3>
        <p>{sub ?? `화정역 인근 · 화·목 저녁 8시 30분까지 야간 진료 · ${CLINIC.parking.type} ${CLINIC.parking.fee}`}</p>
      </div>
      <div className="btns">
        <Btn href={CLINIC.phoneHref} kind="white">
          {Icon.phone} {CLINIC.phone}
        </Btn>
        <Btn href={CLINIC.booking.naver} kind="ghost-light">
          {Icon.calendar} 네이버 예약
        </Btn>
        <Btn href={CLINIC.booking.kakao} kind="ghost-light">
          {Icon.chat} 카카오톡 상담
        </Btn>
      </div>
    </div>
  );
}

export function MedicalNotice({ extra }: { extra?: string }) {
  return (
    <p className="notice">
      {MEDICAL_DISCLAIMER}
      {extra ? ` ${extra}` : ''}
    </p>
  );
}

/* ───── 글 틀 ───── */
export function ArticleShell({
  doc,
  crumbs,
  eyebrow,
  lead,
  hero,
  related,
  children,
  asideExtra,
}: {
  doc: Doc;
  crumbs: Crumb[];
  eyebrow?: string;
  lead?: string;
  hero?: { src: string; alt: string; caption?: string };
  related?: Doc[];
  children: ReactNode;
  asideExtra?: ReactNode;
}) {
  const reviewer = DOCTORS[0];
  /*
   * 2026-09-28 오너: "SEO 만을 위한 느낌 · 구조도 바꿔라" — 머리를 문서(발행·검토 줄)에서 환자용으로.
   * h1 글자(doc.title)는 그대로, 앞(검색어)·뒤(설명)만 크기를 나눈다. 발행·검토는 검토 원장 사진이 붙은 한 줄로.
   * 머리 바로 아래에 지금 진료 중인지 + 전화·예약, 그 아래 병원 한눈에(짧은 이름표), 글 끝엔 진료시간·예약 띠.
   */
  return (
    <>
    <div className="wrap">
      <div className="read-bar" aria-hidden="true" />
      <header className="art-head art-head--lp">
        <Crumbs items={crumbs} />
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <SplitTitle title={doc.title} />
        {lead && <p className="art-lead">{lead}</p>}
        <div className="consult">
          <span className="consult-open"><OpenNow withDot /> · 화·목 저녁 8시 30분까지</span>
          <span className="consult-btns">
            <a className="btn btn--primary" href={CLINIC.phoneHref}>{Icon.phone} 전화 상담</a>
            <a className="btn btn--ghost" href={CLINIC.booking.naver} target="_blank" rel="noopener">{Icon.calendar} 네이버 예약</a>
          </span>
        </div>
        <div className="rev-chip">
          <img src={reviewer.photo} alt="" width={40} height={40} />
          <span>
            <b>{reviewer.name} {reviewer.role}</b> 검토 · {reviewer.license}
            <small>
              발행 {fmtDate(doc.publishAt)}
              {doc.updated !== doc.publishAt ? ` · 수정 ${fmtDate(doc.updated)}` : ''}
            </small>
          </span>
        </div>
        {hero && (
          <figure className="art-hero" style={{ marginTop: 28 }}>
            <img src={hero.src} alt={hero.alt} fetchPriority="high" decoding="async" />
            {hero.caption && <figcaption>{hero.caption}</figcaption>}
          </figure>
        )}
      </header>
    </div>
    <TrustStrip />
    <div className="wrap">
      <div className="art">
        <div className="art-main">{children}</div>
        <aside className="aside" aria-label="보조 정보">
          <div className="aside-card aside-card--cta">
            <h4>전화 · 예약</h4>
            <b>{CLINIC.phone}</b>
            <p>
              <OpenNow /> · 화·목 저녁 8시 30분까지
            </p>
            <Btn href={CLINIC.phoneHref} kind="white">
              {Icon.phone} 전화하기
            </Btn>
            <Btn href={CLINIC.booking.naver} kind="ghost-light">
              {Icon.calendar} 네이버 예약
            </Btn>
          </div>
          {asideExtra}
          {related && related.length > 0 && (
            <div className="aside-card">
              <h4>함께 보면 좋은 글</h4>
              <ul>
                {related.map((r) => (
                  <li key={r.path}>
                    <Link href={r.path}>{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="aside-card">
            <h4>오시는 길</h4>
            <p className="small">
              {CLINIC.address.full}
              <br />
              <span className="muted">3호선 화정역 인근 · {CLINIC.parking.type} {CLINIC.parking.fee}</span>
            </p>
            <Link href="/visit" className="btn btn--ghost btn--sm">
              {Icon.pin} 진료시간·지도
            </Link>
          </div>
        </aside>
      </div>
    </div>
    <section className="lp-sec lp-sec--visit lp-sec--end">
      <div className="wrap">
        <VisitBlock title="진료시간을 확인하고 편하게 연락 주세요" />
      </div>
    </section>
    </>
  );
}

/* ───── 허브 머리 ───── */
export function HubHead({ title, lead, crumbs, eyebrow }: { title: string; lead?: string; crumbs: Crumb[]; eyebrow?: string }) {
  return (
    <div className="wrap hub-head">
      <Crumbs items={crumbs} />
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 style={{ marginTop: 12 }}>{title}</h1>
      {lead && <p>{lead}</p>}
    </div>
  );
}

export function Pager({ prev, next }: { prev?: Doc; next?: Doc }) {
  if (!prev && !next) return null;
  return (
    <nav className="pager" aria-label="이전·다음 글">
      {prev ? (
        <Link href={prev.path}>
          <small>이전 글</small>
          {prev.title}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.path} className="next">
          <small>다음 글</small>
          {next.title}
        </Link>
      )}
    </nav>
  );
}
