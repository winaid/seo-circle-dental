import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader } from '@/components/SiteHeader';
import { Btn, DoctorCard, Faq, HoursTable, Icon, JsonLd } from '@/components/ui';
import { OpenNow } from '@/components/OpenNow';
import { CLINIC, STRENGTHS, UNVERIFIED } from '@/lib/clinic';
import { IMG } from '@/lib/assets';
import { treatmentBySlug } from '@/lib/treatments';
import { TREATMENTS } from '@/lib/treatments';
import { FIRST_VISIT_FLOW } from '@/lib/firstVisit';
import { DOCTORS } from '@/lib/doctors';
import { CLINIC_QA } from '@/lib/faq';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { webPageNode, breadcrumbNode, itemListNode, imageGalleryNode } from '@/lib/schema';
import { focusCards, type FocusKey } from '@/lib/focus';
import { SITE_URL, STATION_DISTANCE_M, fmtDistance } from '@/lib/site';
import { sentences } from '@/lib/text';

export const revalidate = 3600;

/*
 * ★★★ 홈 카드 줄 조건(2026-10-02 오너 GO) — 네이버 검색 결과에서 홈 주소에 카드 줄이 붙은 홈 6곳은 전부
 *   '홈 안 내부 링크 7~8개, 그중 6개가 사진 링크'였고 카드 6장 = HTML 첫 사진 링크 6개였다(49곳 실측, 안 붙은 43곳은 링크가 많거나 사진 목록이 없음).
 *   그래서 이 홈의 내부 링크 = 로고 + 진료 카드 6장 + 개인정보처리방침 = 8개. 메뉴·바닥 목록은 components/NotOnHome 으로 홈에서만 뺀다.
 *   ★ 새 내부 링크(Link·Btn·Chips·LinkList·DocGrid·DoctorCard 링크)를 홈에 더하지 말 것 — 카드 줄 조건이 깨진다. 전화·네이버 예약 같은 바깥 링크는 괜찮다.
 *   (10-06 정정: 링크 수는 갈림길이 아니었다 — 카드 붙은 홈 중 31·37링크도 있음. 위 8개는 그대로 둔 것)
 * ★★★★ 2026-10-06 첫 화면 = 카드 6장(오너 GO "테스트 해봐") — 1280×1000 렌더 실측(C:/tmp/carousel-study/layout-check.mjs):
 *   카드 붙은 홈(목록 5+) 15곳 전부 카드 줄이 맨 위 33~383px·그 위 큰 사진 0. 이 홈은 히어로 사진 뒤 1,188px 이라 안 붙었고,
 *   같은 이름·그림인 store 홈(123px)은 붙었다. 그래서 헤더 바로 아래 카드 → 그 다음 히어로(제목·사진·연락). 글자는 빼지 않고 순서만.
 *   카드 위에 큰 사진·긴 글을 두지 말 것.
 */

const doc = docByPathStrict('/');
export const metadata: Metadata = metaFor(doc);

const HERO = { src: '/img/20210923_ed347b4ffee21.jpg', alt: IMG.interior[8].alt };
const FEATURES = [
  {
    slug: 'implant',
    h2: '화정치과 임플란트, 마지막 선택이 되도록',
    img: { src: '/img/clinic/implant-hero.webp', alt: '상담실에서 원장이 모니터와 치아 모형을 보며 임플란트 계획을 설명하는 모습' },
  },
  {
    slug: 'save-natural-tooth',
    h2: '화정동 신경치료·자연치아 살리기',
    img: { src: '/img/20210923_217b53ad1570b.jpg', alt: '파노라마 엑스레이 화면과 태블릿의 구강 사진을 나란히 놓고 설명하는 모습' },
  },
  {
    slug: 'cavity',
    h2: '화정 치과 충치치료·잇몸치료·스케일링',
    img: { src: '/img/clinic/perio-explain.webp', alt: '상담실에서 잇몸 모형을 놓고 잇몸치료 과정을 설명하는 모습' },
  },
  {
    slug: 'wisdom-tooth',
    h2: '화정치과 사랑니 발치',
    img: { src: '/img/20210923_956b5d44b57ef.jpg', alt: '상담실에서 파노라마 엑스레이 화면과 치아 모형으로 설명하는 모습' },
  },
];

/* 홈 카드 아래 한 줄 — 카드 이름·그림은 content/focus-cards.json(홈 전용 문장) */
const walk = fmtDistance(STATION_DISTANCE_M);
const CAPTION: Partial<Record<FocusKey, string>> = {
  station: `3호선 화정역에서 덕양구청 방면으로 직선거리 ${walk}입니다.`,
  dong: '화정2동 현창빌딩 3층, 화정동 단지에서 걸어서 오실 수 있습니다.',
  gu: '원당과 원흥, 삼송에서도 3호선 한 노선으로 오십니다.',
  treat: '진료 열 가지와 진료마다 먼저 확인하는 것을 적었습니다.',
  doctors: '세 명 모두 보건복지부인증 통합치의학과 전문의입니다.',
  visit: '월·수·금 18:30, 화·목 20:30, 토요일 14:00까지입니다.',
};
const KEY_OF_PATH: Record<string, FocusKey> = { '/area/hwajeong-station': 'station', '/area/hwajeong-1': 'dong', '/area/deogyang': 'gu', '/treatment': 'treat', '/about': 'doctors', '/visit': 'visit' };

export default function HomePage() {
  // ★ 2026-10-08 네 검색어 집중판 — 홈 카드 6장 = 남긴 쪽 여섯(lib/focus.ts). 이름 앞은 늘 '지역+치과'(10-06 홈 카드 조건)
  const carousel = focusCards('home').map((c) => ({ ...c, caption: CAPTION[KEY_OF_PATH[c.path]] ?? '' }));

  return (
    <>
      {/* ★ 홈 정규 주소는 끝에 '/' — 네이버에서 홈에 카드가 붙은 홈 6곳 모두 이 꼴(2026-10-02). Next 메타데이터가 '/' 를 떼므로 직접 낸다 */}
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta property="og:url" content={`${SITE_URL}/`} />
      <SiteHeader nav={false} />
      <main id="main">
        {/* ───── 진료 카드 6장 = 첫 화면 ─────
            ★★★ 2026-10-01 실측(오너 캡처 gwanghwamundental.co.kr): 홈도 카드 줄을 받는다. 그 홈은 **첫 사진 링크 6개 =
            ItemList 6개(주소·사진·순서 동일)**. 카드 앞에 다른 내부 링크를 두지 말 것.
            ★★★★ 10-06: 카드 위에는 헤더만 — 히어로 사진·제목은 카드 아래(파일 위 주석). 제목 h2 도 카드 아래로 옮겼다(카드 위 글자 줄이기) */}
        <section className="home-cards" aria-label="화정치과 진료 안내">
          <div className="wrap">
            {/* ★ 10-07 시험(오너 GO "shop 홈 시험해보자"): 큰 제목 한 줄만 카드 위로 — 문구는 그대로, 위치만.
                10-06 22:58 '화정 치과' 통합에서 빠지고 웹탭 11→16. 첫 화면을 카드로 바꿀 때 h1 이 1,699px 로 내려간 것이 후보.
                카드 조건(맨 위 400px 안·위에 큰 사진 0·위 글자 ≤103자 — 카드 붙은 홈 15곳 실측)은 지킨다
                → 결과: 09:58 재독, 10:59 '화정동 치과' 홈 웹탭 45밖 → 11위(3회 같음). '화정 치과'는 17위 그대로(h1 에 그 꼴 없음).
                ★ 10-07 2차 시험(cd9639c, 오너 GO "해보자"): h1 낱말을 '화정 치과'로, '화정동 치과'는 위 작은 줄로 → 11:24 재독,
                12:20 '화정동 치과' 홈 11위 → 45밖(3회 같음), '화정 치과' 17 → 16(변화 없음). 실패 → 1차로 되돌림.
                ⛔ 결론: 그 검색어 홈 순위는 '맨 위 h1 안의 그 낱말'이 정한다(맨 위 작은 줄로는 안 됨, h1 을 아래로 내려도 안 됨).
                '화정 치과'는 h1 으로 움직이지 않는다 — 플랫폼·블로그 끼어듦과 위 병원 홈들이 막는 검색어
                ★ 10-07 3차(오너 GO "광화문 선치과 그 업체처럼"): gwanghwamundental.co.kr 홈 = h1 이 검색어로 시작('광화문치과 찾으신다면…'),
                h2 8개 중 6개·본문 44회, 플레이스 홈페이지 아님(플레이스는 dentalsun)인데 통합 1~4위·카드. 우리 홈은 플레이스 미연결이라 같은 길.
                h1 맨 앞에 '화정치과 동그라미치과의원' 줄, '…화정동 치과'는 그대로 둔다(화정동 11위 유지). h2 2/10 → 7/10, 본문 10 → 20회 남짓
                ★ 2026-10-08 네 검색어 집중판(오너 "다 없애고 네 개만"): '화정동 치과'는 /area/hwajeong-1 이 맡는다 → 홈 h1 끝 낱말을 '화정 치과'로.
                홈 = 화정치과·화정 치과 둘(h1 두 줄에 하나씩). 제목(title)은 바꾸지 않았다 — 잦은 제목 변경은 네이버가 불이익을 준다고 적어 둔 것 */}
            <div className="home-top">
              <span className="eyebrow">고양시 덕양구 화정동 · 3호선 화정역</span>
              <h1>
                <span className="h1-kw">화정치과 동그라미치과의원</span>
                뽑기 전에 살릴 수 있는지 먼저 보는{' '}
                <em>
                  화정 치과
                  {/* 병원 이름 '동그라미' — 손으로 그린 동그라미가 검색어를 감싼다(장식, 글자 아님). app/globals.css .home-top .circ */}
                  <svg className="circ" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                    <path pathLength={1} d="M252 16C198 2 78 4 30 30C-4 50 26 90 150 92C268 94 312 62 282 30C262 10 196 6 138 12" />
                  </svg>
                </em>
              </h1>
            </div>
            <div className="grid grid--3 home-cards-grid">
              {/* ★ 카드 6장은 content/focus-cards.json(lib/focus.ts) 한 곳에서 나온다 — 화면 <h3> 와 ItemList.name 이 글자까지 같아야 검색 결과 카드 줄이 붙는다
                  ★★ 사진도 ItemList 와 **같은 URL(정사각 800×800)** 을 써야 한다. 2026-09-14 실측:
                     레퍼런스(1dentalsolution)는 ItemList 의 640×640 6장이 화면 <img> 에도 그대로 있어(겹침 6/6)
                     검색 결과 블록에 카드 줄이 붙었고, 우리는 화면이 3:2 webp·구조화 데이터가 정사각 jpg 라
                     겹침 0/6 이라 안 붙었다(네이버가 고른 썸네일도 화면에 있는 사진이었다). */}
              {/* 그림 속에 제목 글자가 이미 있어(scripts/focus-card-art.mjs) 이름·설명은 그림 아래에 — 겹쳐 올리면 글자가 이중으로 보인다 */}
              {carousel.map((c, i) => (
                <Link key={c.path} href={c.path} className="h-card">
                  <span className="h-card-img">
                    <img src={c.image} alt={c.alt} width={800} height={800} loading={i < 3 ? 'eager' : 'lazy'} decoding="async" />
                  </span>
                  <span className="h-card-in">
                    <span className="card-tag">{c.tag}</span>
                    <h3>{c.name}</h3>
                    <p>{c.caption}</p>
                  </span>
                </Link>
              ))}
            </div>
            <div className="sec-head home-cards-head">
              <span className="eyebrow">화정 치과 안내</span>
              <h2 id="h-treat">화정치과를 알아보고 계신다면, 진료 이름보다 진단 순서를 먼저</h2>
              <p>화정 치과 동그라미치과의원은 뽑을지 살릴지를 검사로 먼저 확인합니다. 오시는 길과 진료시간, 의료진, 진료마다 먼저 보는 것을 위 여섯 쪽에 나눠 적었습니다.</p>
            </div>
          </div>
        </section>

        {/* ───── 히어로 (카드 아래) ───── */}
        <section className="hero hero--after" aria-label="소개">
          <div className="hero-bg">
            <img src={HERO.src} alt={HERO.alt} fetchPriority="high" decoding="async" width={1920} height={1280} />
          </div>
          <div className="hero-shade" aria-hidden="true" />
          <div className="hero-ring" aria-hidden="true" />
          <div className="wrap hero-in">
            <div className="hero-copy">
              {/* 10-07: 제목(h1)과 위 작은 줄은 카드 위(.home-top)로 옮겼다 — 같은 글자가 두 번 나오지 않게 여기서는 뺀다 */}
              <p className="hero-lead enter enter-3">
                화정 치과 동그라미치과의원은 통합치의학과 전문의 세 명이 자연치아를 남길 수 있는지부터 확인합니다. 살릴 수 있는 치아는 신경치료로, 그렇지 않은 치아는 임플란트로 — 어느 쪽이 맞는지 검사 뒤에 함께 정합니다.
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
                    <span className="eyebrow">화정치과 · {t.name}</span>
                    <h2>{f.h2}</h2>
                    <p>{t.summary}</p>
                    <p>{intro.slice(0, 3).join(' ')}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ───── 진료 열 가지 (2026-10-08 — 증상 구획 자리. 증상·질환 쪽은 지웠다) ───── */}
        <section className="sec sec--alt" aria-labelledby="h-all">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">진료 과목</span>
              <h2 id="h-all">화정 치과 동그라미치과의원에서 하는 진료 열 가지</h2>
              <p>진료 이름만 늘어놓지 않고, 진료마다 무엇을 먼저 확인하는지 한 줄씩 적었습니다. 진료별 자세한 내용은 진료 안내 쪽에 있습니다.</p>
            </div>
            {/* 홈에서는 링크 없이 글로만 — 홈 첫 링크 묶음은 카드 6장 */}
            <dl className="home-sym home-all">
              {TREATMENTS.map((t) => (
                <div key={t.slug}>
                  <dt>{t.name}</dt>
                  <dd>{t.summary}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ───── 첫 진료 ───── */}
        <section className="sec" aria-labelledby="h-first">
          <div className="wrap two">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">처음 오시면</span>
              <h2 id="h-first">화정치과 첫 진료는 이렇게 진행됩니다</h2>
              <p>처음 오신 날 바로 치료부터 하지 않습니다. 복용 중인 약을 확인하고 사진을 찍은 뒤, 그 사진을 함께 보면서 지금 상태와 선택지를 설명합니다.</p>
            </div>
            <ol className="steps">
              {FIRST_VISIT_FLOW.map((x) => (
                <li key={x.n}>
                  <div>
                    <b>{x.t}</b>
                    <p>{x.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───── 의료진 ───── */}
        <section className="sec sec--alt" aria-labelledby="h-team">
          <div className="wrap team">
            <div className="sec-head sec-head--row">
              <div>
                <span className="eyebrow">의료진</span>
                <h2 id="h-team">화정치과 의료진, 세 명 모두 보건복지부인증 통합치의학과 전문의입니다</h2>
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
        <section className="sec" aria-labelledby="h-visit">
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
            {/* ★ 2026-10-08: 지역 칩 26개(다른 동네 검색어)는 뺐다 — 네 검색어만. 그 셋의 길은 글로 */}
            <div className="home-ways">
              <div>
                <h3>화정역에서</h3>
                <p>3호선 화정역에서 덕양구청 방면으로 나와 화중로를 따라 남쪽으로 내려오시면 됩니다. 역에서 직선거리 {walk}입니다.</p>
              </div>
              <div>
                <h3>화정동에서</h3>
                <p>병원은 화정2동 한가운데에 있어 화정동 단지 대부분에서 걸어서 오실 수 있습니다. 화정1동에서는 화정역을 지나 남쪽으로 내려오시면 됩니다.</p>
              </div>
              <div>
                <h3>덕양구에서</h3>
                <p>원당과 원흥, 삼송에서는 3호선 한 노선으로 오시고, 행신동과 능곡에서는 화정역 방면 버스나 대곡역 환승으로 오시면 됩니다.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───── 고르실 때 (2026-10-08 — 광화문 업체 홈의 '광화문치과를 알아보고 계신다면' 구획과 같은 자리) ───── */}
        <section className="sec sec--alt" aria-labelledby="h-pick">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">고르실 때</span>
              <h2 id="h-pick">화정치과를 알아보고 계신다면</h2>
            </div>
            <div className="fc-body">
              <p>화정 치과를 고르실 때는 집이나 회사에서 오가기 편한지, 저녁이나 토요일에 시간을 낼 수 있는지부터 보시게 됩니다. 동그라미치과의원은 3호선 화정역에서 덕양구청 방면으로 직선거리 {walk}이고, 화요일과 목요일은 저녁 8시 30분까지, 토요일은 오후 2시까지 진료합니다.</p>
              <p>그다음은 누가 어떤 순서로 진단하는지입니다. 화정치과 동그라미치과의원은 보건복지부인증 통합치의학과 전문의 세 명이 진료하고, 저선량으로 촬영하는 CT와 구강스캐너로 찍은 사진을 함께 보며 지금 상태를 설명합니다.</p>
              <p>치료를 정할 때는 그 치아를 남길 수 있는지부터 확인하고, 남길 수 없을 때 임플란트를 말씀드립니다. 비용은 검사 뒤에 건강보험 적용 여부와 함께 설명합니다.</p>
            </div>
          </div>
        </section>

        {/* ───── FAQ ───── */}
        <section className="sec" aria-labelledby="h-faq">
          <div className="wrap two">
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <span className="eyebrow">자주 묻는 질문</span>
              <h2 id="h-faq">화정치과 내원 전에 자주 물으시는 것</h2>
              <p>진료시간·예약·주차·비용처럼 오시기 전에 궁금한 것부터 답합니다. 진료 내용은 진료 안내 쪽에 진료마다 적었습니다.</p>
            </div>
            <Faq items={CLINIC_QA.slice(0, 6).map((q) => ({ q: q.q, a: q.a }))} />
          </div>
        </section>

      </main>
      <JsonLd
        nodes={[
          webPageNode(doc),
          breadcrumbNode('/', [{ name: '홈', path: '/' }]),
          itemListNode('화정치과 동그라미치과의원 안내', carousel.map((c) => ({ name: c.name, path: c.path, image: c.image }))),
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
