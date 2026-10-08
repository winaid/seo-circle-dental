import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnswerFirst, Btn, Crumbs, Icon, JsonLd, MedicalNotice } from '@/components/ui';
import { requireDoc } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, ID } from '@/lib/schema';
import { postBySlug, publishedPosts, postText } from '@/lib/posts';
import { CLINIC } from '@/lib/clinic';
import { abs } from '@/lib/site';
import { fmtDate } from '@/lib/text';

export const revalidate = 3600;
export const dynamicParams = true;

/*
 * 화정치과 이야기 글 한 편 (2026-10-08, lib/posts.ts). 참고한 업체 글과 같은 뼈대 —
 * 제목(검색어) → 요약 → 소제목 4~5개 → 예약 권유 → 첫 화면으로 가는 링크. 카드 목록(ItemList)은 싣지 않는다(업체 글도 없음).
 * ★ 저자·검토자를 원장으로 적지 않는다 — 원장이 쓰거나 검토한 글이 아니다. 발행 주체 = 병원.
 */
export function generateStaticParams() {
  return publishedPosts().map((p) => ({ slug: p.slug }));
}

const slugOf = (raw: string) => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = postBySlug(slugOf((await params).slug));
  if (!p) return {};
  return metaFor(requireDoc(p.path));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = postBySlug(slugOf((await params).slug));
  if (!p) notFound();
  const doc = requireDoc(p.path);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '화정치과 이야기', path: '/blog' },
    { name: p.title, path: p.path },
  ];
  const article = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': ID.article(p.path),
    headline: p.title,
    description: doc.description,
    inLanguage: 'ko-KR',
    mainEntityOfPage: abs(p.path),
    author: { '@id': ID.clinic },
    publisher: { '@id': ID.clinic },
    datePublished: p.publishAt,
    dateModified: p.publishAt,
    image: abs(p.image.src),
    keywords: p.kw,
    wordCount: postText(p).replace(/\s/g, '').length,
  };
  return (
    <>
      <article className="post">
        <div className="wrap post-wrap">
          <Crumbs items={crumbs} />
          <span className="eyebrow post-eyebrow">{p.kw} 이야기</span>
          <h1 className="post-h1">{p.title}</h1>
          <p className="post-meta">
            {CLINIC.name} · {fmtDate(p.publishAt)}
          </p>
          <figure className="post-photo">
            <img src={p.image.src} alt={p.image.alt} width={1200} height={800} fetchPriority="high" decoding="async" />
          </figure>
          <AnswerFirst label="먼저 요약">{p.summary}</AnswerFirst>
          <div className="post-body">
            {p.sections.map((s) => (
              <section key={s.h2}>
                <h2>{s.h2}</h2>
                {s.paras.map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </section>
            ))}
          </div>

          <section className="post-cta" aria-labelledby="h-cta">
            <h2 id="h-cta">{p.kw}에서 먼저 확인해 보세요</h2>
            <p>글로 짐작하기 어려운 것은 검사로 확인합니다. 화요일과 목요일은 저녁 8시 30분까지, 토요일은 오후 2시까지 진료합니다.</p>
            <div className="post-cta-btns">
              <Btn href={CLINIC.phoneHref} kind="white">
                {Icon.phone} {CLINIC.phone}
              </Btn>
              <Btn href={CLINIC.booking.naver} kind="ghost-light">
                {Icon.calendar} 네이버 예약
              </Btn>
            </div>
          </section>

          <nav className="post-back" aria-label="이어서 보기">
            <Link href="/">← 화정치과 동그라미치과의원 첫 화면으로</Link>
            {p.area && <Link href={p.area.path}>{p.area.label} →</Link>}
            <Link href="/blog">화정치과 이야기 전체 보기</Link>
          </nav>
          <MedicalNotice />
        </div>
      </article>
      <JsonLd nodes={[article, breadcrumbNode(p.path, crumbs)]} />
    </>
  );
}
