/**
 * IndexNow — 네이버 서치어드바이저가 공식 지원하는 즉시 수집 프로토콜.
 *   사이트맵의 주소를 읽어 네이버(searchadvisor.naver.com/indexnow)와 api.indexnow.org 에 알린다.
 *   보낸 주소는 .indexnow-sent.json 에 기록해 두고, 다음에는 새 주소만 보낸다.
 *
 * 사용:  SITE_URL=https://실제도메인 node scripts/indexnow.mjs          (새 주소만)
 *        SITE_URL=https://실제도메인 node scripts/indexnow.mjs --all    (전부 다시)
 *
 * ★ 키 파일(public/<키>.txt)이 실제로 서빙되는지 먼저 확인한다 — 안 되면 네이버가 요청을 버린다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SITE_URL = (process.env.SITE_URL ?? '').replace(/\/+$/, '');
const KEY = process.env.INDEXNOW_KEY ?? 'c1d2e0a7f3b94e6c8a5d1f0b7e2c9a4d';
const SENT_FILE = '.indexnow-sent.json';
const ALL = process.argv.includes('--all');

if (!SITE_URL || !SITE_URL.startsWith('https://')) {
  console.error('SITE_URL 환경변수에 https:// 로 시작하는 실제 배포 주소를 넣어 주세요.');
  process.exit(1);
}

const host = new URL(SITE_URL).host;
const keyLocation = `${SITE_URL}/${KEY}.txt`;

const keyRes = await fetch(keyLocation);
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
  console.error(`키 파일이 서빙되지 않습니다: ${keyLocation} (HTTP ${keyRes.status})`);
  process.exit(1);
}

const sm = await (await fetch(`${SITE_URL}/sitemap.xml`)).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const sent = existsSync(SENT_FILE) ? JSON.parse(readFileSync(SENT_FILE, 'utf8')) : [];
const targets = ALL ? urls : urls.filter((u) => !sent.includes(u));
if (!targets.length) {
  console.log('새로 알릴 주소가 없습니다.');
  process.exit(0);
}

const ENDPOINTS = ['https://searchadvisor.naver.com/indexnow', 'https://api.indexnow.org/indexnow'];
for (let i = 0; i < targets.length; i += 10000) {
  const batch = targets.slice(i, i + 10000);
  for (const ep of ENDPOINTS) {
    const res = await fetch(ep, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host, key: KEY, keyLocation, urlList: batch }),
    });
    console.log(`${ep} → HTTP ${res.status} (${batch.length}개)`);
  }
}
writeFileSync(SENT_FILE, JSON.stringify([...new Set([...sent, ...targets])], null, 0));
console.log(`기록 완료: ${targets.length}개 (누적 ${new Set([...sent, ...targets]).size}개)`);
