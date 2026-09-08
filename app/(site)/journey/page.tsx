import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { JOURNEYS } from '@/lib/insight';
import { NO_GUARANTEE_NOTE } from '@/lib/clinic';

export const revalidate = 3600;
const doc = docByPathStrict('/journey');
export const metadata: Metadata = metaFor(doc);

export default function JourneyHub() {
  const published = new Set(docsOfKind('journey').map((d) => d.path));
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '치료 여정', path: '/journey' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="치료 여정" title={doc.title} lead="치료를 결정할 때 가장 많이 묻는 두 가지 — 몇 번 와야 하고, 얼마나 걸리는지. 회차마다 하는 일과 기간이 길어지는 조건까지 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <div className="grid grid--2">
          {JOURNEYS.filter((j) => published.has(`/journey/${j.slug}`)).map((j) => (
            <Link key={j.slug} href={`/journey/${j.slug}`} className="card">
              <div className="card-body">
                <span className="card-tag">{j.treatment} · 내원 {j.visits} · {j.duration}</span>
                <h3>{j.question}</h3>
                <p>{j.answer}</p>
                <span className="card-more">회차별 내용 보기 →</span>
              </div>
            </Link>
          ))}
        </div>
        <p className="notice">{NO_GUARANTEE_NOTE}</p>
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/journey', crumbs), itemListNode('치료 여정', JOURNEYS.map((j) => ({ name: j.question, path: `/journey/${j.slug}` })))]} />
    </>
  );
}
