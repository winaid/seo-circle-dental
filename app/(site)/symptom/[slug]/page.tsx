import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, JsonLd, LinkList, MedicalNotice, Pager } from '@/components/ui';
import { relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { SYMPTOM_GROUPS, symptomBySlug, groupForSymptom } from '@/lib/symptoms';
import { conditionsForSymptom } from '@/lib/conditions';
import { treatmentBySlug } from '@/lib/treatments';
import { charCount } from '@/lib/text';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('symptom', '/symptom/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!symptomBySlug(slug)) return {};
  return metaFor(requireDoc(`/symptom/${slug}`));
}

export default async function SymptomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = symptomBySlug(slug);
  if (!s) notFound();
  const doc = requireDoc(`/symptom/${slug}`);
  const group = groupForSymptom(slug) ?? SYMPTOM_GROUPS[0];
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '증상으로 찾기', path: '/symptom' },
    { name: group.title, path: `/symptom#${group.slug}` },
    { name: s.short, path: doc.path },
  ];
  const conditions = conditionsForSymptom(slug);
  const treatments = s.relatedTreatments.map((t) => treatmentBySlug(t)).filter(Boolean);
  const siblings = group.symptoms.filter((x) => x !== slug).map((x) => symptomBySlug(x)).filter(Boolean);
  const { prev, next } = neighbors(doc);
  const words = charCount(s.answer, ...s.causes.map((c) => c.name + c.detail), ...s.selfCare, ...s.urgent);

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`증상 · ${group.short}`} hero={s.image} related={relatedDocs(doc, 6)}>
        <AnswerFirst>{s.answer}</AnswerFirst>
        <div className="prose">
          <h2>어떤 원인일 수 있나요</h2>
          <p>같은 증상이라도 원인은 여러 가지입니다. 아래는 진료실에서 자주 확인되는 원인이며, 어느 쪽인지는 검사로 가립니다.</p>
          {s.causes.map((c) => (
            <div key={c.name}>
              <h3>{c.name}</h3>
              <p>{c.detail}</p>
            </div>
          ))}

          {conditions.length > 0 && (
            <>
              <h2>어떤 질환일 수 있나요</h2>
              <LinkList items={conditions.map((c) => ({ label: `${c.name} (${c.aka[0]})`, href: `/condition/${c.slug}`, meta: '질환 안내' }))} />
            </>
          )}

          <h2>내원 전에 스스로 해볼 수 있는 것</h2>
          <ul>
            {s.selfCare.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>

          <h2>바로 진료가 필요한 신호</h2>
          <div className="callout callout--warn">
            <b>다음 중 하나라도 있으면 다음 진료일을 기다리지 마세요</b>
            <ul style={{ paddingLeft: 20, marginTop: 6 }}>
              {s.urgent.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          {treatments.length > 0 && (
            <>
              <h2>연결되는 진료</h2>
              <LinkList items={treatments.map((t) => ({ label: t!.name, href: `/treatment/${t!.slug}`, meta: t!.short }))} />
            </>
          )}

          {siblings.length > 0 && (
            <>
              <h2>{group.title} — 비슷한 증상</h2>
              <LinkList items={siblings.map((x) => ({ label: x!.title, href: `/symptom/${x!.slug}`, meta: x!.short }))} />
            </>
          )}

          <CtaBlock title="지금 느끼시는 증상, 검사로 원인을 가려 드립니다" />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc, { wordCount: words }), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
