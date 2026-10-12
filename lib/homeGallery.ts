/**
 * 홈 '화정치과 둘러보기' 사진 구획(2026-10-12 오너: "사진 기존에 있는거랑 홈페이지에 사용됐던거 전부 넣어서 완전 많이").
 *
 * ★ 병원이 기존 홈페이지(circle-dental.co.kr)에 올린 실제 병원 사진만 — 한 장씩 직접 보고 골랐다(C:/tmp/shop-photos/make-gallery.mjs).
 *   뺀 것: 같은 장면의 다른 크기, 글자가 박힌 캡처, 아이콘, 연출·제품 사진, 치료 전후 사진(의료광고), 홈에 이미 있는 사진.
 * ★ 설명(alt)은 사진에 보이는 것만 — 장비 이름·인물 신분은 사진만으로 단정하지 않는다(lib/assets.ts interior 주석과 같은 규칙).
 * ★ 사진은 링크가 아니다 — 홈 첫 사진 링크 6개 = 카드 6장(app/page.tsx 위 주석).
 */
export interface GalleryPhoto { src: string; alt: string; w: number; h: number }
export interface GalleryGroup { key: string; h3: string; items: GalleryPhoto[] }

export const HOME_GALLERY: GalleryGroup[] = [
  {
    key: "room",
    h3: "화정치과 진료실과 장비",
    items: [
      {
        src: "/img/gallery/hwajeong-dental-window-room.webp",
        alt: "창가 진료실의 진료 의자와 벽걸이 모니터",
        w: 1200,
        h: 979
      },
      {
        src: "/img/gallery/hwajeong-dental-private-room.webp",
        alt: "진료 의자와 모니터가 놓인 독립 진료실",
        w: 1200,
        h: 800
      },
      {
        src: "/img/gallery/hwajeong-dental-handpiece.webp",
        alt: "진료용 핸드피스가 걸린 유닛 트레이를 가까이서 본 모습",
        w: 1200,
        h: 778
      },
      {
        src: "/img/gallery/hwajeong-dental-sterilize.webp",
        alt: "멸균 포장된 진료 기구를 소독기에서 꺼내는 장면",
        w: 1200,
        h: 800
      },
      {
        src: "/img/gallery/hwajeong-dental-panorama-xray.webp",
        alt: "파노라마 엑스레이 촬영 장면",
        w: 1200,
        h: 800
      }
    ]
  },
  {
    key: "consult",
    h3: "화정치과 상담",
    items: [
      {
        src: "/img/gallery/hwajeong-dental-tablet-chair.webp",
        alt: "진료 의자에 앉은 환자에게 태블릿의 구강 사진을 짚어 가며 설명하는 모습. 뒤쪽 모니터에 파노라마 영상이 떠 있다",
        w: 627,
        h: 500
      },
      {
        src: "/img/gallery/hwajeong-dental-tablet-wide.webp",
        alt: "진료 의자 옆 태블릿에 띄운 치아 그림을 손가락으로 짚으며 환자에게 설명하는 모습",
        w: 1059,
        h: 575
      },
      {
        src: "/img/gallery/hwajeong-dental-model-desk.webp",
        alt: "흰 가운을 입은 원장이 모니터에 파노라마 영상을 띄워 두고 치아 모형 옆에서 환자에게 설명하는 모습",
        w: 627,
        h: 500
      },
      {
        src: "/img/gallery/hwajeong-dental-keyboard-desk.webp",
        alt: "흰 가운을 입은 원장이 모니터의 파노라마 영상을 보며 맞은편 환자와 이야기하는 모습",
        w: 544,
        h: 439
      },
      {
        src: "/img/gallery/hwajeong-dental-dim-consult.webp",
        alt: "모니터의 파노라마 사진을 보며 치아 모형으로 설명하는 원장",
        w: 1200,
        h: 963
      },
      {
        src: "/img/gallery/hwajeong-dental-record-consult.webp",
        alt: "상담실에서 대표원장이 모니터의 진료 기록을 함께 보며 환자에게 설명하는 모습",
        w: 1200,
        h: 800
      },
      {
        src: "/img/gallery/hwajeong-dental-green-chart.webp",
        alt: "초록 진료복을 입은 원장이 파노라마 영상이 뜬 모니터 앞에서 차트를 적는 모습",
        w: 1059,
        h: 575
      },
      {
        src: "/img/gallery/hwajeong-dental-desk-chart.webp",
        alt: "초록 진료복을 입은 원장이 책상에 앉아 차트를 적는 모습",
        w: 521,
        h: 570
      }
    ]
  },
  {
    key: "care",
    h3: "화정치과 진료 장면",
    items: [
      {
        src: "/img/gallery/hwajeong-dental-drape-care.webp",
        alt: "초록 드레이프를 덮고 누운 환자를 원장이 진료하고 진료 보조 인력이 곁에서 돕는 모습",
        w: 627,
        h: 500
      },
      {
        src: "/img/gallery/hwajeong-dental-wall-panorama.webp",
        alt: "진료실에서 원장과 진료 보조 인력이 벽에 걸린 파노라마 영상을 보며 진료하는 모습",
        w: 1200,
        h: 540
      },
      {
        src: "/img/gallery/hwajeong-dental-surgery-light.webp",
        alt: "무영등 불빛 아래 초록 드레이프 위에서 장갑 낀 손으로 기구를 다루는 장면",
        w: 1200,
        h: 800
      },
      {
        src: "/img/gallery/hwajeong-dental-magnify.webp",
        alt: "무영등 아래에서 원장이 확대해 보며 치아 안쪽을 다루는 모습",
        w: 1200,
        h: 800
      }
    ]
  },
  {
    key: "place",
    h3: "화정치과 건물과 접수",
    items: [
      {
        src: "/img/gallery/hwajeong-dental-building-sign.webp",
        alt: "건물 바깥벽에 걸린 동그라미치과의원 간판과 동그라미 로고, 그 아래 화/목 야간진료 안내",
        w: 1200,
        h: 287
      },
      {
        src: "/img/gallery/hwajeong-dental-reception.webp",
        alt: "접수 데스크와 대기 공간 — 좌석과 벽면 로고",
        w: 1200,
        h: 821
      },
      {
        src: "/img/gallery/hwajeong-dental-hallway.webp",
        alt: "진료실로 이어지는 복도 — 양옆이 유리 파티션으로 나뉘어 있다",
        w: 1200,
        h: 800
      },
      {
        src: "/img/gallery/hwajeong-dental-booths.webp",
        alt: "유리 파티션으로 나뉜 개별 상담 부스 — 칸마다 안내 픽토그램이 붙어 있다",
        w: 1200,
        h: 839
      },
      {
        src: "/img/gallery/hwajeong-dental-booths-two.webp",
        alt: "개별 상담 부스 두 칸 — 안내 픽토그램과 조명",
        w: 1200,
        h: 773
      }
    ]
  },
  {
    key: "cred",
    h3: "화정치과 대표원장 인증과 봉사",
    items: [
      {
        src: "/img/gallery/hwajeong-dental-cred-osstem.webp",
        alt: "오스템임플란트 연구자문치과 위촉패",
        w: 236,
        h: 242
      },
      {
        src: "/img/gallery/hwajeong-dental-cred-course.webp",
        alt: "Professional implant Training course 수료패",
        w: 236,
        h: 242
      },
      {
        src: "/img/gallery/hwajeong-dental-cred-ifea.webp",
        alt: "세계근관치료학회 수료증",
        w: 236,
        h: 178
      },
      {
        src: "/img/gallery/hwajeong-dental-cred-kaoe.webp",
        alt: "대한치과보존학회 회원증",
        w: 236,
        h: 242
      },
      {
        src: "/img/gallery/hwajeong-dental-volunteer.webp",
        alt: "경희대학교 치과대학병원 무료진료 현수막 앞에서 흰 가운을 입은 봉사자들이 함께 찍은 단체 사진",
        w: 742,
        h: 442
      }
    ]
  }
];
