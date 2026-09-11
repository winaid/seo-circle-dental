import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, Chips, CtaBlock, Faq, JsonLd, LinkList, MedicalNotice } from '@/components/ui';
import { docsOfKind, treatmentImage, isLivePath } from '@/lib/catalog';
import { requireDoc, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, procedureNode, webPageNode } from '@/lib/schema';
import { TREATMENTS, treatmentBySlug, type Treatment } from '@/lib/treatments';
import { TREATMENT_PAGES, type TreatmentBlock } from '@/lib/treatmentPages';
import { journeyForTreatment } from '@/lib/insight';
import { symptomBySlug } from '@/lib/symptoms';
import { IMPLANT_TOPICS } from '@/lib/implantTopics';
import { IMPLANT_STEPS } from '@/lib/implantPage';
import { IMPLANT_CASES, CASE_NOTICE } from '@/lib/implantCases';
import { COMPARISONS } from '@/lib/comparisons';
import { LAMINATE_FEATURES, MATERIALS, SHADE_STEPS, METHODS } from '@/lib/aestheticPage';
import { REGIONS, AREA_TREATMENTS } from '@/lib/regions';
import { REFS_TREATMENT } from '@/lib/references';
import { NO_GUARANTEE_NOTE } from '@/lib/clinic';
import { charCount } from '@/lib/text';

export const revalidate = 3600;
export const dynamicParams = true;

/** TREATMENT_PAGES 의 'aesthetic' 키는 치아미백 원고다. */
const pageKey = (slug: string) => (slug === 'whitening' ? 'aesthetic' : slug);

export function generateStaticParams() {
  return publishedSlugs('treatment', '/treatment/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!treatmentBySlug(slug)) return {};
  return metaFor(requireDoc(`/treatment/${slug}`));
}

function Block({ b }: { b: TreatmentBlock }) {
  return (
    <section>
      <h2>{b.title}</h2>
      {b.desc && <p>{b.desc}</p>}
      {b.paragraphs?.map((p) => (
        <p key={p.slice(0, 20)}>{p}</p>
      ))}
      {b.figure && (
        <figure>
          <img src={b.figure.src} alt={b.figure.alt} loading="lazy" decoding="async" />
          <figcaption>{b.figure.alt}{b.figure.ai ? ' (설명용 이미지)' : ''}</figcaption>
        </figure>
      )}
      {b.items?.map((it) => (
        <div key={it.title}>
          <h3>{it.title}</h3>
          <p>{it.body}</p>
        </div>
      ))}
      {b.steps && (
        <ol className="steps">
          {b.steps.map((s) => (
            <li key={s.step + s.title}>
              <div>
                <b>{s.title}</b>
                <p>{s.body}</p>
                {s.image && <img src={s.image} alt={s.alt ?? s.title} loading="lazy" decoding="async" style={{ marginTop: 10, borderRadius: 8, maxWidth: 420 }} />}
              </div>
            </li>
          ))}
        </ol>
      )}
      {b.panels && (
        <div className="grid grid--4">
          {b.panels.map((p) => (
            <img key={p.src} src={p.src} alt={p.alt} loading="lazy" decoding="async" style={{ borderRadius: 8 }} />
          ))}
        </div>
      )}
      {b.band && (
        <figure>
          <img src={b.band.src} alt={b.band.alt} loading="lazy" decoding="async" />
          <figcaption>{b.band.alt}</figcaption>
        </figure>
      )}
    </section>
  );
}

function ImplantExtras() {
  return (
    <>
      <h2>디지털 임플란트는 이렇게 진행합니다</h2>
      <ol className="steps">
        {IMPLANT_STEPS.map((s) => (
          <li key={s.step}>
            <div>
              <b>{s.title}</b>
              <p>{s.body}</p>
              <img src={s.image} alt={s.alt} loading="lazy" decoding="async" style={{ marginTop: 10, borderRadius: 8, maxWidth: 420 }} />
            </div>
          </li>
        ))}
      </ol>
      {COMPARISONS.map((c) => (
        <section key={c.id}>
          <h2>{c.title}</h2>
          <p>{c.lead}</p>
          <table>
            <thead>
              <tr>
                <th />
                {c.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.rows.map((r) => (
                <tr key={r.label}>
                  <th>{r.label}</th>
                  {r.cells.map((cell, i) => (
                    <td key={i}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted">{c.note}</p>
        </section>
      ))}
      <h2>임플란트 세부 안내</h2>
      <LinkList items={IMPLANT_TOPICS.map((t) => ({ label: `${t.name} — ${t.tagline}`, href: `/treatment/implant/${t.slug}`, meta: '세부 안내' }))} />
      <h2>증례</h2>
      {IMPLANT_CASES.map((c) => (
        <section key={c.no}>
          <h3>
            {c.no} · {c.title}
          </h3>
          <p className="small muted">{c.period}</p>
          <div className="grid grid--3">
            {c.images.map((im) => (
              <figure key={im.src} style={{ margin: 0 }}>
                <img src={im.src} alt={im.alt} loading="lazy" decoding="async" style={{ borderRadius: 8 }} />
                <figcaption>{im.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
      <div className="callout callout--warn">{CASE_NOTICE}</div>
    </>
  );
}

function LaminateExtras() {
  return (
    <>
      <h2>라미네이트와 크라운, 무엇이 다른가요</h2>
      {METHODS.map((m) => (
        <section key={m.key}>
          <h3>
            {m.name} <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>{m.tag}</span>
          </h3>
          <p>{m.def}</p>
          <p>
            <strong>{m.reduction.label}</strong> {m.reduction.min}~{m.reduction.max}mm
          </p>
          <ul>
            {m.indications.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <div className="callout">
            <b>한계</b>
            {m.limits.join(' ')}
          </div>
        </section>
      ))}
      <h2>라미네이트의 특징</h2>
      {LAMINATE_FEATURES.map((f) => (
        <section key={f.t}>
          <h3>{f.t}</h3>
          <p>{f.d}</p>
          <figure>
            <img src={f.image} alt={f.alt} loading="lazy" decoding="async" />
            <figcaption>{f.alt}</figcaption>
          </figure>
          <p className="small muted">{f.note}</p>
        </section>
      ))}
      <h2>재료는 어떻게 고르나요</h2>
      {MATERIALS.map((m) => (
        <div key={m.name}>
          <h3>
            {m.name} <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>{m.where}</span>
          </h3>
          <p>{m.body}</p>
        </div>
      ))}
      <h2>색은 이렇게 정합니다</h2>
      <ol className="steps">
        {SHADE_STEPS.map((s) => (
          <li key={s.n}>
            <div>
              <b>{s.t}</b>
              <p>{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}

export default async function TreatmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t: Treatment | undefined = treatmentBySlug(slug);
  if (!t) notFound();
  const doc = requireDoc(`/treatment/${slug}`);
  const page = TREATMENT_PAGES[pageKey(slug)];
  const hero = page?.hero ? { src: page.hero.src, alt: page.hero.alt } : treatmentImage(t);
  const journey = journeyForTreatment(slug);
  /* 숫자를 앞에 (2026-09-11): AI 인용의 44% 가 본문 앞 30% 에서 나온다. 손으로 쓴 stats 가 없는 진료는 여정 데이터의 내원 횟수·기간을 그대로 올린다 — 새 주장 없음. */
  const stats = page?.stats ?? (journey ? [{ k: '내원 횟수', v: journey.visits }, { k: '기간', v: journey.duration }] : undefined);
  const symptoms = t.relatedSymptoms.map((s) => symptomBySlug(s)).filter(Boolean);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '진료 안내', path: '/treatment' },
    { name: t.name, path: doc.path },
  ];
  const isArea = (AREA_TREATMENTS as readonly string[]).includes(slug);
  const related = docsOfKind('qa', 'symptom', 'condition', 'blog').filter((d) => d.category === t.short || d.keywords.some((k) => t.short.includes(k))).slice(0, 6);
  const about = procedureNode(t);
  const words = charCount(t.intro, t.summary, ...t.whoFor, ...t.qa.map((q) => q.q + q.a), ...(page?.blocks.flatMap((b) => [b.title, b.desc ?? '', ...(b.paragraphs ?? []), ...(b.items?.map((i) => i.body) ?? [])]) ?? []));

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`진료 안내 · ${t.short}`} lead={page?.lead} hero={{ ...hero, caption: page?.hero?.alt }} related={related}>
        <AnswerFirst>{t.summary}</AnswerFirst>
        {stats && (
          <div className="stat-row">
            {stats.map((s) => (
              <div className="stat" key={s.k}>
                <small>{s.k}</small>
                <b>{s.v}</b>
              </div>
            ))}
          </div>
        )}
        <div className="prose">
          <p className="lead">{t.intro}</p>

          <h2>이런 경우에 {t.name} 상담을 권합니다</h2>
          <ul>
            {t.whoFor.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>

          {page?.blocks.map((b) => (
            <Block key={b.label + b.title} b={b} />
          ))}
          {slug === 'implant' && <ImplantExtras />}
          {slug === 'laminate' && <LaminateExtras />}

          {page?.aftercare && (
            <>
              <h2>{page.aftercare.title}</h2>
              <ul>
                {page.aftercare.items.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </>
          )}

          {journey && (
            <>
              <h2>{journey.question}</h2>
              <p>{journey.answer}</p>
              <div className="stat-row">
                <div className="stat"><small>내원 횟수</small><b>{journey.visits}</b></div>
                <div className="stat"><small>기간</small><b>{journey.duration}</b></div>
                {isLivePath(`/journey/${journey.slug}`) && <div className="stat"><small>회차별 내용</small><b><Link href={`/journey/${journey.slug}`}>자세히 보기 →</Link></b></div>}
              </div>
              <p className="small muted">{NO_GUARANTEE_NOTE}</p>
            </>
          )}

          <h2>{t.short}에 대해 자주 묻는 질문</h2>
          <Faq items={t.qa.map((q, i) => ({ q: q.q, a: q.a, href: `/qa/${t.slug}-${i + 1}` }))} />

          {symptoms.length > 0 && (
            <>
              <h2>관련 증상</h2>
              <LinkList items={symptoms.map((s) => ({ label: s!.title, href: `/symptom/${s!.slug}`, meta: s!.short }))} />
            </>
          )}

          {isArea && (
            <>
              <h2>지역별 {t.short} 안내</h2>
              {/* 먼 지역(tier=far)은 지역×진료 문서가 애초에 없다(catalog) — 링크를 걸면 404 (2026-09-11 빙 검사) */}
              <Chips items={REGIONS.filter((r) => r.tier !== 'far').map((r) => ({ label: `${r.name} ${t.short}`, href: `/area/${r.slug}/${slug}` }))} />
            </>
          )}

          <h2>다른 진료</h2>
          <Chips items={TREATMENTS.filter((x) => x.slug !== slug).map((x) => ({ label: x.name, href: `/treatment/${x.slug}` }))} />

          <h2>참고 자료</h2>
          <ul>
            {REFS_TREATMENT.map((r) => (
              <li key={r.url}>
                {r.publisher} — <a href={r.url} target="_blank" rel="noopener">{r.title}</a>
              </li>
            ))}
          </ul>

          <CtaBlock title={`${t.name}, 내 경우엔 어떤지 검사 후 정확히 말씀드립니다`} />
          <MedicalNotice />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true, about: { '@id': about['@id'] } }), about, articleNode(doc, { wordCount: words, about: { '@id': about['@id'] } }), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
