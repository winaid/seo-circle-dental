import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { DOCS } from '@/lib/catalog';
import { todayKST, addDays } from '@/lib/publish';
import { abs, INDEXNOW_KEY, SITE_URL } from '@/lib/site';

/**
 * 매일 새로 공개된 글을 네이버에 즉시 알린다 (IndexNow, 2026-09-10).
 *
 * ── 왜 필요한가 ──
 * 이 사이트는 하루 PUBLISH_PER_DAY 편씩 예약 발행된다(ISR 로 저절로 열린다).
 * 사이트맵에도 들어가지만, 로봇이 사이트맵을 다시 읽을 때까지 며칠이 걸린다.
 * IndexNow 는 "이 주소 지금 봐 달라" 고 먼저 말하는 통로다 — 네이버가 공식 지원한다.
 *
 * ★ 보내는 대상은 **어제·오늘 공개분뿐**이다. 전체를 매일 다시 보내지 않는다 —
 *   바뀌지도 않은 주소를 반복해 밀면 키가 제한될 수 있다(IndexNow 권고).
 * ★ 어제분까지 포함하는 이유: 크론이 하루 걸러도 그날 글이 영영 안 알려지는 일이 없게 한다.
 *   중복 제출은 이틀에 한 번뿐이라 무해하다.
 * ★ 이 라우트는 robots.txt 의 Disallow: /api/ 로 이미 로봇에게 가려져 있다.
 *
 * 실행 시각 — vercel.json 의 "30 15 * * *". **Vercel 크론은 UTC 기준**이라 15:30 UTC =
 * 한국 00:30 이다. 예약 발행이 한국 자정에 열리므로 그 30분 뒤에 돈다.
 * ⚠️ 한국 시간으로 착각해 숫자를 고치면 아직 안 열린 글을 알리거나 하루를 통째로 건너뛴다.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const ENDPOINTS = [
  'https://searchadvisor.naver.com/indexnow',
  'https://api.indexnow.org/indexnow',
];

/**
 * 같은 날 반복 호출을 흡수한다. 인스턴스 메모리라 완벽한 잠금은 아니지만,
 * 누가 이 주소를 두드려도 네이버로 나가는 요청이 증폭되지 않게 막는 정도는 된다.
 */
let lastRunDay = '';

export async function GET(request: NextRequest) {
  /*
   * Vercel 크론은 CRON_SECRET 이 설정돼 있으면 Authorization: Bearer <값> 을 함께 보낸다.
   * ⚠️ 설정돼 있으면 반드시 맞아야 통과. 설정이 없으면 막지 않되 로그에 남긴다 —
   *    여기서 401 로 막아 버리면 오너가 값을 넣기 전까지 크론이 조용히 실패한다.
   */
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  } else {
    console.warn('[indexnow] CRON_SECRET 미설정 — 이 주소가 공개로 열려 있다. 환경변수를 넣을 것.');
  }

  const today = todayKST();
  if (lastRunDay === today) {
    return NextResponse.json({ ok: true, skipped: 'already_ran_today', day: today });
  }

  const yesterday = addDays(today, -1);
  const urls = DOCS
    .filter((d) => d.publishAt === today || d.publishAt === yesterday)
    .map((d) => abs(d.path));

  if (urls.length === 0) {
    lastRunDay = today;
    return NextResponse.json({ ok: true, day: today, count: 0, note: '오늘·어제 새로 공개된 글이 없다' });
  }

  const host = new URL(SITE_URL).host;
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls,
  });

  const results = await Promise.all(
    ENDPOINTS.map(async (ep) => {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body,
        });
        return { endpoint: ep, status: res.status };
      } catch (e) {
        return { endpoint: ep, status: 0, error: (e as Error).message.slice(0, 120) };
      }
    }),
  );

  /* 한 곳이라도 받았으면 그날치는 끝난 것으로 본다. 둘 다 실패하면 다음 호출에서 다시 시도한다. */
  if (results.some((r) => r.status >= 200 && r.status < 300)) lastRunDay = today;

  console.log(`[indexnow] ${today} · ${urls.length}개 · ${results.map((r) => `${new URL(r.endpoint).host}=${r.status}`).join(' ')}`);
  return NextResponse.json({ ok: true, day: today, count: urls.length, results });
}
