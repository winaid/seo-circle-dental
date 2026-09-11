import { googleDocs } from '@/lib/catalog';
import { abs } from '@/lib/site';

export const revalidate = 3600;

/**
 * 구글 서치콘솔에 제출하는 사이트맵 — 1층(Doc.googleIndex) 문서만, 약 90쪽.
 *
 * ★ 왜 따로 두나 (2026-09-11): sitemap.xml 은 네이버용으로 412쪽 전부를 싣는다. 그걸 구글에 내면
 *   구글은 "대량 템플릿 페이지를 색인 요청했다" 로 읽고 사이트 전체 평가를 내린다(2026 스팸 업데이트).
 *   구글에는 이 파일만 제출하고, sitemap.xml 은 네이버에만 둔다. robots.txt 에도 이 파일은 적지 않는다.
 * ★ 2층 문서는 이 파일에 없을 뿐 아니라 googlebot noindex 도 달려 있다(lib/meta.ts).
 */
export function GET() {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const urls = googleDocs()
    .map((d) => `  <url>\n    <loc>${esc(abs(d.path))}</loc>\n    <lastmod>${d.updated}</lastmod>\n    <priority>${d.priority}</priority>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' } });
}
