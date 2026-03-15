// 관계맵 데이터 — 사주 궁합 기반 인물/그룹 구조

export const FIXED_GROUPS = [
  { id: 'g1', name: 'A프로젝트 TF', category: '직장동료', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', groupMood: null, myRole: null, recentIssueSummary: '', stabilityScore: null, cx: 300, cy: 480 },
  { id: 'g2', name: '주말 러닝크루', category: '동호회', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', groupMood: null, myRole: null, recentIssueSummary: '', stabilityScore: null, cx: 600, cy: 280 },
  { id: 'g3', name: '동네 베프들', category: '친구', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', groupMood: null, myRole: null, recentIssueSummary: '', stabilityScore: null, cx: 900, cy: 480 },
  { id: 'g4', name: '대학 과 동기', category: '학교', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', groupMood: null, myRole: null, recentIssueSummary: '', stabilityScore: null, cx: 250, cy: 240 },
  { id: 'g5', name: '가족 모임', category: '가족', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', groupMood: null, myRole: null, recentIssueSummary: '', stabilityScore: null, cx: 950, cy: 240 },
];

export const GROUP_SLOTS = [
  { cx: 160, cy: 650 }, { cx: 1040, cy: 650 }, { cx: 450, cy: 180 },
  { cx: 750, cy: 180 }, { cx: 600, cy: 580 }, { cx: 200, cy: 420 },
  { cx: 1000, cy: 420 }, { cx: 400, cy: 700 },
];

export const FIXED_NODES = [
  // ── 확인 완료 (checked) ──
  {
    id: 'c1', name: '조멀티', groups: ['g1', 'g2'],
    score: 91, status: 'checked',
    tags: ['일간 합 관계', '소통 시너지', '공동 추진력'],
    summary: '서로의 일간이 합을 이루어 의사소통이 원활하고, 함께할 때 추진력이 배가되는 관계입니다.',
    detailSummary: '당신의 갑목(甲木)과 조멀티님의 기토(己土)가 갑기합(甲己合)을 이루고 있어, 처음 만나도 빠르게 호흡이 맞는 구조입니다. 특히 월지(月支)의 조화가 좋아 업무 협업에서 높은 시너지를 기대할 수 있어요. 다만 편인(偏印) 성분이 서로 겹치는 부분이 있어, 장시간 밀착 시 사고방식 충돌이 올 수 있으니 적절한 거리를 유지하면 오래 좋은 관계를 이어갈 수 있습니다.',
    roleLabel: '연결자',
    isDetailUnlocked: true, isRecent: false, isMatchable: true,
    badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]',
    privateLabels: [],
    x: 440, y: 380
  },
  {
    id: 'c2', name: '김서하', groups: ['g3'],
    score: 84, status: 'checked',
    tags: ['정서적 안정', '인성 보완형', '장기적 신뢰'],
    summary: '당신에게 부족한 인성(印星) 에너지를 보완해주어, 함께 있으면 마음이 편안해지는 관계입니다.',
    detailSummary: '김서하님의 사주에서 정인(正印)과 편인(偏印)이 강하게 작용하고 있어, 당신의 비겁(比劫) 위주 구조에 안정감을 불어넣는 역할을 합니다. 감정 소모가 적고 시간이 지날수록 신뢰가 깊어지는 타입이에요. 다만 서로의 식상(食傷) 에너지가 약한 편이라, 새로운 도전보다는 안정적 유지에 강점이 있는 관계입니다. 중요한 결정을 앞두고 조언을 구하기에 좋은 상대예요.',
    roleLabel: '완충자',
    isDetailUnlocked: true, isRecent: false, isMatchable: true,
    badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
    privateLabels: [],
    x: 930, y: 440
  },
  {
    id: 'c3', name: '박준영', groups: ['g1'],
    score: 65, status: 'checked',
    tags: ['비겁 충돌 가능', '주도권 경쟁', '성과 자극'],
    summary: '비겁(比劫) 에너지가 서로 강해 협업 시 좋은 성과를 내지만, 주도권 충돌 가능성이 있습니다.',
    detailSummary: '박준영님과 당신은 모두 비겁(比劫)이 강한 구조라 서로에게 자극이 됩니다. 같은 방향을 볼 때는 강력한 팀이 되지만, 책임 범위가 겹치면 미세한 긴장감이 커질 수 있어요. 월지(月支)에서 형(刑) 관계가 있어 업무 압박이 큰 시기에 마찰이 표면화되기 쉽습니다. 서로의 영역을 명확히 구분하고 성과를 인정해주는 방식이 이 관계를 건강하게 유지하는 핵심입니다.',
    roleLabel: '경쟁자',
    isDetailUnlocked: false, isRecent: false, isMatchable: false,
    badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]',
    privateLabels: [],
    x: 250, y: 440
  },
  {
    id: 'c4', name: '이민지', groups: ['g1'],
    score: 78, status: 'checked',
    tags: ['식상 활성', '아이디어 교류', '가벼운 에너지'],
    summary: '식상(食傷)의 조화가 좋아 대화가 즐겁고, 새로운 아이디어를 주고받기에 좋은 관계입니다.',
    detailSummary: '이민지님의 식신(食神)이 당신의 정재(正財)를 생(生)해주는 구조라, 함께하면 실질적인 이득으로 연결되기 쉬운 관계입니다. 가벼운 에너지로 소통하면서도 결과물이 따라오는 타입이에요. 다만 편관(偏官) 성분이 약해 위기 상황에서의 결속력은 보통 수준이며, 깊은 감정 교류보다는 활동 기반의 관계에서 더 빛을 발합니다.',
    roleLabel: '참여자',
    isDetailUnlocked: false, isRecent: true, isMatchable: true,
    badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
    privateLabels: [],
    x: 340, y: 530
  },
  {
    id: 'c5', name: '최현우', groups: ['g2'],
    score: 88, status: 'checked',
    tags: ['식상 과다', '에너지 전환', '활동적 궁합'],
    summary: '식상(食傷) 에너지가 넘쳐 함께하면 활기가 생기고, 정체된 분위기를 전환시켜주는 관계입니다.',
    detailSummary: '최현우님의 상관(傷官)이 매우 강한 구조인데, 당신의 인성(印星)이 이를 적절히 제어해주는 관계입니다. 함께 운동이나 활동을 할 때 서로의 에너지 순환이 좋아져 스트레스 해소에 탁월한 궁합이에요. 다만 상관의 기운이 과도해질 수 있는 시기(충·형이 겹치는 달)에는 말실수나 과도한 행동이 나올 수 있으니, 그런 시기엔 조용한 활동을 함께하는 것이 좋습니다.',
    roleLabel: '분위기메이커',
    isDetailUnlocked: false, isRecent: false, isMatchable: true,
    badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
    privateLabels: [],
    x: 640, y: 240
  },
  {
    id: 'c6', name: '강지윤', groups: ['g4'],
    score: 72, status: 'checked',
    tags: ['편인 성향', '통찰력 공유', '거리감 필요'],
    summary: '편인(偏印) 에너지가 강해 깊은 통찰을 나눌 수 있지만, 적절한 거리 유지가 필요한 관계입니다.',
    detailSummary: '강지윤님은 편인(偏印)과 정관(正官)이 균형 잡힌 구조로, 관찰력과 분석력이 뛰어납니다. 당신과의 관계에서 서로에게 새로운 시각을 제공하는 역할을 하지만, 지지(地支)에서 해(害) 관계가 있어 가까워질수록 미묘한 오해가 생길 수 있어요. 깊은 대화는 좋지만 일상적인 밀착보다는 간헐적으로 만나 질 높은 교류를 하는 것이 이 관계를 오래 유지하는 비결입니다.',
    roleLabel: '관찰자',
    isDetailUnlocked: false, isRecent: false, isMatchable: true,
    badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]',
    privateLabels: [],
    x: 220, y: 210
  },
  {
    id: 'c7', name: '윤소영', groups: ['g3', 'g4'],
    score: 95, status: 'checked',
    tags: ['정관 정인 조화', '안정적 성장', '상호 보완'],
    summary: '정관(正官)과 정인(正印)의 흐름이 서로를 이상적으로 보완하여, 함께 성장할 수 있는 최상의 관계입니다.',
    detailSummary: '윤소영님의 사주 구조는 당신에게 거의 이상적인 보완 관계입니다. 정관(正官)이 당신의 일간을 안정시키고, 정인(正印)이 지식과 정서적 지지를 제공하는 흐름이 자연스럽게 형성됩니다. 특히 년지(年支)와 일지(日支)의 삼합(三合) 관계가 장기적 신뢰와 안정의 기반이 되어, 시간이 지날수록 관계의 깊이가 더해집니다. 인생의 중요한 전환기에 이 분의 조언이 큰 도움이 될 수 있어요.',
    roleLabel: '조력자',
    isDetailUnlocked: true, isRecent: false, isMatchable: true,
    badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]',
    privateLabels: [],
    x: 860, y: 520
  },
  {
    id: 'c8', name: '정태민', groups: ['g2'],
    score: 76, status: 'checked',
    tags: ['편관 성향', '목표 집중', '갈등 가능성'],
    summary: '편관(偏官) 에너지가 강해 목표 달성에 함께하면 강력하지만, 방향이 다르면 충돌할 수 있습니다.',
    detailSummary: '정태민님의 편관(偏官)이 당신의 일간에 직접적으로 작용하는 구조입니다. 같은 목표를 향할 때는 강력한 추진력을 발휘하지만, 의견이 갈리면 타협이 어려운 관계이기도 해요. 월지에서 충(沖) 가능성이 있어 특정 시기에 갈등이 고조될 수 있으니, 평소에 서로의 입장을 이해하려는 노력이 중요합니다. 운동이나 경쟁적 활동에서는 최고의 파트너가 됩니다.',
    roleLabel: '추진자',
    isDetailUnlocked: false, isRecent: false, isMatchable: true,
    badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
    privateLabels: [],
    x: 560, y: 310
  },
  {
    id: 'c9', name: '오하나', groups: ['g5'],
    score: 80, status: 'checked',
    tags: ['정재 관계', '실질적 도움', '가족적 유대'],
    summary: '정재(正財)의 에너지가 서로를 실질적으로 돕는 방향으로 흘러, 가족적 유대감이 강한 관계입니다.',
    detailSummary: '오하나님과 당신의 관계에서 정재(正財)의 흐름이 매우 안정적입니다. 서로에게 실질적인 도움을 주고받는 구조로, 특히 금전이나 생활 관련 문제에서 신뢰할 수 있는 관계예요. 다만 년지(年支)에서 형(刑)의 가능성이 있어, 가족 간 역할 분담이나 기대 수준에 대한 미세한 갈등이 생길 수 있습니다. 서로의 노력을 인정하고 감사를 표현하는 것이 관계 유지의 핵심입니다.',
    roleLabel: '안정자',
    isDetailUnlocked: false, isRecent: true, isMatchable: true,
    badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
    privateLabels: [],
    x: 970, y: 260
  },
  {
    id: 'c10', name: '송재원', groups: ['g1', 'g3'],
    score: 58, status: 'checked',
    tags: ['충 관계 주의', '변화 촉진', '단기 활성'],
    summary: '지지(地支)에서 충(沖) 관계가 있어 변화와 자극을 주지만, 장기적 안정은 어려운 관계입니다.',
    detailSummary: '송재원님과 당신의 일지(日支)가 충(沖) 관계를 이루고 있어, 만나면 에너지가 크게 요동치는 관계입니다. 이 자극이 긍정적으로 작용하면 정체된 상황을 깨뜨리는 촉매가 되지만, 부정적으로 작용하면 감정 소모가 매우 클 수 있어요. 특히 충이 겹치는 시기(세운이나 월운에서 추가 충이 오는 때)에는 의도적으로 거리를 두는 것이 좋습니다. 짧고 굵게 만나는 것이 이 관계를 건강하게 유지하는 방법입니다.',
    roleLabel: '자극자',
    isDetailUnlocked: false, isRecent: false, isMatchable: false,
    badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]',
    privateLabels: [],
    x: 600, y: 500
  },

  // ── 미확인 (pending) ──
  {
    id: 'p1', name: '이은진', groups: ['pending'],
    score: '?', status: 'pending',
    isRecent: false,
    badge: 'bg-gray-100 text-gray-400 border-gray-300 border-dashed',
    x: 150, y: 160
  },
  {
    id: 'p2', name: '한재호', groups: ['pending'],
    score: '?', status: 'pending',
    isRecent: false,
    badge: 'bg-gray-100 text-gray-400 border-gray-300 border-dashed',
    x: 780, y: 170
  },
  {
    id: 'p3', name: '나연서', groups: ['pending'],
    score: '?', status: 'pending',
    isRecent: true,
    badge: 'bg-gray-100 text-gray-400 border-gray-300 border-dashed',
    x: 1050, y: 550
  },
];
