/**
 * SEO 자체 점검 — 떠 있는 서버(기본 http://localhost:3600)의 사이트맵을 읽어 쪽마다 검사한다.
 *   title 길이 · description · h1 개수 · canonical · og:image · JSON-LD 개수 · 본문 글자 수 · alt 없는 이미지 · 내부 링크 수
 *
 * 사용: node scripts/seo-audit.mjs [기준주소] [--limit N]
 */
const BASE = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'http://localhost:3600').replace(/\/+$/, '');
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : Infinity;

const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const paths = locs.map((u) => new URL(u).pathname).slice(0, LIMIT);
console.log(`사이트맵 ${locs.length}개 주소, ${paths.length}개 검사\n`);

const pick = (html, re) => (html.match(re) ?? [])[1] ?? '';
const rows = [];
const problems = [];
let i = 0;
for (const p of paths) {
  i++;
  const res = await fetch(`${BASE}${p}`);
  const html = await res.text();
  const title = pick(html, /<title>([^<]*)<\/title>/);
  const desc = pick(html, /<meta name="description" content="([^"]*)"/);
  const canonical = pick(html, /<link rel="canonical" href="([^"]*)"/);
  const og = pick(html, /<meta property="og:image" content="([^"]*)"/);
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  const ld = (html.match(/application\/ld\+json/g) ?? []).length;
  const main = pick(html, /<main[^>]*>([\s\S]*?)<\/main>/) || html;
  const text = main.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const chars = text.replace(/\s/g, '').length;
  const imgs = [...main.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/alt="[^"]+"/.test(t)).length;
  const links = new Set([...main.matchAll(/href="(\/[^"#?]*)"/g)].map((m) => m[1])).size;
  const row = { p, status: res.status, title: title.length, desc: desc.length, h1, ld, chars, noAlt, links };
  rows.push(row);
  const bad = [];
  if (res.status !== 200) bad.push(`HTTP ${res.status}`);
  if (!title) bad.push('title 없음');
  if (title.length > 75) bad.push(`title ${title.length}자`);
  if (!desc) bad.push('description 없음');
  if (desc.length > 170) bad.push(`description ${desc.length}자`);
  if (h1 !== 1) bad.push(`h1 ${h1}개`);
  if (!canonical) bad.push('canonical 없음');
  if (!og) bad.push('og:image 없음');
  if (ld < 2) bad.push(`JSON-LD ${ld}개`);
  if (chars < 600) bad.push(`본문 ${chars}자`);
  if (noAlt) bad.push(`alt 없는 img ${noAlt}`);
  if (links < 8) bad.push(`내부링크 ${links}`);
  if (bad.length) problems.push({ p, bad });
  if (i % 25 === 0) process.stdout.write(`  ${i}/${paths.length}\r`);
}
const avg = (k) => Math.round(rows.reduce((s, r) => s + r[k], 0) / rows.length);
console.log(`\n평균 — title ${avg('title')}자 · description ${avg('desc')}자 · 본문 ${avg('chars')}자 · JSON-LD ${avg('ld')}개 · 내부링크 ${avg('links')}개`);
console.log(`본문 최소 ${Math.min(...rows.map((r) => r.chars))}자 (${rows.sort((a, b) => a.chars - b.chars)[0].p})`);
if (problems.length) {
  console.log(`\n문제 ${problems.length}쪽:`);
  for (const pr of problems) console.log(`  ${pr.p}  ${pr.bad.join(' · ')}`);
  process.exitCode = 1;
} else {
  console.log('\n전 쪽 통과.');
}
