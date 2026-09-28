import Link from 'next/link';
import type { Card } from '@/lib/carousel';

/**
 * 사진 + 이름 카드 6장 — 네이버 검색 결과 아래 카드 줄(캐러셀)의 재료 (2026-09-28).
 * 같은 cards 를 itemListNode(…, cards) 로도 낸다. 화면 <img> 와 ItemList.image 가 같은 파일이어야 한다.
 */
export function CardRow({ title, cards }: { title: string; cards: Card[] }) {
  if (cards.length < 5) return null;
  return (
    <section className="card-row-wrap" aria-label={title}>
      <h2>{title}</h2>
      <div className="card-row">
        {cards.map((c) => (
          <Link key={c.path + c.name} href={c.path} className="t-card t-card--sm">
            <img src={c.image} alt={c.alt} width={800} height={800} loading="lazy" decoding="async" />
            <div className="t-card-in">
              <span className="card-tag">{c.tag}</span>
              <h3>{c.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
