/**
 * 홈 카드 줄 — 구글이 사이트 결과 아래에 붙이는 썸네일 카드(ItemList 캐러셀)의 재료.
 *
 * ★ 실측(2026-09-08): 1dentalsolution.co.kr 검색 결과의 카드 5장은 그 홈에 박힌 ItemList 의
 *   name·image·url 과 글자까지 같았다. 그래서 우리도 홈에 **실제로 보이는** 진료 카드 6장을
 *   같은 형식으로 낸다. 화면에 없는 걸 구조화 데이터에만 넣지 않는다(구글 정책 위반).
 * ★ 카드 이름은 검색어 모양으로 짧게. '잘하는곳' 류는 빌드 게이트가 막는다 — 여기서도 안 쓴다.
 * ★ 정사각 썸네일은 scripts/gen-square.mjs 가 만들고 content/square.json 에 표로 남긴다.
 */
import squares from '../content/square.json';
import ogTable from '../content/og.json';
import { AREA_TREATMENT_LIST, docByPath, docByPathStrict, isDocPublished, relatedDocs, type Doc, type DocKind } from './catalog';
import { TREATMENTS, treatmentBySlug } from './treatments';
import type { Region } from './regions';
import { probeRotate } from './crawlProbe';

export const CAROUSEL_SLUGS = ['save-natural-tooth', 'implant', 'endodontic', 'cavity', 'periodontal', 'wisdom-tooth'] as const;
type CarouselSlug = (typeof CAROUSEL_SLUGS)[number];

const LABEL: Record<CarouselSlug, string> = {
  'save-natural-tooth': '화정 자연치아 살리기',
  implant: '화정 임플란트',
  endodontic: '화정 신경치료',
  cavity: '화정 충치치료',
  periodontal: '화정 잇몸치료',
  'wisdom-tooth': '화정 사랑니 발치',
};

const SQ = squares as Record<string, string>;
/** 정사각 썸네일이 표에 있으면 그것, 없으면 원본. 어느 쪽이든 깨지지 않는다. */
export const squareOf = (src: string) => SQ[src] ?? src;

export interface CarouselItem {
  slug: CarouselSlug;
  /**
   * 카드 이름 = 검색어 모양('화정 임플란트').
   * ★ 이 문구가 **홈 화면 카드의 <h3> 와 글자까지 같아야** 한다 — 레퍼런스 실측(2026-09-08)에서
   *   검색 결과 카드에 뜬 글자가 ItemList.name 이자 화면 문구였다. 한쪽만 바꾸면 신호가 깨진다.
   *   그래서 홈 카드도 이 배열로 그린다(app/page.tsx). 2026-09-14 오너 GO: 카드에 지역어를 붙인다.
   */
  name: string;
  path: string;
  /** 구조화 데이터용 정사각 800×800 */
  image: string;
  /** 화면 카드에 까는 사진(4:3) */
  photo: string;
  photoAlt: string;
  /** 카드 위쪽 작은 글씨 — 어떤 경우에 보는 진료인지 */
  tag: string;
  caption: string;
}

export function homeCarousel(): CarouselItem[] {
  return CAROUSEL_SLUGS.map((slug) => {
    const d = docByPathStrict(`/treatment/${slug}`);
    const t = treatmentBySlug(slug)!;
    return { slug, name: LABEL[slug], path: d.path, image: squareOf(d.image!.src), photo: d.image!.src, photoAlt: d.image!.alt, tag: t.whoFor[0], caption: t.summary };
  });
}

/* ────────────────────────────────────────────── 페이지별 카드 6장 (2026-09-28 네이버 캐러셀)
 * 오너 캡처: '화정역 치과' 검색에 우리는 /area/hwajeong-1 이 떴는데 카드 줄이 없었다. 실측 원인 둘 —
 *   ① 그 페이지 ItemList 에 image 가 0개(네이버 서치어드바이저 「캐러셀 (ListItem)」 는 image 가 필수)
 *   ② 목록이 아직 발행 전(404)인 지역×진료 주소를 가리켰다.
 * 레퍼런스 실측: my-doctor.io 는 화면에 없는 순위 배지 그림을 ItemList.image 로만 내는데도 카드가 뜬다 → 네이버는 ItemList 를 그대로 읽는다.
 *   blog.hjudh.com 은 ItemList 없이 홈의 '그림 + 제목' 글 카드 묶음이 떴다 → 화면 카드도 함께 둔다.
 * 규칙(서치어드바이저): 한 페이지에 목록 하나 · 항목 수가 적으면 안 씀 · 항목끼리 사진 중복 금지 · 로고/기본 이미지 금지.
 * 그래서 여기 함수는 늘 6장, 사진은 서로 다르게, 주소는 발행된 문서만(발행 전이면 진료 안내로) 낸다.
 * 화면 <img> 와 ItemList.image 는 같은 정사각 JPG(scripts/gen-square.mjs) — 레퍼런스처럼 두 신호가 한 몸이 되게.
 */

export interface Card {
  name: string;
  path: string;
  /** 정사각 800×800 JPG — 화면 카드와 ItemList 가 같이 쓴다 */
  image: string;
  alt: string;
  tag: string;
}

const livePath = (p: string) => { const d = docByPath(p); return !!d && isDocPublished(d); };

/** 진료 한 가지 카드 — 지역×진료 문서가 발행됐으면 그 주소, 아니면 진료 안내 */
function treatmentCard(r: Region | null, slug: string): Card | null {
  const td = docByPath(`/treatment/${slug}`);
  const t = TREATMENTS.find((x) => x.slug === slug);
  if (!td?.image || !t) return null;
  const areaPath = r ? `/area/${r.slug}/${slug}` : null;
  // 카드 글자는 짧게 — '신경치료(근관치료)' 의 괄호는 위 작은 글씨로 내린다 (검색 결과 카드는 두 줄에서 잘린다)
  const base = t.name.replace(/\s*\(.*\)\s*/, '').trim();
  const aka = (t.name.match(/\((.*)\)/) || [])[1];
  return {
    name: r ? `${r.name} ${base}` : `화정 ${base}`,
    path: areaPath && livePath(areaPath) ? areaPath : td.path,
    image: squareOf(td.image.src),
    alt: td.image.alt,
    tag: aka ?? '진료 안내',
  };
}

/** 사진·주소가 겹치지 않게 앞에서부터 n 장 */
function uniqueByImage(cards: Array<Card | null>, n: number): Card[] {
  const seen = new Set<string>();
  const out: Card[] = [];
  for (const c of cards) {
    if (!c || seen.has(c.image) || seen.has(c.path)) continue;
    seen.add(c.image);
    seen.add(c.path);
    out.push(c);
    if (out.length === n) break;
  }
  return out;
}

/**
 * 지역 페이지 — '화정1동 임플란트' 식 6장 (그 지역에서 많이 찾는 진료).
 * ★ 2026-09-28 오후: 지역×진료 쪽을 검색 색인에서 뺐으므로(lib/catalog isSearchIndexed) 카드 주소는 늘 진료 안내다.
 *   이름·사진은 그대로('화정1동 임플란트' · /img/sq) — 오전에 네이버가 카드로 받아 준 그 값이다. 주소만 색인되는 쪽으로.
 */
export function regionCards(r: Region): Card[] {
  // probeRotate: 재수집 판별 시험의 대조군(도래울)만 카드 순서를 한 칸 돌린다 — lib/crawlProbe.ts (2026-09-29)
  return probeRotate(r.slug, uniqueByImage(AREA_TREATMENT_LIST.map((t) => { const c = treatmentCard(r, t.slug); return c && { ...c, path: `/treatment/${t.slug}` }; }), 6));
}

/** 지역×진료 페이지 — 그 지역 대표 한 장('화정1동 치과') + 같은 지역의 다른 진료 5장 */
export function areaTreatmentCards(r: Region, treatment: string): Card[] {
  const rd = docByPath(`/area/${r.slug}`);
  const regionCard: Card | null = rd?.image && isDocPublished(rd) ? { name: r.keyword, path: rd.path, image: squareOf(rd.image.src), alt: rd.image.alt, tag: '오시는 길' } : null;
  const others = AREA_TREATMENT_LIST.filter((t) => t.slug !== treatment).map((t) => treatmentCard(r, t.slug));
  // 지역 사진이 없으면 지역 밖 진료로 여섯째를 채운다
  const fill = TREATMENTS.filter((t) => t.slug !== treatment && !AREA_TREATMENT_LIST.some((a) => a.slug === t.slug)).map((t) => treatmentCard(null, t.slug));
  return uniqueByImage([regionCard, ...others, ...fill], 6);
}

/** 진료 페이지 — 다른 진료 6장('화정 신경치료' 식) */
export function treatmentCards(slug: string): Card[] {
  const order = [...CAROUSEL_SLUGS, ...TREATMENTS.map((t) => t.slug)].filter((s, i, a) => s !== slug && a.indexOf(s) === i);
  return uniqueByImage(order.map((s) => treatmentCard(null, s)), 6);
}

/** 지역 목록(/area) — 사진이 서로 다른 앞쪽 지역 6곳('화정역 치과' 식). 26곳 전체는 화면 글자 카드와 사이트맵이 맡는다 */
export function regionHubCards(regions: Region[]): Card[] {
  return uniqueByImage(regions.map((r) => {
    const d = docByPath(`/area/${r.slug}`);
    if (!d?.image || !isDocPublished(d)) return null;
    return { name: r.keyword, path: d.path, image: squareOf(d.image.src), alt: d.image.alt, tag: r.kind === '역' ? '지하철역' : r.kind === '단지' ? '아파트 단지' : r.kind === '기관' ? '주변 기관' : r.kind === '동' ? '행정동' : r.kind };
  }), 6);
}

/* ────────────────────────────────────────────── 나머지 모든 문서 (2026-09-28 오후)
 * 오전 실측: 우리 결과 147개 중 카드는 지역 페이지에만 붙었다. 증상·문답·용어·의료진·칼럼 등은 ItemList 자체가 없었고,
 * 목록 허브(증상·질환·문답·칼럼·비용·여정·진료)는 ItemList 에 사진이 0장이었다(서치어드바이저: image 필수).
 * → 어느 문서가 검색에 떠도 카드 재료(사진 있는 항목 6개, 전부 열리는 주소)를 갖게 한다.
 * 사진: 정사각(content/square.json)이 있으면 그것, 없으면 og 용 1200×630 jpg(content/og.json).
 *   og jpg 는 오전 분석에서 **옛 카드가 실제로 쓴 바로 그 파일**이라 네이버가 받아 주는 것이 확인된 형식이다(webp 는 안 믿는다).
 */
const OG = ogTable as Record<string, string>;
export const cardImageOf = (src: string) => SQ[src] ?? OG[src] ?? src;

const KIND_TAG: Partial<Record<DocKind, string>> = {
  symptom: '증상', condition: '질환', qa: '진료실 문답', glossary: '치과 용어', blog: '칼럼', journey: '치료 여정',
  cost: '비용', 'implant-topic': '임플란트', doctor: '의료진', treatment: '진료 안내', area: '지역 안내',
};

/** 문서 하나 → 카드. 사진이 없거나 발행 전이면 null. 진료 문서는 '화정 ○○' 이름으로. 이름은 ' — ' 앞까지(검색 결과 카드는 두 줄에서 잘린다). */
function docCard(d: Doc | undefined): Card | null {
  if (!d?.image || !isDocPublished(d)) return null;
  if (d.kind === 'treatment') return treatmentCard(null, d.path.split('/')[2]);
  return { name: d.title.split(' — ')[0].trim(), path: d.path, image: cardImageOf(d.image.src), alt: d.image.alt, tag: KIND_TAG[d.kind] ?? d.category };
}

/**
 * 일반 문서 — 이 글과 이어진 진료('화정 신경치료' 식)를 먼저, 그다음 같은 주제 글, 모자라면 대표 진료로 6장.
 * treatments 는 그 문서 데이터에 적힌 관련 진료(symptom.relatedTreatments 등)를 넘긴다.
 */
export function docCards(doc: Doc, treatments: readonly string[] = []): Card[] {
  const self = (c: Card | null) => (c && c.path !== doc.path ? c : null);
  return uniqueByImage([
    ...treatments.map((s) => self(treatmentCard(null, s))),
    ...relatedDocs(doc, 30).map((d) => self(docCard(d))),
    ...CAROUSEL_SLUGS.map((s) => self(treatmentCard(null, s))),
  ], 6);
}

/** 목록 허브 — 그 목록 앞쪽 글 가운데 사진이 서로 다른 6개 */
export function hubCards(docs: Doc[]): Card[] {
  return uniqueByImage(docs.map(docCard), 6);
}

/** 여러 경로 → 카드(발행·사진 있는 것만) — 의료진·소개처럼 손으로 고른 묶음용 */
export function pathCards(paths: string[], fill: readonly string[] = CAROUSEL_SLUGS): Card[] {
  return uniqueByImage([...paths.map((p) => docCard(docByPath(p))), ...fill.map((s) => treatmentCard(null, s))], 6);
}
