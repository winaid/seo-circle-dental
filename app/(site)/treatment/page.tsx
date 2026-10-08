import type { Metadata } from 'next';
import { CtaBlock, Faq, HubHead, JsonLd, MedicalNotice } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode, itemListNode } from '@/lib/schema';
import { focusCards } from '@/lib/focus';
import { CardRow } from '@/components/CardRow';
import { TREATMENTS } from '@/lib/treatments';
import { sentences } from '@/lib/text';

export const revalidate = 3600;
const doc = docByPathStrict('/treatment');
export const metadata: Metadata = metaFor(doc);

/*
 * 진료 안내 — 한 쪽에 진료 열 가지 (2026-10-08 네 검색어 집중판, lib/focus.ts).
 * 진료별 쪽(/treatment/<진료>)·임플란트 세부·기간·비용 쪽은 지웠다(middleware 가 이 쪽으로 301).
 * ★ 소제목은 진료 이름 그대로 — '화정 임플란트' 같은 진료 검색어는 이제 노리지 않는다(오너: 네 검색어만).
 * ★ 사진은 싣지 않는다 — 진료별 사진 중 시술 장면이 섞여 있어서(의료광고 기준, carousel-studio 와 같은 판단).
 */
export default function TreatmentPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '진료 안내', path: '/treatment' },
  ];
  const cards = focusCards('treat');
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="화정 치과 진료 안내" title={doc.title} lead="화정 치과 동그라미치과의원에서 하는 진료 열 가지입니다. 진료 이름만 늘어놓지 않고, 진료마다 검사로 먼저 확인하는 것과 살릴 수 있는 조건을 적었습니다." />
      <div className="wrap" style={{ paddingBottom: 88 }}>
        <nav className="fc-toc fc-toc--grid" aria-label="진료 차례">
          <b>진료 열 가지</b>
          <ol>
            {TREATMENTS.map((t) => (
              <li key={t.slug}><a href={`#${t.slug}`}>{t.name}</a></li>
            ))}
          </ol>
        </nav>

        <div className="fc-tx">
          {TREATMENTS.map((t, i) => (
            <section key={t.slug} id={t.slug} className="fc-tx-item" aria-labelledby={`h-${t.slug}`}>
              <div className="fc-tx-head">
                <span className="fc-tx-no">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <span className="eyebrow">{t.whoFor[0]}</span>
                  <h2 id={`h-${t.slug}`}>{t.name}</h2>
                </div>
              </div>
              <div className="fc-tx-body">
                <p className="fc-tx-lead">{t.summary}</p>
                <p>{sentences(t.intro).join(' ')}</p>
                <div className="fc-tx-who">
                  <b>이럴 때 봅니다</b>
                  <ul>
                    {t.whoFor.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                </div>
                <Faq openFirst={false} items={t.qa.slice(0, 2).map((q) => ({ q: q.q, a: q.a }))} />
              </div>
            </section>
          ))}
        </div>

        <CardRow title="화정 치과 동그라미치과의원 안내" cards={cards} />
        <CtaBlock />
        <MedicalNotice />
      </div>
      <JsonLd nodes={[webPageNode(doc, { medical: true }), breadcrumbNode('/treatment', crumbs), itemListNode('화정 치과 진료 안내', cards.map((c) => ({ name: c.name, path: c.path, image: c.image })))]} />
    </>
  );
}
