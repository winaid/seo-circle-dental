import type { Metadata } from 'next';
import Link from 'next/link';
import { Chips, CtaBlock, HubHead, JsonLd, MedicalNotice } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { articleNode, breadcrumbNode, webPageNode } from '@/lib/schema';
import { CASES } from '@/lib/emergency';
import { CLINIC } from '@/lib/clinic';

export const revalidate = 3600;
const doc = docByPathStrict('/emergency');
export const metadata: Metadata = metaFor(doc);

export default function EmergencyPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '응급 상황', path: '/emergency' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="응급 상황" title={doc.title} lead="응급 상황에서는 좋은 뜻으로 한 행동이 오히려 상황을 나쁘게 만들기도 합니다. 병원에 오시기 전 몇 분 동안 하실 수 있는 것과 피하셔야 할 것을 상황별로 정리했습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <Chips items={CASES.map((c) => ({ label: c.title, href: `#${c.id}` }))} />
        <div className="prose" style={{ maxWidth: 780, marginTop: 24 }}>
          <div className="callout callout--warn">
            <b>숨쉬기 불편하거나 삼키기 어려우면 치과가 아니라 응급실입니다</b>
            얼굴 부기가 눈이나 목 쪽으로 번지거나 열이 함께 나면 진료시간을 기다리지 말고 가장 빨리 갈 수 있는 곳으로 가세요. 진료시간 안이라면 {CLINIC.phone}로 먼저 전화해 주세요.
          </div>
          {CASES.map((c) => (
            <section key={c.id} id={c.id}>
              <h2>{c.title}</h2>
              <p className="small" style={{ color: 'var(--accent)', fontWeight: 700 }}>권장 시간 · {c.urgency}</p>
              <p>{c.answer}</p>
              <h3>지금 하실 것</h3>
              <ul>
                {c.doList.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <h3>하지 마실 것</h3>
              <ul>
                {c.dontList.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
              <div className="callout">{c.note}</div>
            </section>
          ))}
          <h2>관련 안내</h2>
          <ul>
            <li><Link href="/symptom/toothache-night">밤에 이가 욱신거려서 잠을 못 자요</Link></li>
            <li><Link href="/symptom/jaw-swelling">볼이나 턱 아래가 부었어요</Link></li>
            <li><Link href="/condition/dry-socket">건조와(드라이소켓)</Link></li>
            <li><Link href="/visit">진료시간·오시는 길</Link></li>
          </ul>
          <CtaBlock title="진료시간 안이라면 먼저 전화해 주세요 — 그날 오셔야 하는지 바로 판단해 드립니다" />
          <MedicalNotice />
        </div>
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), articleNode(doc), breadcrumbNode('/emergency', crumbs)]} />
    </>
  );
}
