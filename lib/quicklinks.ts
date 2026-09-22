/**
 * 홈 '바로가기' 타일 5장 — 네이버 웹사이트 결과 아래 붙는 사이트링크 이미지 띠의 재료.
 *
 * ★ 실측(2026-09-22): 레퍼런스(lawcanvas.kr → 밴스의원)의 띠 5장 = 그 홈에 실제로 보이는 글자 타일 5장.
 *   타일마다 하위 페이지가 있고, 그 페이지의 og:image 가 같은 타일 그림, 페이지 제목이 타일 글자였다.
 *   네이버는 이 셋이 같은 것을 보고 띠를 만든다. 그래서 여기 한 곳에서 이름·경로·그림을 내고
 *   홈 화면(app/page.tsx)·페이지 og:image(lib/catalog.ts)·타일 그림(scripts/gen-tiles.mjs)이 전부 이 표를 따른다.
 * ★ 이름을 바꾸면 scripts/gen-tiles.mjs 의 TILES 도 같이 바꾸고 다시 돌린다.
 * ★ 레퍼런스의 만료 도메인 매입·검색어 위장 사이트명·봇/사람 다른 화면은 따라 하지 않는다.
 *   검색에서 들어온 방문자를 본 홈페이지로 보내는 것만 한다(components/SearchRedirect.tsx, 오너 지시 2026-09-22).
 */
export interface QuickLink {
  slug: 'about' | 'treatment' | 'cost' | 'booking' | 'visit';
  /** 타일 큰 글자 = 카드 이름 */
  name: string;
  path: string;
  /** 800×800 jpg — 홈 <img> 와 그 페이지 og:image 가 같은 파일 */
  tile: string;
  /** 카드 아래 한 줄(레퍼런스처럼 '이름 + 무엇을 하는 곳' 문장) */
  caption: string;
}

export const QUICK_LINKS: QuickLink[] = [
  { slug: 'about', name: '병원 소개', path: '/about', tile: '/img/tile/about.jpg', caption: '동그라미치과의원 병원 소개 — 화정역 치과, 통합치의학과 전문의 3인' },
  { slug: 'treatment', name: '진료 안내', path: '/treatment', tile: '/img/tile/treatment.jpg', caption: '동그라미치과의원 진료 안내 — 자연치아 살리기부터 임플란트까지' },
  { slug: 'cost', name: '치료 비용', path: '/cost', tile: '/img/tile/cost.jpg', caption: '동그라미치과의원 치료 비용 — 건강보험이 되는 것과 안 되는 것' },
  { slug: 'booking', name: '예약하기', path: '/booking', tile: '/img/tile/booking.jpg', caption: '동그라미치과의원 예약하기 — 네이버 예약, 전화, 카카오톡 상담' },
  { slug: 'visit', name: '오시는 길', path: '/visit', tile: '/img/tile/visit.jpg', caption: '동그라미치과의원 오시는 길 — 3호선 화정역, 건물 내 주차 무료' },
];

export const quickLinkOf = (path: string) => QUICK_LINKS.find((q) => q.path === path);
