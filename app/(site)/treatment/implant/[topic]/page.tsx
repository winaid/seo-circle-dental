import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, Faq, JsonLd, LinkList, MedicalNotice, Pager } from '@/components/ui';
import { docsOfKind, treatmentImage, treatmentBySlugStrict } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { IMPLANT_TOPICS, implantTopicBySlug } from '@/lib/implantTopics';
import { charCount } from '@/lib/text';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('implant-topic', '/treatment/implant/').map((topic) => ({ topic }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params;
  if (!implantTopicBySlug(topic)) return {};
  return metaFor(requireDoc(`/treatment/implant/${topic}`));
}

export default async function ImplantTopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const it = implantTopicBySlug(topic);
  if (!it) notFound();
  const doc = requireDoc(`/treatment/implant/${topic}`);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '진료 안내', path: '/treatment' },
    { name: '임플란트', path: '/treatment/implant' },
    { name: it.name, path: doc.path },
  ];
  const { prev, next } = neighbors(doc);
  const related = docsOfKind('qa', 'cost', 'journey').filter((d) => d.category === '임플란트').slice(0, 6);
  const img = treatmentImage(treatmentBySlugStrict('implant'));
  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`임플란트 · ${it.tagline}`} hero={img} related={related}>
        <AnswerFirst>{it.answer}</AnswerFirst>
        <div className="prose">
          <p className="lead">{it.detail}</p>
          <h2>어떤 경우에 해당하나요</h2>
          <ul>
            {it.indications.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <h2>알아 둘 점</h2>
          <div className="callout callout--warn">
            <b>부작용과 한계를 숨기지 않습니다</b>
            <ul style={{ paddingLeft: 20, marginTop: 6 }}>
              {it.cautions.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <h2>자주 묻는 질문</h2>
          <Faq items={it.faq.map((f, i) => ({ q: f.q, a: f.a, href: `/qa/implant-${it.slug}-${i + 1}` }))} />
          <h2>다른 임플란트 안내</h2>
          <LinkList items={[{ label: '임플란트 진료 안내', href: '/treatment/implant', meta: '전체' }, ...IMPLANT_TOPICS.filter((x) => x.slug !== topic).map((x) => ({ label: x.name, href: `/treatment/implant/${x.slug}`, meta: x.tagline }))]} />
          <CtaBlock title="내 뼈 상태로 가능한지, CT 검사 후 정확히 안내드립니다" />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc, { wordCount: charCount(it.answer, it.detail, ...it.indications, ...it.cautions) }), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
