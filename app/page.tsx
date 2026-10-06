import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { Btn, DoctorCard, Faq, HoursTable, Icon, JsonLd } from '@/components/ui';
import { OpenNow } from '@/components/OpenNow';
import { CLINIC, STRENGTHS, UNVERIFIED } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { treatmentBySlug } from '@/lib/treatments';
import { SYMPTOMS, SYMPTOM_GROUPS } from '@/lib/symptoms';
import { DOCTORS } from '@/lib/doctors';
import { REGIONS } from '@/lib/regions';
import { CLINIC_QA } from '@/lib/faq';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { webPageNode, breadcrumbNode, itemListNode, imageGalleryNode } from '@/lib/schema';
import { homeCarousel } from '@/lib/carousel';
import { SITE_URL, STATION_DISTANCE_M, fmtDistance } from '@/lib/site';
import { sentences } from '@/lib/text';

export const revalidate = 3600;

/*
 * ★★★ 홈 카드 줄 조건(2026-10-02 오너 GO) — 네이버 검색 결과에서 홈 주소에 카드 줄이 붙은 홈 6곳은 전부
 *   '홈 안 내부 링크 7~8개, 그중 6개가 사진 링크'였고 카드 6장 = HTML 첫 사진 링크 6개였다(49곳 실측, 안 붙은 43곳은 링크가 많거나 사진 목록이 없음).
 *   그래서 이 홈의 내부 링크 = 로고 + 진료 카드 6장 + 개인정보처리방침 = 8개. 메뉴·바닥 목록은 components/NotOnHome 으로 홈에서만 뺀다.
 *   ★ 새 내부 링크(Link·Btn·Chips·LinkList·DocGrid·DoctorCard 링크)를 홈에 더하지 말 것 — 카드 줄 조건이 깨진다. 전화·네이버 예약 같은 바깥 링크는 괜찮다.
 */

const doc = docByPathStrict('/');
export const metadata: Metadata = metaFor(doc);

const HERO = { src: '/img/20210923_ed347b4ffee21.jpg', alt: IMG.interior[8].alt };
const FEATURES = [
  {
    slug: 'implant',
    h2: '화정 임플란트, 마지막 선택이 되도록',
    img: { src: '/img/clinic/implant-hero.webp', alt: '상담실에서 원장이 모니터와 치아 모형을 보며 임플란트 계획을 설명하는 모습' },
  },
  {
    slug: 'save-natural-tooth',
    h2: '화정동 신경치료·자연치아 살리기',
    img: { src: '/img/clinic/endo-surgery.webp', alt: '진료실에서 원장이 확대경을 쓰고 신경치료를 진행하는 모습' },
  },
  {
    slug: 'cavity',
    h2: '화정동 충치치료·잇몸치료·스케일링',
    img: { src: '/img/clinic/perio-explain.webp', alt: '상담실에서 잇몸 모형을 놓고 잇몸치료 과정을 설명하는 모습' },
  },
  {
    slug: 'wisdom-tooth',
    h2: '화정동 사랑니 발치',
    img: { src: '/img/clinic/wisdom-room.webp', alt: '사랑니 발치를 준비하는 진료실' },
  },
];

export default function HomePage() {
  const carousel = homeCarousel();
  const popularSymptoms = ['toothache-night', 'cold-sensitivity', 'bleeding-gums', 'missing-tooth', 'wisdom-tooth-pain', 'cracked-tooth', 'loose-tooth', 'crown-fell-out']
    .map((s) => SYMPTOMS.find((x) => x.slug === s)!)
    .filter(Boolean);

  return (
    <>
      {/* ★ 홈 정규 주소는 끝에 '/' — 네이버에서 홈에 카드가 붙은 홈 6곳 모두 이 꼴(2026-10-02). Next 메타데이터가 '/' 를 떼므로 직접 낸다 */}
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <SiteHeader overlay nav={false} />
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
                먼저 보는{' '}
                <em>
                  화정동 치과
                  {/* 병원 이름 '동그라미' — 손으로 그린 동그라미가 검색어를 감싼다(장식, 글자 아님). app/theme-warm.css */}
                  <svg className="circ" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path pathLength={1} d="M252 16C198 2 78 4 30 30C-4 50 26 90 150 92C268 94 312 62 282 30C262 10 196 6 138 12" />
                  </svg>
                </em>
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

        {/* ───── 진료 카드 6장 = 홈의 첫 사진 링크 묶음 ─────
            ★★★ 2026-10-01 실측(오너 캡처 gwanghwamundental.co.kr): 홈도 카드 줄을 받는다. 그 홈은 **첫 사진 링크 6개 =
            ItemList 6개(주소·사진·순서 동일)**. 우리는 첫 묶음이 바로가기 5칸(소개·비용·예약…)이라 네이버가 그 5칸을
            글자 바로가기로 냈다 → 진료 카드를 첫 묶음으로 올리고 바로가기 타일은 아래로. 카드 앞에 다른 내부 링크를 두지 말 것 */}
        <section className="sec" aria-labelledby="h-treat">
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">진료 안내</span>
                <h2 id="h-treat">화정치과 동그라미에서 하는 진료, 무엇을 먼저 보는지까지</h2>
                <p>진료 이름만 나열하지 않았습니다. 각 진료에서 검사로 먼저 확인하는 것과 살릴 수 있는 조건·없는 조건을 나눠 적었습니다.</p>
              </div>
            </div>
            <div className="grid grid--3">
              {/* ★ 카드 6장은 lib/carousel.ts 한 곳에서 나온다 — 화면 <h3> 와 ItemList.name 이 글자까지 같아야 검색 결과 카드 줄이 붙는다
                  ★★ 사진도 ItemList 와 **같은 URL(정사각 800×800)** 을 써야 한다. 2026-09-14 실측:
                     레퍼런스(1dentalsolution)는 ItemList 의 640×640 6장이 화면 <img> 에도 그대로 있어(겹침 6/6)
                     검색 결과 블록에 카드 줄이 붙었고, 우리는 화면이 3:2 webp·구조화 데이터가 정사각 jpg 라
                     겹침 0/6 이라 안 붙었다(네이버가 고른 썸네일도 화면에 있는 사진이었다). */}
              {carousel.map((c) => (
                <Link key={c.slug} href={c.path} className="t-card">
                  <img src={c.image} alt={c.name} width={800} height={800} loading="lazy" decoding="async" />
                  <div className="t-card-in">
                    <span className="card-tag">{c.tag}</span>
                    <h3>{c.name}</h3>
                    <p>{c.caption}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ───── 지금 진료 ───── */}
        <div className="wrap">
          <div className="now-bar">
            <OpenNow withDot />
            <span className="muted">
              {UNVERIFIED.hours.display.map((d) => `${d.label} ${d.time}`).join(' · ')} · {UNVERIFIED.hours.closed}
            </span>
          </div>
        </div>

        {/* ★ 바로가기 타일 5장(lib/quicklinks)은 2026-10-01 홈에서 뺐다 — 검색 결과의 글자 바로가기가 이 5칸과 같았다.
            레퍼런스(gwanghwamundental.co.kr) 홈은 메뉴성 링크 없이 카드 6장뿐이고 카드 줄을 받는다. 되살리지 말 것(결과 보고 판단) */}
        {/* ───── 왜 ───── */}
        <section className="sec sec--alt" aria-labelledby="h-why">
          <div className="wrap why">
            <div>
              <span className="eyebrow">동그라미치과의원은 어떤 곳인가요</span>
              <h2 id="h-why" style={{ fontSize: 'clamp(26px, 3vw, 36px)', marginTop: 14, marginBottom: 14 }}>
                화정치과 동그라미치과의원이 진료를 대하는 다섯 가지 기준
              </h2>
              <p className="muted" style={{ marginBottom: 28 }}>
                병원이 스스로 밝히고 있는 내용 그대로입니다. 근거가 되는 자격·인증은 병원 소개 페이지에서 실물 사진으로 확인하실 수 있습니다.
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
                <p className="muted">{SYMPTOM_GROUPS.map((g) => g.title).join(' · ')}</p>
                <p className="muted small" style={{ marginTop: 16 }}>
                  증상 {SYMPTOMS.length}가지 · 질환 15가지 · 진료실 문답 {docsOfKind('qa').length}편
                </p>
              </div>
              {/* 홈에서는 링크 없이 글로만 — 홈 내부 링크 8개 */}
              <dl className="home-sym">
                {popularSymptoms.map((s) => (
                  <div key={s.slug}>
                    <dt>{s.title}</dt>
                    <dd>{s.short}</dd>
                  </div>
                ))}
              </dl>
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
            </div>
            <div className="team-photo">
              <img src={IMG.doctorsTeam} alt="동그라미치과의원 의료진 — 김인진 원장, 변석호 대표원장, 김동주 원장" loading="lazy" decoding="async" width={1200} height={800} />
            </div>
            <div className="team-cards">
              {DOCTORS.map((d) => (
                <DoctorCard key={d.slug} d={d} link={false} />
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
                </div>
              </div>
              <div className="visit-box">
                <h3>진료시간</h3>
                <HoursTable />
                <p className="small muted">점심시간 {UNVERIFIED.hours.lunch.start}–{UNVERIFIED.hours.lunch.end} (토요일 제외)</p>
              </div>
            </div>
            {/* ★ 10-02 시험: 링크를 뺄 때 같이 빠진 지역 이름을 '링크 없는 글자'로 되살린다 — 순위가 링크 때문인지 글 때문인지 가르기 */}
            <div style={{ marginTop: 36 }}>
              <span className="eyebrow">이 동네에서 오신다면</span>
              <div className="chips" style={{ marginTop: 14 }}>
                {REGIONS.map((r) => (
                  <span key={r.slug}>{r.keyword}</span>
                ))}
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
            </div>
            <Faq items={CLINIC_QA.slice(0, 6).map((q) => ({ q: q.q, a: q.a }))} />
          </div>
        </section>

      </main>
      <JsonLd
        nodes={[
          webPageNode(doc),
          breadcrumbNode('/', [{ name: '홈', path: '/' }]),
          itemListNode('화정치과 동그라미치과의원 진료 안내', carousel.map((c) => ({ name: c.name, path: c.path, image: c.image }))),
          imageGalleryNode('동그라미치과의원 화정동 진료실과 진료 안내', [
            { src: HERO.src, name: '동그라미치과의원 진료실', caption: HERO.alt },
            { src: IMG.interior[3].src, name: '검사 결과 설명', caption: IMG.interior[3].alt },
            ...carousel.map((c) => ({ src: c.image, name: c.name, caption: c.caption })),
          ]),
        ]}
      />
    </>
  );
}
