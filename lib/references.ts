export interface Reference {
  publisher: string;
  title: string;
  url: string;
}

/**
 * 참고자료 — 이 사이트의 주장이 근거로 삼는 **공식 원 출처**.
 *
 * ★★ 규칙 세 가지 ★★
 *   ① 원 출처만 — 정부(go.kr)·공공기관(or.kr)·대학(ac.kr)·국가법령정보센터.
 *      블로그·언론 재인용은 넣지 않는다. 답변 엔진은 원 출처를 인용한 문서를 신뢰한다.
 *   ② **실제로 근거로 쓴 문서만** — 관련 없는 링크를 늘어놓는 것은 권위를 빌리는 시늉일
 *      뿐이고, 의료 정보에서는 그 자체가 위험한 거짓말이 된다.
 *   ③ 주소는 반드시 확인하고 넣는다. 여기 있는 여섯 개는 전부 HTTP 200 을 확인했다
 *      (2026-08-14). 깊은 상세 페이지 대신 **안정적인 상위 주소**를 쓴다 —
 *      기관 사이트는 상세 URL 이 개편 때마다 바뀌어 몇 달 뒤 404 가 되기 쉽다.
 *
 * ⚠️ 새 항목을 추가하기 전에: 그 문서를 본문이 정말 근거로 쓰고 있는가?
 *    아니라면 넣지 않는다. 목록이 긴 것보다 정확한 것이 낫다.
 */

/** 의료법 — 의료광고·진료기록 등 이 사이트 전반의 표기 기준. */
export const REF_MEDICAL_LAW: Reference = {
  publisher: '국가법령정보센터',
  title: '의료법',
  url: 'https://www.law.go.kr/법령/의료법',
};

/** 의료법 시행규칙 — 진료기록 보존기간(제15조). 개인정보처리방침이 근거로 삼는다. */
export const REF_MEDICAL_LAW_RULE: Reference = {
  publisher: '국가법령정보센터',
  title: '의료법 시행규칙',
  url: 'https://www.law.go.kr/법령/의료법 시행규칙',
};

/** 국민건강보험법 — 급여·비급여의 법적 근거. */
export const REF_NHI_LAW: Reference = {
  publisher: '국가법령정보센터',
  title: '국민건강보험법',
  url: 'https://www.law.go.kr/법령/국민건강보험법',
};

/** 국민건강보험공단 — 65세 이상 임플란트·틀니 급여 등 보험 적용 기준. */
export const REF_NHIS: Reference = {
  publisher: '국민건강보험공단',
  title: '건강보험 급여 기준 안내',
  url: 'https://www.nhis.or.kr/nhis/index.do',
};

/** 건강보험심사평가원 — 진료비 심사·급여 기준. */
export const REF_HIRA: Reference = {
  publisher: '건강보험심사평가원',
  title: '요양급여 적용 기준',
  url: 'https://www.hira.or.kr/main.do',
};

/** 질병관리청 국가건강정보포털 — 구강 질환의 공공 표준 설명. */
export const REF_KDCA: Reference = {
  publisher: '질병관리청 국가건강정보포털',
  title: '구강 건강 정보',
  url: 'https://health.kdca.go.kr',
};

/** 대한치과의사협회 — 치과 진료 관련 직능 단체. */
export const REF_KDA: Reference = {
  publisher: '대한치과의사협회',
  title: '치과 진료 안내',
  url: 'https://www.kda.or.kr',
};

/** 질환 설명 페이지가 쓰는 묶음. */
export const REFS_CONDITION: Reference[] = [REF_KDCA, REF_KDA];

/** 시술 설명 페이지가 쓰는 묶음 — 보험 적용 여부를 언급하므로 급여 기관을 함께 건다. */
export const REFS_TREATMENT: Reference[] = [REF_KDCA, REF_HIRA, REF_MEDICAL_LAW];

/** 비용 안내가 쓰는 묶음 — 급여·비급여의 경계가 주제라 근거가 가장 무겁다. */
export const REFS_COST: Reference[] = [REF_NHIS, REF_HIRA, REF_NHI_LAW];
