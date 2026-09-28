import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, cardListNode } from '@/lib/schema';
import { hubCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';

export const revalidate = 3600;
const doc = docByPathStrict('/blog');
export const metadata: Metadata = metaFor(doc);

export default function BlogHub() {
  const posts = docsOfKind('blog');
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '칼럼', path: '/blog' },
  ];
  // 사진 카드 6장 = 화면 카드 = ItemList(사진 포함). 예전 목록은 사진이 0장이라 카드 재료가 못 됐다 (2026-09-28 네이버 캐러셀)
  const cards = hubCards(docsOfKind('blog'));
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="칼럼" title={doc.title} lead="진료실에서 자주 듣는 오해, 재료 비교, 시기 판단처럼 한 번에 답하기 어려운 주제를 글로 풀었습니다. 새 글은 RSS로도 받아보실 수 있습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        {posts.length ? <DocGrid docs={posts} cols={3} /> : <p className="muted">첫 글을 준비하고 있습니다.</p>}
        <CardRow title="최근 칼럼" cards={cards} />
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/blog', crumbs), ...cardListNode('동그라미치과 칼럼', cards)]} />
    </>
  );
}
