import { UNVERIFIED } from './clinic';

/**
 * 지금 진료 중인지 — 헤더 배지가 쓴다.
 *
 * ★★ 틀린 '진료 중' 은 환자를 헛걸음시킨다 ★★
 *   이 값이 틀리면 사람이 차를 몰고 왔다가 닫힌 문을 본다. 그래서 **애매하면 낮춰 말한다.**
 *   확실히 여는 시간에만 '진료 중' 이라 하고, 나머지는 전부 '지금은 진료 시간이 아닙니다' 다.
 *
 * ★ 시간대를 서울로 못 박는다
 *   방문자 기기가 어느 시간대에 있든 병원의 시계는 서울이다. `Intl` 로 변환한다.
 *   (기기 시계 자체가 틀린 경우까지는 어쩔 수 없다 — 웹에서 알 방법이 없다.)
 *
 * ★★ 공휴일은 판정하지 못한다 ★★
 *   병원은 '일요일·공휴일 휴진' 인데 우리에겐 공휴일 달력이 없다. 설·추석은 해마다
 *   날짜가 바뀌어 고정 목록으로도 못 맞춘다. **그래서 배지가 단정하지 않게 만든다** —
 *   문구는 '진료 중' 이 아니라 상태 표시이고, 옆에 늘 '공휴일 휴진' 을 함께 밝히며,
 *   누르면 진료시간 전체가 있는 페이지로 간다.
 *   ⚠️ 공휴일 목록을 넣게 되면 여기서 `holiday` 를 추가하고 배지 문구도 함께 고칠 것.
 */
export type OpenState = 'open' | 'lunch' | 'closed' | 'dayoff';

export interface OpenStatus {
  state: OpenState;
  /** 배지에 그대로 쓰는 짧은 문구. */
  label: string;
  /** 보조 설명 — 다음에 여는 때 등. 없으면 빈 문자열. */
  detail: string;
}

/** '09:30' → 570(분). 계산을 분 단위로 통일해 비교 실수를 없앤다. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

/**
 * 점심시간.
 *
 * ⚠️ 원본 진료시간표는 점심을 요일 구분 없이 한 줄로만 적어 뒀다(13:00-14:30).
 *   그런데 토요일은 14:00 에 닫으므로 그대로 적용하면 마지막 한 시간이 통째로 점심이 된다.
 *   확인 전까지는 **평일에만** 적용한다. 이 방향이 안전하다 — 점심이 아닌데 점심이라고 하면
 *   환자가 전화를 한 번 더 할 뿐이지만, 반대로는 헛걸음이 된다.
 */
const LUNCH = { open: '13:00', close: '14:30' } as const;

/** 서울 기준 '요일 인덱스 + 하루 중 분' 을 얻는다. */
export function seoulNow(now: Date): { day: number; minutes: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Seoul',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const day = DAY_INDEX[parts.weekday as string] ?? 0;
  // hour 가 '24' 로 오는 구현이 있어 24는 0으로 접는다.
  const hour = Number(parts.hour) % 24;
  return { day, minutes: hour * 60 + Number(parts.minute) };
}

export function getOpenStatus(now: Date = new Date()): OpenStatus {
  const { day, minutes } = seoulNow(now);
  const row = UNVERIFIED.hours.rows.find((r) => DAY_INDEX[r.day] === day);

  if (!row) {
    return { state: 'dayoff', label: '오늘 휴진', detail: '일요일·공휴일은 쉽니다' };
  }

  const open = toMinutes(row.open);
  const close = toMinutes(row.close);

  if (minutes < open) {
    return { state: 'closed', label: '진료 전', detail: `오늘 ${row.open}부터` };
  }
  if (minutes >= close) {
    return { state: 'closed', label: '진료 종료', detail: '' };
  }

  const isWeekday = day >= 1 && day <= 5;
  if (isWeekday && minutes >= toMinutes(LUNCH.open) && minutes < toMinutes(LUNCH.close)) {
    return { state: 'lunch', label: '점심시간', detail: `${LUNCH.close}부터 진료` };
  }

  return { state: 'open', label: '진료 중', detail: `오늘 ${row.close}까지` };
}
