'use client';

import { useEffect, useState } from 'react';
import { getOpenStatus, type OpenStatus } from '@/lib/openStatus';

/**
 * 지금 진료 중인지 — 한국 시간 기준. 서버 렌더와 어긋나지 않게 클라이언트에서만 계산한다.
 */
export function OpenNow({ withDot = false }: { withDot?: boolean }) {
  const [s, setS] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setS(getOpenStatus(new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  if (!s) return <span>진료시간 확인</span>;
  const cls = s.state === 'open' ? 'is-open' : s.state === 'lunch' ? 'is-lunch' : '';
  return (
    <span className="now">
      {withDot && <span className={`now-dot ${cls}`} aria-hidden="true" />}
      {s.label}
    </span>
  );
}
