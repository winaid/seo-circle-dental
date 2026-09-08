import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * ★ 네이버 로봇(Yeti)·다음(Daum)·구글·빙 모두 허용. AI 답변 엔진도 허용 — 인용 노출 대상.
 * ★ 사이트맵 두 개(XML + RSS) 를 함께 알린다 — 실측한 상위 사이트들의 robots 와 같은 구조.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/', '/_next/static/chunks/'] },
      { userAgent: 'Yeti', allow: '/' },
      { userAgent: 'Daum', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'bingbot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap.rss`],
    host: SITE_URL,
  };
}
