import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';

export const revalidate = 3600;
const doc = docByPathStrict('/blog');
export const metadata: Metadata = metaFor(doc);

export default function BlogHub() {
  const posts = docsOfKind('blog');
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '칼럼', path: '/blog' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="칼럼" title={doc.title} lead="진료실에서 자주 듣는 오해, 재료 비교, 시기 판단처럼 한 번에 답하기 어려운 주제를 글로 풀었습니다. 새 글은 RSS로도 받아보실 수 있습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        {posts.length ? <DocGrid docs={posts} cols={3} /> : <p className="muted">첫 글을 준비하고 있습니다.</p>}
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/blog', crumbs), itemListNode('칼럼', posts.map((p) => ({ name: p.title, path: p.path })))]} />
    </>
  );
}
