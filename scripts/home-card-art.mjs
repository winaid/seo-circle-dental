/**
 * 홈 전용 카드 그림 — public/img/home-card/<slug>.jpg (800×800). 2026-10-06.
 * ★ 왜 따로: 네이버 Aurora 는 사이트 안 여러 쪽에 반복되는 덩어리를 '공통 틀'로 보고 본문에서 뺀다(공식 블로그 222930445562 — 형제 문서 클러스터링).
 *   shop 홈 카드 6장은 진료·지역 쪽 카드 목록과 이름·사진이 5/6 같았다(10-06 실측). 카드가 붙은 홈(광화문·caseplatform)은 홈 카드가 하위 쪽에 0번.
 *   그래서 홈 카드는 이름(lib/carousel.ts LABEL 문장)과 그림을 홈에만 쓴다. 문구는 lib/carousel.ts 와 같아야 한다(여기 TITLES).
 *   node scripts/home-card-art.mjs
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const require = createRequire('file:///C:/Users/FORYOUCOM/Downloads/Winaid-AI/package.json');
const { chromium } = require('playwright');
const sharp = require('sharp');
const ROOT = process.cwd();

// lib/carousel.ts CAROUSEL_SLUGS 순서 · LABEL 문장(쉼표 앞 = 큰 제목, 뒤 = 아랫줄)
const CARDS = [
  { slug: 'save-natural-tooth', title: '화정 자연치아 살리기, 뽑기 전에 먼저 봅니다', bg: '/img/clinic/save-surgery.webp', pos: '50% 45%' },
  { slug: 'implant', title: '화정 임플란트, 마지막 선택이 되도록', bg: '/img/clinic/implant-simulation.webp', pos: '50% 45%' },
  { slug: 'endodontic', title: '화정 신경치료, 치아 속 염증을 치료합니다', bg: '/img/clinic/endo-surgery.webp', pos: '45% 50%' },
  { slug: 'cavity', title: '화정 충치치료, 깊이에 따라 다른 방법', bg: '/img/clinic/cavity-field.webp', pos: '50% 50%' },
  { slug: 'periodontal', title: '화정 잇몸치료, 피가 나면 먼저 확인', bg: '/img/clinic/perio-model.webp', pos: '50% 50%' },
  { slug: 'wisdom-tooth', title: '화정 사랑니 발치, 뽑기 전에 위치부터', bg: '/img/clinic/wisdom-surgery.webp', pos: '55% 45%' },
];
const html = (bg, pos, l1, l2) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet">
<style>*{margin:0;box-sizing:border-box}html,body{width:800px;height:800px;overflow:hidden}
.c{position:relative;width:800px;height:800px;overflow:hidden;font-family:Pretendard,sans-serif;word-break:keep-all;color:#fffaf2}
.ph{position:absolute;inset:0;background:url('${bg}') ${pos}/cover no-repeat}
.ph::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,37,66,.05) 30%,rgba(15,37,66,.78) 72%,rgba(15,37,66,.92))}
.ring{position:absolute;right:-150px;top:-150px;width:460px;height:460px;border-radius:50%;border:2px solid rgba(255,250,242,.45)}
.no{position:absolute;left:60px;top:56px;font-size:28px;font-weight:700;letter-spacing:.12em;color:rgba(255,250,242,.92)}
.txt{position:absolute;left:60px;right:60px;bottom:62px}
.t{font-weight:800;font-size:84px;line-height:1.14;letter-spacing:-.03em}
.s{margin-top:22px;font-size:40px;font-weight:600;line-height:1.35;color:#f3e6cf}
</style></head><body><div class="c"><div class="ph"></div><span class="ring"></span>
<div class="no">동그라미치과의원 · 화정</div>
<div class="txt"><div class="t">${l1}</div><div class="s">${l2}</div></div></div></body></html>`;
const b = await chromium.launch();
const pg = await (await b.newContext({ viewport: { width: 800, height: 800 } })).newPage();
const tmp = path.join(ROOT, '.home-card-art.html');
fs.mkdirSync(path.join(ROOT, 'public/img/home-card'), { recursive: true });
for (const c of CARDS) {
  const [l1, l2] = c.title.split(/,\s*/);
  fs.writeFileSync(tmp, html(pathToFileURL(path.join(ROOT, 'public', c.bg)).href, c.pos, l1, l2 || ''));
  await pg.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(150);
  await sharp(await pg.screenshot({ type: 'png' })).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(ROOT, 'public/img/home-card', `${c.slug}.jpg`));
  console.log('만듦', c.slug, '|', l1, '/', l2);
}
fs.rmSync(tmp, { force: true });
await b.close();
const tiles = await Promise.all(CARDS.map((c) => sharp(path.join(ROOT, 'public/img/home-card', `${c.slug}.jpg`)).resize(260).toBuffer()));
await sharp({ create: { width: 780, height: 520, channels: 3, background: '#fff' } }).composite(tiles.map((t, i) => ({ input: t, left: (i % 3) * 260, top: Math.floor(i / 3) * 260 }))).jpeg().toFile('C:/tmp/shop-home-card-sheet.jpg');
