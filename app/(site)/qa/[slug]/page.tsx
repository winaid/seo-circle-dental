import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, CtaBlock, JsonLd, LinkList, MedicalNotice, Pager, Chips } from '@/components/ui';
import { QA_ITEMS, qaBySlug, relatedDocs } from '@/lib/catalog';
import { requireDoc, neighbors, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, qaPageNode } from '@/lib/schema';
import { treatmentBySlug } from '@/lib/treatments';
import { specialBySlug } from '@/lib/specials';
import { implantTopicBySlug } from '@/lib/implantTopics';
import { conditionBySlug } from '@/lib/conditions';
import { symptomBySlug } from '@/lib/symptoms';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { REGIONS } from '@/lib/regions';
import { AREA_TREATMENTS } from '@/lib/regions';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('qa', '/qa/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const q = qaBySlug(slug);
  if (!q) return {};
  return metaFor(requireDoc(q.path));
}

function ParentContext({ q }: { q: NonNullable<ReturnType<typeof qaBySlug>> }) {
  const p = q.parent;
  if (p.kind === 'treatment') {
    const t = treatmentBySlug(p.slug)!;
    return (
      <>
        <p>{t.intro}</p>
        <h3>이런 경우에 {t.name}을 검토합니다</h3>
        <ul>
          {t.whoFor.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </>
    );
  }
  if (p.kind === 'special') {
    const s = specialBySlug(p.slug)!;
    return (
      <>
        <p>{s.body}</p>
        {s.context.map((c) => (
          <div key={c.h}>
            <h3>{c.h}</h3>
            <p>{c.p}</p>
          </div>
        ))}
      </>
    );
  }
  if (p.kind === 'implant-topic') {
    const it = implantTopicBySlug(p.slug)!;
    return (
      <>
        <p>{it.detail}</p>
        <h3>어떤 경우에 해당하나요</h3>
        <ul>
          {it.indications.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <h3>알아 둘 점</h3>
        <ul>
          {it.cautions.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </>
    );
  }
  if (p.kind === 'condition') {
    const c = conditionBySlug(p.slug)!;
    return (
      <>
        <p>
          <strong>{c.name}</strong>({c.aka.join(', ')}) — {c.definition}
        </p>
        <p>{c.detail}</p>
        <h3>일반적인 치료 방향</h3>
        <p>{c.treatment}</p>
      </>
    );
  }
  return (
    <>
      <p>{CLINIC.description}</p>
      <p>
        진료시간은 {UNVERIFIED.hours.display.map((d) => `${d.label} ${d.time}`).join(', ')}이며 {UNVERIFIED.hours.closed}입니다. {CLINIC.parking.type}을 {CLINIC.parking.fee}로 이용하실 수 있고, 예약은 전화({CLINIC.phone})·네이버 예약·카카오톡 상담으로 받습니다.
      </p>
    </>
  );
}

export default async function QaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const q = qaBySlug(slug);
  if (!q) notFound();
  const doc = requireDoc(q.path);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '진료실 문답', path: '/qa' },
    { name: q.parent.name, path: q.parent.href },
    { name: q.q, path: q.path },
  ];
  const symptoms = q.relatedSymptoms.map((s) => symptomBySlug(s)).filter(Boolean);
  const treatments = q.relatedTreatments.map((s) => treatmentBySlug(s)).filter(Boolean);
  const areaSlug = q.relatedTreatments.find((s) => (AREA_TREATMENTS as readonly string[]).includes(s));
  const { prev, next } = neighbors(doc);
  const siblingsIdx = QA_ITEMS.filter((x) => x.parent.href === q.parent.href);

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`진료실 문답 · ${q.category}`} related={relatedDocs(doc, 6)}>
        <AnswerFirst>{q.a}</AnswerFirst>
        <div className="prose">
          <h2>조금 더 설명드리면</h2>
          <ParentContext q={q} />

          <h2>관련 진료 안내</h2>
          <LinkList
            items={[
              { label: q.parent.name, href: q.parent.href, meta: '안내 페이지' },
              ...treatments.filter((t) => t && `/treatment/${t.slug}` !== q.parent.href).map((t) => ({ label: t!.name, href: `/treatment/${t!.slug}`, meta: '진료' })),
            ]}
          />

          {symptoms.length > 0 && (
            <>
              <h2>이런 증상이 있다면 함께 읽어 보세요</h2>
              <LinkList items={symptoms.map((s) => ({ label: s!.title, href: `/symptom/${s!.slug}`, meta: s!.short }))} />
            </>
          )}

          {q.siblings.length > 0 && (
            <>
              <h2>같은 주제의 다른 질문 {siblingsIdx.length > 1 ? `(${siblingsIdx.length - 1})` : ''}</h2>
              <LinkList mark="Q" items={q.siblings.map((s) => ({ label: s.q, href: s.path }))} />
            </>
          )}

          {areaSlug && (
            <>
              <h2>지역별 안내</h2>
              <Chips items={REGIONS.slice(0, 8).map((r) => ({ label: `${r.name} ${treatmentBySlug(areaSlug)!.short}`, href: `/area/${r.slug}/${areaSlug}` }))} />
            </>
          )}

          <CtaBlock title="이 질문, 진료실에서 직접 확인해 드립니다" />
          <MedicalNotice />
          <Pager prev={prev} next={next} />
          <p className="small muted" style={{ marginTop: 24 }}>
            <Link href="/qa">← 진료실 문답 전체 보기</Link>
          </p>
        </div>
      </ArticleShell>
      <JsonLd nodes={[qaPageNode(doc, q.q, q.a), breadcrumbNode(q.path, crumbs)]} />
    </>
  );
}
