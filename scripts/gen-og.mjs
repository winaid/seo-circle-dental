/**
 * og:image 전용 사진 — 네이버·카카오 썸네일 규격(1200×630, 300KB 이하, jpg)으로 통일.
 *
 * ★ 왜: 실측(2026-09-08) 우리 og:image 는 webp 위주 + 임플란트 423KB PNG + 홈 372KB 로
 *   네이버 권장(1200×630 · ≤300KB · 글자 없는 사진)에서 벗어났다. 원본은 화면용으로 두고
 *   og 만 따로 뽑는다. lib/meta.ts 가 content/og.json 표를 읽어 바꿔 끼우고, 표에 없으면 원본.
 * ★ 원본 목록은 코드(lib·app)와 content/images.json 에 적힌 /img/… 경로 전부 — 새 사진을 코드에
 *   넣으면 이 스크립트를 다시 돌린다(`node scripts/gen-og.mjs`). 안 돌려도 원본으로 폴백, 안 깨짐.
 * ★ AI 호출 없음. 로컬 sharp. 비용 0.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const W = 1200, H = 630, MAX_KB = 300;
const OUT = 'public/img/og';
fs.mkdirSync(OUT, { recursive: true });

const walk = (dir, exts) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name), exts) : exts.test(e.name) ? [path.join(dir, e.name)] : []));
const srcs = new Set();
for (const f of [...walk('lib', /\.tsx?$/), ...walk('app', /\.tsx?$/), ...walk('components', /\.tsx?$/)]) {
  const t = fs.readFileSync(f, 'utf8');
  for (const m of t.matchAll(/(?:\$\{P\}|\/img)\/([A-Za-z0-9_./-]+\.(?:png|jpe?g|webp))/g)) srcs.add('/img/' + m[1]);
}
for (const v of Object.values(JSON.parse(fs.readFileSync('content/images.json', 'utf8')))) srcs.add(v.src);
/* og/sq 산출물·로고·SVG 성격의 자산은 제외 — 썸네일감이 아니다 */
const skip = /^\/img\/(og|sq)\//;
const list = [...srcs].filter((s) => !skip.test(s) && fs.existsSync('public' + s)).sort();

const table = {};
let over = 0;
for (const src of list) {
  const base = path.basename(src).replace(/\.[a-z]+$/i, '');
  const out = path.join(OUT, base + '.jpg');
  let q = 80, buf;
  for (;;) {
    buf = await sharp('public' + src).resize(W, H, { fit: 'cover', position: 'attention' }).jpeg({ quality: q, mozjpeg: true }).toBuffer();
    if (buf.length <= MAX_KB * 1024 || q <= 50) break;
    q -= 6;
  }
  fs.writeFileSync(out, buf);
  if (buf.length > MAX_KB * 1024) over++;
  table[src] = `/img/og/${base}.jpg`;
}
fs.writeFileSync('content/og.json', JSON.stringify(table, null, 1) + '\n');
const total = Object.keys(table).length;
const bytes = fs.readdirSync(OUT).reduce((a, f) => a + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`og 이미지 ${total}장 → ${OUT} (${(bytes / 1048576).toFixed(1)}MB), 300KB 초과 ${over}장, content/og.json 갱신`);
