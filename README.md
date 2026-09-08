# SEO_circle-dental — 동그라미치과의원 네이버 노출용 안내 사이트

고양 화정동 동그라미치과의원의 **검색 노출 전용 사이트**입니다. 본원(circle-dental-2)의 검증된 콘텐츠(진료·증상·질환·문답·칼럼)를 그대로 가져와
"지역 + 진료" 질의에 답하는 독립 문서 약 360쪽으로 펼쳤습니다.

## 실행

```bash
npm install
npm run dev        # http://localhost:3600  (개발 서버에서는 예약 발행 글도 전부 보입니다)
npm run build      # 의료광고 금칙 검사 → next build
npm start
```

## 무엇이 들어 있나

| 구역 | 주소 | 쪽수 |
| --- | --- | --- |
| 홈(랜딩) | `/` | 1 |
| 진료 안내 | `/treatment/{slug}`, `/treatment/implant/{topic}` | 10 + 6 |
| 증상 · 질환 | `/symptom/{slug}`, `/condition/{slug}` | 26 + 15 |
| 치료 기간 · 비용 · 용어 | `/journey/*`, `/cost/*`, `/glossary/*` | 8 + 6 + 22 |
| 진료실 문답 | `/qa/{slug}` | 131 |
| 칼럼 | `/blog/{slug}` (content/blog/*.json) | 10 |
| 지역 · 지역×진료 | `/area/{region}`, `/area/{region}/{treatment}` | 15 + 90 |
| 병원 · 의료진 · 오시는 길 · FAQ · 응급 | `/about`, `/about/doctors/*`, `/visit`, `/faq`, `/emergency` | 8 |

모든 주소는 `lib/catalog.ts` 한 곳에서 파생됩니다. 사이트맵·RSS·목록·관련 글이 전부 이 배열을 읽습니다.

## 네이버 노출 장치

- `robots.txt` — Yeti(네이버)·Daum·Google·Bing·AI 크롤러 허용, 사이트맵 2종 안내
- `sitemap.xml` — 공개된 문서 전체, lastmod = 실제 수정일
- `sitemap.rss` — 사이트맵과 함께 제출하는 목록형 RSS (상위 노출 사이트들의 구조)
- `feed` / `rss.xml` — 전문 RSS 2.0 (최신 50편, content:encoded 포함)
- `llms.txt` — AI 답변 엔진용 요약
- JSON-LD — Dentist/Organization(본원 @id 로 연결), WebSite, WebPage/MedicalWebPage, Article, QAPage(문답), FAQPage(/faq), MedicalProcedure, MedicalCondition, Physician, BreadcrumbList, ItemList, DefinedTermSet
- `<title>` — 홈은 `화정동 치과 | 화정역 치과 | 고양 덕양구 …` 3중 키워드, 내부 문서는 `제목 | 화정동 치과 동그라미치과의원`
- IndexNow — `public/<키>.txt` + `npm run indexnow`

### 서치어드바이저 등록 순서

1. `.env` 에 `SITE_URL` 을 실제 배포 주소로 (www 유무·https 까지 등록 주소와 **정확히** 같아야 RSS 제출이 통과합니다).
2. searchadvisor.naver.com → 웹마스터 도구 → 사이트 등록 → **HTML 태그** 방식의 content 값을 `NAVER_SITE_VERIFICATION` 에 넣고 재배포 → 소유확인.
3. 요청 → 사이트맵 제출: `https://도메인/sitemap.xml`
4. 요청 → RSS 제출: `https://도메인/feed`  (실패하면 `https://도메인/sitemap.rss` 로 재시도)
5. 배포 뒤 `SITE_URL=https://도메인 npm run indexnow` — 새 주소를 네이버에 즉시 알립니다. 예약 발행으로 새 글이 생길 때마다 다시 실행하면 새 주소만 보냅니다.
6. 검증 → robots.txt 검증 / 사이트 간단 체크로 확인. 색인은 `site:도메인` 으로 확인.

## 예약 발행

핵심 문서(홈·진료·증상·질환·지역 허브 등)는 개시일(2026-09-08)에 전부 공개되고, 문답·지역×진료·용어 같은 글은
경로 해시 순서로 **첫날 80편, 그 뒤 하루 6편**씩 자동 공개됩니다(`lib/publish.ts`). 사이트맵·RSS·목록이 같은 날짜를 봅니다.
쪽들이 `revalidate = 3600` 이라 배포 없이도 한 시간 안에 새 글이 실립니다.

- 전부 즉시 공개: `PUBLISH_MODE=all`
- 속도 조절: `PUBLISH_FIRST_BATCH`, `PUBLISH_PER_DAY`

## 칼럼 추가

`content/blog/YYYY-MM-DD-slug.json` 파일 하나를 넣으면 목록·상세·사이트맵·RSS 에 자동으로 실립니다(본원과 같은 형식).
날짜가 미래면 그날까지 숨겨집니다.

## 의료광고 금칙

`npm run check` — '잘하는곳 / 추천 / 유명한곳 / 대학병원급 / 무통 / 100% / 완치 …' 같은 표현을 발견하면 빌드를 세웁니다.
실측한 상위 노출 사이트들이 실제로 쓰는 표현이지만 의료법 제56조 제2항 위반 소지가 있고 책임은 병원이 집니다.

## 점검

```bash
npm run dev
node scripts/seo-audit.mjs                # 전 쪽 title/description/h1/canonical/JSON-LD/본문 글자 수/alt/내부링크 검사
node scripts/seo-audit.mjs http://localhost:3600 --limit 40
```

## 사실 관계

- 병원 정보·의료진 경력·진료시간은 본원 `lib/clinic.ts`, `lib/doctors.ts` 원문 그대로입니다(확인되지 않은 값은 넣지 않습니다).
- 지역 페이지의 거리는 OSM 실측 좌표로 계산한 **직선거리**이고, 3호선 정거장 수는 역 순서에서 계산합니다. 소요 시간·버스 번호는 적지 않습니다.
