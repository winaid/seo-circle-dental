import type { MetadataRoute } from 'next';
import { indexedDocs } from '@/lib/catalog';
import { abs } from '@/lib/site';

export const revalidate = 3600;

/**
 * 사이트맵 — 공개됐고 색인에 내는 문서만(지역×진료 제외, lib/catalog isSearchIndexed). 예약 발행 글은 날짜가 되면 저절로 들어온다(ISR).
 * lastmod 는 실제 수정일(updated) — 빌드 시각을 쓰면 전부 같은 값이 되어 신호가 없어진다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return indexedDocs().map((d) => ({
    url: abs(d.path),
    lastModified: d.updated,
    changeFrequency: d.kind === 'home' ? 'daily' : d.kind === 'page' ? 'weekly' : 'monthly',
    priority: d.priority,
  }));
}
