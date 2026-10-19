import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import './theme-warm.css'; // 따뜻한 진료실 테마(2026-09-28) — 이 한 줄을 빼면 예전 모습
import './landing.css'; // 환자용 첫 화면 구조(2026-09-28, components/Landing.tsx)
import { SiteFooter, StickyCta } from '@/components/SiteFooter';
import { JsonLd } from '@/components/ui';
import { Motion } from '@/components/Motion';
import { NaverAnalytics } from '@/components/NaverAnalytics';
import { clinicNode, websiteNode, personNode } from '@/lib/schema';
import { DOCTORS } from '@/lib/doctors';
import { SITE_URL, SITE_NAME, HOME_TITLE, NAVER_SITE_VERIFICATION, GOOGLE_SITE_VERIFICATION, NAVER_ANALYTICS_ID } from '@/lib/site';
import { CLINIC } from '@/lib/clinic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: CLINIC.description,
  applicationName: SITE_NAME,
  alternates: { canonical: `${SITE_URL}/`, types: { 'application/rss+xml': `${SITE_URL}/feed` } },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'ko_KR' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  verification: {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(NAVER_SITE_VERIFICATION ? { other: { 'naver-site-verification': [NAVER_SITE_VERIFICATION] } } : {}),
  },
  other: { 'format-detection': 'telephone=yes' },
};

export const viewport: Viewport = { themeColor: '#0f2542', width: 'device-width', initialScale: 1 };

/** Google Tag Manager — 오너 요청 2026-10-14 (<head> 맨 위 스크립트 + <body> 바로 뒤 noscript) */
const GTM_ID = 'GTM-MR3G3HSR';
const GTM_SCRIPT = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`;

/** Google 태그(gtag.js, GA4) — 오너 요청 2026-10-14 */
const GA_ID = 'G-8VBVRYV3B4';
const GA_SCRIPT = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <script dangerouslySetInnerHTML={{ __html: GTM_SCRIPT }} />
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: GA_SCRIPT }} />
        <link rel="preload" as="style" href="/fonts/pretendard/pretendard.css" />
        <link rel="stylesheet" href="/fonts/pretendard/pretendard.css" />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} 새 글`} href="/feed" />
        <JsonLd nodes={[clinicNode(), websiteNode(), ...DOCTORS.map(personNode)]} />
      </head>
      <body>
        <noscript>
          <iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
        </noscript>
        <a className="skip" href="#main">본문으로 건너뛰기</a>
        {children}
        <SiteFooter />
        <StickyCta />
        <Motion />
        {/* 네이버 애널리틱스 — 공식 스크립트 그대로(</body> 바로 앞). async 로 받으면 아래 줄이 먼저 돌아 wcs 가 없어 한 번도 안 셌다 */}
        {NAVER_ANALYTICS_ID && (
          <>
            <script type="text/javascript" src="https://wcs.pstatic.net/wcslog.js" />
            <script
              type="text/javascript"
              dangerouslySetInnerHTML={{
                __html: `if(!wcs_add) var wcs_add = {};wcs_add["wa"] = "${NAVER_ANALYTICS_ID}";if(window.wcs) {wcs_do();}`,
              }}
            />
            <NaverAnalytics id={NAVER_ANALYTICS_ID} />
          </>
        )}
      </body>
    </html>
  );
}
