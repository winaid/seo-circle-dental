/**
 * RSS 2.0 — 네이버 서치어드바이저 'RSS 제출' 용.
 *
 * ★ 검사 항목(실측·자료 기준)
 *   · <channel><link> 는 SITE_URL 과 글자 하나까지 같다.
 *   · item 마다 title / link / guid / pubDate(RFC 822, 시간대 포함) / description.
 *   · 항목 1개 이상. 최신 50개(전문 피드) — 너무 크면 거부된 사례가 있다.
 *   · BOM 없음, XML 특수문자 이스케이프.
 */
import { publishedDocs, type Doc } from './catalog';
import { abs, SITE_NAME, SITE_URL } from './site';
import { CLINIC } from './clinic';
import { IMG } from './assets';
import { escapeXml, rfc822 } from './text';
import { stableHash as hash } from './publish';

function sortedDocs() {
  return publishedDocs()
    .filter((d) => d.kind !== 'home' && d.kind !== 'page')
    .sort((a, b) => (a.publishAt === b.publishAt ? hash(a.path) - hash(b.path) : a.publishAt < b.publishAt ? 1 : -1));
}

function itemHtml(d: Doc) {
  if (d.rssHtml) return d.rssHtml;
  const img = d.image ? `<p><img src="${abs(d.image.src)}" alt="${escapeXml(d.image.alt)}" /></p>` : '';
  return `${img}<p>${escapeXml(d.excerpt)}</p><p><a href="${abs(d.path)}">${escapeXml(d.title)} — 전체 글 보기</a></p><p>${escapeXml(CLINIC.name)} · ${escapeXml(CLINIC.address.full)} · ${CLINIC.phone}</p>`;
}

function channelHead(self: string) {
  return `<title>${escapeXml(`${SITE_NAME} — 화정동 치과 안내`)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(CLINIC.description)}</description>
    <language>ko-KR</language>
    <copyright>${escapeXml(CLINIC.name)}</copyright>
    <managingEditor>${escapeXml(CLINIC.email)} (${escapeXml(CLINIC.name)})</managingEditor>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <image><url>${abs(IMG.logo)}</url><title>${escapeXml(SITE_NAME)}</title><link>${SITE_URL}</link></image>
    <ttl>60</ttl>`;
}

/** 전문 피드 — /feed, /rss.xml */
export function buildFeed(limit = 50) {
  const docs = sortedDocs().slice(0, limit);
  const last = docs[0]?.publishAt;
  const items = docs
    .map(
      (d) => `
    <item>
      <title>${escapeXml(d.title)}</title>
      <link>${abs(d.path)}</link>
      <guid isPermaLink="true">${abs(d.path)}</guid>
      <pubDate>${rfc822(d.publishAt)}</pubDate>
      <dc:creator>${escapeXml(CLINIC.name)}</dc:creator>
      <category>${escapeXml(d.category)}</category>
      <description>${escapeXml(d.excerpt)}</description>
      <content:encoded><![CDATA[${itemHtml(d).replace(/\]\]>/g, ']]]]><![CDATA[>')}]]></content:encoded>${d.image ? `
      <enclosure url="${abs(d.image.src)}" type="${mime(d.image.src)}" length="0" />` : ''}
    </item>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    ${channelHead(`${SITE_URL}/feed`)}
    ${last ? `<lastBuildDate>${rfc822(last)}</lastBuildDate>` : ''}${items}
  </channel>
</rss>
`;
}

/** 목록 피드 — /sitemap.rss (실측한 사이트들이 사이트맵과 함께 제출하는 형식: 제목·링크·날짜만, 전체 문서). */
export function buildSitemapRss() {
  const docs = sortedDocs();
  const last = docs[0]?.publishAt;
  const items = docs
    .map(
      (d) => `
    <item>
      <guid isPermaLink="true">${abs(d.path)}</guid>
      <link>${abs(d.path)}</link>
      <title>${escapeXml(d.title)}</title>
      <pubDate>${rfc822(d.publishAt)}</pubDate>
    </item>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    ${channelHead(`${SITE_URL}/sitemap.rss`)}
    ${last ? `<lastBuildDate>${rfc822(last)}</lastBuildDate>` : ''}${items}
  </channel>
</rss>
`;
}

function mime(src: string) {
  if (src.endsWith('.webp')) return 'image/webp';
  if (src.endsWith('.png')) return 'image/png';
  return 'image/jpeg';
}

