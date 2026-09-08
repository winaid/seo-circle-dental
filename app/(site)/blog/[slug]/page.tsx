import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleShell, CtaBlock, JsonLd, MedicalNotice, Pager, AnswerFirst } from '@/components/ui';
import { relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { blogBySlug } from '@/lib/blog';
import { charCount, stripTags } from '@/lib/text';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('blog', '/blog/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!blogBySlug(slug)) return {};
  return metaFor(requireDoc(`/blog/${slug}`));
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = blogBySlug(slug);
  if (!p) notFound();
  const doc = requireDoc(`/blog/${slug}`);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '칼럼', path: '/blog' },
    { name: p.title, path: doc.path },
  ];
  const { prev, next } = neighbors(doc);
  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`칼럼 · ${p.category ?? ''}`} hero={p.image ? { src: p.image, alt: p.imageAlt ?? p.title } : undefined} related={relatedDocs(doc, 6)}>
        <AnswerFirst label="요약">{p.summary}</AnswerFirst>
        <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
        <div className="prose">
          <CtaBlock />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc, { type: 'BlogPosting', wordCount: charCount(stripTags(p.html)) }), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
