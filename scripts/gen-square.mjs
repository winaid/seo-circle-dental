/**
 * 정사각 썸네일 — 구글 검색 결과의 사이트 카드 줄(ItemList 캐러셀)용.
 *
 * 홈 진료 카드 6장의 원본을 800x800 으로 잘라 public/img/sq/ 에 두고, 어느 원본이 어느 정사각으로
 * 갔는지 content/square.json 에 적는다. lib/carousel.ts 는 그 표만 읽는다(실행 중 파일 검사 없음 —
 * ISR 재생성 때 public/ 이 서버리스 함수에 없어도 결과가 안 바뀐다). 표에 없으면 원본을 그대로 쓴다.
 *
 * ★ SOURCES 는 lib/carousel.ts 의 CAROUSEL_SLUGS 가 가리키는 문서 이미지와 짝이다.
 *   진료 대표 사진을 바꾸면 여기도 고치고 `node scripts/gen-square.mjs` 를 다시 돌린다.
 * ★ AI 호출 없음 — 로컬 sharp 만 쓴다. 비용 0.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SOURCES = [
  '/img/clinic/save-surgery.webp', // save-natural-tooth
  '/img/20210901_a15ee499c06d8.png', // implant
  '/img/clinic/endo-surgery.webp', // endodontic
  '/img/ai/cavity-resin.webp', // cavity
  '/img/clinic/perio-explain.webp', // periodontal
  '/img/clinic/wisdom-room.webp', // wisdom-tooth
];
const OUT = 'public/img/sq';
fs.mkdirSync(OUT, { recursive: true });
const table = {};
for (const src of SOURCES) {
  const base = path.basename(src).replace(/\.[a-z]+$/i, '');
  const rel = `/img/sq/${base}.webp`;
  await sharp('public' + src).resize(800, 800, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(path.join(OUT, base + '.webp'));
  const m = await sharp(path.join(OUT, base + '.webp')).metadata();
  table[src] = rel;
  console.log(`${src} → ${rel} ${m.width}x${m.height}`);
}
fs.writeFileSync('content/square.json', JSON.stringify(table, null, 1) + '\n');
console.log('content/square.json 갱신', Object.keys(table).length, '건');
