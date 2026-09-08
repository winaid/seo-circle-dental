import { CLINIC, UNVERIFIED, STRENGTHS } from './clinic';
import { DOCTORS, PUBLICATION_DETAIL } from './doctors';

/**
 * '왜 동그라미치과인가' — 홈 화면의 세 갈래 카드.
 *
 * ★★ 한 줄도 지어내지 않는다 ★★
 *   이 섹션은 병원을 고르는 사람이 가장 오래 들여다보는 자리라, 여기 적힌 한 문장이
 *   곧 광고 문구가 된다. 의료광고는 사실이 아닌 표시가 그대로 의료법 제56조 위반이다.
 *   그래서 카드마다 근거를 `source` 에 적어 두고, 값은 **가능한 한 기존 상수에서 파생**한다.
 *   (인증·수료에서 배운 것과 같다 — 같은 사실을 두 곳에 적으면 반드시 어긋난다.)
 *
 * ★ 세 갈래로 나눈 이유
 *   사람 / 장비 / 배려는 환자가 실제로 나눠서 궁금해하는 축이다.
 *   "누가 보나" → "무엇으로 보나" → "가서 편한가" 순서로 읽힌다.
 *
 * ⚠️ 여기에 항목을 추가하려면 근거가 먼저다. 원장님 확인 없이 운영 정보를 적지 말 것.
 *    확인이 안 된 값(보증 기간·범위, 비급여 진료비)은 애초에 문장에 넣지 않는다.
 */
export interface WhyUsCard {
  /** 카드 제목 — 짧은 명사구. */
  title: string;
  /** 한두 문장 설명. 단정·최상급 표현 금지. */
  body: string;
  /** 이 문장의 근거. 화면에는 안 나오지만 나중에 사실 확인할 때 쓴다. */
  source: string;
}

export interface WhyUsGroup {
  /** 갈래 이름 — 카드 위 작은 글씨. 우리말로 둔다(영문 약어는 읽는 사람에게 정보가 0이다). */
  key: string;
  /** 한국어 부제. */
  label: string;
  cards: WhyUsCard[];
}

/**
 * 진료시간 표에서 라벨로 한 줄을 찾아 **문장에 넣을 수 있는 형태**로 바꾼다.
 *
 * 표의 값은 `09:30 - 20:30` 처럼 표에 어울리는 표기다. 그대로 문장에 넣으면
 * "화요일은 09:30 - 20:30까지 봅니다" 처럼 읽힌다(실측 — 하이픈과 '까지' 가 겹친다).
 * 시간을 손으로 옮겨 적지 않으면서 문장으로는 자연스럽게 읽히도록 여기서만 바꾼다.
 */
const hoursOf = (label: string): string => {
  const raw = UNVERIFIED.hours.display.find((h) => h.label === label)?.time ?? '';
  const [open, close] = raw.split('-').map((s) => s.trim());
  return open && close ? `${open}부터 ${close}까지` : raw;
};

/** 특별함 원문에서 본문을 가져온다 — 같은 문장을 두 곳에 적어 두면 어긋난다. */
const strength = (key: string): string =>
  STRENGTHS.find((s) => s.key === key)?.body ?? '';

const 변석호 = DOCTORS[0];

export const WHY_US: WhyUsGroup[] = [
  {
    key: '의료진',
    label: '누가 진료하나',
    cards: [
      {
        title: '전문의 3인 진료',
        body: '세 분 원장 모두 보건복지부인증 통합치의학과 전문의입니다. 진단이 애매한 경우 서로 의견을 나눕니다.',
        source: 'lib/doctors.ts — 세 원장 career 에 모두 "보건복지부인증 통합치의학과 전문의" 기재',
      },
      {
        title: '교수 출신 대표원장',
        body: `대표원장 ${변석호.name}은 경희대학교 치의학전문대학원 외래교수이자 치의학박사입니다.`,
        source: 'lib/doctors.ts — 변석호 career: 경희대학교 치의학전문대학원 외래교수 · 치의학박사',
      },
      {
        title: `학회 활동 ${변석호.societies.length}곳`,
        body: `${변석호.societies
          .slice(0, 3)
          .map((s) => s.replace(' 정회원', ''))
          .join(' · ')} 등 ${변석호.societies.length}개 학회 정회원으로 활동합니다.`,
        source: 'lib/doctors.ts — 변석호 societies 배열(원본 홈페이지 /doctor 표기 그대로)',
      },
      {
        title: '증례 논문 발표',
        body: '파절된 치아 조각을 다시 붙인 뒤 장기 경과를 관찰한 증례를 논문으로 발표했습니다.',
        source: `lib/doctors.ts — PUBLICATION_DETAIL: ${PUBLICATION_DETAIL.title}`,
      },
    ],
  },
  {
    key: '진단·장비',
    label: '무엇으로 보나',
    cards: [
      {
        title: '저선량 CT',
        body: '저선량으로 촬영하는 CT로 뼈와 신경의 위치를 확인한 뒤 계획을 세웁니다.',
        source: 'lib/clinic.ts STRENGTHS.digital — "저선량으로 촬영하는 CT"',
      },
      {
        title: '구강스캐너 · 네비게이션 임플란트',
        body: '구강스캐너로 뜬 모형을 바탕으로 네비게이션 임플란트 시술을 제공합니다.',
        source: 'lib/clinic.ts STRENGTHS.digital — "구강스캐너로 심을 위치를 미리 계획하는 네비게이션 임플란트"',
      },
      {
        title: '통증을 줄이는 마취',
        body: '도포마취제와 마취 가글, 통증을 줄여 주는 마취 장비를 함께 씁니다.',
        source: `lib/clinic.ts STRENGTHS.pain — "${strength('pain').slice(0, 30)}…"`,
      },
      {
        title: '엄격한 위생관리',
        body: '전 직원 대상 교육과 매일 배치되는 위생관리 담당자를 통해 관리합니다.',
        source: 'lib/clinic.ts STRENGTHS.hygiene — "전 직원 대상 교육과 위생관리 담당자의 매일 확인"',
      },
    ],
  },
  {
    key: '내원 편의',
    label: '오시기 편하게',
    cards: [
      {
        title: '화 · 목 야간진료',
        body: `화요일과 목요일은 ${hoursOf('화 · 목')} 진료합니다. 낮에 시간 내기 어려운 분들을 위한 시간입니다.`,
        source: 'lib/clinic.ts UNVERIFIED.hours — 화·목 09:30-20:30 (야간 진료)',
      },
      {
        title: '토요일 진료',
        body: `토요일도 ${hoursOf('토요일')} 진료합니다.`,
        source: 'lib/clinic.ts UNVERIFIED.hours — 토요일 09:30-14:00',
      },
      {
        title: '주차 무료',
        body: `${CLINIC.parking.type}을 ${CLINIC.parking.fee}로 이용하실 수 있습니다.`,
        source: 'lib/clinic.ts CLINIC.parking — 건물 내 기계식 주차장 · 무료 (2026-08 오너 확인)',
      },
      {
        title: '치료 후 보증제도',
        body: '치료받은 치아는 보증제도를 통해 지속적으로 관리합니다.',
        source: 'lib/clinic.ts STRENGTHS.warranty. ⚠️ 보증 기간·범위는 아직 확인 전이라 문장에 넣지 않았다',
      },
    ],
  },
];

/** 카드 총 개수 — 섹션 제목의 "N가지" 에 쓴다. 손으로 세지 않는다. */
export const WHY_US_COUNT = WHY_US.reduce((n, g) => n + g.cards.length, 0);
