/**
 * 정사각 썸네일 — 검색 결과의 사이트 카드 줄(ItemList 캐러셀)용. jpg 로 낸다(레퍼런스와 같은 형식, webp 는 수집기 호환을 믿지 않는다).
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
  // 진료 대표 사진 — 홈·진료 페이지·지역 페이지 카드(ItemList 캐러셀) 공용
  '/img/clinic/save-surgery.webp', // save-natural-tooth
  '/img/20210901_a15ee499c06d8.png', // implant
  '/img/clinic/endo-surgery.webp', // endodontic
  '/img/clinic/perio-explain.webp', // periodontal
  '/img/ai/cavity-resin.webp', // cavity
  '/img/clinic/wisdom-room.webp', // wisdom-tooth
  '/img/20210901_b57681799e6ab.png', // whitening
  '/img/clinic/aesthetic-consult.webp', // crown-prosthesis (laminate 도 같은 사진이라 목록에서 한 번만)
  '/img/clinic/perio-handpiece.webp', // scaling-prevention
  // 지역 페이지 대표 실사진 — 지역×진료 페이지 카드의 '○○ 치과' 한 장 (2026-09-28 네이버 캐러셀)
  '/img/20210923_5e82b10a99850.jpg', // hwajeong
  '/img/20210923_6b7e0b66df9e0.jpg', // hwajeong-1
  '/img/20210923_43d85ec16a0eb.jpg', // hwajeong-2
  '/img/20210923_217b53ad1570b.jpg', // hwajeong-station
  '/img/20210923_595f40b6ee28f.jpg', // deogyang-office
  '/img/20210923_72fa74e154297.jpg', // byeolbit
  '/img/20210923_956b5d44b57ef.jpg', // eunbit
  '/img/20210923_14482879bf993.jpg', // okbit
  '/img/20210923_ed347b4ffee21.jpg', // haetbit
  '/img/20210923_bfab24c2d7395.jpg', // dalbit
  '/img/20210923_67b5506b18b26.jpg', // daegok-station
  '/img/20210902_c9d4c8d8ff172.jpg', // daejeong-station
];
const OUT = 'public/img/sq';
fs.mkdirSync(OUT, { recursive: true });
const table = {};
for (const src of SOURCES) {
  const base = path.basename(src).replace(/\.[a-z]+$/i, '');
  const rel = `/img/sq/${base}.jpg`;
  await sharp('public' + src).resize(800, 800, { fit: 'cover', position: 'attention' }).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, base + '.jpg'));
  const m = await sharp(path.join(OUT, base + '.jpg')).metadata();
  table[src] = rel;
  console.log(`${src} → ${rel} ${m.width}x${m.height}`);
}
fs.writeFileSync('content/square.json', JSON.stringify(table, null, 1) + '\n');
console.log('content/square.json 갱신', Object.keys(table).length, '건');
