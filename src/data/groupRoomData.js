// ═══════════════════════════════════════════════════════════
// 그룹/커플 궁합 방 만들기 — 데이터 & 프리셋
// ═══════════════════════════════════════════════════════════

// ─── 모임 종류 ──────────────────────────────────────────
export const GROUP_CATEGORIES = [
  { key: 'friend',    label: '친구/지인',        emoji: '👯' },
  { key: 'work',      label: '직장/커리어',      emoji: '💼' },
  { key: 'hobby',     label: '취미/라이프스타일', emoji: '🎯' },
  { key: 'family',    label: '가족/생활',        emoji: '🏠' },
];

export const GROUP_RELATION_TYPES = {
  friend: [
    { key: 'localFriend',   label: '동네 친구',     emoji: '🏘️' },
    { key: 'collegeFriend',  label: '대학 친구',     emoji: '🎓' },
    { key: 'highFriend',    label: '고등학교 친구',  emoji: '📚' },
    { key: 'bestie',        label: '베프 모임',     emoji: '💜' },
    { key: 'travel',        label: '여행 멤버',     emoji: '✈️' },
    { key: 'drink',         label: '술친구',        emoji: '🍻' },
  ],
  work: [
    { key: 'team',          label: '회사 팀',       emoji: '🏢' },
    { key: 'projectTF',     label: '프로젝트 TF',   emoji: '📋' },
    { key: 'coworker',      label: '동기 모임',     emoji: '🤝' },
    { key: 'study',         label: '스터디',        emoji: '📖' },
    { key: 'sideProject',   label: '사이드 프로젝트', emoji: '💡' },
  ],
  hobby: [
    { key: 'sports',        label: '운동 크루',     emoji: '💪' },
    { key: 'outdoor',       label: '아웃도어',      emoji: '🏔️' },
    { key: 'culture',       label: '문화/감성',     emoji: '🎨' },
    { key: 'food',          label: '미식 모임',     emoji: '🍽️' },
    { key: 'club',          label: '동호회',        emoji: '👥' },
    { key: 'social',        label: '소셜링',        emoji: '⚡' },
  ],
  family: [
    { key: 'family',        label: '가족',          emoji: '👨‍👩‍👧‍👦' },
    { key: 'siblings',      label: '자매/형제',     emoji: '👫' },
    { key: 'roommate',      label: '자취 메이트',   emoji: '🔑' },
  ],
};

export const COUPLE_RELATION_TYPES = [
  { key: 'some',            label: '썸',            emoji: '💗' },
  { key: 'lover',           label: '연인',          emoji: '💕' },
  { key: 'longTerm',        label: '장기 연애',     emoji: '💍' },
  { key: 'reunion',         label: '재회 고민',     emoji: '🔄' },
  { key: 'marriage',        label: '결혼 준비',     emoji: '💒' },
];

// ─── 분위기 프리셋 ──────────────────────────────────────
export const MOOD_PRESETS = [
  { key: 'comfortable', label: '편안함',      emoji: '😌' },
  { key: 'awkward',     label: '어색함',      emoji: '😅' },
  { key: 'excited',     label: '기대됨',      emoji: '🤩' },
  { key: 'sensitive',   label: '살짝 예민함', emoji: '😬' },
];

// ─── 궁금한 포인트 (의도 태그) ──────────────────────────
export const GROUP_INTENT_TAGS = [
  { key: 'moodMaker',   label: '누가 분위기 메이커인지 궁금해요',           emoji: '🎤' },
  { key: 'awkwardWhy',   label: '우리 모임이 왜 어색해지는지 알고 싶어요',   emoji: '🤔' },
  { key: 'buffer',       label: '누가 갈등을 완충하는지 알고 싶어요',        emoji: '🛡️' },
  { key: 'connector',    label: '누가 사람들을 연결하는지 궁금해요',         emoji: '🔗' },
  { key: 'tension',      label: '은근한 긴장감이 어디서 오는지 궁금해요',    emoji: '⚡' },
];

export const COUPLE_INTENT_TAGS = [
  { key: 'expression',  label: '우리의 표현 방식 차이가 궁금해요',          emoji: '💬' },
  { key: 'pacing',      label: '누가 더 천천히 다가가는 타입인지 알고 싶어요', emoji: '🐢' },
  { key: 'chemistry',   label: '우리 케미가 어떤 타입인지 궁금해요',         emoji: '✨' },
  { key: 'conflict',    label: '싸울 때 어떤 패턴인지 알고 싶어요',          emoji: '🌪️' },
];

// ─── 분석 중 단계 메시지 ────────────────────────────────
export const ANALYZING_STEPS = [
  { label: '관계 흐름 스캔 중',   emoji: '🔍' },
  { label: '역할 분포 계산 중',   emoji: '📊' },
  { label: '대화 케미 정리 중',   emoji: '💬' },
  { label: '개인 결과 분리 중',   emoji: '🔐' },
];

export const ANALYZING_TEASERS = [
  '생각보다 의외의 연결자가 나올 수 있어요',
  '겉으로 조용한 사람이 분위기를 잡는 경우도 있어요',
  '서로의 텐션과 거리감을 읽는 중이에요',
  '숨어 있던 케미가 드러날지도 몰라요',
];

// ─── 공용 결과 데이터 (더미) ────────────────────────────
export const GROUP_RESULT_NAMES = [
  '말이 끊기지 않는 활기형 모임',
  '느슨하지만 정이 깊은 팀',
  '서로 다른 텐션이 오히려 재미인 조합',
  '조용한 듯 은근 텐션이 센 편',
];

export const COUPLE_RESULT_NAMES = [
  '속도 차는 있지만 정이 깊은 커플',
  '표현 방식은 다르지만 오래 가는 조합',
  '설렘이 꾸준한 안정형 커플',
  '서로 끌어올리는 활력형 관계',
];

export const GROUP_ROLE_CARDS = [
  { role: '분위기메이커', emoji: '🔥', desc: '대화를 먼저 열고 흐름을 끌어올리는 사람', color: 'purple' },
  { role: '연결자',       emoji: '🔗', desc: '사람들 사이를 자연스럽게 이어주는 사람', color: 'green' },
  { role: '완충자',       emoji: '🛡️', desc: '갈등이 생기면 부드럽게 중재하는 사람', color: 'blue' },
  { role: '현실 담당',    emoji: '⚖️', desc: '상황을 정리하고 방향을 잡아주는 사람', color: 'orange' },
];

export const COUPLE_ROLE_CARDS = [
  { role: '표현 주도형',    emoji: '💬', desc: '감정을 먼저 표현하고 분위기를 이끄는 사람', color: 'pink' },
  { role: '감정 축적형',    emoji: '🌊', desc: '감정을 천천히 쌓아 깊이 있게 표현하는 사람', color: 'blue' },
  { role: '속도 조절형',    emoji: '🐢', desc: '관계 속도를 조율하며 안전감을 주는 사람', color: 'teal' },
  { role: '안정감 제공형',  emoji: '🌿', desc: '흔들릴 때 묵묵히 곁에서 지지하는 사람', color: 'emerald' },
];

// ─── 주의 포인트 카피 ───────────────────────────────────
export const GROUP_CAUTION_COPIES = [
  '대화가 빨라질수록 한 사람이 소외감을 느낄 수 있어요',
  '장난이 길어지면 감정 온도 차가 커질 수 있어요',
  '의견이 갈릴 때 침묵하는 사람의 입장도 챙겨주세요',
];

export const COUPLE_CAUTION_COPIES = [
  '표현 속도가 다를 뿐, 마음은 같을 수 있어요',
  '피곤할 때 직설적으로 들릴 수 있으니 톤에 주의하세요',
  '속마음을 말하기까지 시간이 필요한 쪽을 기다려주세요',
];

// ─── 개인 결과 행동 가이드 ──────────────────────────────
export const BEHAVIOR_GUIDES = {
  group: [
    '오늘은 먼저 말을 꺼내면 분위기가 풀릴 수 있어요',
    '상대가 반응이 느려도 거리감으로 단정하지 않는 편이 좋아요',
    '장난보다 리액션이 더 중요한 날이에요',
    '조용히 듣는 것만으로도 큰 힘이 될 수 있어요',
  ],
  couple: [
    '오늘은 먼저 안부를 물어보면 관계 온도가 올라갈 수 있어요',
    '말보다 행동으로 표현하는 쪽일 수 있으니 관찰해보세요',
    '작은 칭찬 한마디가 오늘 하루를 바꿀 수 있어요',
    '서로 다른 템포를 인정하면 더 편해질 수 있어요',
  ],
};

// ─── 결과 지표 라벨 ─────────────────────────────────────
export const RESULT_METRICS = {
  group: [
    { key: 'moodTemp',   label: '분위기 온도',   emoji: '🌡️' },
    { key: 'stability',  label: '안정감',        emoji: '🛡️' },
    { key: 'talkDensity', label: '대화 밀도',    emoji: '💬' },
  ],
  couple: [
    { key: 'emotionTemp', label: '감정 온도',    emoji: '❤️‍🔥' },
    { key: 'rhythm',      label: '관계 리듬',    emoji: '🎵' },
    { key: 'expression',  label: '표현 밀도',    emoji: '💌' },
  ],
};

// ─── 색상 매핑 ──────────────────────────────────────────
export const ROLE_COLOR_STYLES = {
  purple:  { bg: 'bg-[#F7F5FA]',  border: 'border-[#EBE5F2]',  text: 'text-[#5E4078]' },
  green:   { bg: 'bg-green-50',   border: 'border-green-100',  text: 'text-green-700' },
  blue:    { bg: 'bg-blue-50',    border: 'border-blue-100',   text: 'text-blue-700' },
  orange:  { bg: 'bg-orange-50',  border: 'border-orange-100', text: 'text-orange-700' },
  pink:    { bg: 'bg-pink-50',    border: 'border-pink-100',   text: 'text-pink-700' },
  teal:    { bg: 'bg-teal-50',    border: 'border-teal-100',   text: 'text-teal-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
};
