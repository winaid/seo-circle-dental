import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { SiteFooter, StickyCta } from '@/components/SiteFooter';
import { JsonLd } from '@/components/ui';
import { clinicNode, websiteNode, personNode } from '@/lib/schema';
import { DOCTORS } from '@/lib/doctors';
import { SITE_URL, SITE_NAME, HOME_TITLE, NAVER_SITE_VERIFICATION, GOOGLE_SITE_VERIFICATION, NAVER_ANALYTICS_ID } from '@/lib/site';
import { CLINIC } from '@/lib/clinic';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: `%s | ${SITE_NAME}` },
  description: CLINIC.description,
  applicationName: SITE_NAME,
  alternates: { canonical: SITE_URL, types: { 'application/rss+xml': `${SITE_URL}/feed` } },
  openGraph: { type: 'website', siteName: SITE_NAME, locale: 'ko_KR' },
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  verification: {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(NAVER_SITE_VERIFICATION ? { other: { 'naver-site-verification': [NAVER_SITE_VERIFICATION] } } : {}),
  },
  icons: { icon: '/img/20210927_36acb8c3e0ae7.png' },
  other: { 'format-detection': 'telephone=yes' },
};

export const viewport: Viewport = { themeColor: '#0f2542', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preload" as="style" href="/fonts/pretendard/pretendard.css" />
        <link rel="stylesheet" href="/fonts/pretendard/pretendard.css" />
        <link rel="alternate" type="application/rss+xml" title={`${SITE_NAME} 새 글`} href="/feed" />
        <JsonLd nodes={[clinicNode(), websiteNode(), ...DOCTORS.map(personNode)]} />
      </head>
      <body>
        <a className="skip" href="#main">본문으로 건너뛰기</a>
        {children}
        <SiteFooter />
        <StickyCta />
        {NAVER_ANALYTICS_ID && (
          <>
            <script async src="https://wcs.pstatic.net/wcslog.js" />
            <script
              dangerouslySetInnerHTML={{
                __html: `if(window.wcs){wcs_add=window.wcs_add||{};wcs_add["wa"]="${NAVER_ANALYTICS_ID}";wcs_do();}`,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}
