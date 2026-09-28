import type { Metadata } from 'next';
import { CtaBlock, DocGrid, HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, cardListNode } from '@/lib/schema';
import { hubCards } from '@/lib/carousel';
import { CardRow } from '@/components/CardRow';
import { CONDITIONS } from '@/lib/conditions';

export const revalidate = 3600;
const doc = docByPathStrict('/condition');
export const metadata: Metadata = metaFor(doc);

export default function ConditionHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '질환 안내', path: '/condition' },
  ];
  // 사진 카드 6장 = 화면 카드 = ItemList(사진 포함). 예전 목록은 사진이 0장이라 카드 재료가 못 됐다 (2026-09-28 네이버 캐러셀)
  const cards = hubCards(docsOfKind('condition'));
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="질환 안내" title={doc.title} lead="진료실에서 들은 병명을 한 문장 정의부터 진행 단계, 표준 치료, 예방까지 정리했습니다. 특정 병원의 방침이 아니라 일반적인 치료 원칙입니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <DocGrid docs={docsOfKind('condition')} cols={3} />
        <CardRow title="많이 찾으시는 질환" cards={cards} />
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/condition', crumbs), ...cardListNode('치과 질환 안내', cards)]} />
    </>
  );
}
