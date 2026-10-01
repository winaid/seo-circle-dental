// 수집 기록 읽기 — middleware 가 Vercel Blob(crawl/)에 남긴 봇 요청을 시각 순으로.
//   node scripts/crawl-log.mjs                          전부(파일 이름만 — 빠름)
//   node scripts/crawl-log.mjs --since 2026-09-29T15:00 --bot yeti
//   node scripts/crawl-log.mjs --full                   user-agent·IP·국가까지(한 건씩 내려받음 — 느림)
//   node scripts/crawl-log.mjs --json > out.json        기계용
// 토큰: .env.local 의 BLOB_READ_WRITE_TOKEN (vercel env pull 로 받음)
import { list, get } from '@vercel/blob';
import { readFileSync, existsSync } from 'node:fs';

if (!process.env.BLOB_READ_WRITE_TOKEN && existsSync('.env.local')) {
  for (const line of readFileSync('.env.local', 'utf8').split('\n')) {
    const m = line.match(/^BLOB_READ_WRITE_TOKEN="?([^"\r\n]+)"?/);
    if (m) process.env.BLOB_READ_WRITE_TOKEN = m[1];
  }
}
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const since = arg('--since'); // 한국 시각으로 적는다(예: 2026-09-29T15:00)
const botF = arg('--bot');
const full = process.argv.includes('--full');
const asJson = process.argv.includes('--json');

const unb64 = (s) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
const rows = [];
let cursor;
do {
  const r = await list({ prefix: 'crawl/', cursor, limit: 1000 });
  for (const b of r.blobs) {
    const m = b.pathname.match(/^crawl\/(\d{4}-\d{2}-\d{2})\/(\d{2})(\d{2})(\d{2})(\d{3})_([^_]+)_(.*)_[a-z0-9]+\.json$/);
    if (!m) continue;
    const kst = `${m[1]}T${m[2]}:${m[3]}:${m[4]}.${m[5]}`;
    rows.push({ kst, bot: m[6], path: unb64(m[7]), pathname: b.pathname, url: b.url });
  }
  cursor = r.cursor;
} while (cursor);
rows.sort((a, b) => a.kst.localeCompare(b.kst));
const out = rows.filter((r) => (!since || r.kst >= since) && (!botF || r.bot === botF));
if (full) {
  for (const r of out) {
    const g = await get(r.pathname, { access: 'private' });
    r.detail = JSON.parse(await new Response(g.stream).text());
  }
}
if (asJson) console.log(JSON.stringify(out, null, 1));
else {
  for (const r of out) console.log(`${r.kst.replace('T', ' ')}  ${r.bot.padEnd(9)} ${r.path}${full ? `  | ${r.detail.ip} ${r.detail.country} ${r.detail.m} ${r.detail.host} | ${r.detail.ua}` : ''}`);
  console.log(`— ${out.length}건 (전체 ${rows.length})`);
}
