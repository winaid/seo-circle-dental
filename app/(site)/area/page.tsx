import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { REGIONS, regionDistanceM, regionStops } from '@/lib/regions';
import { fmtDistance, STATION_DISTANCE_M } from '@/lib/site';

export const revalidate = 3600;
const doc = docByPathStrict('/area');
export const metadata: Metadata = metaFor(doc);

export default function AreaHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '지역별 안내', path: '/area' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="지역별 안내" title={doc.title} lead={`병원은 3호선 화정역에서 ${fmtDistance(STATION_DISTANCE_M)} 거리에 있습니다. 동네마다 오시는 길과 직선거리, 3호선 정거장 수를 계산해 두었습니다. 소요 시간은 시간대마다 달라 적지 않았습니다.`} />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <div className="grid grid--3">
          {REGIONS.map((r) => {
            const stops = regionStops(r);
            return (
              <Link key={r.slug} href={`/area/${r.slug}`} className="card">
                <div className="card-body">
                  <span className="card-tag">{r.kind === '역' ? '지하철역' : r.kind === '생활권' ? '생활권' : r.kind}</span>
                  <h3>{r.keyword}</h3>
                  <p>
                    {r.kind === '역' ? `병원까지 ${fmtDistance(STATION_DISTANCE_M)}` : `직선거리 ${fmtDistance(regionDistanceM(r))}`}
                    {stops !== null && stops > 0 ? ` · 3호선 ${stops}정거장` : ''}
                    {r.otherRail ? ` · ${r.otherRail}` : ''}
                  </p>
                  <span className="card-more">오시는 길 →</span>
                </div>
              </Link>
            );
          })}
        </div>
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/area', crumbs), itemListNode('지역별 안내', REGIONS.map((r) => ({ name: r.keyword, path: `/area/${r.slug}` })))]} />
    </>
  );
}
