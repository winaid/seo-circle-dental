'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

type Wcs = { wcs?: unknown; wcs_add?: Record<string, string>; wcs_do?: () => void };

/**
 * 네이버 애널리틱스 — 사이트 안 이동(next/link)을 한 번씩 센다.
 * 처음 연 쪽은 layout 의 네이버 공식 스크립트가 세므로 첫 렌더는 건너뛴다(두 번 세지 않게).
 */
export function NaverAnalytics({ id }: { id: string }) {
  const path = usePathname();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const w = window as unknown as Wcs;
    w.wcs_add = w.wcs_add || {};
    w.wcs_add.wa = id;
    if (w.wcs && w.wcs_do) w.wcs_do();
  }, [path, id]);
  return null;
}
