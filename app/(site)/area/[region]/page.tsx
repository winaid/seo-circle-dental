import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Chips, JsonLd, MedicalNotice } from '@/components/ui';
import { requireDoc, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { REGIONS, regionBySlug, regionDistanceM, regionStops, regionBearingKo, regionLine3Path, neighborsWithDistance } from '@/lib/regions';
import { fmtDistance, STATION_DISTANCE_M } from '@/lib/site';
import { regionCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';
import { Byline, ClinicGallery, DoctorStrip, LandingHero, LineMap, LpSection, TrustStrip, VisitBlock } from '@/components/Landing';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('area', '/area/').map((region) => ({ region }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  if (!regionBySlug(region)) return {};
  return metaFor(requireDoc(`/area/${region}`));
}

/*
 * 지역 안내 — 환자용 첫 화면 구조 (2026-09-28 오너: "SEO 만을 위한 느낌이라 이탈할 것 같다 · 구조도 바꿔라").
 * 순서: 첫 화면(어디서 얼마나 · 전화/예약) → 병원 한눈에 → 많이 찾는 진료(사진 카드 = 네이버 캐러셀 재료)
 *       → 오시는 길(노선 그림) → 원장 → 병원 사진 → 진료시간·예약 → 다른 동네 → 검토자.
 * ★ 바꾸지 않은 것: h1 글자(doc.title) · JSON-LD 세 개(ItemList 이름·주소·사진 그대로) · 지역 소개 문단(r.intro) · 카드 사진 파일.
 * ★ 병원 공통 정보는 짧은 이름표·사진으로만 — 26쪽이 같은 긴 문단을 되풀이하지 않게(중복 76%→49% 유지).
 */
export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const r = regionBySlug(region);
  if (!r) notFound();
  const doc = requireDoc(`/area/${region}`);
  const idx = REGIONS.findIndex((x) => x.slug === region);
  const dist = regionDistanceM(r);
  const stops = regionStops(r);
  const bearing = regionBearingKo(r);
  const line3Path = regionLine3Path(r) ?? (stops === 0 ? ['화정'] : null);
  const near = neighborsWithDistance(r);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '지역별 안내', path: '/area' },
    { name: r.keyword, path: doc.path },
  ];
  // 카드 6장 = 화면 카드 = ItemList(사진 포함). 네이버 캐러셀 재료 (2026-09-28)
  const cards = regionCards(r);
  const walk = fmtDistance(STATION_DISTANCE_M);
  const isStation = r.slug === 'hwajeong-station';
  const lead = isStation
    ? `화정역에서 걸어서 ${walk}, 덕양구청 방면입니다.`
    : stops !== null && stops > 0
      ? `${r.name}에서 3호선으로 ${stops}정거장, 화정역에서 내려 걸어오시면 됩니다.`
      : stops === 0
        ? `${r.name}에서 가장 가까운 3호선 역은 화정역이고, 병원은 역에서 ${walk}입니다.`
        : dist !== null
          ? `${r.name}에서 병원까지 직선거리 ${fmtDistance(dist)}${bearing ? `, 병원은 ${bearing}쪽에 있습니다` : '입니다'}.`
          : `${r.name}에서는 대곡역에서 3호선으로 갈아타 화정역에서 내리시면 됩니다.`;
  const facts = [
    dist !== null || isStation ? { k: '거리', v: isStation ? `역에서 ${walk}` : `직선 ${fmtDistance(dist!)}` } : { k: '가는 길', v: '교외선 → 대곡 환승' },
    { k: '지하철', v: stops !== null && stops > 0 ? `3호선 ${stops}정거장` : stops === 0 ? '3호선 화정역' : r.otherRail ? r.otherRail.split(' · ')[0] : '버스 · 자가용' },
    { k: '야간 진료', v: '화·목 20:30' },
    { k: '주차', v: '건물 내 무료' },
  ];
  const photo = doc.image ?? { src: '/img/clinic/doctors-team.webp', alt: '동그라미치과의원 의료진' };

  return (
    <>
      <div className="lp">
        <LandingHero doc={doc} crumbs={crumbs} eyebrow={`${r.name}에서 오시는 분께`} lead={lead} facts={facts} photo={photo} />
        <TrustStrip />

        <section className="lp-sec lp-sec--cards">
          <div className="wrap">
            <CardRow title={`${r.name}에서 많이 찾으시는 진료`} cards={cards} />
          </div>
        </section>

        <LpSection id="h-route" eyebrow="오시는 길" title={`${r.name}에서 동그라미치과의원까지`}>
          <div className="lp-route">
            <div className="lp-route-copy">
              <p className="lp-intro">{r.intro}</p>
              {r.transit.length > 0 && (
                <ul className="lp-transit">
                  {r.transit.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
              <div className="kv">
                {isStation ? (
                  <div><b>직선거리</b><span>화정역에서 병원까지 {walk}</span></div>
                ) : dist !== null ? (
                  <div><b>직선거리</b><span>{r.name}에서 병원까지 {fmtDistance(dist)}{bearing ? ` · 병원은 ${r.name}에서 ${bearing}쪽` : ''} (좌표 기준 계산값)</span></div>
                ) : null}
                {r.otherRail && <div><b>다른 노선</b><span>{r.otherRail}</span></div>}
              </div>
            </div>
            <div className="lp-route-map">
              {line3Path ? (
                <LineMap path={line3Path} walkM={walk} />
              ) : (
                <div className="lp-compass">
                  <b>{dist !== null ? fmtDistance(dist) : '대곡역 환승'}</b>
                  <span>{dist !== null ? `${r.name}에서 병원까지 직선거리${bearing ? ` · ${bearing}쪽` : ''}` : '교외선 → 대곡역 → 3호선 화정역'}</span>
                </div>
              )}
            </div>
          </div>
        </LpSection>

        <LpSection id="h-docs" eyebrow="진료하는 사람" title={`${r.name}에서 오시면 만나는 원장`} tone="alt">
          <DoctorStrip />
          <p className="lp-note"><Link href="/about">의료진과 장비 자세히 보기</Link></p>
        </LpSection>

        <LpSection id="h-gallery" eyebrow="병원 둘러보기" title={`${r.name}에서 오시는 병원 안`}>
          <ClinicGallery offset={idx} exclude={photo.src} />
        </LpSection>

        <section className="lp-sec lp-sec--visit">
          <div className="wrap">
            <VisitBlock title={`${r.name}에서 오시기 전에, 진료시간을 확인하세요`} />
          </div>
        </section>

        <LpSection id="h-near" eyebrow="다른 동네" title={`${r.name} 말고 다른 동네에서 오시나요?`}>
          {near.length > 0 && (
            <>
              <p className="lp-note lp-note--top">{r.name}과 가까운 동네</p>
              <Chips items={near.map(({ r: x, m }) => ({ label: m !== null ? `${x.keyword} · ${fmtDistance(m)}` : x.keyword, href: `/area/${x.slug}` }))} />
            </>
          )}
          <p className="lp-note lp-note--top">전체 지역</p>
          <Chips items={REGIONS.filter((x) => x.slug !== region).map((x) => ({ label: x.keyword, href: `/area/${x.slug}` }))} />
          <Byline doc={doc} />
          <MedicalNotice />
        </LpSection>
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode(doc.path, crumbs), itemListNode(`${r.keyword} 진료 안내`, cards.map((c) => ({ name: c.name, path: c.path, image: c.image })))]} />
    </>
  );
}
