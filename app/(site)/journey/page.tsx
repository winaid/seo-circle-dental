import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
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
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="치료 여정" title={doc.title} lead="치료를 결정할 때 가장 많이 묻는 두 가지 — 몇 번 와야 하고, 얼마나 걸리는지. 회차마다 하는 일과 기간이 길어지는 조건까지 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <DocGrid docs={docsOfKind('journey')} cols={2} />
        <p className="notice">{NO_GUARANTEE_NOTE}</p>
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/journey', crumbs), itemListNode('치료 여정', JOURNEYS.map((j) => ({ name: j.question, path: `/journey/${j.slug}` })))]} />
    </>
  );
}
