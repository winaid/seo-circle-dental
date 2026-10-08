/**
 * 한 쪽 판 (2026-10-08 오후 오너: "광화문 업체는 모든 키워드에서 주소가 홈인데 우리는 지역별 안내 화정2동 치과 쪽이 뜬다.
 *   줄이고 한 페이지로 하라고 한 건데").
 *
 * ★ 남기는 쪽 = 홈 하나 + 개인정보처리방침 + 화정치과 이야기(블로그 목록·한글 주소 글). 광화문 업체와 같은 짜임.
 *   네 검색어(화정 치과·화정치과 / 화정역 치과 / 화정동 치과 / 덕양구 치과)는 모두 홈이 받는다.
 * ★ 지역 쪽(화정역·화정동·덕양구, 예전 화정2동·행신 등 전부)·진료 안내·의료진·오시는 길·예약·문답 = 홈으로 301.
 *   301 은 예전 쪽이 받던 평가를 홈으로 넘긴다. 내용 자체를 뺀 증상·질환·용어·비용 등은 예전처럼 410.
 * ★ 같은 날 오전판(남긴 쪽 8개)은 git 12f7a58 을 보면 된다. middleware.ts 가 routeOf() 하나로 가른다.
 * ★ 이 파일은 middleware(엣지)에서도 읽는다 — JSON 말고 다른 것을 import 하지 말 것.
 * ★ content/focus-cards.json 의 지역·진료 쪽 카드 목록은 지우지 않는다 — 그 목록의 글이 첫날 공개 순서(lib/posts.ts)를 정한다.
 */
import table from '../content/focus-cards.json';

export type FocusKey = 'home' | 'station' | 'dong' | 'gu' | 'treat' | 'doctors' | 'visit';

interface PageRow { path: string; tag: string }

const PAGES = table.pages as Record<FocusKey, PageRow>;

export const FOCUS_PATH: Record<FocusKey, string> = Object.fromEntries(Object.entries(PAGES).map(([k, p]) => [k, p.path])) as Record<FocusKey, string>;

/** 남기는 쪽 — 사이트맵·RSS·카탈로그가 이 집합만 낸다(블로그 글은 lib/posts.ts 가 따로 더한다). */
export const KEEP_PATHS = new Set<string>(['/', '/privacy']);

// 카드 6장(focusCards)은 lib/focusCards.ts — 블로그 글을 읽어야 해서 여기(엣지 middleware 가 읽는 파일)에 두지 않는다

/* ────────────────────────────────────────────── 지운 주소 가르기 */

/** 화면 쪽이 아닌 주소 — 파일·피드·API 는 그대로 통과 */
const PASS = new Set(['/feed', '/sitemap.rss', '/robots.txt', '/sitemap.xml']);

export type Route = { kind: 'keep' } | { kind: 'move'; to: string } | { kind: 'gone' };

export function routeOf(rawPath: string): Route {
  const path = rawPath.replace(/\/+$/, '') || '/';
  if (KEEP_PATHS.has(path) || PASS.has(path)) return { kind: 'keep' };
  if (/^\/(_next|api)(\/|$)/.test(path) || /\.[a-z0-9]{2,5}$/i.test(path)) return { kind: 'keep' };
  // 화정치과 이야기(블로그, 2026-10-08 오후) — 목록과 한글 주소 글만 산다. 예전 영문 주소 칼럼 10편은 410 그대로(lib/posts.ts)
  if (path === '/blog') return { kind: 'keep' };
  if (/^\/blog\/[^/]+$/.test(path)) {
    let s = path.slice(6);
    try { s = decodeURIComponent(s); } catch { /* 깨진 주소는 아래에서 410 */ }
    if (/[가-힣]/.test(s)) return { kind: 'keep' };
  }
  // 지역·진료·의료진·내원 안내 쪽 → 모두 홈(301)
  if (path === '/area' || path.startsWith('/area/')) return { kind: 'move', to: '/' };
  if (/^\/(treatment|about)(\/|$)/.test(path)) return { kind: 'move', to: '/' };
  if (['/visit', '/booking', '/faq', '/contact', '/location'].includes(path)) return { kind: 'move', to: '/' };
  // 증상·질환·문답·용어·비용·여정·칼럼·응급·지역×진료 = 내용째 뺀 쪽 → 410
  return { kind: 'gone' };
}

/** 이 주소로 링크를 걸어도 되는가(지운 주소면 false) */
export const isKeptHref = (href: string) => {
  if (!href.startsWith('/')) return true;
  return routeOf(href.split('#')[0].split('?')[0]).kind === 'keep';
};
