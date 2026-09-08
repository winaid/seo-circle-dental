import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, ArticleShell, Chips, CtaBlock, DoctorCard, Faq, HoursTable, JsonLd, LinkList, MedicalNotice } from '@/components/ui';
import { AREA_TREATMENT_LIST, docByPathStrict, docsOfKind, isDocPublished, docByPath } from '@/lib/catalog';
import { requireDoc, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { REGIONS, regionBySlug, regionDistanceM, regionStops } from '@/lib/regions';
import { fmtDistance, STATION_DISTANCE_M } from '@/lib/site';
import { CLINIC, STRENGTHS, UNVERIFIED } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { CLINIC_QA } from '@/lib/faq';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('area', '/area/').map((region) => ({ region }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  if (!regionBySlug(region)) return {};
  return metaFor(requireDoc(`/area/${region}`));
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const r = regionBySlug(region);
  if (!r) notFound();
  const doc = requireDoc(`/area/${region}`);
  const idx = REGIONS.findIndex((x) => x.slug === region);
  const dist = regionDistanceM(r);
  const stops = regionStops(r);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '지역별 안내', path: '/area' },
    { name: r.keyword, path: doc.path },
  ];
  const faq = [...CLINIC_QA.slice(idx % 4), ...CLINIC_QA.slice(0, idx % 4)].slice(0, 4);
  const areaDocs = AREA_TREATMENT_LIST.map((t) => docByPath(`/area/${r.slug}/${t.slug}`)).filter((d) => d && isDocPublished(d));
  const related = docsOfKind('area').filter((d) => d.path !== doc.path).slice(0, 6);

  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow={`지역 안내 · ${r.name}`} related={related}>
        <AnswerFirst label={`${r.name}에서 오신다면`}>{r.intro}</AnswerFirst>
        <div className="prose">
          <h2>{r.name}에서 오시는 길</h2>
          <div className="kv">
            <div><b>직선거리</b><span>{r.kind === '역' ? `화정역에서 병원까지 ${fmtDistance(STATION_DISTANCE_M)}` : `${r.name}에서 병원까지 ${fmtDistance(dist)} (좌표 기준 계산값)`}</span></div>
            {stops !== null && stops > 0 && <div><b>3호선</b><span>{r.line3}역에서 화정역까지 {stops}정거장, 환승 없음</span></div>}
            {stops === 0 && <div><b>3호선</b><span>화정역 하차 · 병원까지 {fmtDistance(STATION_DISTANCE_M)}</span></div>}
            {r.otherRail && <div><b>다른 노선</b><span>{r.otherRail}</span></div>}
            <div><b>주차</b><span>{CLINIC.parking.type} {CLINIC.parking.fee}. {CLINIC.parking.note}</span></div>
            <div><b>주소</b><span>{CLINIC.address.full}</span></div>
          </div>
          {r.transit.length > 0 && (
            <ul>
              {r.transit.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          )}
          <p>
            <Link href="/visit">진료시간·지도·주차 안내 전체 보기</Link>
          </p>

          <h2>진료시간 — {r.name}에서 퇴근 후에도</h2>
          <p>화요일과 목요일은 저녁 8시 30분까지 야간 진료를 합니다. 토요일은 오후 2시까지 점심시간 없이 진료합니다.</p>
          <HoursTable />
          <p className="small muted">점심시간 {UNVERIFIED.hours.lunch.start}–{UNVERIFIED.hours.lunch.end} (토요일 제외)</p>

          <h2>{r.name}에서 많이 찾으시는 진료</h2>
          {areaDocs.length > 0 ? (
            <div className="grid grid--2" style={{ marginTop: 4 }}>
              {areaDocs.map((d) => (
                <Link key={d!.path} href={d!.path} className="t-card">
                  <img src={d!.image!.src} alt={d!.image!.alt} loading="lazy" decoding="async" />
                  <div className="t-card-in">
                    <span className="card-tag">{r.name}</span>
                    <h3>{d!.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <LinkList items={AREA_TREATMENT_LIST.map((t) => ({ label: t.name, href: `/treatment/${t.slug}`, meta: t.short }))} />
          )}

          <h2>{r.name} 치과를 고르실 때 확인하면 좋은 것</h2>
          <p>
            어디서 오시든 확인할 것은 같습니다. 진료하는 사람이 누구인지, 검사를 어떻게 하는지, 설명을 어떻게 하는지입니다. 동그라미치과의원은 세 원장 모두 보건복지부인증 통합치의학과 전문의이고, 저선량 CT와 구강스캐너로 검사한 뒤 사진을 함께 보며 설명합니다.
          </p>
          <ul>
            {STRENGTHS.map((s) => (
              <li key={s.key}>
                <strong>{s.title}</strong> — {s.body}
              </li>
            ))}
          </ul>

          <h2>의료진</h2>
          <div className="team-cards">
            {DOCTORS.map((d) => (
              <DoctorCard key={d.slug} d={d} />
            ))}
          </div>

          <h2>{r.name}에서 오시기 전에 자주 묻는 것</h2>
          <Faq items={faq.map((q) => ({ q: q.q, a: q.a, href: `/qa/visit-${CLINIC_QA.indexOf(q) + 1}` }))} />

          <h2>다른 지역에서 오시는 길</h2>
          <Chips items={REGIONS.filter((x) => x.slug !== region).map((x) => ({ label: x.keyword, href: `/area/${x.slug}` }))} />

          <CtaBlock title={`${r.name}에서 오시는 길, 전화 주시면 바로 안내드립니다`} />
          <MedicalNotice />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode(doc.path, crumbs), itemListNode(`${r.name} 진료 안내`, AREA_TREATMENT_LIST.map((t) => ({ name: `${r.name} ${t.name}`, path: `/area/${r.slug}/${t.slug}` })))]} />
    </>
  );
}
