import { DOCS, publishedDocs } from '@/lib/catalog';

export const revalidate = 3600;

/**
 * 문서 목록 JSON — 이미지 생성 스크립트 같은 도구가 읽는다.
 * 개발 서버에서는 예약 발행 글까지 전부, 프로덕션에서는 공개된 것만.
 */
export function GET() {
  const list = (process.env.NODE_ENV === 'development' ? DOCS : publishedDocs()).map((d) => ({
    path: d.path,
    kind: d.kind,
    title: d.title,
    category: d.category,
    excerpt: d.excerpt,
    keywords: d.keywords,
    image: d.image ?? null,
    publishAt: d.publishAt,
  }));
  return Response.json(list, { headers: { 'X-Robots-Tag': 'noindex', 'Cache-Control': 'no-store' } });
}
