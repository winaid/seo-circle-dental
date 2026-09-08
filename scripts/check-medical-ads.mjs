/**
 * 의료광고 금칙 표현 검사 — 빌드 전에 돈다. 발견되면 빌드를 세운다.
 *
 * 실측한 상위 노출 사이트들은 '잘하는곳 / 추천 / 유명한곳 / 과잉진료 없는 / 대학병원급' 을
 * 제목에 쓴다. 의료법 제56조 제2항(객관적으로 인정되지 않는 표시·비교·비방·오인)에 걸릴 수 있고
 * 책임은 병원이 진다. 구조는 참고해도 이 표현은 쓰지 않는다.
 *
 * 검사 대상: lib/*.ts, content/blog/*.json, app/**\/*.tsx, components/*.tsx (주석은 제외)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
/** 정규식 — '완치되나요?' 처럼 병을 설명하는 문장은 통과시키고, 결과를 약속하는 꼴만 잡는다. */
const BANNED = [
  /잘하는\s?곳/, /유명한\s?곳/, /추천(드립니다|합니다|해\s?드립니다)/, /최고의/, /(^|[^0-9])1위/, /국내\s?최초/, /유일한/, /완벽/,
  /부작용\s?(이\s?)?없/, /100%\s*(안전|성공|만족|보장|효과|자연)/, /완치(됩니다|를\s?보장|시켜|가능|해\s?드)/, /과잉\s?진료\s?없/,
  /대학병원급/, /무통/, /평생\s?보장/, /통증\s?없이\s?(치료|시술|진행(해|합))/, /실패\s?없/, /확실(히|하게)\s?(낫|치료)/,
];
const ALLOW = [
  // 데이터 파일 안에서 '쓰지 않는다' 고 설명하는 문장(주석 제거 후에도 남는 문자열)에 대비.
  /BANNED/, /금칙/, /금지/,
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name.startsWith('.')) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (['.ts', '.tsx', '.json'].includes(extname(p))) out.push(p);
  }
  return out;
}

function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/[^\n]*/g, '$1');
}

const files = [...walk(join(ROOT, 'lib')), ...walk(join(ROOT, 'content')), ...walk(join(ROOT, 'app')), ...walk(join(ROOT, 'components'))];
const hits = [];
for (const f of files) {
  const raw = readFileSync(f, 'utf8');
  const src = f.endsWith('.json') ? raw : stripComments(raw);
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    if (ALLOW.some((re) => re.test(line))) return;
    for (const b of BANNED) {
      const m = line.match(b); if (m) hits.push({ file: f.replace(ROOT, '.'), line: i + 1, phrase: m[0], text: line.trim().slice(0, 100) });
    }
  });
}

if (hits.length) {
  console.error(`\n[의료광고 금칙] ${hits.length}건 — 의료법 제56조. 표현을 고친 뒤 다시 빌드하세요.\n`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  「${h.phrase}」  ${h.text}`);
  process.exit(1);
}
console.log(`[의료광고 금칙] 통과 — ${files.length}개 파일, ${BANNED.length}개 표현 검사`);
