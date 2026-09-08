/**
 * 지역 페이지 데이터 — "행신동 치과", "대곡역 치과", "별빛마을 치과" 같은 지역 질의에 **페이지 하나씩** 대응한다.
 *
 * ★★ 검색어 하나 = 페이지 하나 ★★
 *   제목·H1 에는 그 지역 이름 하나만 넣는다. "화정동 | 대곡역 | 대정역 | 치과" 처럼 여러 지역을 한 제목에
 *   몰아 넣으면 검색에는 잡혀도 읽는 사람이 믿지 않는다. 지역이 늘면 항목을 늘리지 제목을 늘리지 않는다.
 *
 * ★★ 지어내지 않는다 ★★
 *   · 좌표는 OSM Nominatim 실측(2026-09-08). 거리는 병원 좌표와의 **직선거리 계산값**이다.
 *   · 정거장 수는 3호선 역 순서(lib/site.ts LINE3)에서 계산한다.
 *   · '몇 분' 같은 소요 시간은 적지 않는다 — 사람·시간대마다 다르고 확인할 수 없다.
 *   · 버스 노선 번호는 바뀌므로 적지 않는다.
 *   · 좌표를 못 구한 곳(교외선 대정역)은 lat/lng 를 비워 두고 거리를 표시하지 않는다.
 */
import { CLINIC_GEO, distanceM, stopsToHwajeong, STATION, STATION_DISTANCE_M, fmtDistance, type Line3Station } from './site';

export interface Region {
  slug: string;
  /** 사람이 부르는 이름. */
  name: string;
  /** 검색어 그대로 — 제목과 H1 에 쓴다. */
  keyword: string;
  /** 행정 단위 설명. */
  kind: '동' | '역' | '구' | '시' | '생활권' | '단지' | '기관';
  lat?: number;
  lng?: number;
  /** 가장 가까운 3호선 역(있을 때). 정거장 수 계산에 쓴다. */
  line3?: Line3Station;
  /** 다른 노선 역 안내. */
  otherRail?: string;
  /** 이 동네에서 오는 길 — 사실만. */
  transit: string[];
  /** 이 지역 안내 첫 단락 — 지역마다 다르게 쓴다(같은 문장을 돌려쓰지 않는다). */
  intro: string;
  /** 지도에서 함께 보이는 이웃 — 안내 문장과 관련 지역 링크에 쓴다. */
  nearby?: string[];
  /**
   * 거리 등급 — core(걸어서·한 정거장) · mid(버스·차 한 번) 은 진료별 페이지까지, far 는 안내 한 장만.
   * 멀리 있는 동네에 진료 페이지를 여섯 장씩 두면 노출돼도 내원으로 이어지지 않고 얇은 쪽만 늘어난다.
   */
  tier: 'core' | 'mid' | 'far';
  /** 짧은 검색어 형태(예: '행신 치과'). 제목은 정식 표기 하나만 쓰고, 이 형태는 설명·본문·키워드에 넣는다. */
  alt?: string;
}

export const REGIONS: Region[] = [
  /* ───────── 화정 생활권 ───────── */
  {
    slug: 'hwajeong',
    tier: 'core',
    alt: '화정 치과',
    name: '화정동',
    keyword: '화정동 치과',
    kind: '동',
    lat: 37.6351667,
    lng: 126.8328241,
    line3: '화정',
    transit: ['3호선 화정역 하차, 덕양구청 방면', '화정동 안에서는 걸어서 오시는 분이 많습니다'],
    intro:
      '동그라미치과의원은 화정동 안, 화신로260번길 51 현창빌딩 3층에 있습니다. 화정역과 덕양구청이 있는 화정동 중심 생활권이라 걸어서 오시는 분이 많고, 화·목요일은 저녁 8시 30분까지 진료해 퇴근 후 방문도 가능합니다.',
    nearby: ['hwajeong-1', 'hwajeong-2', 'hwajeong-station', 'deogyang-office'],
  },
  {
    slug: 'hwajeong-1',
    tier: 'core',
    alt: '화정1동치과',
    name: '화정1동',
    keyword: '화정1동 치과',
    kind: '동',
    lat: 37.6423208,
    lng: 126.8329014,
    line3: '화정',
    transit: ['화정1동에서 화정역 방면으로 걸어오거나 시내버스 이용', '3호선 화정역 하차, 덕양구청 방면'],
    intro:
      '화정1동은 화정역 북쪽, 달빛마을 3단지·화수고등학교·화정도서관·명지병원이 있는 동네입니다. 병원은 화정역 남쪽 화정2동 쪽에 있어, 화정1동에서는 화정역을 지나 덕양구청 방면으로 내려오시면 됩니다. 달빛마을에서 병원까지 직선거리 약 1km 안팎이라 걸어오시는 분도, 버스로 두세 정거장 오시는 분도 있습니다.',
    nearby: ['hwajeong', 'dalbit', 'eunbit', 'hwajeong-station'],
  },
  {
    slug: 'hwajeong-2',
    tier: 'core',
    alt: '화정2동치과',
    name: '화정2동',
    keyword: '화정2동 치과',
    kind: '동',
    lat: 37.6318578,
    lng: 126.8363915,
    line3: '화정',
    transit: ['화정2동 안에서는 걸어서', '3호선 화정역 하차 후 덕양구청 방면'],
    intro:
      '동그라미치과의원이 있는 바로 그 동네입니다. 화정2동은 화정역 남쪽으로 은빛마을 11단지·별빛마을 8단지·옥빛마을 15단지와 고양경찰서가 있는 구역이고, 병원은 그 한가운데 화신로260번길 현창빌딩 3층입니다. 단지 대부분에서 걸어서 오실 수 있습니다.',
    nearby: ['byeolbit', 'eunbit', 'okbit', 'hwajeong'],
  },
  {
    slug: 'hwajeong-station',
    tier: 'core',
    alt: '화정역치과',
    name: '화정역',
    keyword: '화정역 치과',
    kind: '역',
    lat: STATION.lat,
    lng: STATION.lng,
    line3: '화정',
    transit: ['3호선 화정역에서 병원까지 직선거리 ' + fmtDistance(STATION_DISTANCE_M), '대곡·원당·원흥·삼송·구파발 방면 모두 환승 없이 도착'],
    intro: `지하철 3호선 화정역에서 병원까지 직선거리 ${fmtDistance(STATION_DISTANCE_M)}입니다. 역에서 덕양구청 방면으로 나와 화중로를 따라오시면 화신로260번길 현창빌딩이 보입니다. 3호선을 타고 오시는 대곡·원당·원흥·삼송·구파발 방면 모두 갈아타지 않고 오실 수 있습니다.`,
    nearby: ['hwajeong', 'deogyang-office', 'daegok-station'],
  },
  {
    slug: 'deogyang-office',
    tier: 'core',
    alt: '덕양구청 치과',
    name: '덕양구청',
    keyword: '덕양구청 근처 치과',
    kind: '기관',
    lat: 37.6374679,
    lng: 126.8323245,
    line3: '화정',
    transit: ['덕양구청에서 화중로를 따라 남쪽으로 걸어서', '3호선 화정역(화정역·덕양구청 출구) 인근'],
    intro:
      '덕양구청은 화정역 바로 옆에 있고, 병원은 구청에서 화중로를 따라 남쪽으로 조금 내려온 화신로260번길에 있습니다. 구청 볼일을 보고 오시는 분, 구청 인근 직장에서 점심시간이나 퇴근 후에 오시는 분이 많습니다. 화·목요일은 저녁 8시 30분까지 진료합니다.',
    nearby: ['hwajeong-station', 'hwajeong', 'hwajeong-1'],
  },

  /* ───────── 화정동 아파트 단지 ───────── */
  {
    slug: 'byeolbit',
    tier: 'core',
    alt: '별빛마을 8단지 치과',
    name: '별빛마을',
    keyword: '별빛마을 치과',
    kind: '단지',
    lat: 37.6316104,
    lng: 126.8302506,
    line3: '화정',
    transit: ['별빛마을 8단지·롯데마트에서 걸어서', '차량 이용 시 건물 내 기계식 주차 무료'],
    intro:
      '별빛마을 8단지(부영)는 롯데마트 화정점과 붙어 있는 화정2동 단지이고, 병원은 단지에서 동쪽으로 길 하나 건너 화신로260번길 현창빌딩입니다. 직선거리로 300m 가 안 되는 거리라 유모차나 어르신 걸음으로도 부담이 없습니다.',
    nearby: ['hwajeong-2', 'okbit', 'eunbit'],
  },
  {
    slug: 'eunbit',
    tier: 'core',
    alt: '은빛마을 11단지 치과',
    name: '은빛마을',
    keyword: '은빛마을 치과',
    kind: '단지',
    lat: 37.6349704,
    lng: 126.8344358,
    line3: '화정',
    transit: ['은빛마을 11단지에서 걸어서', '3호선 화정역 인근'],
    intro:
      '은빛마을 11단지(부영)는 화정역 동남쪽, 백양로 쪽 단지입니다. 병원은 단지에서 남서쪽으로 직선거리 300m 남짓이라 단지 정문에서 걸어서 오시면 됩니다. 화정도서관 쪽에서 오셔도 같은 길입니다.',
    nearby: ['hwajeong-2', 'hwajeong-1', 'byeolbit'],
  },
  {
    slug: 'okbit',
    tier: 'core',
    alt: '옥빛마을 15단지 치과',
    name: '옥빛마을',
    keyword: '옥빛마을 치과',
    kind: '단지',
    lat: 37.6295026,
    lng: 126.8348637,
    line3: '화정',
    transit: ['옥빛마을 15·17단지에서 고양경찰서 방면으로 걸어서', '차량 이용 시 건물 내 기계식 주차 무료'],
    intro:
      '옥빛마을 15·17단지는 화정2동과 행신3동 경계, 고양경찰서 남쪽에 있는 단지입니다. 병원은 단지에서 북쪽으로 직선거리 500m 안팎이라 경찰서 방면으로 올라오시면 화신로260번길이 나옵니다. 행신3동 쪽 단지에서 화정역 방면 치과를 찾으실 때 가장 가까운 편에 속합니다.',
    nearby: ['hwajeong-2', 'haetbit', 'haengsin-3'],
  },
  {
    slug: 'haetbit',
    tier: 'core',
    alt: '햇빛마을 21단지 치과',
    name: '햇빛마을',
    keyword: '햇빛마을 치과',
    kind: '단지',
    lat: 37.6278083,
    lng: 126.841069,
    line3: '화정',
    transit: ['햇빛마을 21·24단지에서 화신로를 따라 북서쪽으로', '화정역 방면 시내버스 또는 차량'],
    intro:
      '햇빛마을 21단지·24단지는 행신3동 화신로 변에 있는 단지입니다. 병원 주소도 화신로260번길이라 같은 길을 따라 북서쪽으로 올라오시면 됩니다. 21단지에서 직선거리 약 1km, 24단지에서 약 1.4km 이고, 차로 오시면 건물 안 기계식 주차장을 무료로 이용하실 수 있습니다.',
    nearby: ['haengsin-3', 'haengsin-4', 'okbit'],
  },
  {
    slug: 'dalbit',
    tier: 'core',
    alt: '달빛마을 3단지 치과',
    name: '달빛마을',
    keyword: '달빛마을 치과',
    kind: '단지',
    lat: 37.6430049,
    lng: 126.833604,
    line3: '화정',
    transit: ['달빛마을 3단지·명지병원 앞에서 화정역 방면 시내버스', '3호선 화정역 하차 후 덕양구청 방면'],
    intro:
      '달빛마을 3단지(신안)는 화정1동 북쪽, 명지병원과 화수고등학교 인근 단지입니다. 병원까지 직선거리 약 1.1km 로 화정역을 지나 남쪽으로 내려오는 길이며, 명지병원 앞에서 화정역 방면 버스를 타시거나 화중로를 따라 걸어오실 수 있습니다.',
    nearby: ['hwajeong-1', 'eunbit', 'hwajeong-station'],
  },

  /* ───────── 이웃 역 ───────── */
  {
    slug: 'daegok-station',
    tier: 'mid',
    alt: '대곡역치과',
    name: '대곡역',
    keyword: '대곡역 치과',
    kind: '역',
    lat: 37.6317813,
    lng: 126.8102838,
    line3: '대곡',
    otherRail: '경의중앙선 · 서해선 · GTX-A 환승역',
    transit: ['3호선으로 화정역까지 한 정거장', '경의중앙선·서해선·GTX-A 에서 3호선으로 갈아타는 환승역'],
    intro:
      '대곡역은 3호선·경의중앙선·서해선·GTX-A 가 만나는 환승역이고, 화정역은 대곡역에서 3호선으로 바로 다음 정거장입니다. 일산·능곡·행신 쪽에서 경의중앙선이나 서해선으로 오시는 분, GTX-A 로 서울에서 오시는 분 모두 대곡역에서 3호선으로 한 번만 갈아타시면 됩니다. 대곡역에서 병원까지 직선거리 약 2km 입니다.',
    nearby: ['hwajeong-station', 'daejeong-station', 'neunggok-station'],
  },
  {
    slug: 'daejeong-station',
    tier: 'mid',
    alt: '대정역치과',
    name: '대정역',
    keyword: '대정역 치과',
    kind: '역',
    line3: '대곡',
    otherRail: '교외선(대곡–의정부) 대정역',
    transit: ['교외선으로 대곡역까지 한 정거장 이동 후 3호선 환승, 화정역까지 한 정거장', '교외선은 운행 간격이 길어 시간표를 먼저 확인하시는 것이 좋습니다'],
    intro:
      '대정역은 대곡역에서 의정부 방면으로 이어지는 교외선의 첫 역으로, 대장천 건너 대장동 쪽에 있습니다. 병원으로 오시려면 교외선으로 대곡역까지 한 정거장 이동한 뒤 3호선으로 갈아타 화정역에서 내리시면 됩니다. 교외선은 하루 운행 횟수가 많지 않으니 돌아가실 시간표를 미리 확인해 두시면 편합니다.',
    nearby: ['daegok-station', 'hwajeong-station'],
  },
  {
    slug: 'neunggok-station',
    tier: 'mid',
    alt: '능곡역치과',
    name: '능곡역',
    keyword: '능곡역 치과',
    kind: '역',
    lat: 37.6194209,
    lng: 126.8212567,
    line3: '대곡',
    otherRail: '경의중앙선 · 서해선 능곡역',
    transit: ['경의중앙선 또는 서해선으로 대곡역까지 한 정거장, 3호선 환승 후 화정역 한 정거장', '능곡역에서 화정역 방면 시내버스'],
    intro:
      '능곡역은 경의중앙선과 서해선이 서는 역이고, 병원까지 직선거리 약 1.8km 입니다. 지하철로는 대곡역에서 3호선으로 갈아타 화정역에서 내리시고, 버스로는 화정역 방면 노선을 타시면 됩니다. 능곡 생활권 안내는 능곡 페이지에 따로 있습니다.',
    nearby: ['neunggok', 'daegok-station', 'haengsin-1'],
  },
  {
    slug: 'neunggok',
    tier: 'mid',
    alt: '능곡동 치과',
    name: '능곡',
    keyword: '능곡 치과',
    kind: '생활권',
    lat: 37.6194209,
    lng: 126.8212567,
    otherRail: '경의중앙선 능곡역 · 3호선/경의중앙선 대곡역',
    line3: '대곡',
    transit: ['경의중앙선 능곡역에서 대곡역 이동 후 3호선 환승, 화정역까지 한 정거장', '대곡역에서는 3호선으로 바로 한 정거장'],
    intro:
      '능곡과 토당동 일대에서는 대곡역이 가장 편한 길입니다. 대곡역은 3호선과 경의중앙선이 만나는 환승역이고, 화정역은 대곡역 바로 다음 정거장입니다. 대표원장이 능곡서울치과 대표원장으로 진료했던 이력이 있어 능곡에서 이어서 다니시는 분도 계십니다.',
    nearby: ['neunggok-station', 'daegok-station', 'haengsin-1'],
  },

  /* ───────── 행신 ───────── */
  {
    slug: 'haengsin',
    tier: 'mid',
    alt: '행신 치과',
    name: '행신동',
    keyword: '행신동 치과',
    kind: '동',
    lat: 37.6194469,
    lng: 126.8372169,
    otherRail: '경의중앙선 행신역',
    transit: ['경의중앙선 행신역에서 대곡역으로 이동 후 3호선 환승, 화정역 하차', '행신동에서 화정역 방면 시내버스 이용'],
    intro:
      '행신동은 화정동 바로 남쪽에 붙어 있는 동네입니다. 행신역 일대에서 병원까지 직선거리 약 1.6km 안팎이라 차로도, 버스로도 가깝습니다. 행신동에서 오시는 분은 화정역 방면 버스를 타시거나, 경의중앙선으로 대곡역까지 와서 3호선으로 한 정거장 이동하시면 됩니다.',
    nearby: ['haengsin-1', 'haengsin-3', 'haengsin-4', 'haetbit'],
  },
  {
    slug: 'haengsin-1',
    tier: 'mid',
    alt: '행신1동치과',
    name: '행신1동',
    keyword: '행신1동 치과',
    kind: '동',
    lat: 37.6220625,
    lng: 126.8331154,
    line3: '화정',
    transit: ['행신1동에서 화정역 방면 시내버스 또는 차량', '경의중앙선 능곡역·행신역에서 대곡역 환승 후 3호선 화정역'],
    intro:
      '행신1동은 능곡고등학교·고양시립행신도서관·서광라이프 아파트가 있는 행신동 서쪽 구역입니다. 병원까지 직선거리 약 1.2km 로, 화정역 방면으로 올라오시면 됩니다. 능곡역과 행신역 사이에 있어 어느 쪽 역에서든 대곡역을 거쳐 3호선으로 오실 수도 있습니다.',
    nearby: ['haengsin', 'neunggok-station', 'haengsin-3'],
  },
  {
    slug: 'haengsin-3',
    tier: 'mid',
    alt: '행신3동치과',
    name: '행신3동',
    keyword: '행신3동 치과',
    kind: '동',
    lat: 37.6249178,
    lng: 126.8394023,
    line3: '화정',
    transit: ['화신로를 따라 북서쪽으로 걸어서 또는 시내버스', '차량 이용 시 건물 내 기계식 주차 무료'],
    intro:
      '행신3동은 옥빛마을·햇빛마을 21단지와 가라산이 있는, 행신동에서 화정동에 가장 가까운 구역입니다. 병원 주소인 화신로260번길이 이 동네를 지나는 화신로에서 이어지므로, 화신로를 따라 북서쪽으로 오시면 됩니다. 직선거리 약 1km 안팎입니다.',
    nearby: ['okbit', 'haetbit', 'haengsin-4', 'hwajeong-2'],
  },
  {
    slug: 'haengsin-4',
    tier: 'mid',
    alt: '행신4동치과',
    name: '행신4동',
    keyword: '행신4동 치과',
    kind: '동',
    lat: 37.6203524,
    lng: 126.8482991,
    line3: '화정',
    transit: ['화신로 방면 시내버스 또는 차량', '차량 이용 시 건물 내 기계식 주차 무료'],
    intro:
      '행신4동은 햇빛마을 24단지·휴먼시아·서정고등학교가 있는 행신동 동쪽 구역입니다. 병원까지 직선거리 약 2km 로, 화신로를 따라 화정역 방면으로 오시거나 차로 오시면 건물 안 기계식 주차장을 무료로 이용하실 수 있습니다.',
    nearby: ['haetbit', 'haengsin-3', 'haengsin'],
  },

  /* ───────── 동쪽 · 흥도 · 원흥 ───────── */
  {
    slug: 'heungdo',
    tier: 'mid',
    alt: '흥도 치과',
    name: '흥도동',
    keyword: '흥도동 치과',
    kind: '동',
    lat: 37.6313124,
    lng: 126.8620107,
    transit: ['흥도동·도내동에서 화정역 방면 시내버스', '차량 이용 시 건물 내 기계식 주차 무료'],
    intro:
      '흥도동은 화정동 동쪽, 이케아 고양점과 고양휴게소가 있는 도내동·원흥지구 일대를 아우르는 동입니다. 병원까지 직선거리 약 2.6km 이고, 차로 오시면 건물 안 기계식 주차장을 무료로 이용하실 수 있습니다. 도래울마을에서 오시는 길은 도래울 페이지에 따로 적었습니다.',
    nearby: ['doraeul', 'wonheung', 'haengsin-4'],
  },
  {
    slug: 'doraeul',
    tier: 'mid',
    alt: '도래울마을 치과',
    name: '도래울마을',
    keyword: '도래울 치과',
    kind: '단지',
    lat: 37.6266911,
    lng: 126.8618519,
    transit: ['도래울마을에서 화정역 방면 시내버스', '차량 이용 시 건물 내 기계식 주차 무료'],
    intro:
      '도래울마을은 원흥지구 도내동, 이케아·롯데아울렛 고양점 바로 옆 단지들입니다. 병원까지 직선거리 약 2.6km 로 차로 오시는 분이 많고, 건물 안 기계식 주차장을 무료로 이용하실 수 있습니다. 화·목요일 저녁 8시 30분까지 진료하므로 퇴근길에 들르실 수 있습니다.',
    nearby: ['heungdo', 'wonheung', 'haengsin-4'],
  },
  {
    slug: 'wondang',
    tier: 'mid',
    alt: '성사동 치과',
    name: '원당·성사동',
    keyword: '원당 치과',
    kind: '생활권',
    lat: 37.6538104,
    lng: 126.8426076,
    line3: '원당',
    transit: ['3호선 원당역에서 화정역까지 한 정거장'],
    intro:
      '원당역과 성사동 일대는 화정역에서 3호선으로 한 정거장 거리입니다. 원당 재래시장·성사동 주거지에서 병원까지 직선거리 약 2.3km 안팎이고, 원당역에서 지하철로 한 정거장이면 화정역입니다.',
    nearby: ['jugyo', 'hwajeong-1', 'hwajeong-station'],
  },
  {
    slug: 'jugyo',
    tier: 'mid',
    alt: '주교동치과',
    name: '주교동',
    keyword: '주교동 치과',
    kind: '동',
    lat: 37.6600889,
    lng: 126.8268991,
    line3: '원당',
    transit: ['원당역까지 이동 후 3호선으로 한 정거장', '주교동에서 화정역 방면 시내버스 이용'],
    intro:
      '주교동은 고양시청이 있는 원당 생활권의 북쪽 동네입니다. 원당역에서 3호선으로 한 정거장이면 화정역이고, 차로 오시면 건물 안 기계식 주차장을 무료로 이용하실 수 있습니다.',
    nearby: ['wondang', 'hwajeong-1'],
  },
  {
    slug: 'wonheung',
    tier: 'far',
    alt: '원흥동 치과',
    name: '원흥동',
    keyword: '원흥 치과',
    kind: '동',
    lat: 37.6450752,
    lng: 126.8726383,
    line3: '원흥',
    transit: ['3호선 원흥역에서 화정역까지 두 정거장'],
    intro:
      '원흥역 일대에서 화정역은 3호선으로 두 정거장입니다. 원흥지구에서 화정동까지 직선거리 약 3.7km로, 지하철로도 차로도 부담 없는 거리입니다.',
    nearby: ['doraeul', 'heungdo', 'samsong'],
  },
  {
    slug: 'samsong',
    tier: 'far',
    alt: '삼송동 치과',
    name: '삼송동',
    keyword: '삼송 치과',
    kind: '동',
    lat: 37.65184,
    lng: 126.8897232,
    line3: '삼송',
    transit: ['3호선 삼송역에서 화정역까지 세 정거장'],
    intro:
      '삼송역 일대에서 화정역까지는 3호선으로 세 정거장입니다. 삼송지구에서 병원까지 직선거리 약 5.4km이며, 갈아타지 않고 한 노선으로 오실 수 있습니다.',
    nearby: ['wonheung'],
  },
  {
    slug: 'deogyang',
    tier: 'mid',
    alt: '고양 덕양구 치과',
    name: '덕양구',
    keyword: '덕양구 치과',
    kind: '구',
    lat: 37.6374679,
    lng: 126.8323245,
    line3: '화정',
    transit: ['덕양구 어디서든 3호선 화정역 또는 화정역 방면 버스'],
    intro:
      '동그라미치과의원은 고양시 덕양구의 중심인 화정동, 덕양구청 인근에 있습니다. 덕양구 어디서든 3호선 화정역 또는 화정역 방면 버스로 오실 수 있고, 통합치의학과 전문의 세 명이 자연치아 보존·신경치료·임플란트·사랑니 발치를 진료합니다.',
    nearby: ['hwajeong', 'haengsin', 'wondang', 'heungdo'],
  },
  {
    slug: 'goyang',
    tier: 'mid',
    alt: '고양 치과',
    name: '고양시',
    keyword: '고양시 치과',
    kind: '시',
    lat: 37.6351667,
    lng: 126.8328241,
    line3: '화정',
    transit: ['일산·원당·행신 어디서든 3호선 화정역 하차'],
    intro:
      '고양시 덕양구 화정동의 동그라미치과의원입니다. 일산·원당·행신 어디서든 3호선 화정역으로 오시면 되고, 뽑기 전에 살릴 수 있는지 먼저 확인하는 진료를 합니다. 고양시에서 치과를 고르실 때 확인하면 좋은 것들을 이 페이지에 정리했습니다.',
    nearby: ['deogyang', 'daegok-station', 'hwajeong-station'],
  },
];

export const regionBySlug = (slug: string) => REGIONS.find((r) => r.slug === slug);

/** 병원까지 직선거리(m). 좌표가 없으면 null — 거리를 지어내지 않는다. */
export function regionDistanceM(r: Region): number | null {
  if (r.lat === undefined || r.lng === undefined) return null;
  return Math.round(distanceM(CLINIC_GEO, { lat: r.lat, lng: r.lng }) / 10) * 10;
}

export function regionStops(r: Region): number | null {
  return r.line3 ? stopsToHwajeong(r.line3) : null;
}

/** 지도에서 이웃한 지역 — 같은 생활권끼리 서로 잇는다. */
export function regionNeighbors(r: Region): Region[] {
  return (r.nearby ?? []).map(regionBySlug).filter((x): x is Region => !!x && x.slug !== r.slug);
}

/** 지역×진료 조합에 넣을 진료 — 검색량이 큰 여섯 가지. */
export const AREA_TREATMENTS = ['implant', 'endodontic', 'cavity', 'periodontal', 'wisdom-tooth', 'save-natural-tooth'] as const;
