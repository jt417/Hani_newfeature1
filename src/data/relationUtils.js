// ═══════════════════════════════════════════════════════════
// 다이어리 유틸리티
// 감정 라벨, 감정 흐름 요약, 월간 리포트 등
// ═══════════════════════════════════════════════════════════

// ─── 감정 라벨 (빠른 기록용) ────────────────────────────
export const MOOD_LABELS = [
  { key: 'comfortable', label: '편안함', emoji: '😌', color: 'emerald' },
  { key: 'excited', label: '설렘', emoji: '💕', color: 'pink' },
  { key: 'sensitive', label: '예민함', emoji: '😤', color: 'amber' },
  { key: 'hurt', label: '서운함', emoji: '😢', color: 'blue' },
  { key: 'frustrated', label: '답답함', emoji: '😩', color: 'orange' },
  { key: 'proud', label: '뿌듯함', emoji: '✨', color: 'violet' },
  { key: 'empty', label: '허무함', emoji: '🌫️', color: 'gray' },
  { key: 'recovered', label: '회복감', emoji: '🌿', color: 'teal' },
];

// ─── 빠른 기록 키워드 ──────────────────────────────────
export const QUICK_KEYWORDS = [
  '직장 스트레스', '연애/썸', '가족', '건강', '돈 걱정',
  '우정', '자기계발', '휴식', '다툼', '좋은 소식',
  '외로움', '성취감', '불안', '감사', '후회',
];

// ─── 체크인 트리거 프리셋 ──────────────────────────────
export const DRAIN_TRIGGERS = ['직장', '관계', '건강', '돈', '미래불안'];
export const RECOVERY_TRIGGERS = ['운동', '대화', '혼자 시간', '취미', '수면'];

// ═══════════════════════════════════════════════════════════
// 유틸 함수
// ═══════════════════════════════════════════════════════════

// ─── 감정 흐름 요약 ────────────────────────────────────
export function summarizeEmotionFlow(events) {
  if (events.length < 2) return '아직 흐름을 파악하기엔 기록이 부족해요';

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const recentHalf = sorted.slice(Math.floor(sorted.length / 2));
  const earlyHalf = sorted.slice(0, Math.floor(sorted.length / 2));

  const earlyNeg = earlyHalf.filter(e => e.emotion === '부정').length;
  const recentNeg = recentHalf.filter(e => e.emotion === '부정').length;
  const earlyPos = earlyHalf.filter(e => e.emotion === '긍정').length;
  const recentPos = recentHalf.filter(e => e.emotion === '긍정').length;

  if (recentNeg > earlyNeg && recentNeg > recentPos) {
    return '최근 부정적 감정이 늘어나는 흐름이 보여요';
  }
  if (recentPos > earlyPos && recentPos > recentNeg) {
    return '최근 긍정적인 흐름으로 전환되고 있어요';
  }
  if (recentNeg < earlyNeg) {
    return '예전보다 감정이 안정되어 가고 있어요';
  }
  return '감정의 기복이 반복되는 흐름이에요';
}

// ─── 월간 리포트 생성 ──────────────────────────────────
export function getMonthlyReport(year, month, events) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthEvents = events.filter(ev => ev.date.startsWith(monthStr));

  if (monthEvents.length === 0) {
    return {
      totalEvents: 0,
      emotionCounts: { '긍정': 0, '중립': 0, '부정': 0 },
      avgIntensity: 0,
      repeatedPatterns: [],
      drainPatterns: [],
      recoveryPatterns: [],
      suggestions: ['이번 달 기록이 없어요. 가벼운 체크인부터 시작해보세요.'],
      moodSummary: [],
    };
  }

  const emotionCounts = { '긍정': 0, '중립': 0, '부정': 0 };
  monthEvents.forEach(ev => {
    if (emotionCounts[ev.emotion] !== undefined) emotionCounts[ev.emotion]++;
  });

  const avgIntensity = (monthEvents.reduce((s, ev) => s + (ev.intensity || 3), 0) / monthEvents.length).toFixed(1);

  const tagCounts = {};
  monthEvents.forEach(ev => {
    (ev.analysis?.patternTags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const repeatedPatterns = Object.entries(tagCounts)
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  const negEvents = monthEvents.filter(ev => ev.emotion === '부정');
  const posEvents = monthEvents.filter(ev => ev.emotion === '긍정');

  const drainPatterns = [];
  const recoveryPatterns = [];

  if (negEvents.length > 0) {
    const negTypes = {};
    negEvents.forEach(ev => { negTypes[ev.eventType || ev.moodLabel || '미분류'] = (negTypes[ev.eventType || ev.moodLabel || '미분류'] || 0) + 1; });
    Object.entries(negTypes).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([t]) => drainPatterns.push(t));
  }
  if (posEvents.length > 0) {
    const posTypes = {};
    posEvents.forEach(ev => { posTypes[ev.eventType || ev.moodLabel || '미분류'] = (posTypes[ev.eventType || ev.moodLabel || '미분류'] || 0) + 1; });
    Object.entries(posTypes).sort((a, b) => b[1] - a[1]).slice(0, 3).forEach(([t]) => recoveryPatterns.push(t));
  }

  const moodCounts = {};
  monthEvents.forEach(ev => {
    if (ev.moodLabel) moodCounts[ev.moodLabel] = (moodCounts[ev.moodLabel] || 0) + 1;
  });
  const moodSummary = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const suggestions = [];
  if (emotionCounts['부정'] > emotionCounts['긍정']) {
    suggestions.push('다음 달에는 회복 시간을 의도적으로 확보해보세요');
  }
  if (emotionCounts['긍정'] >= emotionCounts['부정']) {
    suggestions.push('지금의 긍정적 흐름을 유지할 수 있는 루틴을 만들어보세요');
  }
  if (monthEvents.length < 5) {
    suggestions.push('빠른 기록을 활용해 기록 빈도를 조금 더 높여보세요');
  }
  if (suggestions.length === 0) {
    suggestions.push('꾸준한 기록이 이어지고 있어요. 이 흐름을 유지해보세요');
  }

  return {
    totalEvents: monthEvents.length,
    emotionCounts,
    avgIntensity: Number(avgIntensity),
    repeatedPatterns,
    drainPatterns,
    recoveryPatterns,
    suggestions,
    moodSummary,
  };
}

// ─── 체크인 리플렉션 생성 ───────────────────────────
export function generateCheckInReflection(moodLabel, energyLevel, concernPerson, triggers) {
  const reflections = {
    '편안함': [
      '편안한 하루를 보내고 계시네요. 이 에너지를 내일도 이어가보세요.',
      '마음이 안정된 날이에요. 이런 날의 패턴을 기억해두면 좋아요.',
    ],
    '설렘': [
      '설레는 감정이 있는 날이네요. 어떤 기대가 마음을 움직이고 있는지 돌아보세요.',
      '좋은 에너지가 느껴져요. 이 흐름을 즐겨보세요.',
    ],
    '예민함': [
      '예민한 날에는 반응보다 관찰이 먼저예요. 잠깐 멈추고 숨을 고르세요.',
      '예민함은 내 경계가 필요하다는 신호일 수 있어요. 무리하지 마세요.',
    ],
    '서운함': [
      '서운한 감정은 기대가 있었다는 뜻이에요. 그 기대가 어디서 왔는지 천천히 살펴보세요.',
      '마음이 쓰이는 게 있군요. 오늘은 나를 위한 시간을 만들어보세요.',
    ],
    '답답함': [
      '답답한 날에는 작은 것부터 정리하면 마음이 가벼워질 수 있어요.',
      '해결이 당장 안 되더라도 괜찮아요. 기록으로 정리하는 것만으로도 도움이 돼요.',
    ],
    '뿌듯함': [
      '오늘 잘한 일이 있었나 봐요. 그 순간을 기억해두세요.',
      '뿌듯한 감정을 기록해두면 힘든 날에 좋은 에너지원이 돼요.',
    ],
    '허무함': [
      '허무한 날도 있어요. 지금 느끼는 감정을 있는 그대로 인정해주세요.',
      '이 감정이 반복된다면 패턴을 살펴볼 필요가 있어요.',
    ],
    '회복감': [
      '회복 중이시군요. 이 흐름을 유지하기 위해 오늘 나를 편하게 해준 것을 기록해보세요.',
      '좋은 신호예요. 회복의 흐름이 어디서 시작되었는지 돌아보면 도움이 돼요.',
    ],
  };

  const pool = reflections[moodLabel] || ['오늘의 감정을 기록해주셔서 좋아요. 천천히 하루를 돌아보세요.'];
  let reflection = pool[Math.floor(Math.random() * pool.length)];

  if (concernPerson) {
    reflection += ` ${concernPerson}님과 관련된 마음이 있다면, 그 감정도 함께 살펴보세요.`;
  }
  if (energyLevel <= 2) {
    reflection += ' 에너지가 낮은 날이니 무리하지 말고 쉬는 것도 좋은 선택이에요.';
  }

  return reflection;
}
