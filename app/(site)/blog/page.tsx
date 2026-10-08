import type { Metadata } from 'next';
import Link from 'next/link';
import { HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode } from '@/lib/schema';
import { publishedPosts } from '@/lib/posts';
import { fmtDate } from '@/lib/text';

export const revalidate = 3600;
const doc = docByPathStrict('/blog');
export const metadata: Metadata = metaFor(doc);

/* 화정치과 이야기 목록 — 공개된 글 전부, 새 글부터 (lib/posts.ts) */
export default function BlogHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '화정치과 이야기', path: '/blog' },
  ];
  const posts = publishedPosts();
  return (
    <>
      <HubHead
        crumbs={crumbs}
        eyebrow="화정치과 이야기"
        title={doc.title}
        lead="진료 전에 알아 두면 좋은 것을 글로 정리했습니다. 증상이 있을 때 확인할 것, 진료가 어떻게 진행되는지, 집에서 하는 관리, 오시는 길까지 담았습니다."
      />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <ol className="post-list">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={p.path}>
                <span className="post-list-kw">{p.kw}</span>
                <b>{p.title}</b>
                <span className="post-list-sum">{p.summary}</span>
                <small>{fmtDate(p.publishAt)}</small>
              </Link>
            </li>
          ))}
        </ol>
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/blog', crumbs)]} />
    </>
  );
}
