/**
 * 쪽마다 카드 6장 — 네이버 캐러셀 재료(화면 카드 = ItemList, 같은 그림). 표는 content/focus-cards.json.
 *
 * ★★ 2026-10-08 오후 v2: 카드가 블로그 글을 가리킨다.
 *   v1 은 일곱 쪽이 서로(홈·의료진·오시는 길·진료 안내·지역 셋)를 가리켰는데, 다시 읽힌 쪽마다 카드가 빠졌다
 *   (site: 실측 — 홈 0장, 화정동·덕양구 쪽 '대표 사진 1장', 아직 안 읽힌 예전 쪽은 6장 그대로).
 *   10-01 에도 홈 첫 묶음이 소개·진료·비용·예약·오시는 길을 가리키자 카드가 아니라 글자 바로가기로 나왔다.
 *   카드가 붙는 홈(광화문 업체 등)은 카드가 글을 가리킨다 → 메뉴형 쪽이 아니라 내용 글로, 쪽마다 겹치지 않게.
 * ★ 카드 대상 글은 첫날 공개(lib/posts.ts) — 미색인·미공개 대상은 카드에서 빠진다(10-02 실측).
 */
import table from '../content/focus-cards.json';
import type { FocusKey } from './focus';
import { postById } from './posts';

interface ListRow { post: string; name: string }
const LISTS = table.lists as Record<FocusKey, ListRow[]>;

export interface FocusCard {
  name: string;
  path: string;
  /** 800×800 카드 그림 — 화면 <img> 와 ItemList.image 가 같은 파일 */
  image: string;
  alt: string;
  tag: string;
  /** 홈 카드 아래 한 줄 */
  caption: string;
}

/** 카드 그림 파일 — scripts/focus-card-art.mjs 가 같은 규칙으로 만든다 */
export const focusCardImage = (list: FocusKey, i: number) => `/img/fc/v${table.v}-${list}-${i + 1}.jpg`;

export function focusCards(list: FocusKey): FocusCard[] {
  return LISTS[list].map((c, i) => {
    const p = postById(c.post);
    if (!p) throw new Error(`[focusCards] 글 없음: ${c.post}`);
    return { name: c.name, path: p.path, image: focusCardImage(list, i), alt: c.name, tag: `${p.kw} 이야기`, caption: p.summary };
  });
}

/** 카드가 가리키는 글 — 첫날 공개 대상(lib/posts.ts) */
export const CARD_POST_IDS = new Set(Object.values(LISTS).flat().map((c) => c.post));
