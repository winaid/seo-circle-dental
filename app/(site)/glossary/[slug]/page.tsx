import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, JsonLd, LinkList, MedicalNotice, Pager } from '@/components/ui';
import { glossarySlug, relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { GLOSSARY } from '@/lib/insight';
import { treatmentBySlug } from '@/lib/treatments';
import { abs } from '@/lib/site';

export const revalidate = 3600;
export const dynamicParams = true;

const bySlug = (slug: string) => GLOSSARY.find((g) => glossarySlug(g.term) === slug);

export function generateStaticParams() {
  return publishedSlugs('glossary', '/glossary/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!bySlug(slug)) return {};
  return metaFor(requireDoc(`/glossary/${slug}`));
}

export default async function TermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = bySlug(slug);
  if (!g) notFound();
  const doc = requireDoc(`/glossary/${slug}`);
  const t = g.related ? treatmentBySlug(g.related) : undefined;
  const same = GLOSSARY.filter((x) => x.related === g.related && x.term !== g.term);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '용어 사전', path: '/glossary' },
    { name: g.term, path: doc.path },
  ];
  const { prev, next } = neighbors(doc);
  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow="치과 용어" related={relatedDocs(doc, 6)}>
        <AnswerFirst label="뜻">{g.def}</AnswerFirst>
        <div className="prose">
          {g.reading && (
            <p>
              <strong>{g.term}</strong>은(는) 진료실에서 <strong>{g.reading}</strong>이라고도 부릅니다. 같은 것을 가리키는 말이니 어느 쪽으로 들으셔도 됩니다.
            </p>
          )}
          {t && (
            <>
              <h2>어느 진료에서 나오는 말인가요</h2>
              <p>
                {t.name} 진료에서 자주 듣게 되는 용어입니다. {t.summary}
              </p>
              <LinkList items={[{ label: `${t.name} 진료 안내`, href: `/treatment/${t.slug}`, meta: t.short }]} />
            </>
          )}
          {same.length > 0 && (
            <>
              <h2>함께 알아두면 좋은 용어</h2>
              <LinkList items={same.map((x) => ({ label: x.term, href: `/glossary/${glossarySlug(x.term)}`, meta: x.reading }))} />
            </>
          )}
          <CtaBlock title="진료실에서 들은 말이 무슨 뜻인지, 언제든 다시 물어보셔도 됩니다" />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd
        nodes={[
          webPageNode(doc, { medical: true, about: { '@type': 'DefinedTerm', name: g.term, description: g.def, inDefinedTermSet: abs('/glossary') } }),
          articleNode(doc),
          breadcrumbNode(doc.path, crumbs),
        ]}
      />
    </>
  );
}
