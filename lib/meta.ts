import type { Metadata } from 'next';
import type { Doc } from './catalog';
import { abs, SITE_NAME, SITE_URL } from './site';
import { IMG } from './assets';
import ogTable from '../content/og.json';

/** og:image 는 1200×630 jpg 로 따로 뽑은 것(scripts/gen-og.mjs → content/og.json). 표에 없으면 원본 — 깨지진 않는다. */
const OG = ogTable as Record<string, string>;
export const OG_W = 1200;
export const OG_H = 630;
export function ogImageOf(src: string): { url: string; width?: number; height?: number } {
  const o = OG[src];
  return o ? { url: abs(o), width: OG_W, height: OG_H } : { url: abs(src) };
}

export const DEFAULT_OG = { src: IMG.doctorsTeam, alt: '동그라미치과의원 의료진' };

export function metaFor(doc: Doc, extra: Partial<Metadata> = {}): Metadata {
  const img = doc.image ?? DEFAULT_OG;
  const og = ogImageOf(img.src);
  return {
    metadataBase: new URL(SITE_URL),
    title: { absolute: doc.seoTitle },
    description: doc.description,
    keywords: doc.keywords,
    alternates: { canonical: abs(doc.path), types: { 'application/rss+xml': `${SITE_URL}/feed` } },
    openGraph: {
      type: doc.kind === 'home' || doc.kind === 'page' || doc.kind === 'area' ? 'website' : 'article',
      url: abs(doc.path),
      title: doc.seoTitle,
      description: doc.description,
      siteName: SITE_NAME,
      locale: 'ko_KR',
      images: [{ ...og, alt: img.alt }],
      ...(doc.kind !== 'home' && doc.kind !== 'page' ? { publishedTime: doc.publishAt, modifiedTime: doc.updated } : {}),
    },
    twitter: { card: 'summary_large_image', title: doc.seoTitle, description: doc.description, images: [og.url] },
    /*
     * 2층 문서(Doc.googleIndex=false)는 구글 로봇에게만 noindex — <meta name="googlebot" content="noindex, follow">.
     * <meta name="robots"> 는 index 그대로라 네이버·Bing 색인은 변하지 않는다. follow 는 남겨 링크 신호는 흐르게 한다.
     */
    robots: doc.googleIndex
      ? { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, googleBot: { index: false, follow: true } },
    ...extra,
  };
}
