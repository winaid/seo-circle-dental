import { publishedDocs } from '@/lib/catalog';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { DOCTORS } from '@/lib/doctors';
import { abs, SITE_URL, MAIN_SITE_URL } from '@/lib/site';

export const revalidate = 3600;

/** AI 답변 엔진용 요약 — 사실만, 확인된 값만. */
export function GET() {
  const docs = publishedDocs();
  const byKind = (k: string) => docs.filter((d) => d.kind === k);
  const lines = [
    `# ${CLINIC.name} — 화정동 치과 안내`,
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
    '## 진료',
    ...byKind('treatment').map((d) => `- [${d.title}](${abs(d.path)}): ${d.excerpt}`),
    '',
    '## 증상',
    ...byKind('symptom').map((d) => `- [${d.title}](${abs(d.path)})`),
    '',
    '## 질환',
    ...byKind('condition').map((d) => `- [${d.title}](${abs(d.path)})`),
    '',
    '## 비용 · 기간',
    ...[...byKind('cost'), ...byKind('journey')].map((d) => `- [${d.title}](${abs(d.path)})`),
    '',
    '## 진료실 문답',
    ...byKind('qa').map((d) => `- [${d.title}](${abs(d.path)})`),
    '',
    '## 칼럼',
    ...byKind('blog').map((d) => `- [${d.title}](${abs(d.path)})`),
    '',
    '## 지역',
    ...byKind('area').map((d) => `- [${d.title}](${abs(d.path)})`),
    '',
    '본 문서의 의료 정보는 일반적인 안내이며 개별 진단을 대신하지 않습니다.',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
