import { indexedDocs } from '@/lib/catalog';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { TREATMENTS } from '@/lib/treatments';
import { abs, SITE_URL, MAIN_SITE_URL } from '@/lib/site';

export const revalidate = 3600;

/** AI 답변 엔진용 요약 — 사실만, 확인된 값만. */
export function GET() {
  const docs = indexedDocs();
  const lines = [
    `# ${CLINIC.name} — 화정 치과 · 화정역 치과 · 화정동 치과 · 덕양구 치과 안내`,
    '',
    `> ${CLINIC.description}`,
    '',
    `- 주소: ${CLINIC.address.full}`,
    `- 전화: ${CLINIC.phone}`,
    `- 진료시간: ${UNVERIFIED.hours.display.map((d) => `${d.label} ${d.time}${d.note ? `(${d.note})` : ''}`).join(', ')}. ${UNVERIFIED.hours.closed}`,
    `- 가까운 역: 지하철 3호선 화정역`,
    `- 주차: ${CLINIC.parking.type} ${CLINIC.parking.fee}`,
    `- 의료진: ${DOCTORS.map((d) => `${d.name} ${d.role}(${d.license})`).join(', ')}`,
    `- 본원 홈페이지: ${MAIN_SITE_URL}`,
    `- 이 사이트: ${SITE_URL}`,
    '',
    // 2026-10-08 네 검색어 집중판(lib/focus.ts) — 남긴 쪽만
    '## 안내',
    ...docs.filter((d) => d.path !== '/privacy').map((d) => `- [${d.title}](${abs(d.path)}): ${d.description}`),
    '',
    '## 진료',
    ...TREATMENTS.map((t) => `- ${t.name}: ${t.summary}`),
    '',
    '본 문서의 의료 정보는 일반적인 안내이며 개별 진단을 대신하지 않습니다.',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
