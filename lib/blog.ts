import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 블로그 글 — content/blog/{date}-{slug}.json 한 파일이 글 하나.
 * 본원 사이트와 같은 형식이라 그쪽에서 쓴 글을 그대로 옮겨 올 수 있다.
 *
 * ⚠️ 본문 HTML 은 저장소에 커밋한 것만 들어온다. 외부 입력을 이 폴더에 쓰지 말 것.
 */
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  summary: string;
  category?: string;
  image?: string;
  imageAlt?: string;
  html: string;
}

const DIR = join(process.cwd(), 'content', 'blog');

function sanitizeBody(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript:/gi, '');
}

/** 본원 주소 체계로 적힌 링크를 이 사이트 구조로 바꾼다. */
const LINK_MAP: Array<[RegExp, string]> = [
  [/href="\/insight\/symptom\/[a-z-]+#([a-z-]+)"/g, 'href="/symptom/$1"'],
  [/href="\/insight\/symptom\//g, 'href="/symptom/'],
  [/href="\/insight\/condition/g, 'href="/condition'],
  [/href="\/insight\/journey/g, 'href="/journey'],
  [/href="\/insight\/cost/g, 'href="/cost'],
  [/href="\/insight\/glossary/g, 'href="/glossary'],
  [/href="\/insight\/emergency/g, 'href="/emergency'],
  [/href="\/insight\/blog/g, 'href="/blog'],
  [/href="\/about\/special\/[a-z-]+"/g, 'href="/about"'],
  [/href="\/about\/doctors"/g, 'href="/about"'],
];

let cache: BlogPost[] | null = null;

export function allBlogPosts(): BlogPost[] {
  if (cache) return cache;
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
  } catch {
    files = [];
  }
  const posts = files.map((f) => {
    const raw = JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Omit<BlogPost, 'slug'>;
    const slug = f.replace(/\.json$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
    /* 작은따옴표 속성을 큰따옴표로 맞춘 뒤 변환한다 — 글 파일이 href='…' 로 적혀 있어 LINK_MAP 이 하나도 안 맞았다 (2026-09-11 빙 검사: /insight/cost 4xx). */
    let html = sanitizeBody(raw.html).replace(/href='([^']*)'/g, 'href="$1"');
    for (const [re, to] of LINK_MAP) html = html.replace(re, to);
    return { ...raw, slug, html };
  });
  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  cache = posts;
  return posts;
}

export const blogBySlug = (slug: string) => allBlogPosts().find((p) => p.slug === slug);
