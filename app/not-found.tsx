import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { Chips } from '@/components/ui';
import { CLINIC } from '@/lib/clinic';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <div className="wrap hub-head" style={{ paddingBottom: 88 }}>
          <span className="eyebrow">페이지를 찾을 수 없습니다</span>
          <h1 style={{ marginTop: 12 }}>이 주소의 글은 없거나 아직 공개 전입니다</h1>
          <p>주소가 바뀌었을 수 있습니다. 아래에서 찾으시던 내용으로 가실 수 있습니다.</p>
          <div style={{ marginTop: 24 }}>
            <Chips
              items={[
                { label: '화정치과 동그라미치과의원', href: '/' },
                { label: '화정치과 이야기', href: '/blog' },
              ]}
            />
          </div>
          <p style={{ marginTop: 24 }}>
            급한 문의는 <a href={CLINIC.phoneHref} style={{ color: 'var(--brand)', fontWeight: 700 }}>{CLINIC.phone}</a>
          </p>
        </div>
      </main>
    </>
  );
}
