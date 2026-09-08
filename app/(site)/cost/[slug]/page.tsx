import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, JsonLd, LinkList, MedicalNotice, Pager } from '@/components/ui';
import { relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { COST_TOPICS, COST_LABEL } from '@/lib/insight';
import { REFS_COST } from '@/lib/references';
import { UNVERIFIED } from '@/lib/clinic';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('cost', '/cost/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!COST_TOPICS.find((c) => c.slug === slug)) return {};
  return metaFor(requireDoc(`/cost/${slug}`));
}

export default async function CostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COST_TOPICS.find((x) => x.slug === slug);
  if (!c) notFound();
  const doc = requireDoc(`/cost/${slug}`);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '비용 기준', path: '/cost' },
    { name: c.title, path: doc.path },
  ];
  const { prev, next } = neighbors(doc);
  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`비용 · ${COST_LABEL[c.covered]}`} related={relatedDocs(doc, 6)}>
        <AnswerFirst>{c.answer}</AnswerFirst>
        <div className="prose">
          <p className="lead">{c.detail}</p>
          <h2>비용을 가르는 요인</h2>
          <ul>
            {c.factors.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="callout">
            <b>금액을 적지 않은 이유</b>
            {UNVERIFIED.pricing.note} 정확한 금액은 검사 후 안내드리며, 비급여 항목은 원내 게시 진료비를 함께 확인하실 수 있습니다.
          </div>
          <h2>다른 비용 안내</h2>
          <LinkList items={COST_TOPICS.filter((x) => x.slug !== slug).map((x) => ({ label: x.title, href: `/cost/${x.slug}`, meta: COST_LABEL[x.covered] }))} />
          <h2>근거 자료</h2>
          <ul>
            {REFS_COST.map((r) => (
              <li key={r.url}>
                {r.publisher} — <a href={r.url} target="_blank" rel="noopener">{r.title}</a>
              </li>
            ))}
          </ul>
          <CtaBlock title="내 경우엔 보험이 되는지, 검사 후 정확히 안내드립니다" />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
