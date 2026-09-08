import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { CONDITIONS } from '@/lib/conditions';

export const revalidate = 3600;
const doc = docByPathStrict('/condition');
export const metadata: Metadata = metaFor(doc);

export default function ConditionHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '질환 안내', path: '/condition' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="질환 안내" title={doc.title} lead="진료실에서 들은 병명을 한 문장 정의부터 진행 단계, 표준 치료, 예방까지 정리했습니다. 특정 병원의 방침이 아니라 일반적인 치료 원칙입니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <DocGrid docs={docsOfKind('condition')} cols={3} />
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/condition', crumbs), itemListNode('치과 질환', CONDITIONS.map((c) => ({ name: c.name, path: `/condition/${c.slug}` })))]} />
    </>
  );
}
