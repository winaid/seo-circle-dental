import Link from 'next/link';

/**
 * 사진 + 이름 카드 6장 — 네이버 검색 결과 아래 카드 줄(캐러셀)의 재료 (2026-09-28).
 * 같은 cards 를 itemListNode(…, cards) 로도 낸다. 화면 <img> 와 ItemList.image 가 같은 파일이어야 한다.
 * ★ 2026-10-08: 카드 그림에 제목 글자가 들어가(scripts/focus-card-art.mjs) 이름은 그림 위가 아니라 아래에 — 홈 카드(.h-card)와 같은 모양
 */
export function CardRow({ title, cards }: { title: string; cards: Array<{ name: string; path: string; image: string; alt: string; tag: string }> }) {
  if (cards.length < 5) return null;
  return (
    <section className="card-row-wrap fc-cards" aria-label={title}>
      <h2>{title}</h2>
      <div className="card-row">
        {cards.map((c) => (
          <Link key={c.path + c.name} href={c.path} className="h-card h-card--sm">
            <span className="h-card-img">
              <img src={c.image} alt={c.alt} width={800} height={800} loading="lazy" decoding="async" />
            </span>
            <span className="h-card-in">
              <span className="card-tag">{c.tag}</span>
              <h3>{c.name}</h3>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
