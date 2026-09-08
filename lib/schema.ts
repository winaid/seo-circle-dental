/**
 * 구조화 데이터(JSON-LD).
 *
 * ★ 이 사이트는 본원(circle-dental.co.kr)과 같은 병원을 설명한다. 병원 노드의 @id 를
 *   본원 주소로 잡고 sameAs 로 서로 이어 "다른 사이트, 같은 병원" 임을 기계에 알린다.
 * ★ 확인되지 않은 값(UNVERIFIED.verified=false)은 넣지 않는다.
 */
import { CLINIC, UNVERIFIED } from './clinic';
import { DOCTORS, type Doctor } from './doctors';
import { IMG } from './assets';
import { SITE_URL, MAIN_SITE_URL, abs, SITE_NAME, CLINIC_GEO } from './site';
import type { Doc } from './catalog';
import type { Treatment } from './treatments';
import type { Condition } from './conditions';

export const ID = {
  clinic: `${MAIN_SITE_URL}/#clinic`,
  website: `${SITE_URL}/#website`,
  director: `${SITE_URL}/about/doctors/${DOCTORS[0].slug}#person`,
  person: (slug: string) => `${SITE_URL}/about/doctors/${slug}#person`,
  page: (path: string) => `${abs(path)}#webpage`,
  article: (path: string) => `${abs(path)}#article`,
  breadcrumb: (path: string) => `${abs(path)}#breadcrumb`,
} as const;

const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

function openingHours() {
  const h = UNVERIFIED.hours;
  if (!h.verified) return [];
  const out: Array<Record<string, string>> = [];
  for (const r of h.rows) {
    const l = h.lunch;
    if (toMin(l.start) > toMin(r.open) && toMin(l.end) < toMin(r.close)) {
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: r.day, opens: r.open, closes: l.start });
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: r.day, opens: l.end, closes: r.close });
    } else {
      out.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: r.day, opens: r.open, closes: r.close });
    }
  }
  return out;
}

export function clinicNode() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Dentist', 'MedicalOrganization', 'Organization'],
    '@id': ID.clinic,
    name: CLINIC.name,
    alternateName: CLINIC.nameEn,
    description: CLINIC.description,
    url: MAIN_SITE_URL,
    telephone: CLINIC.phone,
    email: CLINIC.email,
    taxID: CLINIC.bizNo,
    founder: { '@id': ID.director },
    logo: abs(IMG.logo),
    image: [abs(IMG.doctorsTeam), abs(IMG.interior[8].src)],
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${CLINIC.address.street}, 3층 301·302·303호 (${CLINIC.address.building})`,
      addressLocality: CLINIC.address.locality,
      addressRegion: CLINIC.address.region,
      postalCode: CLINIC.address.postalCode,
      addressCountry: CLINIC.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: CLINIC_GEO.lat, longitude: CLINIC_GEO.lng },
    areaServed: CLINIC.serviceArea.map((n) => ({ '@type': 'Place', name: n })),
    openingHoursSpecification: openingHours(),
    medicalSpecialty: 'Dentistry',
    isAcceptingNewPatients: true,
    currenciesAccepted: 'KRW',
    sameAs: [MAIN_SITE_URL, SITE_URL, CLINIC.social.instagram, CLINIC.social.naverBlog, CLINIC.booking.naver].filter(Boolean),
    employee: DOCTORS.map((d) => ({ '@id': ID.person(d.slug) })),
  };
}

export function websiteNode() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': ID.website,
    url: SITE_URL,
    name: `${SITE_NAME} — 화정치과 · 화정동 치과 안내`,
    inLanguage: 'ko-KR',
    publisher: { '@id': ID.clinic },
  };
}

export function personNode(d: Doctor) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Physician', 'Person'],
    '@id': ID.person(d.slug),
    name: d.name,
    jobTitle: d.role,
    image: abs(d.photo),
    url: abs(`/about/doctors/${d.slug}`),
    worksFor: { '@id': ID.clinic },
    medicalSpecialty: 'Dentistry',
    knowsAbout: d.focus,
    hasCredential: d.career.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c })),
    memberOf: d.societies.map((s) => ({ '@type': 'Organization', name: s })),
  };
}

export function breadcrumbNode(path: string, items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': ID.breadcrumb(path),
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

export function webPageNode(doc: Doc, opts: { medical?: boolean; about?: unknown } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.medical ? ['WebPage', 'MedicalWebPage'] : 'WebPage',
    '@id': ID.page(doc.path),
    url: abs(doc.path),
    name: doc.seoTitle,
    description: doc.description,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': ID.website },
    about: opts.about ?? { '@id': ID.clinic },
    breadcrumb: { '@id': ID.breadcrumb(doc.path) },
    datePublished: doc.publishAt,
    dateModified: doc.updated,
    ...(doc.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: abs(doc.image.src), caption: doc.image.alt } } : {}),
    ...(opts.medical ? { reviewedBy: { '@id': ID.director }, lastReviewed: doc.updated, audience: { '@type': 'MedicalAudience', audienceType: 'Patient' } } : {}),
  };
}

export function articleNode(doc: Doc, opts: { wordCount?: number; type?: 'Article' | 'BlogPosting' | 'MedicalScholarlyArticle'; about?: unknown } = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': opts.type ?? 'Article',
    '@id': ID.article(doc.path),
    headline: doc.title,
    description: doc.description,
    inLanguage: 'ko-KR',
    mainEntityOfPage: { '@id': ID.page(doc.path) },
    author: { '@id': ID.clinic },
    publisher: { '@id': ID.clinic },
    reviewedBy: { '@id': ID.director },
    datePublished: doc.publishAt,
    dateModified: doc.updated,
    keywords: doc.keywords.join(', '),
    articleSection: doc.category,
    ...(doc.image ? { image: abs(doc.image.src) } : {}),
    ...(opts.wordCount ? { wordCount: opts.wordCount } : {}),
    ...(opts.about ? { about: opts.about } : {}),
  };
}

export function faqNode(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })),
  };
}

/** 문답 한 편짜리 페이지 — FAQPage 가 아니라 QAPage 가 맞는 타입이다. */
export function qaPageNode(doc: Doc, q: string, a: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'QAPage',
    '@id': ID.page(doc.path),
    url: abs(doc.path),
    name: doc.seoTitle,
    inLanguage: 'ko-KR',
    isPartOf: { '@id': ID.website },
    breadcrumb: { '@id': ID.breadcrumb(doc.path) },
    datePublished: doc.publishAt,
    dateModified: doc.updated,
    mainEntity: {
      '@type': 'Question',
      name: q,
      text: q,
      answerCount: 1,
      dateCreated: doc.publishAt,
      author: { '@type': 'Audience', audienceType: 'Patient' },
      acceptedAnswer: { '@type': 'Answer', text: a, dateCreated: doc.publishAt, url: abs(doc.path), author: { '@id': ID.clinic } },
    },
  };
}

export function procedureNode(t: Treatment) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    '@id': `${abs(`/treatment/${t.slug}`)}#procedure`,
    name: t.name,
    alternateName: t.short,
    description: t.summary,
    procedureType: { '@type': 'MedicalProcedureType', name: t.procedureType },
    howPerformed: t.intro,
    provider: { '@id': ID.clinic },
  };
}

export function conditionNode(c: Condition) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    '@id': `${abs(`/condition/${c.slug}`)}#condition`,
    name: c.name,
    alternateName: c.aka,
    description: c.definition,
    signOrSymptom: c.signs.map((s) => ({ '@type': 'MedicalSignOrSymptom', name: s })),
    riskFactor: c.causes.map((s) => ({ '@type': 'MedicalRiskFactor', name: s })),
    possibleTreatment: { '@type': 'MedicalTherapy', name: c.treatment },
    stage: c.stages.map((s) => ({ '@type': 'MedicalConditionStage', stageAsNumber: undefined, subStageSuffix: s.step, name: s.what })),
  };
}

export function itemListNode(name: string, items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: abs(it.path) })),
  };
}

export function serialize(nodes: unknown[]) {
  return JSON.stringify(nodes.length === 1 ? nodes[0] : nodes).replace(/</g, '\\u003c');
}
