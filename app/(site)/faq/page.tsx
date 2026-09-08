import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, Faq, HubHead, JsonLd, LinkList, MedicalNotice } from '@/components/ui';
import { docByPathStrict, QA_ITEMS, docsOfKind } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, faqNode, webPageNode } from '@/lib/schema';
import { CLINIC_QA } from '@/lib/faq';

export const revalidate = 3600;
const doc = docByPathStrict('/faq');
export const metadata: Metadata = metaFor(doc);

export default function FaqPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '자주 묻는 질문', path: '/faq' },
  ];
  const published = new Set(docsOfKind('qa').map((d) => d.path));
  const popular = QA_ITEMS.filter((q) => q.parent.kind === 'treatment' && published.has(q.path)).slice(0, 10);
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="자주 묻는 질문" title={doc.title} lead="진료시간·예약·주차·비용처럼 오시기 전에 궁금한 것입니다. 확인된 사실과 일반적인 치과 진료 정보만 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88, display: 'grid', gap: 48, maxWidth: 'calc(820px + 40px)' }}>
        <Faq items={CLINIC_QA.map((q, i) => ({ q: q.q, a: q.a, href: `/qa/visit-${i + 1}` }))} />
        {popular.length > 0 && (
          <section>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>진료에 대한 질문</h2>
            <LinkList mark="Q" items={popular.map((q) => ({ label: q.q, href: q.path, meta: q.category }))} />
            <p className="small muted" style={{ marginTop: 12 }}>
              <Link href="/qa">진료실 문답 전체 보기</Link>
            </p>
          </section>
        )}
        <CtaBlock />
        <MedicalNotice />
      </div>
      <JsonLd nodes={[webPageNode(doc), faqNode(CLINIC_QA), breadcrumbNode('/faq', crumbs)]} />
    </>
  );
}
