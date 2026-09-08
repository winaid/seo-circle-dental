import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { Btn, Chips, DocGrid, DoctorCard, Faq, HoursTable, Icon, JsonLd, LinkList } from '@/components/ui';
import { OpenNow } from '@/components/OpenNow';
import { CLINIC, STRENGTHS, UNVERIFIED } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { TREATMENTS, treatmentBySlug } from '@/lib/treatments';
import { SYMPTOMS, SYMPTOM_GROUPS } from '@/lib/symptoms';
import { DOCTORS } from '@/lib/doctors';
import { CLINIC_QA } from '@/lib/faq';
import { REGIONS } from '@/lib/regions';
import { docByPathStrict, latestDocs, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { webPageNode, breadcrumbNode, itemListNode } from '@/lib/schema';
import { STATION_DISTANCE_M, fmtDistance } from '@/lib/site';
import { sentences } from '@/lib/text';

export const revalidate = 3600;

const doc = docByPathStrict('/');
export const metadata: Metadata = metaFor(doc);

const HERO = { src: '/img/20210923_ed347b4ffee21.jpg', alt: IMG.interior[8].alt };
const FEATURES = [
  {
    slug: 'implant',
    h2: '화정동 임플란트, 마지막 선택이 되도록',
    img: { src: '/img/clinic/implant-hero.webp', alt: '상담실에서 원장이 모니터와 치아 모형을 보며 임플란트 계획을 설명하는 모습' },
    links: [
      { label: '임플란트 진료 안내', href: '/treatment/implant' },
      { label: '만 65세 이상 임플란트 건강보험', href: '/cost/implant-senior' },
      { label: '뼈이식이 필요하다고 들었다면', href: '/treatment/implant/bone-graft' },
      { label: '임플란트는 몇 번 가고 얼마나 걸리나', href: '/journey/implant' },
    ],
  },
  {
    slug: 'save-natural-tooth',
    h2: '화정동 신경치료·자연치아 살리기',
    img: { src: '/img/clinic/endo-surgery.webp', alt: '진료실에서 원장이 확대경을 쓰고 신경치료를 진행하는 모습' },
    links: [
      { label: '자연치아 살리기', href: '/treatment/save-natural-tooth' },
      { label: '신경치료(근관치료)', href: '/treatment/endodontic' },
      { label: '다른 치과에서 뽑자고 했는데 살릴 수 있나요', href: '/qa/save-natural-tooth-1' },
      { label: '치아를 뽑을지 살릴지 판단 기준', href: '/blog/extract-or-save' },
    ],
  },
  {
    slug: 'cavity',
    h2: '화정동 충치치료·잇몸치료·스케일링',
    img: { src: '/img/clinic/perio-explain.webp', alt: '상담실에서 잇몸 모형을 놓고 잇몸치료 과정을 설명하는 모습' },
    links: [
      { label: '충치치료 — 레진·인레이·크라운', href: '/treatment/cavity' },
      { label: '잇몸치료(치주치료)', href: '/treatment/periodontal' },
      { label: '스케일링·예방치료', href: '/treatment/scaling-prevention' },
      { label: '스케일링은 보험이 되나요', href: '/cost/scaling' },
    ],
  },
  {
    slug: 'wisdom-tooth',
    h2: '화정동 사랑니 발치',
    img: { src: '/img/clinic/wisdom-room.webp', alt: '사랑니 발치를 준비하는 진료실' },
    links: [
      { label: '사랑니 발치 안내', href: '/treatment/wisdom-tooth' },
      { label: '사랑니 쪽 잇몸이 붓고 아파요', href: '/symptom/wisdom-tooth-pain' },
      { label: '사랑니 발치 비용은 어떻게 정해지나요', href: '/cost/wisdom-cost' },
      { label: '사랑니, 언제 뽑는 것이 좋을까', href: '/blog/wisdom-tooth-timing' },
    ],
  },
];

export default function HomePage() {
  const mainTreatments = ['save-natural-tooth', 'implant', 'endodontic', 'cavity', 'periodontal', 'wisdom-tooth'].map((s) => treatmentBySlug(s)!);
  const latest = latestDocs(8);
  const popularSymptoms = ['toothache-night', 'cold-sensitivity', 'bleeding-gums', 'missing-tooth', 'wisdom-tooth-pain', 'cracked-tooth', 'loose-tooth', 'crown-fell-out']
    .map((s) => SYMPTOMS.find((x) => x.slug === s)!)
    .filter(Boolean);
  const blogDocs = docsOfKind('blog').slice(0, 3);

  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        {/* ───── 히어로 ───── */}
        <section className="hero" aria-label="소개">
          <div className="hero-bg">
            <img src={HERO.src} alt={HERO.alt} fetchPriority="high" decoding="async" width={1920} height={1280} />
          </div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-ring" aria-hidden="true" />
          <div className="wrap hero-in">
            <div className="hero-copy">
              <span className="eyebrow eyebrow--light enter">화정치과 · 고양시 덕양구 화정동 · 3호선 화정역</span>
              <h1 className="enter enter-2">
                뽑기 전에 살릴 수 있는지
                <br />
                먼저 보는 <em>화정동 치과</em>
              </h1>
              <p className="hero-lead enter enter-3">
                통합치의학과 전문의 세 명이 자연치아를 남길 수 있는지부터 확인합니다. 살릴 수 있는 치아는 신경치료로, 그렇지 않은 치아는 임플란트로 — 어느 쪽이 맞는지 검사 뒤에 함께 정합니다.
              </p>
              <div className="hero-cta enter enter-4">
                <Btn href={CLINIC.phoneHref} kind="white" size="lg">
                  {Icon.phone} {CLINIC.phone}
                </Btn>
                <Btn href={CLINIC.booking.naver} kind="ghost-light" size="lg">
                  {Icon.calendar} 네이버 예약
                </Btn>
                <Btn href="/symptom" kind="ghost-light" size="lg">
                  증상으로 찾기 {Icon.arrow}
                </Btn>
              </div>
            </div>
            <dl className="hero-facts enter enter-4">
              <div className="hero-fact">
                <dt className="sr">가까운 역</dt>
                <dd><b>화정역 {fmtDistance(STATION_DISTANCE_M)}</b><span>3호선 · 덕양구청 방면</span></dd>
              </div>
              <div className="hero-fact">
                <dt className="sr">야간 진료</dt>
                <dd><b>화·목 20:30까지</b><span>퇴근 후 진료 가능</span></dd>
              </div>
              <div className="hero-fact">
                <dt className="sr">의료진</dt>
                <dd><b>전문의 3인</b><span>보건복지부인증 통합치의학과</span></dd>
              </div>
              <div className="hero-fact">
                <dt className="sr">주차</dt>
                <dd><b>건물 내 주차 무료</b><span>기계식 · 큰 차량은 전화 문의</span></dd>
              </div>
            </dl>
          </div>
        </section>

        {/* ───── 지금 진료 ───── */}
        <div className="wrap">
          <div className="now-bar">
            <OpenNow withDot />
            <span className="muted">
              {UNVERIFIED.hours.display.map((d) => `${d.label} ${d.time}`).join(' · ')} · {UNVERIFIED.hours.closed}
            </span>
            <span className="spacer" />
            <Link href="/visit" className="btn btn--ghost btn--sm">
              {Icon.pin} 오시는 길
            </Link>
          </div>
        </div>

        {/* ───── 진료 ───── */}
        <section className="sec" aria-labelledby="h-treat">
          <div className="wrap">
            <div className="sec-head sec-head--row">
              <div>
                <span className="eyebrow">진료 안내</span>
                <h2 id="h-treat">화정치과 동그라미에서 하는 진료, 무엇을 먼저 보는지까지</h2>
                <p>진료 이름만 나열하지 않았습니다. 각 진료에서 검사로 먼저 확인하는 것과 살릴 수 있는 조건·없는 조건을 나눠 적었습니다.</p>
              </div>
              <Link href="/treatment" className="btn btn--ghost">
                진료 전체 보기 {Icon.arrow}
              </Link>
            </div>
            <div className="grid grid--3">
              {mainTreatments.map((t) => {
                const d = docByPathStrict(`/treatment/${t.slug}`);
                return (
                  <Link key={t.slug} href={d.path} className="t-card">
                    <img src={d.image!.src} alt={d.image!.alt} loading="lazy" decoding="async" />
                    <div className="t-card-in">
                      <span className="card-tag">{t.whoFor[0]}</span>
                      <h3>{t.name}</h3>
                      <p>{t.summary}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ───── 왜 ───── */}
        <section className="sec sec--alt" aria-labelledby="h-why">
          <div className="wrap why">
            <div>
              <span className="eyebrow">동그라미치과의원은 어떤 곳인가요</span>
              <h2 id="h-why" style={{ fontSize: 'clamp(26px, 3vw, 36px)', marginTop: 14, marginBottom: 14 }}>
                화정치과 동그라미치과의원이 진료를 대하는 다섯 가지 기준
              </h2>
              <p className="muted" style={{ marginBottom: 28 }}>
                병원이 스스로 밝히고 있는 내용 그대로입니다. 근거가 되는 자격·인증은 <Link href="/about" style={{ color: 'var(--brand)', fontWeight: 600 }}>병원 소개</Link>에서 실물 사진으로 확인하실 수 있습니다.
              </p>
              <div className="why-list">
                {STRENGTHS.map((s) => (
                  <div className="why-item" key={s.key}>
                    <span className="ring">{s.key.slice(0, 1).toUpperCase()}</span>
                    <div>
                      <h3>{s.title}</h3>
                      <p>{s.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <figure className="why-photo">
              <img src={IMG.interior[3].src} alt={IMG.interior[3].alt} loading="lazy" decoding="async" />
              <figcaption>{IMG.interior[3].alt}</figcaption>
            </figure>
          </div>
        </section>

        {/* ───── 진료별 안내(긴 글) ───── */}
        <section className="sec" aria-label="진료별 안내">
          <div className="wrap">
            {FEATURES.map((f, i) => {
              const t = treatmentBySlug(f.slug)!;
              const intro = sentences(t.intro);
              return (
                <article key={f.slug} className={`feature${i % 2 ? ' feature--flip' : ''}`}>
                  <div className="feature-media">
                    <img src={f.img.src} alt={f.img.alt} loading="lazy" decoding="async" />
                  </div>
                  <div className="feature-copy">
                    <span className="eyebrow">{t.name}</span>
                    <h2>{f.h2}</h2>
                    <p>{t.summary}</p>
                    <p>{intro.slice(0, 3).join(' ')}</p>
                    <div className="feature-links">
                      {f.links.map((l) => (
                        <Link key={l.href} href={l.href}>
                          {l.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ───── 증상 ───── */}
        <section className="sec sec--alt" aria-labelledby="h-sym">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">증상으로 찾기</span>
              <h2 id="h-sym">이가 아프고 시릴 때, 잇몸에서 피가 날 때 — 지금 느끼는 불편으로 원인 짚어보기</h2>
              <p>진료과목 이름을 몰라도 됩니다. 느끼시는 증상과 가장 가까운 항목부터 읽어 보세요. 원인 후보, 내원 전 할 수 있는 것, 바로 와야 하는 신호를 나눠 적었습니다.</p>
            </div>
            <div className="two">
              <div>
                <Chips items={SYMPTOM_GROUPS.map((g) => ({ label: g.title, href: `/symptom#${g.slug}` }))} />
                <p className="muted small" style={{ marginTop: 16 }}>
                  증상 {SYMPTOMS.length}가지 · 질환 15가지 · 진료실 문답 {docsOfKind('qa').length}편
                </p>
              </div>
              <LinkList items={popularSymptoms.map((s) => ({ label: s.title, href: `/symptom/${s.slug}`, meta: s.short }))} />
            </div>
          </div>
        </section>

        {/* ───── 의료진 ───── */}
        <section className="sec" aria-labelledby="h-team">
          <div className="wrap team">
            <div className="sec-head sec-head--row">
              <div>
                <span className="eyebrow">의료진</span>
                <h2 id="h-team">세 명 모두 보건복지부인증 통합치의학과 전문의입니다</h2>
                <p>학력·경력은 병원이 공개한 원문 그대로이며 요약하거나 고쳐 쓰지 않았습니다. 진단이 애매한 경우 원장들이 서로 의견을 나눕니다.</p>
              </div>
              <Link href="/about" className="btn btn--ghost">
                병원 소개 {Icon.arrow}
              </Link>
            </div>
            <div className="team-photo">
              <img src={IMG.doctorsTeam} alt="동그라미치과의원 의료진 — 김인진 원장, 변석호 대표원장, 김동주 원장" loading="lazy" decoding="async" width={1200} height={800} />
            </div>
            <div className="team-cards">
              {DOCTORS.map((d) => (
                <DoctorCard key={d.slug} d={d} />
              ))}
            </div>
          </div>
        </section>

        {/* ───── 오시는 길 ───── */}
        <section className="sec sec--alt" aria-labelledby="h-visit">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">오시는 길 · 진료시간</span>
              <h2 id="h-visit">화정역 치과 동그라미치과의원 오시는 길</h2>
            </div>
            <div className="visit">
              <div className="visit-box">
                <h3>위치</h3>
                <p className="visit-addr">{CLINIC.address.full}</p>
                <div className="visit-meta">
                  <div><b>지하철</b><span>3호선 화정역 · 직선거리 {fmtDistance(STATION_DISTANCE_M)} · 덕양구청 방면</span></div>
                  <div><b>주차</b><span>{CLINIC.parking.type} {CLINIC.parking.fee}. {CLINIC.parking.note}</span></div>
                  <div><b>전화</b><span>{CLINIC.phone}</span></div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <Btn href={`https://map.naver.com/p/search/${encodeURIComponent('동그라미치과의원 화정동')}`} kind="primary" size="sm">
                    {Icon.pin} 네이버 지도
                  </Btn>
                  <Btn href="/visit" kind="ghost" size="sm">
                    자세한 안내
                  </Btn>
                </div>
              </div>
              <div className="visit-box">
                <h3>진료시간</h3>
                <HoursTable />
                <p className="small muted">점심시간 {UNVERIFIED.hours.lunch.start}–{UNVERIFIED.hours.lunch.end} (토요일 제외)</p>
              </div>
            </div>
            <div style={{ marginTop: 36 }}>
              <span className="eyebrow">이 동네에서 오신다면</span>
              <div style={{ marginTop: 14 }}>
                <Chips items={REGIONS.map((r) => ({ label: r.keyword, href: `/area/${r.slug}` }))} />
              </div>
            </div>
          </div>
        </section>

        {/* ───── FAQ ───── */}
        <section className="sec" aria-labelledby="h-faq">
          <div className="wrap two">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">자주 묻는 질문</span>
              <h2 id="h-faq">내원 전에 자주 물으시는 것</h2>
              <p>진료시간·예약·주차·비용처럼 오시기 전에 궁금한 것부터 답합니다. 진료 내용에 대한 질문은 진료실 문답에 따로 모았습니다.</p>
              <div>
                <Link href="/faq" className="btn btn--ghost btn--sm">
                  전체 보기 {Icon.arrow}
                </Link>
              </div>
            </div>
            <Faq items={CLINIC_QA.slice(0, 6).map((q, i) => ({ q: q.q, a: q.a, href: `/qa/visit-${i + 1}` }))} />
          </div>
        </section>

        {/* ───── 새 글 ───── */}
        <section className="sec sec--alt" aria-labelledby="h-new">
          <div className="wrap">
            <div className="sec-head sec-head--row">
              <div>
                <span className="eyebrow">새로 올라온 글</span>
                <h2 id="h-new">진료실에서 실제로 받는 질문에 답합니다</h2>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/qa" className="btn btn--ghost btn--sm">
                  문답 전체
                </Link>
                <Link href="/blog" className="btn btn--ghost btn--sm">
                  칼럼
                </Link>
              </div>
            </div>
            <DocGrid docs={[...blogDocs, ...latest.filter((d) => d.kind !== 'blog')].slice(0, 8)} cols={4} />
          </div>
        </section>
      </main>
      <JsonLd
        nodes={[
          webPageNode(doc),
          breadcrumbNode('/', [{ name: '홈', path: '/' }]),
          itemListNode('진료 과목', TREATMENTS.map((t) => ({ name: t.name, path: `/treatment/${t.slug}` }))),
        ]}
      />
    </>
  );
}
