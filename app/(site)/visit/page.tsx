import type { Metadata } from 'next';
import Link from 'next/link';
import { Btn, Chips, CtaBlock, Faq, HoursTable, HubHead, Icon, JsonLd, MedicalNotice } from '@/components/ui';
import { OpenNow } from '@/components/OpenNow';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode } from '@/lib/schema';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';
import { CLINIC_QA } from '@/lib/faq';
import { REGIONS } from '@/lib/regions';
import { CLINIC_GEO, fmtDistance, STATION_DISTANCE_M } from '@/lib/site';
import { IMG } from '@/lib/assets';

export const revalidate = 3600;
const doc = docByPathStrict('/visit');
export const metadata: Metadata = metaFor(doc);

export default function VisitPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '오시는 길', path: '/visit' },
  ];
  const mapSrc = `https://www.google.com/maps?q=${CLINIC_GEO.lat},${CLINIC_GEO.lng}&z=17&hl=ko&output=embed`;
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="오시는 길 · 진료시간 · 예약" title={doc.title} lead={`${CLINIC.address.full}. 3호선 화정역에서 ${fmtDistance(STATION_DISTANCE_M)}, ${CLINIC.parking.type} ${CLINIC.parking.fee}.`} />
      <div className="wrap" style={{ paddingBottom: 88, display: 'grid', gap: 40 }}>
        <div className="visit">
          <div className="visit-box">
            <h3>지금은</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
              <OpenNow withDot />
            </p>
            <HoursTable />
            <p className="small muted">점심시간 {UNVERIFIED.hours.lunch.start}–{UNVERIFIED.hours.lunch.end} (토요일 제외) · 화·목 야간 진료</p>
          </div>
          <div className="visit-box">
            <h3>어떻게 연락하면 되나요</h3>
            <div className="visit-meta">
              <div><b>전화</b><span>지금 아프거나 급할 때. 증상을 말씀하시면 그날 오셔야 하는지 먼저 판단해 드립니다. {CLINIC.phone}</span></div>
              <div><b>네이버 예약</b><span>급하지 않고 시간을 정하고 싶을 때. 가능한 시간대를 보고 직접 고르실 수 있습니다.</span></div>
              <div><b>카카오톡</b><span>진료시간·주차·준비물처럼 짧은 질문에 맞습니다. 증상 판단은 구강을 봐야 가능합니다.</span></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Btn href={CLINIC.phoneHref}>{Icon.phone} 전화하기</Btn>
              <Btn href={CLINIC.booking.naver} kind="ghost">{Icon.calendar} 네이버 예약</Btn>
              <Btn href={CLINIC.booking.kakao} kind="ghost">{Icon.chat} 카카오톡 상담</Btn>
            </div>
          </div>
        </div>

        <div className="two">
          <div className="visit-box">
            <h3>어디에 있나요</h3>
            <p className="visit-addr">{CLINIC.address.full}</p>
            <div className="visit-meta">
              <div><b>건물</b><span>{CLINIC.address.building} 3층 · 우편번호 {CLINIC.address.postalCode}</span></div>
              <div><b>지하철</b><span>3호선 화정역 하차, 덕양구청 방면 · 병원까지 {fmtDistance(STATION_DISTANCE_M)}</span></div>
              <div><b>주차</b><span>{CLINIC.parking.type} {CLINIC.parking.fee}. {CLINIC.parking.note}</span></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <Btn href={`https://map.naver.com/p/search/${encodeURIComponent('동그라미치과의원 화정동')}`} size="sm">{Icon.pin} 네이버 지도</Btn>
              <Btn href={`https://map.kakao.com/link/search/${encodeURIComponent('동그라미치과의원 화정동')}`} kind="ghost" size="sm">카카오맵</Btn>
              <Btn href={`https://www.google.com/maps/dir/?api=1&destination=${CLINIC_GEO.lat},${CLINIC_GEO.lng}`} kind="ghost" size="sm">길찾기</Btn>
            </div>
          </div>
          <div style={{ borderRadius: 'var(--r)', overflow: 'hidden', border: '1px solid var(--line)', minHeight: 320 }}>
            <iframe title="동그라미치과의원 위치 지도" src={mapSrc} width="100%" height="100%" style={{ border: 0, minHeight: 320, display: 'block' }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        </div>

        <figure className="photo-band">
          <img src={IMG.interior[11].src} alt={IMG.interior[11].alt} loading="lazy" decoding="async" />
          <figcaption>{IMG.interior[11].alt}</figcaption>
        </figure>

        <section>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>이 동네에서 오신다면</h2>
          <Chips items={REGIONS.map((r) => ({ label: r.keyword, href: `/area/${r.slug}` }))} />
        </section>

        <section style={{ maxWidth: 820 }}>
          <h2 style={{ fontSize: 24, marginBottom: 14 }}>내원 전에 자주 묻는 것</h2>
          <Faq items={CLINIC_QA.map((q, i) => ({ q: q.q, a: q.a, href: `/qa/visit-${i + 1}` }))} />
          <p className="small muted" style={{ marginTop: 12 }}>
            <Link href="/faq">자주 묻는 질문 전체 보기</Link>
          </p>
        </section>
        <CtaBlock />
        <MedicalNotice />
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/visit', crumbs)]} />
    </>
  );
}
