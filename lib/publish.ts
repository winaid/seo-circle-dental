/**
 * 예약 발행 — 실측한 상위 노출 사이트들은 글을 한 번에 올리지 않고 매일 조금씩 올린다.
 * 그래서 새 글이 RSS 에 꾸준히 실리고, 검색 로봇이 매일 돌아올 이유가 생긴다.
 *
 * ★ 규칙
 *   · 핵심 문서(홈·진료·증상·질환·지역 허브 등)는 LAUNCH_DATE 에 전부 공개.
 *   · 나머지(문답 글·지역×진료·용어 등)는 안정적인 해시 순서로 하루 PUBLISH_PER_DAY 편씩.
 *   · 개발 서버(next dev) 또는 PUBLISH_MODE=all 이면 전부 보인다.
 * ★ 날짜 기준은 한국 시간. 서버 시계(UTC)에 +9h.
 */
import { LAUNCH_DATE, PUBLISH_FIRST_BATCH, PUBLISH_PER_DAY } from './site';

export function todayKST(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

export const SHOW_ALL = process.env.PUBLISH_MODE === 'all' || process.env.NODE_ENV === 'development';

export function isPublished(date: string): boolean {
  if (SHOW_ALL) return true;
  return date <= todayKST();
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** n 번째 예약 글의 발행일. 첫 묶음은 개시일, 그 뒤는 하루 PER_DAY 편. */
export function scheduleDate(index: number): string {
  if (index < PUBLISH_FIRST_BATCH) return LAUNCH_DATE;
  return addDays(LAUNCH_DATE, 1 + Math.floor((index - PUBLISH_FIRST_BATCH) / PUBLISH_PER_DAY));
}

/** FNV-1a — 경로만으로 정해지는 안정적인 순서. 글을 추가해도 기존 글의 발행일이 안 바뀐다. */
export function stableHash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}
