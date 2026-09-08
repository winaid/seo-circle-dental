import { notFound } from 'next/navigation';
import { DOCS, docByPath, isDocPublished, type Doc, type DocKind } from './catalog';

/** 문서를 찾고, 아직 발행일이 안 됐으면 404. ISR 이라 날짜가 지나면 저절로 살아난다. */
export function requireDoc(path: string): Doc {
  const d = docByPath(path);
  if (!d || !isDocPublished(d)) notFound();
  return d;
}

/** 같은 종류 안에서 이전·다음 — 발행된 것만. */
export function neighbors(doc: Doc, kind: DocKind = doc.kind): { prev?: Doc; next?: Doc } {
  const list = DOCS.filter((d) => d.kind === kind && isDocPublished(d));
  const i = list.findIndex((d) => d.path === doc.path);
  return { prev: i > 0 ? list[i - 1] : undefined, next: i >= 0 && i < list.length - 1 ? list[i + 1] : undefined };
}

/** 발행된 문서의 slug 목록 — generateStaticParams 용. */
export function publishedSlugs(kind: DocKind, prefix: string): string[] {
  return DOCS.filter((d) => d.kind === kind && isDocPublished(d) && d.path.startsWith(prefix)).map((d) => d.path.slice(prefix.length));
}

/** 한국어 조사 — 받침 유무. 괄호 등 뒤에 붙은 기호는 건너뛴다. */
export function josa(word: string, pair: '을/를' | '이/가' | '은/는' | '과/와' | '으로/로'): string {
  const chars = [...word].reverse();
  const last = chars.find((c) => /[가-힣]/.test(c));
  const code = last ? last.charCodeAt(0) - 0xac00 : -1;
  const jong = code >= 0 ? code % 28 : 0;
  const [a, b] = pair.split('/');
  if (pair === '으로/로') return jong === 0 || jong === 8 ? b : a;
  return jong ? a : b;
}
