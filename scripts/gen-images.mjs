/**
 * 사진 없는 문서에 설명용 이미지를 만든다 — 두 단계.
 *   1) 장면 설계: 문서 제목·요약을 텍스트 모델에 넘겨 "치과 진료실 상판 위 정물" 장면을 문서마다
 *      다르게 설계한다(주요 소품이 서로 겹치지 않게, 이미 있는 그림과도 겹치지 않게). 한국어 alt 도 함께.
 *   2) 그림 생성: gpt-image-2 (본원 사이트와 같은 LOOK 프롬프트·크기·품질) → sharp webp 1200×800.
 *
 * 사용: node scripts/gen-images.mjs            (계획 + 생성, 이어하기 가능)
 *       node scripts/gen-images.mjs --plan     (장면 설계만)
 *       node scripts/gen-images.mjs --limit 20 (앞 20장만)
 *       node scripts/gen-images.mjs --kinds qa,cost
 *
 * ⚠️ 사람·손·얼굴·글자 금지 — 실제 인물이 아닌 얼굴은 '우리 원장·환자' 로 읽히고, 만들어진 글자는 없는 브랜드를 만든다.
 * ⚠️ 결과 파일은 public/img/gen/, 목록은 content/images.json. 이미 있는 파일은 건너뛴다(비용 보호).
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import sharp from 'sharp';

const env = existsSync('.env.local') ? readFileSync('.env.local', 'utf8') : '';
const KEY = process.env.OPENAI_API_KEY ?? env.match(/OPENAI_API_KEY=(\S+)/)?.[1];
if (!KEY) { console.error('OPENAI_API_KEY 가 없습니다 (.env.local).'); process.exit(1); }
const TEXT_MODEL = process.env.OPENAI_TEXT_MODEL ?? 'gpt-5.5-mini';
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-2';
const BASE = process.env.CATALOG_BASE ?? 'http://localhost:3600';
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : d; };
const LIMIT = Number(opt('--limit', Infinity));
const KINDS = opt('--kinds', 'qa,cost,glossary,journey,condition,symptom').split(',');
const CONCURRENCY = Number(opt('--concurrency', 3));

const MANIFEST = 'content/images.json';
const PLAN = 'content/images.plan.json';
const OUT_DIR = 'public/img/gen';
mkdirSync(OUT_DIR, { recursive: true });
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const plan = existsSync(PLAN) ? JSON.parse(readFileSync(PLAN, 'utf8')) : {};

/* 본원 사이트 전체 공통 LOOK — 결이 갈리면 한 사이트로 안 보인다. */
const LOOK =
  'Bright, tidy dental clinic. Clean white counter surface, clinical daylight, soft shadows. ' +
  'White and pale grey palette with one quiet warm beige accent in the background. ' +
  'Macro photographic, shallow depth of field, calm and professional. ' +
  'No linen cloth, no dried flowers, no rustic pottery. ' +
  'Absolutely no people, no hands, no faces, no body parts. No logos, no brand marks, no readable lettering or numbers anywhere.';

/* 이미 있는 그림의 주제 — 새 장면이 이것들과 겹치지 않게 텍스트 모델에 알린다. */
const EXISTING = 'endodontic files beside molar cross-section; ceramic crown above prepared tooth; tartar on lower front teeth model with scaler; thin veneer shells beside front-teeth model; two crowns metal vs ceramic; single veneer with night guard; zirconia crown with floss and interdental brush; shade guide with whitening tray; implant fixture in bone model; bone graft granules; implant planning on tablet; kids toothbrush; wisdom tooth angles model; periodontal probe; intake form with pills; panoramic x-ray on viewer; mirror and probe with lower jaw model; tablet tooth chart with model; cross-section molar with pulp; magnifier loupe; cracked tooth model; scaling before after model; sealant on molar';

const slugOf = (path) => path.slice(1).replace(/\//g, '-');

async function openai(url, body) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const r = await fetch(`https://api.openai.com/v1/${url}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${KEY}` },
      body: JSON.stringify(body),
    });
    if (r.ok) return r.json();
    const text = await r.text();
    if ((r.status === 429 || r.status >= 500) && attempt < 3) {
      const wait = 4000 * (attempt + 1);
      console.log(`  ${r.status} 재시도 ${attempt + 1} (${wait / 1000}s)`);
      await new Promise((res) => setTimeout(res, wait));
      continue;
    }
    throw new Error(`${r.status} ${text.slice(0, 200)}`);
  }
}

/* ───── 1) 장면 설계 ───── */
async function planScenes(docs) {
  const todo = docs.filter((d) => !plan[d.path]);
  console.log(`장면 설계: ${todo.length}편 (이미 ${docs.length - todo.length}편 있음)`);
  const usedProps = new Set(Object.values(plan).flatMap((p) => p.props ?? []));
  for (let i = 0; i < todo.length; i += 30) {
    const chunk = todo.slice(i, i + 30);
    const sys = `You design still-life photo scenes for a Korean dental clinic's information website. Each document gets ONE scene that is physically plausible on a clean white counter in a dental clinic and that visually matches the document's topic. Rules:
- Objects only: dental models (tooth cross-sections, jaw models, gum models), instruments, materials (crowns, implants, veneers, files, floss, trays), x-ray film on a viewer, small clinic props. NEVER people, hands, faces, body parts, mascots, cartoons.
- NEVER text, numbers, labels, signs, screens with UI, money bills, cards with print. For cost/insurance topics use neutral props (a closed ledger, a small brass scale, coins blurred, a pen and blank paper) — no readable print.
- Every scene in this batch must have a DIFFERENT main object and a different composition (angle, distance, arrangement). Do not reuse main objects across items. Also avoid these already-used subjects: ${EXISTING}. Already-used props from previous batches: ${[...usedProps].slice(0, 120).join('; ') || '(none)'}.
- "scene": 1–2 English sentences, concrete and specific (what object, how placed, what detail is visible, camera angle). No style words (style is added later).
- "alt": Korean, one sentence, describing exactly what is in the picture (objects, arrangement) — not the mood, not the topic name.
- "props": 2–4 short English nouns of the main objects.
Return JSON: {"items":[{"path":"...","scene":"...","alt":"...","props":["..."]}]} with every input path exactly once.`;
    const user = chunk.map((d) => `path: ${d.path}\nkind: ${d.kind} / category: ${d.category}\ntitle: ${d.title}\nsummary: ${d.excerpt.slice(0, 220)}`).join('\n\n');
    const j = await openai('chat/completions', {
      model: TEXT_MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: user },
      ],
    });
    let items = [];
    try { items = JSON.parse(j.choices[0].message.content).items ?? []; } catch { items = []; }
    for (const it of items) {
      if (!it.path || !it.scene) continue;
      plan[it.path] = { scene: it.scene, alt: it.alt ?? '', props: it.props ?? [] };
      (it.props ?? []).forEach((p) => usedProps.add(p));
    }
    writeFileSync(PLAN, JSON.stringify(plan, null, 1));
    console.log(`  ${Math.min(i + 30, todo.length)}/${todo.length} 설계됨`);
  }
}

/* ───── 2) 그림 생성 ───── */
async function generateOne(d) {
  const p = plan[d.path];
  if (!p) return 'no-plan';
  const slug = slugOf(d.path);
  const out = `${OUT_DIR}/${slug}.webp`;
  if (existsSync(out) && manifest[d.path]) return 'skip';
  const t0 = Date.now();
  const j = await openai('images/generations', { model: IMAGE_MODEL, prompt: `${p.scene} ${LOOK}`, size: '1536x1024', quality: 'medium', n: 1 });
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error('빈 응답');
  await sharp(Buffer.from(b64, 'base64')).resize(1200, 800, { fit: 'cover' }).webp({ quality: 80 }).toFile(out);
  manifest[d.path] = { src: `/img/gen/${slug}.webp`, alt: p.alt || d.title, scene: p.scene };
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
  return `${Math.round((Date.now() - t0) / 1000)}s`;
}

async function main() {
  const all = await (await fetch(`${BASE}/catalog.json`)).json();
  const docs = all.filter((d) => !d.image && KINDS.includes(d.kind)).slice(0, LIMIT);
  console.log(`대상 ${docs.length}편 (${KINDS.join(',')}) · 텍스트 ${TEXT_MODEL} · 이미지 ${IMAGE_MODEL}`);
  await planScenes(docs);
  if (flag('--plan')) return;
  const queue = docs.filter((d) => !(existsSync(`${OUT_DIR}/${slugOf(d.path)}.webp`) && manifest[d.path]));
  console.log(`생성: ${queue.length}편 (동시 ${CONCURRENCY})`);
  let done = 0, fail = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const d = queue.shift();
      try {
        const r = await generateOne(d);
        done++;
        console.log(`  ✓ ${d.path}  ${r}  [${done}/${done + fail + queue.length}]`);
      } catch (e) {
        fail++;
        console.log(`  ✗ ${d.path}  ${String(e.message ?? e).slice(0, 120)}`);
      }
    }
  });
  await Promise.all(workers);
  console.log(`끝 — 성공 ${done}, 실패 ${fail}, 목록 ${Object.keys(manifest).length}편`);
}

main().catch((e) => { console.error(e); process.exit(1); });
