import { buildSitemapRss } from '@/lib/feed';

export const revalidate = 3600;

export function GET() {
  return new Response(buildSitemapRss(), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
