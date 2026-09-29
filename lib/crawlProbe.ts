/**
 * 재수집 판별 시험 (2026-09-29, 오너 GO)
 *
 * 카드가 없는 페이지가 "네이버가 아직 안 읽은 것"인지 "읽고도 카드를 안 준 것"인지 가르려고,
 * 8쪽의 빵부스러기 마지막 이름에만 짧은 말을 붙인다. 네이버 검색 결과의 경로 줄
 * (circle-dental.shop › 지역별 안내 › 달빛마을 치과)은 BreadcrumbList 이름을 그대로 보여 주므로,
 * 경로 줄이 새 이름으로 바뀐 순간 = 다시 읽힌 증거. 그때 카드가 있는지로 판정하고, 첫 변화 시각으로 반영 시간을 잰다.
 *
 * 대조군 도래울(이미 카드 있음)은 카드 순서도 한 칸 돌린다(PROBE_ROTATE) —
 * 카드 순서와 경로 줄이 함께 바뀌면 "경로 줄로 재독을 판별할 수 있다"가 검증된다.
 *
 * 검색 결과 쪽 감시: C:/tmp/probe/probe-watch.mjs. 시험이 끝나면 두 표를 비우면 원래대로 돌아간다.
 */
export const CRAWL_PROBE: Record<string, string> = {
  '/area/dalbit': ' 안내',
  '/area/byeolbit': ' 안내',
  '/treatment/crown-prosthesis': ' 진료',
  '/treatment/laminate': ' 진료',
  '/symptom/toothache-night': ' 안내',
  '/glossary/dry-socket': ' 뜻',
  '/about/doctors/kim-injin': ' 소개',
  '/area/doraeul': ' 안내',
};

/** 카드 순서를 한 칸 돌릴 지역(대조군) — 맨 끝 카드를 맨 앞으로 */
export const PROBE_ROTATE = new Set<string>(['doraeul']);

/** 빵부스러기 마지막 이름에 시험용 말 붙이기 — 화면(ol.crumbs)과 BreadcrumbList 가 같은 값을 쓰도록 둘 다 여기를 거친다 */
export function probeCrumbs<T extends { name: string; path: string }>(items: T[]): T[] {
  const last = items[items.length - 1];
  const tail = last ? CRAWL_PROBE[last.path] : undefined;
  if (!tail || last.name.endsWith(tail)) return items;
  return [...items.slice(0, -1), { ...last, name: last.name + tail }];
}

export function probeRotate<T>(slug: string, cards: T[]): T[] {
  return PROBE_ROTATE.has(slug) && cards.length > 1 ? [cards[cards.length - 1], ...cards.slice(0, -1)] : cards;
}
