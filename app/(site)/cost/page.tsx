import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
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
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="비용 기준" title={doc.title} lead="같은 이름의 치료라도 건강보험이 적용되는 항목인지, 몇 개가 필요한지에 따라 금액이 달라집니다. 숫자 하나보다 '왜 다른가'를 먼저 알 수 있게 정리했습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <DocGrid docs={docsOfKind('cost')} cols={2} />
        <p className="notice">{UNVERIFIED.pricing.note}</p>
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/cost', crumbs), itemListNode('비용 안내', COST_TOPICS.map((c) => ({ name: c.title, path: `/cost/${c.slug}` })))]} />
    </>
  );
}
