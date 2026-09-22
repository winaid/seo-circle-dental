'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MAIN_SITE_URL, SEARCH_REDIRECT_PATHS, SEARCH_REDIRECT_TO_MAIN } from '@/lib/site';

/**
 * 검색엔진에서 들어온 방문자를 본 홈페이지(circle-dental.co.kr)로 보낸다 — 오너 지시 2026-09-22.
 *
 * ★ 범위: 홈 + 바로가기 5쪽(lib/quicklinks)만. 400여 개 안내 글은 그대로 읽게 둔다(그 글을 보러 온 사람이다).
 * ★ 조건: document.referrer 가 네이버·구글·다음·빙 검색일 때만. 주소를 직접 치거나 우리 링크로 온 경우,
 *   검색 로봇(referrer 없음)은 그대로 이 화면을 본다 — 봇과 사람에게 다른 HTML 을 주는 위장은 하지 않는다.
 * ★ 끄는 법: lib/site.ts 의 SEARCH_REDIRECT_TO_MAIN=false 또는 env NEXT_PUBLIC_SEARCH_REDIRECT=off. ?stay=1 이면 그 한 번은 안 넘어간다.
 * ★ 위험(오너에게 고지함): 네이버 웹마스터 가이드는 검색 유입만 다른 곳으로 보내는 페이지를 제재 대상으로 본다.
 *   노출이 빠지면 이 스위치부터 끈다.
 */
const SEARCH_HOSTS = /(^|\.)(naver\.com|google\.[a-z.]+|daum\.net|bing\.com|search\.yahoo\.com)$/i;

export function SearchRedirect() {
  const path = usePathname();
  useEffect(() => {
    if (!SEARCH_REDIRECT_TO_MAIN || !path || !SEARCH_REDIRECT_PATHS.includes(path)) return;
    if (new URLSearchParams(location.search).has('stay')) return;
    let host = '';
    try { host = new URL(document.referrer).hostname; } catch { return; }
    if (!SEARCH_HOSTS.test(host)) return;
    const to = new URL(MAIN_SITE_URL);
    to.searchParams.set('utm_source', host.includes('naver') ? 'naver' : host.includes('google') ? 'google' : 'search');
    to.searchParams.set('utm_medium', 'organic');
    to.searchParams.set('utm_campaign', 'circle-dental-shop');
    to.searchParams.set('utm_content', path);
    location.replace(to.toString());
  }, [path]);
  return null;
}
