import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, Faq, JsonLd, MedicalNotice } from '@/components/ui';
import { requireDoc } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { regionBySlug, regionDistanceM, regionBearingKo } from '@/lib/regions';
import { fmtDistance, LINE3, STATION_DISTANCE_M, stopsToHwajeong } from '@/lib/site';
import { focusCards } from '@/lib/focus';
import { AREA_COPY, areaCopyBySlug, DANJI_ROWS, GU_ROWS, type AreaCopy } from '@/lib/focusCopy';
import { treatmentBySlug } from '@/lib/treatments';
import { sentences } from '@/lib/text';
import { CardRow } from '@/components/CardRow';
import { ClinicGallery, DoctorStrip, LandingHero, LpSection, TrustStrip, VisitBlock } from '@/components/Landing';

export const revalidate = 3600;
export const dynamicParams = false;

/*
 * 지역 쪽 = 네 검색어 집중판(2026-10-08, lib/focus.ts)의 셋 — 화정역 치과 · 화정동 치과 · 덕양구 치과.
 * 다른 동네 쪽 23개는 지웠다(middleware 가 /area/deogyang 으로 301). 글은 lib/focusCopy.ts — 쪽마다 따로 쓴 구획.
 * 순서: 첫 화면(검색어 h1·거리·전화) → 한눈에 → 카드 6장(네이버 캐러셀 재료, ItemList 와 같은 그림) → 목차
 *       → 그 검색어만의 구획들(계산 표 포함) → 진료 → 의료진 → 병원 사진 → 진료시간 → 자주 묻는 질문.
 */
export function generateStaticParams() {
  return AREA_COPY.map((c) => ({ region: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ region: string }> }): Promise<Metadata> {
  const { region } = await params;
  if (!areaCopyBySlug(region)) return {};
  return metaFor(requireDoc(`/area/${region}`));
}

function Line3Table() {
  const hj = LINE3.indexOf('화정');
  const rows = LINE3.filter((s) => s !== '화정').map((s) => ({ s, side: LINE3.indexOf(s) < hj ? '구파발 쪽' : '대화 쪽', n: stopsToHwajeong(s) }));
  return (
    <div className="prose fc-table">
      <table>
        <caption>3호선 역에서 화정역까지 정거장 수 — 역 순서로 센 값</caption>
        <thead><tr><th scope="col">탄 역</th><th scope="col">방면</th><th scope="col">화정역까지</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.s}><th scope="row">{r.s}역{r.s === '대곡' ? ' (경의중앙선·서해선·GTX-A 환승)' : ''}</th><td>{r.side}</td><td>{r.n}정거장</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DanjiTable() {
  return (
    <div className="prose fc-table">
      <table>
        <caption>화정동 단지에서 병원까지 — 좌표로 계산한 직선거리</caption>
        <thead><tr><th scope="col">출발</th><th scope="col">동</th><th scope="col">직선거리</th><th scope="col">병원 방향</th></tr></thead>
        <tbody>
          {DANJI_ROWS.map((x) => {
            const r = regionBySlug(x.slug)!;
            const m = x.slug === 'hwajeong-station' ? STATION_DISTANCE_M : regionDistanceM(r);
            const dir = regionBearingKo(r);
            return (
              <tr key={x.slug}><th scope="row">{x.label}</th><td>{x.dong}</td><td>{m !== null ? fmtDistance(m) : '—'}</td><td>{dir ? `${dir}쪽` : '—'}</td></tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GuTable() {
  return (
    <div className="prose fc-table">
      <table>
        <caption>덕양구 동네에서 병원까지 — 직선거리는 좌표로 계산한 값</caption>
        <thead><tr><th scope="col">동네</th><th scope="col">직선거리</th><th scope="col">오시는 길</th></tr></thead>
        <tbody>
          {GU_ROWS.map((x) => {
            const m = regionDistanceM(regionBySlug(x.slug)!);
            return (
              <tr key={x.slug}><th scope="row">{x.label}</th><td>{m !== null ? fmtDistance(m) : '—'}</td><td className="fc-wrap">{x.how}</td></tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const TABLES = { line3: Line3Table, danji: DanjiTable, gu: GuTable } as const;

function TreatmentBlocks({ c }: { c: AreaCopy }) {
  return (
    <div className="fc-treat">
      {c.treatments.map((slug) => {
        const t = treatmentBySlug(slug)!;
        return (
          <article key={slug} className="fc-treat-item">
            <span className="card-tag">{t.whoFor[0]}</span>
            <h3>{t.name}</h3>
            <p>{t.summary}</p>
            <p className="muted">{sentences(t.intro).slice(0, 2).join(' ')}</p>
          </article>
        );
      })}
    </div>
  );
}

export default async function RegionPage({ params }: { params: Promise<{ region: string }> }) {
  const { region } = await params;
  const c = areaCopyBySlug(region);
  if (!c) notFound();
  const doc = requireDoc(`/area/${region}`);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: c.kw, path: doc.path },
  ];
  // 카드 6장 = 화면 카드 = ItemList(같은 그림). 이름은 이 쪽 전용(lib/focus.ts · content/focus-cards.json)
  const cards = focusCards(c.key);
  const toc = [...c.sections.map((s) => ({ id: s.id, t: s.h2 })), { id: 'care', t: `${c.kw}에서 하는 진료` }, { id: 'faq', t: `${c.kw} 자주 묻는 질문` }];

  return (
    <>
      <div className="lp">
        <LandingHero doc={doc} crumbs={crumbs} eyebrow={c.eyebrow} lead={c.lead} facts={c.facts} photo={c.photo} />
        <TrustStrip />

        <section className="lp-sec fc-top">
          <div className="wrap">
            <AnswerFirst label={`${c.kw} 한눈에`}>{c.summary}</AnswerFirst>
            <CardRow title={`${c.kw} 동그라미치과의원 안내`} cards={cards} />
            <nav className="fc-toc" aria-label="이 쪽 차례">
              <b>차례</b>
              <ol>
                {toc.map((x) => (
                  <li key={x.id}><a href={`#${x.id}`}>{x.t}</a></li>
                ))}
              </ol>
            </nav>
          </div>
        </section>

        {c.sections.map((s, i) => {
          const Table = s.table ? TABLES[s.table] : null;
          return (
            <LpSection key={s.id} id={s.id} eyebrow={s.eyebrow} title={s.h2} tone={i % 2 ? undefined : 'alt'}>
              <div className="fc-body">
                {s.paras.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              {Table && <Table />}
            </LpSection>
          );
        })}

        <LpSection id="care" eyebrow="진료" title={`${c.kw}에서 하는 진료`} tone={c.sections.length % 2 ? undefined : 'alt'}>
          <TreatmentBlocks c={c} />
          <p className="lp-note"><Link href="/treatment">진료 열 가지 전체 보기</Link></p>
        </LpSection>

        <LpSection id="docs" eyebrow="의료진" title={`${c.kw} 의료진, 통합치의학과 전문의 세 명`}>
          <DoctorStrip />
        </LpSection>

        <LpSection id="gallery" eyebrow="병원 둘러보기" title={`${c.kw} 동그라미치과의원 안`} tone="alt">
          <ClinicGallery offset={AREA_COPY.indexOf(c) * 4} exclude={c.photo.src} />
        </LpSection>

        <section className="lp-sec lp-sec--visit">
          <div className="wrap">
            <VisitBlock title={`${c.kw} 진료시간, 오시기 전에 확인하세요`} />
          </div>
        </section>

        <LpSection id="faq" eyebrow="자주 묻는 질문" title={`${c.kw} 자주 묻는 질문`}>
          <div className="fc-faq">
            <Faq items={c.faq.map((f) => ({ q: f.q, a: f.a }))} />
          </div>
          <MedicalNotice />
        </LpSection>
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode(doc.path, crumbs), itemListNode(`${c.kw} 동그라미치과의원 안내`, cards.map((x) => ({ name: x.name, path: x.path, image: x.image })))]} />
    </>
  );
}
