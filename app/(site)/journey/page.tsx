import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, cardListNode } from '@/lib/schema';
import { pathCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';
import { JOURNEYS } from '@/lib/insight';
import { NO_GUARANTEE_NOTE } from '@/lib/clinic';

export const revalidate = 3600;
const doc = docByPathStrict('/journey');
export const metadata: Metadata = metaFor(doc);

export default function JourneyHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '치료 여정', path: '/journey' },
  ];
  // 사진 카드 6장 = 화면 카드 = ItemList(사진 포함). 예전 목록은 사진이 0장이라 카드 재료가 못 됐다 (2026-09-28 네이버 캐러셀)
  const cards = pathCards(docsOfKind('journey').map((d) => d.path));
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="치료 여정" title={doc.title} lead="치료를 결정할 때 가장 많이 묻는 두 가지 — 몇 번 와야 하고, 얼마나 걸리는지. 회차마다 하는 일과 기간이 길어지는 조건까지 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <DocGrid docs={docsOfKind('journey')} cols={2} />
        <p className="notice">{NO_GUARANTEE_NOTE}</p>
        <CardRow title="치료 여정" cards={cards} />
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/journey', crumbs), ...cardListNode('치료 여정', cards)]} />
    </>
  );
}
