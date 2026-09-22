/**
 * 바로가기 타일 5장(800×800 jpg) — 네이버 웹사이트 결과 아래 '사이트링크 이미지 띠'의 재료.
 *
 * ★ 왜: 레퍼런스(lawcanvas.kr → 밴스의원, 2026-09-22 실측)의 띠 5장은 글자가 큰 단색 타일이었고,
 *   각 타일이 하위 페이지의 og:image 이자 홈 화면의 <img> 였다. 사진이 아니라 '글자 타일'이라
 *   검색 결과 92px 썸네일에서도 읽힌다. 우리도 같은 조건으로 만든다(리다이렉트·위장 없이).
 * ★ 글자는 lib/quicklinks.ts 와 한 몸 — 타일 글자 = 카드 이름 = 페이지 og:image. 바꾸면 다시 돌린다.
 * ★ 렌더는 크롬(playwright, 루트 node_modules) — sharp 의 SVG 글자는 Pretendard 를 못 쓴다.
 *   실행: node scripts/gen-tiles.mjs   (AI 호출 없음, 비용 0)
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('file:///C:/Users/FORYOUCOM/Downloads/Winaid-AI/package.json');
const { chromium } = require('playwright');
const sharp = require('sharp');

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/img/tile');
fs.mkdirSync(OUT, { recursive: true });
const fontCss = 'file:///' + path.join(ROOT, 'public/fonts/pretendard/pretendard.css').replace(/\\/g, '/');
const logo = 'file:///' + path.join(ROOT, 'public/img/20210927_36acb8c3e0ae7.png').replace(/\\/g, '/');

/** 타일 정의 — lib/quicklinks.ts 의 QUICK_LINKS 와 순서·글자가 같아야 한다 */
const TILES = [
  { slug: 'about', big: '병원 소개', small: '동그라미치과의원 · 화정역' },
  { slug: 'treatment', big: '진료 안내', small: '자세히 보기' },
  { slug: 'cost', big: '치료 비용', small: '보험 기준 보기' },
  { slug: 'booking', big: '예약하기', small: '네이버 예약 · 전화' },
  { slug: 'visit', big: '오시는 길', small: '3호선 화정역' },
];

const html = (t) => `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<link rel="stylesheet" href="${fontCss}">
<style>
  html,body{margin:0;width:800px;height:800px;overflow:hidden}
  body{font-family:'Pretendard Variable',Pretendard,-apple-system,'Malgun Gothic',sans-serif;background:#e8eef6;color:#0f2542;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
  .big{font-size:${t.big && t.big.length > 4 ? 128 : 148}px;font-weight:800;letter-spacing:-0.04em;line-height:1.05;text-align:center;word-break:keep-all}
  .small{margin-top:46px;font-size:40px;font-weight:600;color:#39424c;display:flex;flex-direction:column;align-items:flex-start;gap:14px}
  .line{width:330px;height:4px;background:#0f2542;position:relative;border-radius:2px}
  .line::after{content:'';position:absolute;right:-2px;top:-11px;width:22px;height:22px;border-right:4px solid #0f2542;border-bottom:4px solid #0f2542;transform:rotate(-45deg)}
  .ring{position:absolute;right:-120px;bottom:-120px;width:420px;height:420px;border-radius:50%;border:34px solid rgba(31,63,102,.08)}
</style></head><body>
<div class="ring"></div>
<div class="big">${t.big}</div><div class="small"><span>${t.small}</span><span class="line"></span></div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 800 }, deviceScaleFactor: 1 });
for (const t of TILES) {
  await page.setContent(html(t), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(150);
  const png = await page.screenshot({ type: 'png' });
  const out = path.join(OUT, `${t.slug}.jpg`);
  const buf = await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  fs.writeFileSync(out, buf);
  console.log(out.replace(ROOT, ''), Math.round(buf.length / 1024) + 'KB');
}
await browser.close();
