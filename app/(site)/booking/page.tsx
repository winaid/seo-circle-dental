import type { Metadata } from 'next';
import Link from 'next/link';
import { Btn, HoursTable, HubHead, Icon, JsonLd, MedicalNotice } from '@/components/ui';
import { OpenNow } from '@/components/OpenNow';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode } from '@/lib/schema';
import { CLINIC, UNVERIFIED } from '@/lib/clinic';

export const revalidate = 3600;
const doc = docByPathStrict('/booking');
export const metadata: Metadata = metaFor(doc);

/**
 * 예약하기 — 바로가기 타일(lib/quicklinks)의 '예약하기' 칸이 가리키는 쪽.
 * 내용은 /visit 의 연락 방법을 예약 관점으로만 다시 묶은 것. 새 사실은 없다(전화·네이버 예약·카카오 링크는 lib/clinic 한 곳).
 */
export default function BookingPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '예약하기', path: '/booking' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} eyebrow="예약하기" title="예약하기 — 네이버 예약 · 전화 · 카카오톡 상담" lead="급한 정도에 따라 맞는 방법이 다릅니다. 지금 아프면 전화, 시간을 정하고 싶으면 네이버 예약, 짧은 질문은 카카오톡." />
      <div className="wrap" style={{ paddingBottom: 88, display: 'grid', gap: 40 }}>
        <div className="visit">
          <div className="visit-box">
            <h3>네이버 예약</h3>
            <p>가능한 시간대를 보고 직접 고르실 수 있습니다. 급하지 않고 시간을 정해 두고 싶을 때 맞습니다.</p>
            <Btn href={CLINIC.booking.naver} external>{Icon.calendar} 네이버 예약으로 시간 고르기</Btn>
          </div>
          <div className="visit-box">
            <h3>전화 {CLINIC.phone}</h3>
            <p>지금 아프거나 급할 때. 증상을 말씀하시면 그날 오셔야 하는지 먼저 판단해 드립니다.</p>
            <Btn href={CLINIC.phoneHref}>{Icon.phone} 전화하기</Btn>
          </div>
          <div className="visit-box">
            <h3>카카오톡 상담</h3>
            <p>진료시간·주차·준비물처럼 짧은 질문에 맞습니다. 증상 판단은 구강을 봐야 가능해 카카오톡으로는 하지 않습니다.</p>
            <Btn href={CLINIC.booking.kakao} kind="ghost" external>{Icon.chat} 카카오톡 채널 열기</Btn>
          </div>
        </div>

        <div className="two">
          <div className="visit-box">
            <h3>지금은</h3>
            <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>
              <OpenNow withDot />
            </p>
            <HoursTable />
            <p className="small muted">점심시간 {UNVERIFIED.hours.lunch.start}–{UNVERIFIED.hours.lunch.end} (토요일 제외) · 화·목 야간 진료</p>
          </div>
          <div className="visit-box">
            <h3>오실 때</h3>
            <p>{CLINIC.address.full}. 3호선 화정역 하차, 건물 내 기계식 주차 무료. 다른 병원에서 찍은 엑스레이가 있으면 가져오시면 다시 찍지 않아도 되는 경우가 있습니다.</p>
            <p>
              <Link href="/visit" className="btn btn--ghost btn--sm">{Icon.pin} 오시는 길 · 주차</Link>
            </p>
          </div>
        </div>
        <MedicalNotice />
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/booking', crumbs)]} />
    </>
  );
}
