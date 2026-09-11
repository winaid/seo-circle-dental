/**
 * 문서 목록(카탈로그) — 사이트의 모든 주소가 여기서 파생된다.
 *
 * ★ 사이트맵·RSS·목록·관련 글·이전/다음 링크가 전부 이 배열을 읽는다.
 *   페이지를 추가하고 여기 넣는 것을 잊으면 검색 로봇은 그 페이지를 영영 모른다.
 * ★ 예약 발행일도 여기서 정해진다(lib/publish.ts). 화면·사이트맵·RSS 가 같은 값을 본다.
 */
import { TREATMENTS, type Treatment } from './treatments';
import { TREATMENT_PAGES } from './treatmentPages';
import { IMPLANT_TOPICS } from './implantTopics';
import { SYMPTOMS, SYMPTOM_GROUPS } from './symptoms';
import { CONDITIONS } from './conditions';
import { JOURNEYS, COST_TOPICS, GLOSSARY, COST_LABEL } from './insight';
import { SPECIALS } from './specials';
import { CLINIC_QA } from './faq';
import { DOCTORS } from './doctors';
import { IMG } from './assets';
import { CLINIC } from './clinic';
import { REGIONS, AREA_TREATMENTS, regionDistanceM, type Region } from './regions';
import { allBlogPosts } from './blog';
import { HOME_TITLE, KEY_SUFFIX, KEY_SUFFIX_SHORT, LAUNCH_DATE } from './site';
import { isPublished, scheduleDate, stableHash } from './publish';
import { clampText, stripTags } from './text';
import { fmtDistance } from './site';
import { generatedImageFor } from './generatedImages';

export type DocKind =
  | 'home'
  | 'page'
  | 'doctor'
  | 'treatment'
  | 'implant-topic'
  | 'symptom'
  | 'condition'
  | 'journey'
  | 'cost'
  | 'glossary'
  | 'qa'
  | 'blog'
  | 'area'
  | 'area-treatment';

export interface Doc {
  path: string;
  kind: DocKind;
  /** H1. */
  title: string;
  /** <title>. */
  seoTitle: string;
  /** meta description (≤155자). */
  description: string;
  /** 목록 카드·RSS 요약. */
  excerpt: string;
  image?: { src: string; alt: string };
  keywords: string[];
  /** 카드 라벨·RSS category. */
  category: string;
  publishAt: string;
  updated: string;
  priority: number;
  /** 개시일에 바로 공개되는 핵심 문서인가. */
  core: boolean;
  /**
   * 구글에 색인시킬 문서인가 (2026-09-11 2층 구조).
   *  · true  = 1층: 홈·소개·의료진·진료·증상·질환·칼럼·지역 허브 약 90쪽 → sitemap-google.xml 에 실리고 구글이 평가한다.
   *  · false = 2층: 지역×진료·문답·용어·비용·여정 → <meta name="googlebot" content="noindex,follow">.
   *    네이버(Yeti)·Bing 은 이 태그를 안 보므로 네이버 노출은 그대로다.
   * ★ 이유: 구글 2026 스팸 업데이트가 동네 이름만 바꾼 지역 페이지·대량 템플릿 글을 직접 겨냥한다.
   *   지역×진료는 서로 66~75% 같은 본문, 문답은 진료 페이지 안에 이미 있는 내용이라 구글에는 중복이다.
   *   구글 색인에서 빼면 사이트 전체가 얇다는 판정을 피하고, Gemini 인용은 1층이 맡는다.
   */
  googleIndex: boolean;
  /** RSS 전문(있을 때만). */
  rssHtml?: string;
}

/** 문답 글 하나 — /qa/{slug} 페이지가 읽는다. */
export interface QaItem {
  slug: string;
  path: string;
  q: string;
  a: string;
  parent: { kind: 'treatment' | 'special' | 'clinic' | 'implant-topic' | 'condition'; slug: string; name: string; href: string };
  /** 같은 부모 아래 형제 문답. */
  siblings: Array<{ q: string; path: string }>;
  category: string;
  relatedTreatments: string[];
  relatedSymptoms: string[];
}

export const GLOSSARY_SLUGS: Record<string, string> = {
  법랑질: 'enamel',
  상아질: 'dentin',
  치수: 'pulp',
  치수염: 'pulpitis',
  근관치료: 'root-canal',
  '치근단 농양': 'periapical-abscess',
  치은염: 'gingivitis',
  치주염: 'periodontitis',
  치주낭: 'periodontal-pocket',
  치석: 'calculus',
  크라운: 'crown',
  인레이: 'inlay',
  브릿지: 'bridge',
  골이식: 'bone-graft',
  '상악동 거상술': 'sinus-lift',
  골유착: 'osseointegration',
  '임플란트 주위염': 'peri-implantitis',
  매복치: 'impacted-tooth',
  드라이소켓: 'dry-socket',
  교합: 'occlusion',
  실란트: 'sealant',
  '치경부 마모': 'cervical-abrasion',
};
export const glossarySlug = (term: string) => GLOSSARY_SLUGS[term] ?? `term-${stableHash(term).toString(36)}`;

export function seoTitle(title: string, suffix: string = KEY_SUFFIX) {
  const full = `${title} | ${suffix}`;
  return full.length <= 72 ? full : `${title} | ${KEY_SUFFIX_SHORT}`;
}

/*
 * meta description · og:description 길이 = 80자 (2026-09-11 네이버 서치어드바이저 검사:
 * "사용자가 쉽게 사이트를 파악할 수 있도록 80자 이내로 설명문을 작성해주세요"). 전에는 구글 기준 155자였다.
 * clampText 가 문장 끝(. ) 에서 자른다 — 홈처럼 손으로 쓴 설명도 여기를 지나므로 80자 안에 문장이 끝나게 쓴다.
 */
export const DESC_MAX = 80;

/** 구글 1층 종류 (Doc.googleIndex 주석 참조). 2층 = area-treatment · qa · glossary · journey · cost. */
const GOOGLE_INDEX_KINDS = new Set<DocKind>(['home', 'page', 'doctor', 'treatment', 'implant-topic', 'symptom', 'condition', 'blog', 'area']);
const desc = (s: string) => clampText(stripTags(s), DESC_MAX);

export const treatmentBySlugStrict = (slug: string): Treatment => {
  const t = TREATMENTS.find((x) => x.slug === slug);
  if (!t) throw new Error(`[catalog] 진료 slug 없음: ${slug}`);
  return t;
};

export function treatmentImage(t: Treatment): { src: string; alt: string } {
  const page = TREATMENT_PAGES[t.slug];
  if (page?.hero) return { src: page.hero.src, alt: page.hero.alt };
  const key = ({ implant: 'implant', 'save-natural-tooth': 'natural', laminate: 'aesthetic', whitening: 'aesthetic', 'crown-prosthesis': 'aesthetic', 'wisdom-tooth': 'wisdom' } as Record<string, keyof typeof IMG.treatment>)[t.slug];
  const img = key ? IMG.treatment[key] : IMG.treatment.natural;
  return { src: img.src, alt: img.alt };
}

export const AREA_TREATMENT_LIST = AREA_TREATMENTS.map(treatmentBySlugStrict);

/* ────────────────────────────────────────────── 문답 글 목록 */
function buildQa(): QaItem[] {
  const items: QaItem[] = [];
  const push = (
    base: string,
    list: Array<{ q: string; a: string }>,
    parent: QaItem['parent'],
    category: string,
    relatedTreatments: string[],
    relatedSymptoms: string[],
  ) => {
    const paths = list.map((_, i) => `/qa/${base}-${i + 1}`);
    list.forEach((qa, i) => {
      items.push({
        slug: `${base}-${i + 1}`,
        path: paths[i],
        q: qa.q,
        a: qa.a,
        parent,
        siblings: list.map((s, j) => ({ q: s.q, path: paths[j] })).filter((_, j) => j !== i),
        category,
        relatedTreatments,
        relatedSymptoms,
      });
    });
  };
  for (const t of TREATMENTS) {
    push(t.slug, t.qa, { kind: 'treatment', slug: t.slug, name: t.name, href: `/treatment/${t.slug}` }, t.short, [t.slug], t.relatedSymptoms);
  }
  for (const s of SPECIALS) {
    push(s.slug, s.faq, { kind: 'special', slug: s.slug, name: s.title, href: `/about#${s.slug}` }, '병원 안내', s.key === 'implant' ? ['implant'] : [], []);
  }
  push('visit', CLINIC_QA, { kind: 'clinic', slug: 'visit', name: '내원 안내', href: '/visit' }, '내원 안내', [], []);
  for (const t of IMPLANT_TOPICS) {
    push(`implant-${t.slug}`, t.faq, { kind: 'implant-topic', slug: t.slug, name: t.name, href: `/treatment/implant/${t.slug}` }, '임플란트', ['implant'], ['missing-tooth']);
  }
  for (const c of CONDITIONS) {
    push(c.slug, c.faq, { kind: 'condition', slug: c.slug, name: c.name, href: `/condition/${c.slug}` }, c.name, c.relatedTreatments, c.relatedSymptoms);
  }
  return items;
}
export const QA_ITEMS: QaItem[] = buildQa();
export const qaBySlug = (slug: string) => QA_ITEMS.find((q) => q.slug === slug);

/* ────────────────────────────────────────────── 문서 목록 */
function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  const add = (d: Omit<Doc, 'seoTitle' | 'updated' | 'publishAt' | 'googleIndex'> & { seoTitle?: string; publishAt?: string; updated?: string; googleIndex?: boolean }) => {
    docs.push({
      seoTitle: d.seoTitle ?? seoTitle(d.title),
      updated: d.updated ?? LAUNCH_DATE,
      publishAt: d.publishAt ?? (d.core ? LAUNCH_DATE : ''),
      googleIndex: d.googleIndex ?? (GOOGLE_INDEX_KINDS.has(d.kind) && d.path !== '/privacy'),
      ...d,
    } as Doc);
  };

  add({
    path: '/',
    kind: 'home',
    title: '뽑기 전에 살릴 수 있는지 먼저 보는 화정동 치과',
    seoTitle: HOME_TITLE,
    /* 80자 안에서 지역·역·야간진료·진료 네 가지만. 전화번호·전문의 수는 본문과 구조화 데이터에 있다. */
    description: desc('화정치과 동그라미치과의원. 화정역 3호선 인근, 화·목 저녁 8시 30분까지 야간 진료. 자연치아 살리기·임플란트·사랑니 발치.'),
    excerpt: CLINIC.description,
    image: { src: IMG.doctorsTeam, alt: '동그라미치과의원 의료진 세 명' },
    keywords: ['화정치과', '화정 치과', '화정동 치과', '화정역 치과', '덕양구 치과', '고양 치과', '동그라미치과의원'],
    category: '병원',
    priority: 1,
    core: true,
  });

  add({ path: '/about', kind: 'page', title: '동그라미치과의원 소개 — 의료진·장비·진료 원칙', seoTitle: seoTitle('병원 소개 · 의료진 · 진료 원칙'), description: desc('고양 화정동 동그라미치과의원의 의료진 3인, 통증을 줄이는 방법, 디지털 진단 장비, 위생 관리, 치료 후 보증 제도를 정리했습니다.'), excerpt: '통합치의학과 전문의 세 명이 진료하는 화정동 치과. 진료를 대하는 기준과 장비, 위생, 보증 제도.', image: { src: IMG.doctorsTeam, alt: '동그라미치과의원 의료진' }, keywords: ['화정동 치과 의료진', '동그라미치과 원장', '덕양구 치과 전문의'], category: '병원', priority: 0.9, core: true });
  for (const d of DOCTORS) {
    add({ path: `/about/doctors/${d.slug}`, kind: 'doctor', title: `${d.name} ${d.role} — ${d.license}`, seoTitle: seoTitle(`${d.name} ${d.role}`), description: desc(`동그라미치과의원 ${d.name} ${d.role}. ${d.career.slice(0, 3).join(', ')}. 진료 영역: ${d.focus.join(', ')}.`), excerpt: `${d.career[0]} · ${d.license}`, image: { src: d.photo, alt: `${d.name} ${d.role}` }, keywords: [`${d.name} 원장`, `화정동 ${d.name}`, '동그라미치과 의료진'], category: '의료진', priority: 0.7, core: true });
  }
  add({ path: '/visit', kind: 'page', title: '오시는 길·진료시간·예약', seoTitle: seoTitle('오시는 길 · 진료시간 · 예약'), description: desc(`${CLINIC.address.full}. 화정역 3호선 인근, 건물 내 기계식 주차 무료. 화·목 저녁 8시 30분까지 야간 진료. 전화 ${CLINIC.phone}, 네이버 예약, 카카오톡 상담.`), excerpt: '화정역 인근 현창빌딩 3층. 진료시간·주차·예약 방법.', image: { src: IMG.interior[11].src, alt: IMG.interior[11].alt }, keywords: ['화정역 치과 위치', '동그라미치과 진료시간', '화정동 치과 야간진료'], category: '내원 안내', priority: 0.9, core: true });
  add({ path: '/faq', kind: 'page', title: '자주 묻는 질문', description: desc('진료시간, 예약, 주차, 비용, 다른 병원 엑스레이, 복용 중인 약, 임신 중 치료 등 내원 전 궁금한 것을 정리했습니다.'), excerpt: '내원 전 자주 묻는 질문 모음.', keywords: ['화정동 치과 예약', '치과 자주 묻는 질문'], category: '내원 안내', priority: 0.7, core: true });
  add({ path: '/emergency', kind: 'page', title: '치과 응급 상황 — 병원에 오기 전 지금 할 일', seoTitle: seoTitle('치과 응급 상황 대처'), description: desc('치아가 빠졌을 때, 부러졌을 때, 밤에 참기 힘들 때, 얼굴이 부었을 때, 발치 후 피가 안 멈출 때. 병원 도착 전 할 수 있는 것과 하면 안 되는 것.'), excerpt: '치아가 빠졌을 때·부러졌을 때·붓기·출혈. 응급 대처법.', keywords: ['치과 응급', '고양 치과 응급', '치아 빠졌을 때'], category: '응급', priority: 0.8, core: true });
  add({ path: '/privacy', kind: 'page', title: '개인정보처리방침', description: desc('동그라미치과의원 개인정보처리방침.'), excerpt: '개인정보처리방침.', keywords: [], category: '병원', priority: 0.2, core: true });

  add({ path: '/treatment', kind: 'page', title: '진료 안내 — 자연치아 살리기부터 임플란트까지', seoTitle: seoTitle('진료 안내'), description: desc('화정동 동그라미치과의원의 진료 과목. 자연치아 살리기, 임플란트, 신경치료, 잇몸치료, 충치치료, 사랑니 발치, 라미네이트, 크라운, 스케일링, 치아미백.'), excerpt: '진료 과목 열 가지와 각 진료에서 먼저 확인하는 것.', keywords: ['화정동 치과 진료', '고양 치과 진료 과목'], category: '진료', priority: 0.9, core: true });
  for (const t of TREATMENTS) {
    add({ path: `/treatment/${t.slug}`, kind: 'treatment', title: `화정동 ${t.name}`, seoTitle: seoTitle(`화정동 ${t.name}`), description: desc(t.summary), excerpt: t.summary, image: treatmentImage(t), keywords: [`화정 ${t.short}`, `화정동 ${t.short}`, `화정역 ${t.short}`, `고양 ${t.short}`, `덕양구 ${t.short}`, t.name], category: t.short, priority: 0.9, core: true });
  }
  for (const it of IMPLANT_TOPICS) {
    add({ path: `/treatment/implant/${it.slug}`, kind: 'implant-topic', title: `임플란트 ${it.name} — ${it.tagline}`, seoTitle: seoTitle(`임플란트 ${it.name}`), description: desc(it.answer), excerpt: it.answer, image: treatmentImage(treatmentBySlugStrict('implant')), keywords: [`화정동 임플란트 ${it.name}`, `고양 ${it.name}`, it.name], category: '임플란트', priority: 0.8, core: true });
  }

  add({ path: '/symptom', kind: 'page', title: '증상으로 찾기 — 지금 느끼는 불편으로 원인 짚어보기', seoTitle: seoTitle('증상으로 찾기'), description: desc('밤에 욱신거림, 찬물에 시림, 잇몸 출혈, 치아 흔들림, 입냄새, 턱 소리 등 26가지 증상별 원인과 지금 할 수 있는 것.'), excerpt: '26가지 증상별 원인·자가 대처·바로 진료가 필요한 신호.', keywords: ['치아 증상', '이가 시려요', '잇몸 피'], category: '증상', priority: 0.9, core: true });
  for (const s of SYMPTOMS) {
    const group = SYMPTOM_GROUPS.find((g) => g.symptoms.includes(s.slug));
    add({ path: `/symptom/${s.slug}`, kind: 'symptom', title: s.title, seoTitle: seoTitle(s.title), description: desc(s.answer), excerpt: s.answer, image: s.image, keywords: [s.short, `${s.short} 원인`, `화정동 치과 ${s.short}`], category: group?.short ?? '증상', priority: 0.8, core: true });
  }

  add({ path: '/condition', kind: 'page', title: '치과 질환 안내 — 병명으로 이해하기', seoTitle: seoTitle('치과 질환 안내'), description: desc('충치, 치수염, 치은염, 치주염, 사랑니 염증, 드라이소켓, 치아균열, 시린이, 턱관절장애, 이갈이, 임플란트주위염, 매복치, 구강건조, 구취, 무치악. 15가지 질환의 정의·단계·치료.'), excerpt: '15가지 치과 질환의 정의, 진행 단계, 표준 치료.', keywords: ['치과 질환', '치주염', '치수염'], category: '질환', priority: 0.8, core: true });
  for (const c of CONDITIONS) {
    add({ path: `/condition/${c.slug}`, kind: 'condition', title: `${c.name}(${c.aka[0]}) — 증상·원인·치료`, seoTitle: seoTitle(`${c.name} ${c.aka[0]}`), description: desc(c.definition + ' ' + c.detail), excerpt: c.definition, keywords: [c.name, ...c.aka, `${c.name} 치료`, `화정동 치과 ${c.aka[0]}`], category: '질환', priority: 0.8, core: true });
  }

  add({ path: '/journey', kind: 'page', title: '치료 여정 — 몇 번 가고 얼마나 걸리나', seoTitle: seoTitle('치료 기간과 내원 횟수'), description: desc('임플란트, 신경치료, 잇몸치료, 사랑니, 충치, 크라운, 심미치료, 자연치아 살리기. 치료별 내원 횟수와 기간, 회차마다 하는 일.'), excerpt: '치료별 내원 횟수·기간·회차별 내용.', keywords: ['임플란트 기간', '신경치료 몇 번', '치료 기간'], category: '치료 여정', priority: 0.7, core: true });
  for (const j of JOURNEYS) {
    add({ path: `/journey/${j.slug}`, kind: 'journey', title: j.question, seoTitle: seoTitle(j.question), description: desc(j.answer), excerpt: j.answer, keywords: [`${j.treatment} 기간`, `${j.treatment} 내원 횟수`, `화정동 ${j.treatment}`], category: j.treatment, priority: 0.7, core: false });
  }

  add({ path: '/cost', kind: 'page', title: '치과 비용 기준 — 건강보험이 되는 것과 안 되는 것', seoTitle: seoTitle('치과 비용 · 건강보험 기준'), description: desc('만 65세 이상 임플란트 보험, 스케일링 보험, 신경치료·잇몸치료·사랑니 발치·충치 치료의 급여와 비급여 기준. 비용이 사람마다 다른 이유.'), excerpt: '급여·비급여의 경계와 비용을 가르는 요인.', keywords: ['치과 비용', '임플란트 보험', '스케일링 보험'], category: '비용', priority: 0.8, core: true });
  for (const c of COST_TOPICS) {
    add({ path: `/cost/${c.slug}`, kind: 'cost', title: c.title, seoTitle: seoTitle(c.title), description: desc(c.answer), excerpt: c.answer, keywords: [c.title.replace(/[?？]/g, ''), COST_LABEL[c.covered], '화정동 치과 비용'], category: '비용', priority: 0.7, core: false });
  }

  add({ path: '/glossary', kind: 'page', title: '치과 용어 사전 — 진료실에서 듣는 말 풀이', seoTitle: seoTitle('치과 용어 사전'), description: desc('법랑질, 상아질, 치수, 근관치료, 치주낭, 골이식, 상악동 거상술, 골유착, 드라이소켓, 교합 등 진료실에서 듣게 되는 용어 22가지.'), excerpt: '진료실에서 듣게 되는 치과 용어 22가지.', keywords: ['치과 용어', '근관치료 뜻', '골유착'], category: '용어', priority: 0.6, core: true });
  for (const g of GLOSSARY) {
    const slug = glossarySlug(g.term);
    add({ path: `/glossary/${slug}`, kind: 'glossary', title: `${g.term}${g.reading ? `(${g.reading})` : ''} 뜻`, seoTitle: seoTitle(`${g.term} 뜻`), description: desc(g.def), excerpt: g.def, keywords: [g.term, `${g.term} 뜻`, `${g.term}이란`], category: '용어', priority: 0.5, core: false });
  }

  add({ path: '/qa', kind: 'page', title: '진료실 문답 — 환자분들이 실제로 묻는 질문', seoTitle: seoTitle('진료실 문답'), description: desc(`자연치아 살리기, 임플란트, 신경치료, 사랑니, 잇몸, 충치, 비용, 마취, 예약. 진료실에서 실제로 받는 질문 ${QA_ITEMS.length}가지에 답합니다.`), excerpt: `진료실에서 실제로 받는 질문 ${QA_ITEMS.length}가지.`, keywords: ['치과 질문', '치과 궁금한 점'], category: '문답', priority: 0.8, core: true });
  for (const q of QA_ITEMS) {
    add({ path: q.path, kind: 'qa', title: q.q, seoTitle: seoTitle(q.q), description: desc(q.a), excerpt: q.a, keywords: [q.category, q.parent.name, `화정동 치과 ${q.category}`], category: q.category, priority: 0.7, core: false });
  }

  add({ path: '/blog', kind: 'page', title: '동그라미치과 칼럼', seoTitle: seoTitle('치과 칼럼'), description: desc('스케일링 오해, 지르코니아와 금 크라운, 임플란트·브릿지·틀니 비교, 신경치료한 치아, 뽑을지 살릴지, 사랑니 발치 시기 등 원장이 쓰는 칼럼.'), excerpt: '원장이 쓰는 치과 칼럼.', keywords: ['치과 칼럼', '화정동 치과 블로그'], category: '칼럼', priority: 0.7, core: true });
  for (const p of allBlogPosts()) {
    add({ path: `/blog/${p.slug}`, kind: 'blog', title: p.title, seoTitle: seoTitle(p.title), description: desc(p.summary), excerpt: p.summary, image: p.image ? { src: p.image, alt: p.imageAlt ?? p.title } : undefined, keywords: [p.category ?? '칼럼', `화정동 치과 ${p.category ?? ''}`.trim()], category: p.category ?? '칼럼', priority: 0.7, core: false, publishAt: p.date, updated: p.updated ?? p.date, rssHtml: p.html });
  }

  add({ path: '/area', kind: 'page', title: '지역별 안내 — 고양·덕양구·은평에서 오시는 길', seoTitle: seoTitle('지역별 오시는 길'), description: desc('화정동, 화정역, 행신동, 능곡, 원당, 주교동, 원흥, 삼송, 지축, 화전, 향동, 덕은, 구파발에서 동그라미치과의원까지. 3호선 정거장 수와 직선거리.'), excerpt: '동네별 오시는 길과 거리.', keywords: ['덕양구 치과', '고양 치과', '행신동 치과'], category: '지역', priority: 0.8, core: true });
  for (const r of REGIONS) {
    add({ path: `/area/${r.slug}`, kind: 'area', title: `${r.slug === 'hwajeong' ? '화정치과 · ' : ''}${r.keyword} — 동그라미치과의원 오시는 길과 진료 안내`, seoTitle: `${r.slug === 'hwajeong' ? '화정치과 · ' : ''}${r.keyword} | 동그라미치과의원 · 화정역 3호선 야간진료`, description: desc(`${r.alt ?? r.keyword}를 찾으신다면 — ${r.intro}`), excerpt: r.intro, image: { src: IMG.interior[REGIONS.indexOf(r) % IMG.interior.length].src, alt: IMG.interior[REGIONS.indexOf(r) % IMG.interior.length].alt }, keywords: [r.keyword, ...(r.alt ? [r.alt] : []), ...(r.slug === 'hwajeong' ? ['화정치과'] : []), `${r.name} 임플란트`, `${r.name} 신경치료`, `${r.name} 야간진료 치과`], category: '지역', priority: 0.8, core: true });
    if (r.tier === 'far') continue;
    for (const t of AREA_TREATMENT_LIST) {
      add({ path: `/area/${r.slug}/${t.slug}`, kind: 'area-treatment', title: `${r.name} ${t.name}`, seoTitle: `${r.name} ${t.short} | 동그라미치과의원 · 화정역 3호선`, description: desc(`${r.name}에서 ${t.name}을 알아보신다면. 동그라미치과의원까지 ${fmtDistanceLabel(r)}. ${t.summary}`), excerpt: `${r.name}에서 ${t.name}을 알아보시는 분께 — ${t.summary}`, image: treatmentImage(t), keywords: [`${r.name} ${t.short}`, ...(r.slug === 'hwajeong' ? [`화정 ${t.short}`, '화정치과'] : []), `${r.name} 치과`, t.name], category: t.short, priority: 0.6, core: false });
    }
  }

  /* 사진 없는 문서에 생성 이미지(content/images.json)를 붙인다. */
  for (const d of docs) {
    if (!d.image) {
      const g = generatedImageFor(d.path);
      if (g) d.image = g;
    }
  }

  /* 예약 발행일 배정 — 경로 해시 순서라 글을 추가해도 기존 글 날짜가 안 바뀐다. */
  const scheduled = docs.filter((d) => !d.publishAt).sort((a, b) => stableHash(a.path) - stableHash(b.path));
  scheduled.forEach((d, i) => {
    d.publishAt = scheduleDate(i);
    if (d.updated < d.publishAt) d.updated = d.publishAt;
  });
  return docs;
}

function fmtDistanceLabel(r: Region) {
  const m = regionDistanceM(r);
  return m === null ? '3호선 화정역 인근' : `직선거리 ${fmtDistance(m)}`;
}

export const DOCS: Doc[] = buildDocs();

const byPath = new Map(DOCS.map((d) => [d.path, d]));
export const docByPath = (path: string) => byPath.get(path);
export const docByPathStrict = (path: string): Doc => {
  const d = byPath.get(path);
  if (!d) throw new Error(`[catalog] 문서 없음: ${path}`);
  return d;
};

export const publishedDocs = () => DOCS.filter((d) => isPublished(d.publishAt));
/** 구글 사이트맵(sitemap-google.xml)용 — 발행됐고 1층인 문서만. */
export const googleDocs = () => publishedDocs().filter((d) => d.googleIndex);
export const isDocPublished = (d: Doc) => isPublished(d.publishAt);

/**
 * 이 주소로 링크를 걸어도 되는가 — 카탈로그 문서면 발행됐을 때만, 카탈로그 밖(정적 페이지·앵커·외부·전화)은 늘 true.
 * ★ 빙 사이트 검사(2026-09-11) 가 4xx 73건을 잡았다 — 전부 "아직 발행일이 안 된 문서"로 가는 내부 링크였다
 *   (문답·지역×진료·여정·비용·용어). 페이지는 requireDoc 이 404 를 내는데 링크는 발행 여부를 안 봤다.
 *   링크를 그리는 공용 부품(LinkList·Chips·Faq)과 홈 카드가 이 함수로 거른다. 발행일이 지나면 ISR 재생성 때 저절로 나타난다.
 */
export function isLivePath(href: string): boolean {
  if (!href.startsWith('/')) return true;
  const path = href.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
  const d = byPath.get(path);
  return !d || isDocPublished(d);
}
export const docsOfKind = (...kinds: DocKind[]) => publishedDocs().filter((d) => kinds.includes(d.kind));

/** 최신 글 — 발행일 내림차순, 같은 날이면 경로 해시. 홈·RSS 가 쓴다. */
export function latestDocs(n: number, kinds?: DocKind[]) {
  return publishedDocs()
    .filter((d) => d.kind !== 'home' && d.kind !== 'page' && (!kinds || kinds.includes(d.kind)))
    .sort((a, b) => (a.publishAt === b.publishAt ? stableHash(a.path) - stableHash(b.path) : a.publishAt < b.publishAt ? 1 : -1))
    .slice(0, n);
}

/** 관련 글 — 같은 분류 우선, 종류는 섞어서. */
export function relatedDocs(doc: Doc, n = 6) {
  const pool = publishedDocs().filter((d) => d.path !== doc.path && d.kind !== 'home' && d.kind !== 'page' && d.kind !== 'area' && d.kind !== 'area-treatment');
  const same = pool.filter((d) => d.category === doc.category);
  const others = pool.filter((d) => d.category !== doc.category && doc.keywords.some((k) => d.keywords.includes(k)));
  const seen = new Set<string>();
  return [...same, ...others].filter((d) => (seen.has(d.path) ? false : (seen.add(d.path), true))).slice(0, n);
}

export const TOTAL_DOCS = DOCS.length;
