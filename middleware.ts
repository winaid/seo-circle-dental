import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { put } from '@vercel/blob';

/**
 * 수집 기록 — 검색·AI 봇이 가져간 요청을 Vercel Blob(비공개 저장소 shop-crawl-log)에 한 건씩 남긴다.
 * store(SEO_circle-dental-store/middleware.ts) 와 같은 장치. 2026-10-01 오너 GO.
 *   홈 수집 요청 뒤 1시간 동안 검색 결과가 그대로였는데 '네이버가 아직 안 읽었나 / 읽고도 바로가기를 유지했나'를
 *   가릴 방법이 없었다(Vercel 로그는 하루 안에 지워지고 user-agent 도 없음). 이제 Yeti 가 가져간 시각을 초 단위로 안다.
 * 파일 이름에 시각·봇·주소를 넣어 목록만으로 읽힌다(내용에는 user-agent·IP·국가·referer).
 *   읽기: node scripts/crawl-log.mjs [--since 2026-10-01T13:00] [--bot yeti] [--full]
 * ★ 저장 횟수를 아끼려고 검색엔진·AI 봇만 남긴다(SEO 도구 봇·이름 없는 봇·사람 방문은 안 남김).
 * ★ 응답은 손대지 않는다 — 화면·색인 설정에 영향 없음.
 */
const BOTS: [RegExp, string][] = [
  [/yeti/i, 'yeti'],
  [/naver/i, 'naver'],
  [/googlebot|google-inspectiontool|googleother|google-extended|adsbot-google|mediapartners-google/i, 'google'],
  [/bingbot|bingpreview|msnbot/i, 'bing'],
  [/daum|daumoa/i, 'daum'],
  [/gptbot|oai-searchbot|chatgpt-user/i, 'openai'],
  [/claudebot|claude-user|claude-searchbot|anthropic/i, 'claude'],
  [/perplexity/i, 'perplexity'],
];
// ★ winaid-verify = 우리 점검 도구가 쓰는 이름 — 우리 소음
// ★ NAVER(inapp = 네이버 앱 안 브라우저로 들어온 사람(10-01 첫 2시간 115건 중 104건) — 봇 아님
const SKIP = /ahrefs|semrush|mj12|dotbot|blexbot|dataforseo|serpstat|zoominfo|barkrowler|seokicks|megaindex|winaid-verify|NAVER\(inapp/i;

function whoIs(ua: string): string | null {
  if (!ua || SKIP.test(ua)) return null;
  for (const [re, name] of BOTS) if (re.test(ua)) return name;
  return null;
}

const b64url = (s: string) => btoa(Array.from(new TextEncoder().encode(s), (b) => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function record(req: NextRequest, bot: string) {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600e3).toISOString(); // 파일 이름은 한국 시각
  const path = req.nextUrl.pathname + req.nextUrl.search;
  const h = req.headers;
  const body = {
    t: now.toISOString(),
    bot,
    m: req.method,
    host: h.get('host'),
    path,
    ua: h.get('user-agent'),
    ip: (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip'),
    country: h.get('x-vercel-ip-country'),
    ref: h.get('referer'),
    accept: h.get('accept'),
    ims: h.get('if-modified-since'),
    inm: h.get('if-none-match'),
    edge: h.get('x-vercel-id'),
  };
  const name = `crawl/${kst.slice(0, 10)}/${kst.slice(11, 23).replace(/[:.]/g, '')}_${bot}_${b64url(path).slice(0, 160)}_${Math.random().toString(36).slice(2, 8)}.json`;
  return put(name, JSON.stringify(body), { access: 'private', contentType: 'application/json', addRandomSuffix: false }).catch(() => undefined);
}

export function middleware(req: NextRequest, event: NextFetchEvent) {
  const host = (req.headers.get('host') || '').toLowerCase();
  const local = host.startsWith('localhost') || host.startsWith('127.0.0.1');
  // host 가 비면 서버 안에서 스스로 부른 요청(이미지 최적화 등) — 남기지 않는다
  if (host && !local && process.env.BLOB_READ_WRITE_TOKEN) {
    const bot = whoIs(req.headers.get('user-agent') || '');
    if (bot) event.waitUntil(record(req, bot));
  }
  return NextResponse.next();
}

// ★ _next/static 만 뺀다 — 카드 사진(/img/sq)·공유 사진(/img/og)도 봇이 가져가면 남겨야 한다.
export const config = { matcher: ['/((?!_next/static|favicon.ico).*)'] };
