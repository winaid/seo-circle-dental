import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleShell, CtaBlock, JsonLd, LinkList, MedicalNotice } from '@/components/ui';
import { docsOfKind } from '@/lib/catalog';
import { requireDoc, publishedSlugs } from '@/lib/gate';
import { metaFor } from '@/lib/meta';
import { breadcrumbNode, personNode, webPageNode, ID } from '@/lib/schema';
import { DOCTORS, doctorBySlug, credentialOf, PUBLICATION_DETAIL, OUTREACH_BROADCAST } from '@/lib/doctors';
import { TREATMENTS } from '@/lib/treatments';

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return publishedSlugs('doctor', '/about/doctors/').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!doctorBySlug(slug)) return {};
  return metaFor(requireDoc(`/about/doctors/${slug}`));
}

export default async function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = doctorBySlug(slug);
  if (!d) notFound();
  const doc = requireDoc(`/about/doctors/${slug}`);
  const crumbs = [
    { name: '홈', path: '/' },
    { name: '병원 소개', path: '/about' },
    { name: `${d.name} ${d.role}`, path: doc.path },
  ];
  const cred = credentialOf(d);
  const isDirector = d.slug === DOCTORS[0].slug;
  const focusTreatments = TREATMENTS.filter((t) => d.focus.some((f) => t.name.includes(f.replace(/\(.*\)/, '').slice(0, 2))));
  return (
    <>
      <ArticleShell doc={doc} crumbs={crumbs} eyebrow="의료진" hero={{ src: d.photo, alt: `${d.name} ${d.role}` }} related={docsOfKind('doctor').filter((x) => x.path !== doc.path)}>
        <div className="prose">
          <p className="lead">
            {d.name} {d.role}은 {d.license}입니다. 주로 보는 영역은 {d.focus.join(', ')}이며, 아래 학력·경력은 병원이 공개한 원문 순서 그대로입니다.
          </p>
          <h2>학력 · 경력</h2>
          <ul>
            {d.career.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {d.societies.length > 0 && (
            <>
              <h2>학회 활동</h2>
              <ul>
                {d.societies.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </>
          )}
          <h2>{cred.label}</h2>
          <p>
            {cred.items.join(' · ')}
            {cred.total > cred.items.length ? ` 외 ${cred.total - cred.items.length}건` : ''}
          </p>
          {isDirector && (
            <>
              <h2>발표 논문</h2>
              <p>
                <em>{PUBLICATION_DETAIL.title}</em>
                <br />
                <span className="muted small">{PUBLICATION_DETAIL.authors}</span>
              </p>
              <p>{PUBLICATION_DETAIL.relevanceKo}</p>
              <h2>사회공헌</h2>
              <figure>
                <img src={OUTREACH_BROADCAST.src} alt={OUTREACH_BROADCAST.alt} loading="lazy" decoding="async" />
                <figcaption>{OUTREACH_BROADCAST.alt}</figcaption>
              </figure>
            </>
          )}
          {focusTreatments.length > 0 && (
            <>
              <h2>주로 보는 진료</h2>
              <LinkList items={focusTreatments.map((t) => ({ label: t.name, href: `/treatment/${t.slug}`, meta: t.short }))} />
            </>
          )}
          <h2>다른 의료진</h2>
          <LinkList items={DOCTORS.filter((x) => x.slug !== slug).map((x) => ({ label: `${x.name} ${x.role}`, href: `/about/doctors/${x.slug}`, meta: x.license }))} />
          <p>
            <Link href="/about">병원 소개로 돌아가기</Link>
          </p>
          <CtaBlock title={`${d.name} ${d.role} 진료 예약`} />
          <MedicalNotice />
        </div>
      </ArticleShell>
      <JsonLd nodes={[webPageNode(doc, { about: { '@id': ID.person(d.slug) } }), personNode(d), breadcrumbNode(doc.path, crumbs)]} />
    </>
  );
}
