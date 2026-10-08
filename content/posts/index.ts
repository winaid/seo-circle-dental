/**
 * 블로그 글 묶음 — 묶음마다 JSON 한 파일(content/posts/batch-*.json). 새 묶음을 더하면 여기 한 줄 추가.
 * 형식: [{ n, title, kw, summary, sections: [{ h2, paras[] }] }]  — lib/posts.ts 가 주소·공개일·사진을 붙인다.
 */
import A from './batch-A.json';
import B from './batch-B.json';
import C from './batch-C.json';
import D from './batch-D.json';

type Raw = { title: string; kw: string; summary: string; sections: Array<{ h2: string; paras: string[] }> };
export const POST_BATCHES: Record<string, Raw[]> = { A, B, C, D };
