import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { COST_TOPICS, COST_LABEL } from '@/lib/insight';
import { UNVERIFIED } from '@/lib/clinic';

export const revalidate = 3600;
const doc = docByPathStrict('/cost');
export const metadata: Metadata = metaFor(doc);

export default function CostHub() {
  const published = new Set(docsOfKind('cost').map((d) => d.path));
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '비용 기준', path: '/cost' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="비용 기준" title={doc.title} lead="같은 이름의 치료라도 건강보험이 적용되는 항목인지, 몇 개가 필요한지에 따라 금액이 달라집니다. 숫자 하나보다 '왜 다른가'를 먼저 알 수 있게 정리했습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <div className="grid grid--2">
          {COST_TOPICS.map((c) => {
            const href = `/cost/${c.slug}`;
            const on = published.has(href);
            const body = (
              <div className="card-body">
                <span className="card-tag">{COST_LABEL[c.covered]}</span>
                <h3>{c.title}</h3>
                <p>{c.answer}</p>
                <span className="card-more">{on ? '자세히 보기 →' : '곧 공개'}</span>
              </div>
            );
            return on ? (
              <Link key={c.slug} href={href} className="card">{body}</Link>
            ) : (
              <div key={c.slug} className="card">{body}</div>
            );
          })}
        </div>
        <p className="notice">{UNVERIFIED.pricing.note}</p>
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/cost', crumbs), itemListNode('비용 안내', COST_TOPICS.map((c) => ({ name: c.title, path: `/cost/${c.slug}` })))]} />
    </>
  );
}
