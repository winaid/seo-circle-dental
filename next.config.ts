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
      { source: '/insight/symptom/:slug', destination: '/symptom/:slug', permanent: true },
      { source: '/insight/symptom', destination: '/symptom', permanent: true },
      { source: '/insight/condition/:slug', destination: '/condition/:slug', permanent: true },
      { source: '/insight/condition', destination: '/condition', permanent: true },
      { source: '/insight/journey/:slug', destination: '/journey/:slug', permanent: true },
      { source: '/insight/journey', destination: '/journey', permanent: true },
      { source: '/insight/cost', destination: '/cost', permanent: true },
      { source: '/insight/glossary', destination: '/glossary', permanent: true },
      { source: '/insight/emergency', destination: '/emergency', permanent: true },
      { source: '/insight/blog/:slug', destination: '/blog/:slug', permanent: true },
      { source: '/insight/blog', destination: '/blog', permanent: true },
      { source: '/insight', destination: '/qa', permanent: true },
      { source: '/about/special/:slug', destination: '/about', permanent: true },
      { source: '/about/doctors', destination: '/about', permanent: true },
      ...['jichuk', 'gupabal', 'hwajeon', 'hyangdong', 'deokeun'].flatMap((s) => [
        { source: `/area/${s}`, destination: '/area/deogyang', permanent: true },
        { source: `/area/${s}/:treatment`, destination: '/area/deogyang/:treatment', permanent: true },
      ]),
      { source: '/rss', destination: '/feed', permanent: true },
      { source: '/feed.xml', destination: '/feed', permanent: true },
      { source: '/contact', destination: '/visit', permanent: true },
      { source: '/location', destination: '/visit', permanent: true },
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
