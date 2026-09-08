import type { Metadata } from 'next';
import type { Doc } from './catalog';
import { abs, SITE_NAME, SITE_URL } from './site';
import { IMG } from './assets';

export const DEFAULT_OG = { src: IMG.doctorsTeam, alt: '동그라미치과의원 의료진' };

export function metaFor(doc: Doc, extra: Partial<Metadata> = {}): Metadata {
  const img = doc.image ?? DEFAULT_OG;
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
      images: [{ url: abs(img.src), alt: img.alt }],
      ...(doc.kind !== 'home' && doc.kind !== 'page' ? { publishedTime: doc.publishAt, modifiedTime: doc.updated } : {}),
    },
    twitter: { card: 'summary_large_image', title: doc.seoTitle, description: doc.description, images: [abs(img.src)] },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    ...extra,
  };
}
