import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, Chips, CtaBlock, Faq, JsonLd, LinkList, MedicalNotice } from '@/components/ui';
import { AREA_TREATMENT_LIST, docsOfKind, isDocPublished, docByPath, treatmentImage, isLivePath } from '@/lib/catalog';
import { requireDoc, josa } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { REGIONS, regionBySlug, regionDistanceM, regionStops, AREA_TREATMENTS } from '@/lib/regions';
import { fmtDistance, STATION_DISTANCE_M } from '@/lib/site';
import { CLINIC } from '@/lib/clinic';
import { treatmentBySlug } from '@/lib/treatments';
import { journeyForTreatment } from '@/lib/insight';
import { symptomBySlug } from '@/lib/symptoms';
import { DOCS } from '@/lib/catalog';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return DOCS.filter((d) => d.kind === 'area-treatment' && isDocPublished(d)).map((d) => {
    const [, , region, treatment] = d.path.split('/');
    return { region, treatment };
  });
}

export async function generateMetadata({ params }: { params: Promise<{ region: string; treatment: string }> }): Promise<Metadata> {
  const { region, treatment } = await params;
  if (!regionBySlug(region) || !(AREA_TREATMENTS as readonly string[]).includes(treatment)) return {};
  return metaFor(requireDoc(`/area/${region}/${treatment}`));
}

export default async function AreaTreatmentPage({ params }: { params: Promise<{ region: string; treatment: string }> }) {
  const { region, treatment } = await params;
  const r = regionBySlug(region);
  const t = treatmentBySlug(treatment);
  if (!r || !t || !(AREA_TREATMENTS as readonly string[]).includes(treatment)) notFound();
  const doc = requireDoc(`/area/${region}/${treatment}`);
  const idx = REGIONS.findIndex((x) => x.slug === region);
  const dist = regionDistanceM(r);
  const stops = regionStops(r);
  const journey = journeyForTreatment(treatment);
  const img = treatmentImage(t);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '지역별 안내', path: '/area' },
    { name: r.keyword, path: `/area/${r.slug}` },
    { name: t.name, path: doc.path },
  ];
  const qa = [...t.qa.slice(idx % t.qa.length), ...t.qa.slice(0, idx % t.qa.length)].slice(0, 3);
  const symptoms = t.relatedSymptoms.map((s) => symptomBySlug(s)).filter(Boolean).slice(0, 4);
  const otherRegions = REGIONS.filter((x) => { const d = x.slug !== region ? docByPath(`/area/${x.slug}/${treatment}`) : undefined; return !!d && isDocPublished(d); }).slice(0, 10);
  const otherTreatments = AREA_TREATMENT_LIST.filter((x) => x.slug !== treatment).filter((x) => { const d = docByPath(`/area/${region}/${x.slug}`); return !!d && isDocPublished(d); });
  const related = docsOfKind('treatment', 'qa').filter((d) => d.category === t.short).slice(0, 6);
  const distLine = r.slug === 'hwajeong-station' ? `화정역에서 병원까지 ${fmtDistance(STATION_DISTANCE_M)}` : dist !== null ? `${r.name}에서 병원까지 직선거리 ${fmtDistance(dist)}` : `${r.name}에서는 교외선으로 대곡역까지 간 뒤 3호선으로 갈아타 화정역에서 내리시면 됩니다`;

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`${r.keyword} · ${t.short}`} hero={{ src: img.src, alt: img.alt }} related={related}>
        <AnswerFirst label={`${r.name}에서 ${t.name}${josa(t.name, '을/를')} 알아보신다면`}>
          {distLine}
          {stops !== null && stops > 0 ? `, 3호선 ${r.line3}역에서 화정역까지 ${stops}정거장입니다.` : '입니다.'} {t.summary}
        </AnswerFirst>
        <div className="prose">
          <h2>{r.name}에서 동그라미치과의원까지</h2>
          <p>{r.intro}</p>
          <div className="kv">
            <div><b>거리</b><span>{distLine}{dist !== null ? ' (좌표 기준 계산값)' : ''}</span></div>
            {stops !== null && stops > 0 && <div><b>3호선</b><span>{r.line3}역 → 화정역 {stops}정거장, 환승 없음</span></div>}
            {r.otherRail && <div><b>다른 노선</b><span>{r.otherRail}</span></div>}
            <div><b>야간 진료</b><span>화·목 저녁 8시 30분까지 · 토요일 오후 2시까지</span></div>
            <div><b>주차</b><span>{CLINIC.parking.type} {CLINIC.parking.fee}</span></div>
          </div>

          <h2>{t.name}, 무엇을 먼저 보나요</h2>
          <p>{t.intro}</p>

          <h2>이런 경우에 {t.name}{josa(t.name, '을/를')} 검토합니다</h2>
          <ul>
            {t.whoFor.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>

          {journey && (
            <>
              <h2>{journey.question}</h2>
              <p>{journey.answer}</p>
              <div className="stat-row">
                <div className="stat"><small>내원 횟수</small><b>{journey.visits}</b></div>
                <div className="stat"><small>기간</small><b>{journey.duration}</b></div>
                {isLivePath(`/journey/${journey.slug}`) && <div className="stat"><small>회차별 내용</small><b><Link href={`/journey/${journey.slug}`}>자세히 보기 →</Link></b></div>}
              </div>
            </>
          )}

          <h2>{r.name}에서 오시는 분들이 자주 묻는 것</h2>
          <Faq items={qa.map((q) => ({ q: q.q, a: q.a, href: `/qa/${t.slug}-${t.qa.indexOf(q) + 1}` }))} />
          <p>
            <Link href={`/treatment/${t.slug}`}>{t.name} 진료 안내 전체 보기</Link> · <Link href={`/qa#${t.slug}`}>{t.short} 문답 {t.qa.length}가지</Link>
          </p>

          {symptoms.length > 0 && (
            <>
              <h2>이런 증상이 있다면</h2>
              <LinkList items={symptoms.map((s) => ({ label: s!.title, href: `/symptom/${s!.slug}`, meta: s!.short }))} />
            </>
          )}

          {otherTreatments.length > 0 && (
            <>
              <h2>{r.name}에서 함께 찾으시는 진료</h2>
              <Chips items={otherTreatments.map((x) => ({ label: `${r.name} ${x.short}`, href: `/area/${region}/${x.slug}` }))} />
            </>
          )}
          {otherRegions.length > 0 && (
            <>
              <h2>다른 지역의 {t.short} 안내</h2>
              <Chips items={otherRegions.map((x) => ({ label: `${x.name} ${t.short}`, href: `/area/${x.slug}/${treatment}` }))} />
            </>
          )}

          <CtaBlock title={`${r.name}에서 ${t.name} 상담, 전화 한 통이면 됩니다`} />
          <MedicalNotice />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
