import type { Metadata } from 'next';
import { HubHead, JsonLd } from '@/components/ui';
import { docByPathStrict } from '@/lib/catalog';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, webPageNode } from '@/lib/schema';
import { CLINIC } from '@/lib/clinic';
import { REF_MEDICAL_LAW_RULE } from '@/lib/references';

export const revalidate = 3600;
const doc = docByPathStrict('/privacy');
export const metadata: Metadata = metaFor(doc, { robots: { index: false, follow: true } });

export default function PrivacyPage() {
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '개인정보처리방침', path: '/privacy' },
  ];
  return (
    <>
      <HubHead crumbs={crumbs} title="개인정보처리방침" lead={`${CLINIC.name}은 개인정보 보호법 등 관련 법령을 준수하며, 이 사이트에서 개인정보를 어떻게 다루는지 아래에 밝힙니다.`} />
      <div className="wrap prose" style={{ paddingBottom: 88, maxWidth: 'calc(780px + 40px)' }}>
        <h2>이 사이트가 수집하는 정보</h2>
        <p>이 사이트에는 회원가입·문의 폼이 없으며 방문자의 개인정보를 직접 수집하지 않습니다. 접속 기록은 호스팅 사업자의 표준 서버 로그(IP 주소, 접속 시각, 요청 주소, 브라우저 종류)로만 남고 서비스 운영과 보안 목적 외에 쓰지 않습니다.</p>
        <h2>외부 서비스</h2>
        <p>네이버 예약, 카카오톡 상담, 지도 서비스로 이동하시면 그 순간부터 각 서비스의 개인정보처리방침이 적용됩니다. 예약·상담 과정에서 입력하신 정보는 해당 서비스와 병원이 진료 예약과 안내 목적으로만 이용합니다.</p>
        <h2>진료 기록</h2>
        <p>내원 후 작성되는 진료기록은 의료법 및 같은 법 시행규칙 제15조가 정한 기간 동안 병원 내에서 보존하며, 법령에 따른 경우 외에는 제3자에게 제공하지 않습니다.</p>
        <h2>정보주체의 권리</h2>
        <p>본인의 개인정보에 대한 열람·정정·삭제·처리정지를 요구하실 수 있습니다. 요청은 전화({CLINIC.phone}) 또는 이메일({CLINIC.email})로 주시면 지체 없이 처리합니다.</p>
        <h2>개인정보 보호책임자</h2>
        <p>
          {CLINIC.name} 대표 {CLINIC.director} · {CLINIC.phone} · {CLINIC.email}
        </p>
        <h2>근거 법령</h2>
        <ul>
          <li>개인정보 보호법</li>
          <li>
            {REF_MEDICAL_LAW_RULE.publisher} — <a href={REF_MEDICAL_LAW_RULE.url} target="_blank" rel="noopener">{REF_MEDICAL_LAW_RULE.title}</a>
          </li>
        </ul>
        <p className="small muted">시행일: 2026년 9월 8일</p>
      </div>
      <JsonLd nodes={[webPageNode(doc), breadcrumbNode('/privacy', crumbs)]} />
    </>
  );
}
