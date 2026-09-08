export function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

/** 글자 수 제한 — 문장 경계에서 자르고, 못 자르면 말줄임. */
export function clampText(s: string, max = 155): string {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const end = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('다. '), cut.lastIndexOf('요. '));
  if (end > max * 0.5) return cut.slice(0, end + 1).trim();
  return `${cut.trim()}…`;
}

export function charCount(...parts: string[]) {
  return parts.join('').replace(/\s/g, '').length;
}

export function headingId(text: string) {
  return text.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase();
}

export function fmtDate(iso: string) {
  const [y, m, d] = iso.split('-');
  return `${y}.${m}.${d}`;
}

/** RSS 2.0 pubDate — RFC 822, 시간대 포함(네이버가 시간대 없는 값을 거부한 사례가 있다). */
export function rfc822(iso: string) {
  return new Date(`${iso}T09:00:00+09:00`).toUTCString();
}

export function escapeXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 문장 단위로 나눈다 — 소수점(0.3mm)·약어에서는 안 자른다. */
export function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=\S)/)
    .map((s) => s.trim())
    .filter(Boolean);
}
