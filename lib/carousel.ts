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
import { docByPathStrict } from './catalog';
import { treatmentBySlug } from './treatments';

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
  name: string;
  path: string;
  image: string;
  caption: string;
}

export function homeCarousel(): CarouselItem[] {
  return CAROUSEL_SLUGS.map((slug) => {
    const d = docByPathStrict(`/treatment/${slug}`);
    const t = treatmentBySlug(slug)!;
    return { slug, name: LABEL[slug], path: d.path, image: squareOf(d.image!.src), caption: t.summary };
  });
}
