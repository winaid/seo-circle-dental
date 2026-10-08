/**
 * 네 검색어 집중판 카드 그림 — public/img/fc/v<v>-<쪽>-<대상>.jpg (800×800). 2026-10-08.
 * content/focus-cards.json 한 표를 읽는다(화면 카드·ItemList 와 같은 표). 이름을 바꾸면 표의 v 를 올리고 다시 돌릴 것
 * (같은 파일 이름에 내용만 바꾸면 네이버·next/image 가 옛 그림을 쥐고 있다 — 10-01 store 함정).
 * ★ 쪽마다 카드 이름이 달라 그림도 쪽마다 다르다 — 같은 덩어리(이름+그림)가 여러 쪽에 되풀이되면 네이버가 공통 틀로 보고 뺀다(10-06).
 * ★ 바탕 사진은 병원 공간·상담 사진만(진료 중인 장면 금지). v2(10-08 오후): 카드 = 블로그 글, 파일 = v<v>-<쪽>-<순번>.jpg, 사진은 쪽 안에서 겹치지 않게 돌려 쓴다.
 *   node scripts/focus-card-art.mjs
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire('file:///C:/Users/FORYOUCOM/Downloads/Winaid-AI/package.json');
const { chromium } = require('playwright');
const sharp = require('sharp');
const ROOT = process.cwd();
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/focus-cards.json'), 'utf8'));
const OUT = path.join(ROOT, 'public/img/fc');
// 병원 공간·상담 사진(lib/assets IMG.interior 중 엑스레이 촬영 장면 뺀 11장 + 상담 사진 5장)
const POOL = [
  '/img/20210923_5e82b10a99850.jpg', '/img/20210923_6b7e0b66df9e0.jpg', '/img/20210923_43d85ec16a0eb.jpg', '/img/20210923_217b53ad1570b.jpg',
  '/img/20210923_595f40b6ee28f.jpg', '/img/20210923_72fa74e154297.jpg', '/img/20210923_956b5d44b57ef.jpg', '/img/20210923_14482879bf993.jpg',
  '/img/20210923_ed347b4ffee21.jpg', '/img/20210923_bfab24c2d7395.jpg', '/img/20210902_c9d4c8d8ff172.jpg',
  '/img/clinic/implant-hero.webp', '/img/clinic/perio-explain.webp', '/img/clinic/doctor-desk.webp', '/img/clinic/aes-chairside.webp', '/img/clinic/doctors-team.webp',
];

const split = (name) => {
  if (name.includes(', ')) { const i = name.indexOf(', '); return [name.slice(0, i), name.slice(i + 2)]; }
  const m = name.match(/^(\S+ 치과|\S+치과)\s*(.*)$/);
  return m ? [m[1], m[2]] : [name, ''];
};
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const html = (bg, pos, l1, l2, home) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}html,body{width:800px;height:800px;overflow:hidden}
.c{position:relative;width:800px;height:800px;overflow:hidden;font-family:Pretendard,sans-serif;word-break:keep-all;color:#fffaf2}
.ph{position:absolute;inset:0;background:url('${bg}') ${pos}/cover no-repeat}
.ph::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,37,66,.08) 28%,rgba(15,37,66,.8) 70%,rgba(15,37,66,.94))}
.ring{position:absolute;right:-150px;top:-150px;width:460px;height:460px;border-radius:50%;border:2px solid rgba(255,250,242,.45)}
.no{position:absolute;left:60px;top:56px;font-size:28px;font-weight:700;letter-spacing:.12em;color:rgba(255,250,242,.92)}
.txt{position:absolute;left:60px;right:60px;bottom:62px}
.t{font-weight:800;font-size:${home ? 72 : 84}px;line-height:1.14;letter-spacing:-.03em}
.s{margin-top:22px;font-size:${home ? 40 : 46}px;font-weight:600;line-height:1.35;color:#f3e6cf}
.bar{width:84px;height:6px;border-radius:3px;background:#d9a55e;margin-bottom:26px}
</style></head><body><div class="c"><div class="ph"></div><span class="ring"></span>
<div class="no">동그라미치과의원 · 화정</div>
<div class="txt"><div class="bar"></div><div class="t">${esc(l1)}</div>${l2 ? `<div class="s">${esc(l2)}</div>` : ''}</div></div></body></html>`;

fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 800, height: 800 } })).newPage();
const tmp = path.join(ROOT, '.focus-card-art.html');
const made = [];
const listKeys = Object.keys(T.lists);
for (const [list, cards] of Object.entries(T.lists)) {
  for (const [i, c] of cards.entries()) {
    const bg = POOL[(listKeys.indexOf(list) * 5 + i) % POOL.length];
    const pos = '50% 40%';
    const [l1, l2] = split(c.name);
    fs.writeFileSync(tmp, html(pathToFileURL(path.join(ROOT, 'public', bg)).href, pos, l1, l2, list === 'home'));
    await pg.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(120);
    const file = path.join(OUT, `v${T.v}-${list}-${i + 1}.jpg`);
    await sharp(await pg.screenshot({ type: 'png' })).jpeg({ quality: 84, mozjpeg: true }).toFile(file);
    made.push(file);
    console.log('만듦', `v${T.v}-${list}-${i + 1}`, c.post, '|', l1, '/', l2);
  }
}
fs.rmSync(tmp, { force: true });
await b.close();
// 확인용 한 장(C:/tmp) — 쪽마다 한 줄
const tiles = await Promise.all(made.map((f) => sharp(f).resize(160).toBuffer()));
await sharp({ create: { width: 960, height: 160 * Math.ceil(made.length / 6), channels: 3, background: '#fff' } })
  .composite(tiles.map((t, i) => ({ input: t, left: (i % 6) * 160, top: Math.floor(i / 6) * 160 })))
  .jpeg().toFile('C:/tmp/focus4/card-sheet.jpg');
console.log('끝', made.length);
