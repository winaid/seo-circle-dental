import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, Chips, CtaBlock, JsonLd, MedicalNotice } from '@/components/ui';
import { docsOfKind } from '@/lib/catalog';
import { requireDoc, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { REGIONS, regionBySlug, regionDistanceM, regionStops, regionBearingKo, regionLine3Path, neighborsWithDistance } from '@/lib/regions';
import { fmtDistance, STATION_DISTANCE_M } from '@/lib/site';
import { CLINIC } from '@/lib/clinic';
import { regionCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';

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

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const r = regionBySlug(region);
  if (!r) notFound();
  const doc = requireDoc(`/area/${region}`);
  const dist = regionDistanceM(r);
  const stops = regionStops(r);
  const bearing = regionBearingKo(r);
  const line3Path = regionLine3Path(r);
  const near = neighborsWithDistance(r);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '지역별 안내', path: '/area' },
    { name: r.keyword, path: doc.path },
  ];
  // 카드 6장 = 화면 카드 = ItemList(사진 포함). 네이버 캐러셀 재료 (2026-09-28)
  const cards = regionCards(r);
  const related = docsOfKind('area').filter((d) => d.path !== doc.path).slice(0, 6);

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`지역 안내 · ${r.name}`} related={related}>
        <AnswerFirst label={`${r.alt ?? r.keyword}를 찾으신다면`}>{r.intro}</AnswerFirst>
        <div className="prose">
          <CardRow title={`${r.name}에서 많이 찾으시는 진료`} cards={cards} />

          {/* ★ 2026-09-28: 쪽마다 같던 진료시간표·병원 강점·의료진·병원 문답은 뺐다(26쪽이 76~85% 같은 문장이었다).
              여기엔 좌표·노선으로 계산한 그 지역만의 사실만 둔다. 병원 공통 정보는 아래 한 줄 링크가 맡는다. */}
          <h2>{r.name}에서 오시는 길</h2>
          <div className="kv">
            {r.slug === 'hwajeong-station' ? (
              <div><b>직선거리</b><span>화정역에서 병원까지 {fmtDistance(STATION_DISTANCE_M)}</span></div>
            ) : dist !== null ? (
              <div><b>직선거리</b><span>{r.name}에서 병원까지 {fmtDistance(dist)}{bearing ? ` · 병원은 ${r.name}에서 ${bearing}쪽` : ''} (좌표 기준 계산값)</span></div>
            ) : null}
            {stops !== null && stops > 0 && <div><b>3호선</b><span>{line3Path ? line3Path.join(' → ') : `${r.line3} → 화정`} · {stops}정거장, 환승 없음</span></div>}
            {stops === 0 && <div><b>3호선</b><span>화정역 하차 · 병원까지 {fmtDistance(STATION_DISTANCE_M)}</span></div>}
            {r.otherRail && <div><b>다른 노선</b><span>{r.otherRail}</span></div>}
            <div><b>주소</b><span>{CLINIC.address.full}</span></div>
          </div>
          {r.transit.length > 0 && (
            <ul>
              {r.transit.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <p className="small muted">
            진료시간·주차는 <Link href="/visit">오시는 길</Link>, 의료진과 검사 방법은 <Link href="/about">병원 소개</Link>, 예약·비용 질문은 <Link href="/faq">자주 묻는 질문</Link>에 모아 두었습니다.
          </p>

          {near.length > 0 && (
            <>
              <h2>{r.name} 가까운 동네</h2>
              <Chips items={near.map(({ r: x, m }) => ({ label: m !== null ? `${x.keyword} · ${fmtDistance(m)}` : x.keyword, href: `/area/${x.slug}` }))} />
            </>
          )}
          <h2>다른 지역에서 오시는 길</h2>
          <Chips items={REGIONS.filter((x) => x.slug !== region).map((x) => ({ label: x.keyword, href: `/area/${x.slug}` }))} />

          <CtaBlock title={`${r.name}에서 오시는 길, 전화 주시면 바로 안내드립니다`} />
          <MedicalNotice />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode(doc.path, crumbs), itemListNode(`${r.keyword} 진료 안내`, cards.map((c) => ({ name: c.name, path: c.path, image: c.image })))]} />
    </>
  );
}
