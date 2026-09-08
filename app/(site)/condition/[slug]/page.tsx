import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, Faq, JsonLd, LinkList, MedicalNotice, Pager } from '@/components/ui';
import { relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, conditionNode, webPageNode } from '@/lib/schema';
import { conditionBySlug } from '@/lib/conditions';
import { symptomBySlug } from '@/lib/symptoms';
import { treatmentBySlug } from '@/lib/treatments';
import { REFS_CONDITION } from '@/lib/references';
import { charCount } from '@/lib/text';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('condition', '/condition/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!conditionBySlug(slug)) return {};
  return metaFor(requireDoc(`/condition/${slug}`));
}

export default async function ConditionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = conditionBySlug(slug);
  if (!c) notFound();
  const doc = requireDoc(`/condition/${slug}`);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '질환 안내', path: '/condition' },
    { name: c.name, path: doc.path },
  ];
  const symptoms = c.relatedSymptoms.map((s) => symptomBySlug(s)).filter(Boolean);
  const treatments = c.relatedTreatments.map((t) => treatmentBySlug(t)).filter(Boolean);
  const { prev, next } = neighbors(doc);
  const about = conditionNode(c);
  const words = charCount(c.definition, c.detail, c.treatment, ...c.signs, ...c.causes, ...c.prevention, ...c.stages.map((s) => s.what));

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`질환 · ${c.aka.join(' · ')}`} related={relatedDocs(doc, 6)}>
        <AnswerFirst label="한 문장 정의">{c.definition}</AnswerFirst>
        <div className="prose">
          <p className="lead">{c.detail}</p>

          <h2>{c.name}의 증상</h2>
          <ul>
            {c.signs.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <h2>원인과 위험 요인</h2>
          <ul>
            {c.causes.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <h2>방치하면 어떻게 진행되나요</h2>
          <ol className="steps">
            {c.stages.map((s) => (
              <li key={s.step}>
                <div>
                  <b>{s.step}</b>
                  <p>{s.what}</p>
                </div>
              </li>
            ))}
          </ol>

          <h2>일반적인 치료 방향</h2>
          <p>{c.treatment}</p>
          {treatments.length > 0 && <LinkList items={treatments.map((t) => ({ label: `${t!.name} 진료 안내`, href: `/treatment/${t!.slug}`, meta: '동그라미치과' }))} />}

          <h2>예방과 관리</h2>
          <ul>
            {c.prevention.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <h2>자주 묻는 질문</h2>
          <Faq items={c.faq.map((f, i) => ({ q: f.q, a: f.a, href: `/qa/${c.slug}-${i + 1}` }))} />

          {symptoms.length > 0 && (
            <>
              <h2>관련 증상</h2>
              <LinkList items={symptoms.map((s) => ({ label: s!.title, href: `/symptom/${s!.slug}`, meta: s!.short }))} />
            </>
          )}

          <h2>참고 자료</h2>
          <ul>
            {REFS_CONDITION.map((r) => (
              <li key={r.url}>
                {r.publisher} — <a href={r.url} target="_blank" rel="noopener">{r.title}</a>
              </li>
            ))}
          </ul>

          <CtaBlock title={`${c.name}이 의심된다면 검사로 확인해 드립니다`} />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true, about: { '@id': about['@id'] } }), about, articleNode(doc, { wordCount: words, about: { '@id': about['@id'] } }), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
