import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind, glossarySlug } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, cardListNode } from '@/lib/schema';
import { hubCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';
import { GLOSSARY } from '@/lib/insight';
import { abs } from '@/lib/site';

export const revalidate = 3600;
const doc = docByPathStrict('/glossary');
export const metadata: Metadata = metaFor(doc);

export default function GlossaryHub() {
  const published = new Set(docsOfKind('glossary').map((d) => d.path));
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '용어 사전', path: '/glossary' },
  ];
  // 사진 카드 6장 = 화면 카드 = ItemList(사진 포함). 예전 목록은 사진이 0장이라 카드 재료가 못 됐다 (2026-09-28 네이버 캐러셀)
  const cards = hubCards(docsOfKind('glossary'));
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="용어 사전" title={doc.title} lead="진료실에서 듣게 되는 말을 한두 문장으로 풀었습니다. 어느 진료에서 나오는 말인지도 함께 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <dl style={{ display: 'grid', gap: 0, maxWidth: 820, borderTop: '1px solid var(--line)' }}>
          {GLOSSARY.map((g) => {
            const href = `/glossary/${glossarySlug(g.term)}`;
            return (
              <div key={g.term} style={{ padding: '18px 0', borderBottom: '1px solid var(--line)' }}>
                <dt style={{ fontWeight: 700, fontSize: 18, color: 'var(--ink)' }}>
                  {published.has(href) ? <Link href={href}>{g.term}</Link> : g.term}
                  {g.reading && <span className="muted" style={{ fontWeight: 500, fontSize: 14, marginLeft: 8 }}>{g.reading}</span>}
                </dt>
                <dd style={{ margin: '6px 0 0', fontSize: 15.5, color: 'var(--ink-2)' }}>{g.def}</dd>
              </div>
            );
          })}
        </dl>
        <CardRow title="많이 찾으시는 용어" cards={cards} />
        <CtaBlock />
      </div>
      <JsonLd
        nodes={[
          webPageNode(doc, { medical: true }),
          breadcrumbNode('/glossary', crumbs),
          {
            '@context': 'https://schema.org',
            '@type': 'DefinedTermSet',
            '@id': abs('/glossary'),
            name: '치과 용어 사전',
            hasDefinedTerm: GLOSSARY.map((g) => ({ '@type': 'DefinedTerm', name: g.term, description: g.def, url: abs(`/glossary/${glossarySlug(g.term)}`) })),
          }, ...cardListNode('치과 용어 사전', cards)
        ]}
      />
    </>
  );
}
