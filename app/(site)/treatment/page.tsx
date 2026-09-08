import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBlock, HubHead, JsonLd, LinkList } from '@/components/ui';
import { docByPathStrict, treatmentImage } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { TREATMENTS } from '@/lib/treatments';
import { IMPLANT_TOPICS } from '@/lib/implantTopics';
import { JOURNEYS, COST_TOPICS } from '@/lib/insight';

export const revalidate = 3600;
const doc = docByPathStrict('/treatment');
export const metadata: Metadata = metaFor(doc);

export default function TreatmentHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '진료 안내', path: '/treatment' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="진료 안내" title={doc.title} lead="진료 이름만 나열하지 않았습니다. 각 진료에서 검사로 먼저 확인하는 것, 살릴 수 있는 조건과 없는 조건, 자주 받는 질문까지 페이지마다 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88, display: 'grid', gap: 56 }}>
        <div className="grid grid--3">
          {TREATMENTS.map((t) => {
            const img = treatmentImage(t);
            return (
              <Link key={t.slug} href={`/treatment/${t.slug}`} className="t-card">
                <img src={img.src} alt={img.alt} loading="lazy" decoding="async" />
                <div className="t-card-in">
                  <span className="card-tag">{t.whoFor[0]}</span>
                  <h3>{t.name}</h3>
                  <p>{t.summary}</p>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="two">
          <section>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>임플란트 세부 안내</h2>
            <LinkList items={IMPLANT_TOPICS.map((t) => ({ label: t.name, href: `/treatment/implant/${t.slug}`, meta: t.tagline }))} />
          </section>
          <section>
            <h2 style={{ fontSize: 22, marginBottom: 14 }}>기간과 비용</h2>
            <LinkList items={[...JOURNEYS.slice(0, 4).map((j) => ({ label: j.question, href: `/journey/${j.slug}`, meta: j.duration })), ...COST_TOPICS.slice(0, 3).map((c) => ({ label: c.title, href: `/cost/${c.slug}`, meta: '비용' }))]} />
          </section>
        </div>
        <CtaBlock />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/treatment', crumbs), itemListNode('진료 과목', TREATMENTS.map((t) => ({ name: t.name, path: `/treatment/${t.slug}` })))]} />
    </>
  );
}
