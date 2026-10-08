/**
 * 네 검색어 집중판 (2026-10-08 오너: "키워드 다 없애고 화정 치과·화정치과 / 화정역 치과 / 화정동 치과 / 덕양구 치과 만 노려서, 광화문 업체처럼").
 *
 * ★ 남기는 쪽은 여덟 개뿐이다 — 검색어 쪽 넷 + 받치는 쪽 셋 + 개인정보처리방침.
 *     /                        화정 치과 · 화정치과
 *     /area/hwajeong-station   화정역 치과
 *     /area/hwajeong-1         화정동 치과 — 10-08 아침 '화정동 치과' 통합 3위·카드가 붙어 있던 주소라 그대로 쓴다(이름만 화정1동 → 화정동)
 *     /area/deogyang           덕양구 치과
 *     /treatment · /about · /visit  진료 안내 · 의료진 · 진료시간과 오시는 길
 * ★ 나머지 400여 쪽은 지웠다. 같은 내용이 남은 쪽으로 옮겨 간 주소는 301, 내용 자체를 뺀 주소는 410(삭제됨).
 *   middleware.ts 가 routeOf() 하나로 가른다. 되살리려면 git 에서 2026-10-08 이전 커밋을 보면 된다.
 * ★ 이 파일은 middleware(엣지)에서도 읽는다 — JSON 말고 다른 것을 import 하지 말 것.
 */
import table from '../content/focus-cards.json';

export type FocusKey = 'home' | 'station' | 'dong' | 'gu' | 'treat' | 'doctors' | 'visit';

interface PageRow { path: string; tag: string; bg: string; pos: string }
interface ListRow { to: FocusKey; name: string; bg?: string; pos?: string }

const PAGES = table.pages as Record<FocusKey, PageRow>;
const LISTS = table.lists as Record<FocusKey, ListRow[]>;

export const FOCUS_PATH: Record<FocusKey, string> = Object.fromEntries(Object.entries(PAGES).map(([k, p]) => [k, p.path])) as Record<FocusKey, string>;

/** 남기는 쪽 — 사이트맵·RSS·카탈로그가 이 집합만 낸다. */
export const KEEP_PATHS = new Set<string>([...Object.values(FOCUS_PATH), '/privacy']);

export interface FocusCard {
  name: string;
  path: string;
  /** 800×800 카드 그림 — 화면 <img> 와 ItemList.image 가 같은 파일 */
  image: string;
  alt: string;
  tag: string;
}

/** 카드 그림 파일 — scripts/focus-card-art.mjs 가 같은 규칙으로 만든다 */
export const focusCardImage = (list: FocusKey, to: FocusKey) => `/img/fc/v${table.v}-${list}-${to}.jpg`;

/** 그 쪽에 싣는 카드 6장(자기 자신 빼고 나머지 여섯 쪽). 이름은 쪽마다 다르다 — 같은 덩어리가 여러 쪽에 되풀이되지 않게. */
export function focusCards(list: FocusKey): FocusCard[] {
  return LISTS[list].map((c) => ({
    name: c.name,
    path: FOCUS_PATH[c.to],
    image: focusCardImage(list, c.to),
    alt: c.name,
    tag: PAGES[c.to].tag,
  }));
}

/* ────────────────────────────────────────────── 지운 주소 가르기 */

/** 화면 쪽이 아닌 주소 — 파일·피드·API 는 그대로 통과 */
const PASS = new Set(['/feed', '/sitemap.rss', '/robots.txt', '/sitemap.xml']);

export type Route = { kind: 'keep' } | { kind: 'move'; to: string } | { kind: 'gone' };

export function routeOf(rawPath: string): Route {
  const path = rawPath.replace(/\/+$/, '') || '/';
  if (KEEP_PATHS.has(path) || PASS.has(path)) return { kind: 'keep' };
  if (/^\/(_next|api)(\/|$)/.test(path) || /\.[a-z0-9]{2,5}$/i.test(path)) return { kind: 'keep' };
  // 같은 내용이 남은 쪽에 있는 주소 → 301
  if (path === '/area/hwajeong' || path === '/area/hwajeong-2') return { kind: 'move', to: FOCUS_PATH.dong };
  if (/^\/area\/[^/]+$/.test(path)) return { kind: 'move', to: FOCUS_PATH.gu }; // 다른 동네 = 모두 덕양구·고양 안
  if (path === '/area') return { kind: 'move', to: '/' };
  if (path.startsWith('/treatment/')) return { kind: 'move', to: FOCUS_PATH.treat };
  if (path.startsWith('/about/')) return { kind: 'move', to: FOCUS_PATH.doctors };
  if (['/booking', '/faq', '/contact', '/location'].includes(path)) return { kind: 'move', to: FOCUS_PATH.visit };
  // 증상·질환·문답·용어·비용·여정·칼럼·응급·지역×진료 = 내용째 뺀 쪽 → 410
  return { kind: 'gone' };
}

/** 이 주소로 링크를 걸어도 되는가(지운 주소면 false) */
export const isKeptHref = (href: string) => {
  if (!href.startsWith('/')) return true;
  return routeOf(href.split('#')[0].split('?')[0]).kind === 'keep';
};
