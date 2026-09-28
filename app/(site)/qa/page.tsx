import type { Metadata } from 'next';
import { CtaBlock, HubHead, JsonLd, LinkList } from '@/components/ui';
import { QA_ITEMS, docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, cardListNode } from '@/lib/schema';
import { hubCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';

export const revalidate = 3600;
const doc = docByPathStrict('/qa');
export const metadata: Metadata = metaFor(doc);

export default function QaHub() {
  const published = new Set(docsOfKind('qa').map((d) => d.path));
  const items = QA_ITEMS.filter((q) => published.has(q.path));
  const groups = new Map<string, typeof items>();
  for (const q of items) {
    const key = q.parent.name;
    groups.set(key, [...(groups.get(key) ?? []), q]);
  }
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '진료실 문답', path: '/qa' },
  ];
  // 사진 카드 6장 = 화면 카드 = ItemList(사진 포함). 예전 목록은 사진이 0장이라 카드 재료가 못 됐다 (2026-09-28 네이버 캐러셀)
  const cards = hubCards(docsOfKind('qa'));
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="진료실 문답" title={doc.title} lead={`${items.length}가지 질문에 답합니다. 답은 첫 두세 문장에서 끝내고, 배경 설명을 뒤에 이었습니다. 진료 안내·증상·질환 페이지와 서로 이어져 있습니다.`} />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <div style={{ display: 'grid', gap: 48, maxWidth: 820 }}>
          {[...groups.entries()].map(([name, list]) => (
            <section key={name} id={list[0].parent.slug}>
              <h2 style={{ fontSize: 22, marginBottom: 14 }}>
                {name} <span className="muted" style={{ fontWeight: 500, fontSize: 15 }}>{list.length}</span>
              </h2>
              <LinkList mark="Q" items={list.map((q) => ({ label: q.q, href: q.path }))} />
            </section>
          ))}
        </div>
        <CardRow title="많이 찾으시는 질문" cards={cards} />
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/qa', crumbs), ...cardListNode('진료실 문답', cards)]} />
    </>
  );
}
