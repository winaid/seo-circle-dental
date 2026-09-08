/**
 * 생성 이미지 목록 — scripts/gen-images.mjs 가 content/images.json 에 쓴다.
 *   { "/qa/implant-1": { "src": "/img/gen/qa-implant-1.webp", "alt": "…", "scene": "…" } }
 * 카탈로그가 사진 없는 문서에 이 값을 붙인다. 파일이 없으면 그냥 사진 없는 카드로 남는다.
 */
import manifest from '../content/images.json';

export interface GeneratedImage {
  src: string;
  alt: string;
  scene?: string;
}

const MAP = manifest as Record<string, GeneratedImage>;

export function generatedImageFor(path: string): { src: string; alt: string } | undefined {
  const g = MAP[path];
  return g ? { src: g.src, alt: g.alt } : undefined;
}
