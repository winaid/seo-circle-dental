import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, JsonLd, LinkList, MedicalNotice, Pager } from '@/components/ui';
import { relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { journeyBySlug, JOURNEYS } from '@/lib/insight';
import { treatmentBySlug } from '@/lib/treatments';
import { NO_GUARANTEE_NOTE } from '@/lib/clinic';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('journey', '/journey/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!journeyBySlug(slug)) return {};
  return metaFor(requireDoc(`/journey/${slug}`));
}

export default async function JourneyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const j = journeyBySlug(slug);
  if (!j) notFound();
  const doc = requireDoc(`/journey/${slug}`);
  const t = treatmentBySlug(slug) ?? treatmentBySlug('crown-prosthesis');
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '치료 여정', path: '/journey' },
    { name: j.treatment, path: doc.path },
  ];
  const { prev, next } = neighbors(doc);
  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`치료 여정 · ${j.treatment}`} related={relatedDocs(doc, 6)}>
        <AnswerFirst>{j.answer}</AnswerFirst>
        <div className="stat-row">
          <div className="stat"><small>내원 횟수</small><b>{j.visits}</b></div>
          <div className="stat"><small>전체 기간</small><b>{j.duration}</b></div>
          <div className="stat"><small>진료</small><b>{j.treatment}</b></div>
        </div>
        <div className="prose">
          <h2>회차마다 무엇을 하나요</h2>
          <ol className="steps">
            {j.steps.map((s) => (
              <li key={s.label}>
                <div>
                  <b>{s.label}</b>
                  <p>{s.what}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2>기간이 길어지는 경우</h2>
          <ul>
            {j.variables.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>
          <div className="callout">{NO_GUARANTEE_NOTE}</div>

          {t && (
            <>
              <h2>진료 안내</h2>
              <LinkList items={[{ label: `${t.name} 진료 안내`, href: `/treatment/${t.slug}`, meta: '동그라미치과' }, ...JOURNEYS.filter((x) => x.slug !== slug).slice(0, 4).map((x) => ({ label: x.question, href: `/journey/${x.slug}`, meta: x.treatment }))]} />
            </>
          )}

          <CtaBlock title="내 경우엔 몇 번 와야 하는지, 검사 후 정확히 안내드립니다" />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
