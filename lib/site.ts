/**
 * 사이트 전역 설정 — 주소·제목 규칙·발행 일정.
 *
 * ★ SITE_URL 은 반드시 서치어드바이저에 등록한 주소와 **글자 하나까지** 같아야 한다.
 *   RSS 의 <channel><link> 가 등록 주소와 다르면 네이버가 RSS 제출 자체를 거부한다
 *   (www 유무·http/https 까지 본다). 여기 한 곳에서만 읽고, 화면 어디에도 주소를 직접 적지 않는다.
 */
import { CLINIC } from './clinic';

/*
 * 기본값 = 실제 도메인 (2026-09-10). 예전 기본값은 `circle-dental-seo.vercel.app` 이었는데
 * **앞뒤가 바뀐 오타라 열리지도 않는 주소였다**(실제는 seo-circle-dental). 환경변수가 덮고 있어
 * 겉으로는 멀쩡했지만, 환경변수가 빠지는 순간 canonical·sitemap·RSS·robots 가 통째로
 * 죽은 주소를 가리킨다. 기본값은 '없어도 맞는 값' 이어야 한다.
 */
export const SITE_URL = (process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://circle-dental.shop').replace(/\/+$/, '');

/** 본원 홈페이지 — 구조화 데이터에서 같은 병원임을 잇는 sameAs 로 쓴다. */
export const MAIN_SITE_URL = CLINIC.url;

export const SITE_NAME = CLINIC.name;
export const SITE_SHORT = CLINIC.shortName;

/** 홈 <title> — 실측한 상위 노출 사이트들의 '지역+업종 | 지역+업종 | 역+업종' 3중 구조. */
export const HOME_TITLE = '화정치과 동그라미치과의원 | 화정동 · 3호선 화정역 · 화목 야간진료';
/** 내부 문서 제목 뒤에 붙는 꼬리. 검색 결과 한 줄에 지역·병원이 함께 잡히게 한다. */
export const KEY_SUFFIX = '화정치과 동그라미치과의원';
export const KEY_SUFFIX_SHORT = '동그라미치과의원';

/** 사이트를 처음 공개한 날 = 핵심 문서의 발행일. */
export const LAUNCH_DATE = '2026-09-08';
/** 예약 발행 — 첫날 한 번에 내보내는 글 수, 그 뒤 하루에 내보내는 글 수. */
export const PUBLISH_FIRST_BATCH = Number(process.env.PUBLISH_FIRST_BATCH ?? 80);
export const PUBLISH_PER_DAY = Number(process.env.PUBLISH_PER_DAY ?? 6);

/**
 * IndexNow 키 — 네이버 서치어드바이저가 공식 지원하는 즉시 수집 프로토콜.
 * 같은 값이 public/{KEY}.txt 로 서빙돼야 한다(scripts/indexnow.mjs 가 검사한다).
 */
export const INDEXNOW_KEY = process.env.INDEXNOW_KEY ?? 'c1d2e0a7f3b94e6c8a5d1f0b7e2c9a4d';

/**
 * 네이버 서치어드바이저 소유확인 값 (2026-09-10 등록).
 * ★ 이 태그를 빼면 소유확인이 풀리고 사이트맵·RSS 제출까지 함께 무효가 된다. 지우지 말 것.
 * ★ 비밀이 아니다 — 어차피 모든 페이지의 HTML 에 그대로 노출되는 값이라 코드에 둔다.
 *   환경변수로만 두면 그 변수가 지워지는 순간 조용히 소유확인이 풀린다.
 */
export const NAVER_SITE_VERIFICATION = process.env.NAVER_SITE_VERIFICATION ?? 'dd1337fcfdf147a54b15e3fc8198611c2e5c635f';
export const GOOGLE_SITE_VERIFICATION = process.env.GOOGLE_SITE_VERIFICATION ?? '';
export const NAVER_ANALYTICS_ID = process.env.NAVER_ANALYTICS_ID ?? '';

export const abs = (path: string) => (path === '/' ? SITE_URL : `${SITE_URL}${path}`);

/** 가장 가까운 지하철역 — 좌표는 OSM Nominatim 실측(2026-09-08). */
export const STATION = {
  name: '화정역',
  line: '지하철 3호선',
  lat: 37.635681,
  lng: 126.8310287,
} as const;

export const CLINIC_GEO = { lat: 37.6331145, lng: 126.8326594 } as const;

/** 두 좌표 사이 직선거리(m). 도보 시간은 사람마다 달라 적지 않고, 계산된 거리만 적는다. */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

export const STATION_DISTANCE_M = Math.round(distanceM(CLINIC_GEO, STATION) / 10) * 10;

export function fmtDistance(m: number) {
  return m < 1000 ? `약 ${m}m` : `약 ${(m / 1000).toFixed(1)}km`;
}

/** 3호선 역 순서(북→남). 정거장 수를 계산하는 근거. */
export const LINE3 = ['구파발', '지축', '삼송', '원흥', '원당', '화정', '대곡', '백석', '마두', '정발산', '주엽', '대화'] as const;
export type Line3Station = (typeof LINE3)[number];
export function stopsToHwajeong(station: Line3Station) {
  return Math.abs(LINE3.indexOf(station) - LINE3.indexOf('화정'));
}
