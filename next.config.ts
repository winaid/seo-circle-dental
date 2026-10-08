import type { NextConfig } from 'next';

/**
 * ★ 보안 헤더는 순위보다 '사이트 상태 리포트' 감점을 막는 자리다.
 * ★ 옛 본원 주소 체계(/insight/...)로 들어오는 링크는 새 구조로 301.
 */
const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=()' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  poweredByHeader: false,
  async redirects() {
    return [
      /*
       * 옛 vercel.app 주소로 들어오면 실제 도메인으로 영구 이전 (2026-09-10 도메인 연결).
       * ★ 같은 내용이 두 주소로 열리면 검색엔진이 중복으로 보고 어느 쪽을 대표로 삼을지
       *   스스로 정한다 — 그러면 우리가 서치어드바이저에 등록한 주소와 어긋날 수 있다.
       * ★ host 를 정확히 지정한다. 프리뷰 배포 주소(seo-circle-dental-xxxx.vercel.app)는
       *   해당되지 않아 미리보기가 계속 동작한다.
       */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'seo-circle-dental.vercel.app' }],
        destination: 'https://circle-dental.shop/:path*',
        permanent: true,
      },
      // ★ 2026-10-08 옛 주소 체계(/insight/…·지운 동네) 옮김은 뺐다 — 지운 쪽은 middleware.ts 가 lib/focus routeOf 로 301·410 을 낸다(여기서 옮기면 두 번 건너뛴다)
      { source: '/rss', destination: '/feed', permanent: true },
      { source: '/feed.xml', destination: '/feed', permanent: true },
    ];
  },
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/feed', headers: [{ key: 'Cache-Control', value: 'public, max-age=900, s-maxage=3600' }] },
      { source: '/rss.xml', headers: [{ key: 'Cache-Control', value: 'public, max-age=900, s-maxage=3600' }] },
      { source: '/sitemap.rss', headers: [{ key: 'Cache-Control', value: 'public, max-age=900, s-maxage=3600' }] },
    ];
  },
};

export default nextConfig;
