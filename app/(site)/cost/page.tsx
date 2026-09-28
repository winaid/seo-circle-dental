import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, cardListNode } from '@/lib/schema';
import { pathCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';
import { COST_TOPICS } from '@/lib/insight';
import { UNVERIFIED } from '@/lib/clinic';

export const revalidate = 3600;
const doc = docByPathStrict('/cost');
export const metadata: Metadata = metaFor(doc);

export default function CostHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '비용 기준', path: '/cost' },
  ];
  // 사진 카드 6장 = 화면 카드 = ItemList(사진 포함). 예전 목록은 사진이 0장이라 카드 재료가 못 됐다 (2026-09-28 네이버 캐러셀)
  const cards = pathCards(docsOfKind('cost').map((d) => d.path));
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="비용 기준" title={doc.title} lead="같은 이름의 치료라도 건강보험이 적용되는 항목인지, 몇 개가 필요한지에 따라 금액이 달라집니다. 숫자 하나보다 '왜 다른가'를 먼저 알 수 있게 정리했습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <DocGrid docs={docsOfKind('cost')} cols={2} />
        <p className="notice">{UNVERIFIED.pricing.note}</p>
        <CardRow title="비용 기준과 이어진 진료" cards={cards} />
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/cost', crumbs), ...cardListNode('비용 기준', cards)]} />
    </>
  );
}
