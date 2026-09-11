import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * ★ 네이버 로봇(Yeti)·다음(Daum)·구글·빙 모두 허용. AI 답변 엔진도 허용 — 인용 노출 대상.
 * ★ 사이트맵 두 개(XML + RSS) 를 함께 알린다 — 실측한 상위 사이트들의 robots 와 같은 구조.
 *
 * ⚠️⚠️ **자바스크립트를 막지 않는다** (2026-09-11, 빙 Robots.txt 테스터) ⚠️⚠️
 *   예전에는 `/_next/static/chunks/` 를 막았다. 크롤 예산을 아끼려던 것인데 방향이 반대다 —
 *   검색엔진은 화면을 **그려 보고** 판단하고, 그리는 데 필요한 파일을 막으면 우리 화면을
 *   반쪽만 본 채로 평가한다(구글이 명시적으로 경고하는 항목이다). 되살리지 말 것.
 *
 * ⚠️ **`host` 를 쓰지 않는다** (같은 날, 빙 테스터가 42행을 오류로 잡았다).
 *   `Host:` 는 얀덱스 전용 비표준 지시어였고 2018년에 얀덱스도 폐기했다. 빙·구글·네이버는
 *   읽지 않으면서 오류로만 잡힌다. 대표 주소는 각 쪽의 `<link rel="canonical">` 과
 *   사이트맵이 이미 말하고 있다.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
      { userAgent: 'Yeti', allow: '/' },
      { userAgent: 'Daum', allow: '/' },
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'bingbot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      /* 사용자가 ChatGPT 안에서 링크를 눌러 바로 읽어 갈 때 쓰는 이름 — 위 둘과 다른 봇이다. */
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'AhrefsBot', disallow: '/' },
      { userAgent: 'SemrushBot', disallow: '/' },
      { userAgent: 'MJ12bot', disallow: '/' },
    ],
    sitemap: [`${SITE_URL}/sitemap.xml`, `${SITE_URL}/sitemap.rss`],
  };
}
