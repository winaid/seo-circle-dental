import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, DoctorCard, Faq, HubHead, JsonLd, MedicalNotice } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode } from '@/lib/schema';
import { CLINIC, STRENGTHS, OUTREACH } from '@/lib/clinic';
import { SPECIALS } from '@/lib/specials';
import { DOCTORS, PUBLICATION_DETAIL, OUTREACH_PHOTO } from '@/lib/doctors';
import { WHY_US } from '@/lib/whyUs';
import { TRUST_STATS } from '@/lib/trustSignals';
import { FIRST_VISIT_FLOW } from '@/lib/firstVisit';
import { IMG } from '@/lib/assets';

export const revalidate = 3600;
const doc = docByPathStrict('/about');
export const metadata: Metadata = metaFor(doc);

export default function AboutPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '병원 소개', path: '/about' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="병원 소개" title={doc.title} lead={CLINIC.description} />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <div className="team-photo" style={{ marginBottom: 48 }}>
          <img src={IMG.doctorsTeam} alt="동그라미치과의원 의료진 세 명" width={1200} height={800} fetchPriority="high" />
        </div>

        <div className="art" style={{ paddingBottom: 0 }}>
          <div className="art-main prose" style={{ maxWidth: 780 }}>
            <h2 id="doctors">의료진 — 세 명 모두 통합치의학과 전문의</h2>
            <p>학력·경력은 병원이 공개한 원문 그대로이며 요약하거나 고쳐 쓰지 않았습니다. 대표원장은 경희대학교 치의학전문대학원 외래교수이자 치의학박사입니다.</p>
            <div className="team-cards">
              {DOCTORS.map((d) => (
                <DoctorCard key={d.slug} d={d} />
              ))}
            </div>
            <div className="stat-row">
              {TRUST_STATS.slice(0, 3).map((s) => (
                <div className="stat" key={s.label}>
                  <small>{s.label}</small>
                  <b>{s.value}</b>
                </div>
              ))}
            </div>

            <h2 id="why">진료를 대하는 기준</h2>
            {WHY_US.map((g) => (
              <section key={g.key}>
                <h3>{g.label}</h3>
                <ul>
                  {g.cards.map((c) => (
                    <li key={c.title}>
                      <strong>{c.title}</strong> — {c.body}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {SPECIALS.map((s) => (
              <section key={s.slug} id={s.slug}>
                <h2>{s.title}</h2>
                <p>{s.body}</p>
                <figure>
                  <img src={s.image} alt={s.alt} loading="lazy" decoding="async" />
                  <figcaption>{s.alt}</figcaption>
                </figure>
                {s.context.map((c) => (
                  <div key={c.h}>
                    <h3>{c.h}</h3>
                    <p>{c.p}</p>
                  </div>
                ))}
                <Faq openFirst={false} items={s.faq.map((f, i) => ({ q: f.q, a: f.a, href: `/qa/${s.slug}-${i + 1}` }))} />
              </section>
            ))}

            <h2 id="process">처음 오시면 이렇게 진행됩니다</h2>
            <ol className="steps">
              {FIRST_VISIT_FLOW.map((s) => (
                <li key={s.n}>
                  <div>
                    <b>{s.t}</b>
                    <p>{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <h2 id="trust">근거 — 인증·논문·봉사</h2>
            <div className="grid grid--4">
              {IMG.credentials.map((c) => (
                <figure key={c.src} style={{ margin: 0 }}>
                  <img src={c.src} alt={c.label} loading="lazy" decoding="async" style={{ objectFit: 'contain', background: 'var(--paper-2)', borderRadius: 8, aspectRatio: '1' }} />
                  <figcaption>{c.label}</figcaption>
                </figure>
              ))}
            </div>
            <h3>발표 논문</h3>
            <p>
              <em>{PUBLICATION_DETAIL.title}</em> — {PUBLICATION_DETAIL.authors}
            </p>
            <p>{PUBLICATION_DETAIL.relevanceKo}</p>
            <h3>사회공헌</h3>
            <ul>
              {OUTREACH.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
            <figure>
              <img src={OUTREACH_PHOTO.src} alt={OUTREACH_PHOTO.alt} loading="lazy" decoding="async" />
              <figcaption>{OUTREACH_PHOTO.alt}</figcaption>
            </figure>

            <h2 id="space">병원 둘러보기</h2>
            <div className="grid grid--3">
              {IMG.interior.map((im) => (
                <figure key={im.src} style={{ margin: 0 }}>
                  <img src={im.src} alt={im.alt} loading="lazy" decoding="async" style={{ borderRadius: 8, aspectRatio: '4/3', objectFit: 'cover' }} />
                  <figcaption>{im.alt}</figcaption>
                </figure>
              ))}
            </div>

            <CtaBlock />
            <MedicalNotice />
          </div>
          <aside className="aside">
            <div className="aside-card">
              <h4>이 페이지에서</h4>
              <ul>
                <li><Link href="#doctors">의료진</Link></li>
                <li><Link href="#why">진료 기준</Link></li>
                {STRENGTHS.map((s) => {
                  const sp = SPECIALS.find((x) => x.key === s.key);
                  return sp ? <li key={s.key}><Link href={`#${sp.slug}`}>{s.title}</Link></li> : null;
                })}
                <li><Link href="#process">진료 절차</Link></li>
                <li><Link href="#trust">인증·논문</Link></li>
                <li><Link href="#space">둘러보기</Link></li>
              </ul>
            </div>
            <div className="aside-card">
              <h4>오시는 길</h4>
              <p className="small">{CLINIC.address.full}</p>
              <Link href="/visit" className="btn btn--ghost btn--sm">진료시간·지도</Link>
            </div>
          </aside>
        </div>
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/about', crumbs)]} />
    </>
  );
}
