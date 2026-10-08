/**
 * 화정치과 이야기 — 블로그 글 (2026-10-08 오너: "광화문 업체처럼 수십 수백 개 붙여").
 *
 * ★ 근거(10-08 실측, C:/tmp/focus4/gh-serp.mjs): 같은 업체 세 사이트(광화문·수원·부산)는 홈이 '지역 + 치과'를 받는데,
 *   뒤에 그 검색어를 제목에 넣은 생활형 글이 90·247·169개 붙어 있다. 글은 1,400~2,100자, 소제목 4~6개, 끝에 예약 권유, 홈으로 가는 링크 하나.
 * ★ 우리 글은 content/posts/batch-*.json(사람이 읽고 고칠 수 있는 원문). 사실은 lib 의 병원 자료에서만, 의료광고 금칙은 빌드 게이트가 거른다.
 * ★ 주소 = /blog/<한글 제목>. 예전 /blog/<영문>(칼럼 10편)은 410 그대로 — lib/focus.ts routeOf 가 한글 주소만 살린다.
 * ★ 공개 = 첫날 30편 + 카드가 가리키는 글(content/focus-cards.json), 그 뒤 하루 6편(묶음을 번갈아 섞는다). 날짜가 되면 ISR 로 저절로 사이트맵·RSS 에 들어간다.
 */
import { POST_BATCHES } from '../content/posts';
import { addDays, isPublished } from './publish';
import { IMG } from './assets';
import cardTable from '../content/focus-cards.json';

export type PostKw = '화정치과' | '화정 치과' | '화정역 치과' | '화정동 치과' | '덕양구 치과';
export interface PostSection { h2: string; paras: string[] }
export interface Post {
  /** 묶음+번호(A1, C29…) — content/focus-cards.json 의 카드가 이 값으로 글을 가리킨다 */
  id: string;
  slug: string;
  path: string;
  title: string;
  kw: PostKw;
  summary: string;
  sections: PostSection[];
  publishAt: string;
  image: { src: string; alt: string };
  /** 지역 검색어 글이면 그 지역 쪽 */
  area?: { path: string; label: string };
}

export const POST_START = '2026-10-08';
const FIRST = 30;
/** 카드가 가리키는 글(쪽마다 6편) — 첫날 함께 공개(공개 전 글은 카드에서 빠진다) */
const CARD_IDS = new Set(Object.values(cardTable.lists as Record<string, Array<{ post: string }>>).flat().map((c) => c.post));
const PER_DAY = 6;

/** 글 사진 — 병원 공간·상담 사진만(진료 중인 장면 빼고). 글마다 돌려 쓴다 */
const PHOTOS: Array<{ src: string; alt: string }> = [
  ...IMG.interior.filter((_, i) => i !== 10).map((x) => ({ src: x.src, alt: x.alt })),
  { src: '/img/clinic/implant-hero.webp', alt: '상담실에서 원장이 모니터와 치아 모형을 보며 설명하는 모습' },
  { src: '/img/clinic/perio-explain.webp', alt: '잇몸 모형과 칫솔을 들고 관리 방법을 설명하는 모습' },
  { src: '/img/clinic/doctor-desk.webp', alt: '초록 진료복을 입은 원장이 책상에 앉아 차트를 적는 모습' },
  { src: '/img/clinic/aes-chairside.webp', alt: '진료 의자 앞 모니터에 띄운 파노라마 사진' },
  { src: '/img/clinic/implant-aftercare.webp', alt: '모니터의 파노라마 사진을 보며 치아 모형으로 설명하는 원장' },
];

/** 지역 검색어 글 끝의 홈 링크 글자 — 2026-10-08 오후 한 쪽 판: 지역 쪽을 지우고 네 검색어 모두 홈이 받는다(lib/focus.ts) */
const AREA: Partial<Record<PostKw, { path: string; label: string }>> = {
  '화정역 치과': { path: '/', label: '화정역 치과 동그라미치과의원 안내' },
  '화정동 치과': { path: '/', label: '화정동 치과 동그라미치과의원 안내' },
  '덕양구 치과': { path: '/', label: '덕양구 치과 동그라미치과의원 안내' },
};

export const postSlug = (title: string) =>
  title.replace(/[·,?!.:'"“”‘’()]/g, ' ').trim().replace(/\s+/g, '-').slice(0, 60);

function build(): Post[] {
  // 묶음을 번갈아 섞는다(A1 B1 C1 D1 A2 …) — 하루에 공개되는 글의 주제가 한쪽으로 몰리지 않게
  const lists = Object.entries(POST_BATCHES);
  const max = Math.max(0, ...lists.map(([, l]) => l.length));
  const order: Array<{ id: string; title: string; kw: string; summary: string; sections: PostSection[] }> = [];
  for (let i = 0; i < max; i++) for (const [b, l] of lists) if (l[i]) order.push({ ...l[i], id: `${b}${i + 1}` });
  // 첫날 = 앞 30편 + 카드가 가리키는 글. 나머지는 순서대로 하루 6편
  const dayOne = new Set([...order.slice(0, FIRST).map((p) => p.id), ...CARD_IDS]);
  let later = 0;
  const seen = new Set<string>();
  return order.map((p, i) => {
    let slug = postSlug(p.title);
    while (seen.has(slug)) slug += '-2';
    seen.add(slug);
    const kw = p.kw as PostKw;
    const day = dayOne.has(p.id) ? 0 : 1 + Math.floor(later++ / PER_DAY);
    return {
      id: p.id,
      slug,
      // ★ 주소는 퍼센트 인코딩 꼴로 — canonical·네이버가 가져간 주소가 이 꼴이다. 한글 그대로 쓴 카드 링크·ItemList 는 '색인된 주소'와 다르게 보여
      //   카드에서 빠진 것으로 본다(10-08 14시: 홈 카드 0, 한글 주소 글에 카드가 붙는 blog.hjudh.com 은 링크가 전부 인코딩 꼴)
      path: `/blog/${encodeURIComponent(slug)}`,
      title: p.title,
      kw,
      summary: p.summary,
      sections: p.sections,
      publishAt: day === 0 ? POST_START : addDays(POST_START, day),
      image: PHOTOS[i % PHOTOS.length],
      area: AREA[kw],
    };
  });
}

export const POSTS: Post[] = build();
const bySlug = new Map(POSTS.map((p) => [p.slug, p]));
const byId = new Map(POSTS.map((p) => [p.id, p]));
export const postById = (id: string) => byId.get(id);
export const postBySlug = (slug: string) => bySlug.get(slug);
export const publishedPosts = () => POSTS.filter((p) => isPublished(p.publishAt)).sort((a, b) => (a.publishAt === b.publishAt ? POSTS.indexOf(a) - POSTS.indexOf(b) : a.publishAt < b.publishAt ? 1 : -1));
export const postText = (p: Post) => p.sections.flatMap((s) => [s.h2, ...s.paras]).join(' ');
