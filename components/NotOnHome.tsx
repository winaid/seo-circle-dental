'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/**
 * 홈('/')에서는 children 대신 fallback 을 그린다 — 레이아웃(바닥)처럼 모든 쪽에 같이 나가는 링크 묶음을 홈에서만 뺄 때.
 * ★ 2026-10-02 오너 GO: 네이버가 홈 결과에 카드 줄을 붙이는 홈은 49곳 실측에서 전부 '홈 안 내부 링크 7~8개, 그중 6개가 사진 링크'였다.
 *   그래서 홈의 내부 링크 = 로고 + 진료 카드 6장 + 개인정보처리방침 = 8개로 맞춘다(app/page.tsx). 다른 쪽은 그대로.
 */
export function NotOnHome({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <>{usePathname() === '/' ? fallback : children}</>;
}
