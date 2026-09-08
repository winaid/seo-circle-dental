import { buildFeed } from '@/lib/feed';

export const revalidate = 3600;

export function GET() {
  return new Response(buildFeed(50), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
