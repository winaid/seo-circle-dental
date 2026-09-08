import type { Metadata } from 'next';
import { CtaBlock, HubHead, JsonLd, LinkList, Chips } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, itemListNode, webPageNode } from '@/lib/schema';
import { SYMPTOM_GROUPS, SYMPTOMS, symptomBySlug } from '@/lib/symptoms';

export const revalidate = 3600;
const doc = docByPathStrict('/symptom');
export const metadata: Metadata = metaFor(doc);

export default function SymptomHub() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '증상으로 찾기', path: '/symptom' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="증상으로 찾기" title={doc.title} lead="진료과목 이름을 몰라도 됩니다. 느끼시는 증상과 가장 가까운 항목부터 읽어 보세요. 원인 후보, 내원 전 할 수 있는 것, 바로 와야 하는 신호를 나눠 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <Chips items={SYMPTOM_GROUPS.map((g) => ({ label: g.short, href: `#${g.slug}` }))} />
        <div style={{ display: 'grid', gap: 56, maxWidth: 820, marginTop: 40 }}>
          {SYMPTOM_GROUPS.map((g) => (
            <section key={g.slug} id={g.slug}>
              <h2 style={{ fontSize: 24 }}>{g.title}</h2>
              <p className="muted" style={{ margin: '10px 0 18px' }}>{g.lead}</p>
              <LinkList items={g.symptoms.map((s) => symptomBySlug(s)!).map((s) => ({ label: s.title, href: `/symptom/${s.slug}`, meta: s.short }))} />
            </section>
          ))}
        </div>
        <CtaBlock title="증상만으로 진단할 수는 없습니다 — 검사로 원인을 가려 드립니다" />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/symptom', crumbs), itemListNode('증상', SYMPTOMS.map((s) => ({ name: s.title, path: `/symptom/${s.slug}` })))]} />
    </>
  );
}
