// ═══════════════════════════════════════════════════════════
// 관계맵 + 다이어리 연동 유틸리티
// 감정 라벨, 관계 상태, 그룹 분위기, 월간 리포트 등
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

// ─── 프라이빗 라벨 ──────────────────────────────────────
export const PRIVATE_LABEL_OPTIONS = [
  { key: 'some', label: '썸', emoji: '💗', color: 'pink' },
  { key: 'ex', label: '전 연인', emoji: '💔', color: 'rose' },
  { key: 'workStress', label: '회사 스트레스', emoji: '😰', color: 'amber' },
  { key: 'caution', label: '조심 인물', emoji: '⚠️', color: 'red' },
  { key: 'recovery', label: '회복 인물', emoji: '🌱', color: 'emerald' },
];

// ─── 관계 상태 ──────────────────────────────────────────
export const RELATIONSHIP_STATUSES = [
  { key: 'comfortable', label: '편안함', color: 'emerald', emoji: '🌿' },
  { key: 'tension', label: '긴장감', color: 'amber', emoji: '⚡' },
  { key: 'longing', label: '그리움', color: 'blue', emoji: '💙' },
  { key: 'distance', label: '거리감', color: 'gray', emoji: '🌫️' },
  { key: 'recovery', label: '회복감', color: 'teal', emoji: '🌱' },
  { key: 'fatigue', label: '피로감', color: 'rose', emoji: '🔥' },
];

// ─── 그룹 분위기 ────────────────────────────────────────
export const GROUP_MOODS = [
  { key: 'stable', label: '안정', emoji: '🟢', color: 'emerald' },
  { key: 'active', label: '활발', emoji: '🟡', color: 'amber' },
  { key: 'sensitive', label: '예민', emoji: '🟠', color: 'orange' },
  { key: 'draining', label: '소모', emoji: '🔴', color: 'rose' },
];

// ─── 그룹 내 역할 ──────────────────────────────────────
export const MY_ROLES = [
  { key: 'connector', label: '연결자', emoji: '🔗' },
  { key: 'mediator', label: '조율자', emoji: '⚖️' },
  { key: 'observer', label: '관찰자', emoji: '👁️' },
  { key: 'healer', label: '회복자', emoji: '🌿' },
  { key: 'tensionCreator', label: '긴장유발자', emoji: '⚡' },
];

// ─── 체크인 트리거 프리셋 ──────────────────────────────
export const DRAIN_TRIGGERS = ['직장', '관계', '건강', '돈', '미래불안'];
export const RECOVERY_TRIGGERS = ['운동', '대화', '혼자 시간', '취미', '수면'];

// ─── Tailwind 안전 색상 매핑 ───────────────────────────
export const STATUS_STYLES = {
  comfortable: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  tension: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  longing: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  distance: { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  recovery: { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200' },
  fatigue: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
};

export const LABEL_STYLES = {
  pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  rose: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
};

// ═══════════════════════════════════════════════════════════
// 유틸 함수
// ═══════════════════════════════════════════════════════════

// 30일 전 날짜 문자열
function get30DaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// 특정 노드와 관련된 이벤트 필터
function getEventsForNode(nodeId, events) {
  return events.filter(ev =>
    (ev.relatedPeople || []).some(p => p.id === nodeId)
  );
}

// ─── 노드별 감정 요약 ──────────────────────────────────
export function getNodeEmotionSummary(nodeId, events) {
  const nodeEvents = getEventsForNode(nodeId, events);
  const threshold = get30DaysAgo();

  let positive = 0, neutral = 0, negative = 0;
  const moodDistribution = {};
  const keywordCounts = {};
  let lastContactAt = null;
  let recentCount30d = 0;

  nodeEvents.forEach(ev => {
    // 감정 카운트
    if (ev.emotion === '긍정') positive++;
    else if (ev.emotion === '부정') negative++;
    else neutral++;

    // 무드 라벨 (빠른 기록)
    if (ev.moodLabel) {
      moodDistribution[ev.moodLabel] = (moodDistribution[ev.moodLabel] || 0) + 1;
    }

    // 키워드 (빠른 기록)
    (ev.keywords || []).forEach(kw => {
      keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    });

    // 최근 날짜
    if (!lastContactAt || ev.date > lastContactAt) {
      lastContactAt = ev.date;
    }

    // 30일 이내 기록 수
    if (ev.date >= threshold) recentCount30d++;
  });

  const frequentKeywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([kw]) => kw);

  return {
    positive, neutral, negative,
    totalCount: nodeEvents.length,
    recentCount30d,
    moodDistribution,
    frequentKeywords,
    lastContactAt
  };
}

// ─── 관계 상태 분류 ────────────────────────────────────
export function classifyRelationshipStatus(nodeId, events) {
  const summary = getNodeEmotionSummary(nodeId, events);
  if (summary.totalCount === 0) return null;

  const { positive, negative, neutral, totalCount, recentCount30d } = summary;
  const negRatio = negative / totalCount;
  const posRatio = positive / totalCount;

  // 최근 부정 비율 높으면 → 긴장감 또는 피로감
  if (negRatio >= 0.6) {
    return recentCount30d >= 2 ? 'fatigue' : 'tension';
  }
  // 긍정 높고 최근 접점 많으면 → 편안함
  if (posRatio >= 0.5 && recentCount30d >= 1) return 'comfortable';
  // 긍정 높은데 최근 접점 없으면 → 그리움
  if (posRatio >= 0.5 && recentCount30d === 0) return 'longing';
  // 중립 위주이고 접점 적으면 → 거리감
  if (neutral >= positive && neutral >= negative && recentCount30d <= 1) return 'distance';
  // 그 외 혼합 → 회복감
  return 'recovery';
}

// ─── 에너지 영향 계산 ──────────────────────────────────
export function computeEnergyImpact(nodeId, events) {
  const summary = getNodeEmotionSummary(nodeId, events);
  if (summary.totalCount === 0) return '중립';

  const { positive, negative, totalCount } = summary;
  const posRatio = positive / totalCount;
  const negRatio = negative / totalCount;

  if (posRatio >= 0.6) return '회복';
  if (negRatio >= 0.5) return '소모';
  return '중립';
}

// ─── 추천 액션 ─────────────────────────────────────────
export function getRecommendedActions(nodeId, events) {
  const status = classifyRelationshipStatus(nodeId, events);
  if (!status) return [];

  const actionMap = {
    comfortable: ['감사 표현 추천', '가볍게 안부 보내기'],
    tension: ['감정적인 대화는 다음으로 미루기', '업무 중심 대화 유지'],
    longing: ['가볍게 안부 보내기', '짧은 만남 제안해보기'],
    distance: ['지금은 자연스러운 거리를 유지하기', '무리하게 연락하지 않기'],
    recovery: ['최근 변화된 흐름을 지켜보기', '편안한 대화 시도하기'],
    fatigue: ['이번 주는 혼자 회복이 먼저', '간격 조절 추천'],
  };

  return actionMap[status] || [];
}

// ─── 그룹 분위기 계산 ──────────────────────────────────
export function getGroupMood(groupId, events, nodes) {
  // 해당 그룹 소속 노드 찾기
  const memberIds = nodes
    .filter(n => n.status === 'checked' && (n.groups || []).includes(groupId))
    .map(n => n.id);

  if (memberIds.length === 0) {
    return { mood: 'stable', myRole: 'observer', attentionPerson: null, recentIssueSummary: '', stabilityScore: 50 };
  }

  // 해당 멤버들과 관련된 모든 이벤트
  const groupEvents = events.filter(ev =>
    (ev.relatedPeople || []).some(p => memberIds.includes(p.id))
  );

  let positive = 0, negative = 0, neutral = 0;
  const personNegCounts = {};

  groupEvents.forEach(ev => {
    if (ev.emotion === '긍정') positive++;
    else if (ev.emotion === '부정') negative++;
    else neutral++;

    if (ev.emotion === '부정') {
      (ev.relatedPeople || []).forEach(p => {
        if (memberIds.includes(p.id)) {
          personNegCounts[p.name] = (personNegCounts[p.name] || 0) + 1;
        }
      });
    }
  });

  const total = positive + negative + neutral;
  const negRatio = total > 0 ? negative / total : 0;
  const posRatio = total > 0 ? positive / total : 0;

  // 분위기 결정
  let mood = 'stable';
  if (negRatio >= 0.5) mood = 'draining';
  else if (negRatio >= 0.3) mood = 'sensitive';
  else if (posRatio >= 0.5 && total >= 3) mood = 'active';

  // 역할 결정 (그룹 내 패턴 기반)
  const roleOptions = ['connector', 'mediator', 'observer', 'healer', 'tensionCreator'];
  let myRole;
  if (negative > positive && total >= 3) myRole = 'tensionCreator';
  else if (positive > negative * 2) myRole = 'healer';
  else if (total >= 4) myRole = 'connector';
  else if (total >= 2) myRole = 'mediator';
  else myRole = 'observer';

  // 주의 인물
  const topNegPerson = Object.entries(personNegCounts)
    .sort((a, b) => b[1] - a[1])[0];
  const attentionPerson = topNegPerson && topNegPerson[1] >= 2 ? topNegPerson[0] : null;

  // 이슈 요약
  let recentIssueSummary = '';
  if (mood === 'draining') recentIssueSummary = '최근 이 그룹에서 부정적 감정이 반복되고 있어요';
  else if (mood === 'sensitive') recentIssueSummary = '미세한 긴장감이 감지되고 있어요';
  else if (mood === 'active') recentIssueSummary = '활발한 교류가 이어지고 있어요';
  else recentIssueSummary = '안정적인 흐름을 유지하고 있어요';

  // 안정도 점수
  const stabilityScore = Math.max(20, Math.min(100, Math.round(100 - negRatio * 80)));

  return { mood, myRole, attentionPerson, recentIssueSummary, stabilityScore };
}

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
export function getMonthlyReport(year, month, events, nodes) {
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const monthEvents = events.filter(ev => ev.date.startsWith(monthStr));

  if (monthEvents.length === 0) {
    return {
      totalEvents: 0,
      emotionCounts: { '긍정': 0, '중립': 0, '부정': 0 },
      avgIntensity: 0,
      mostConnectedPerson: null,
      repeatedPatterns: [],
      drainPatterns: [],
      recoveryPatterns: [],
      suggestions: ['이번 달 기록이 없어요. 가벼운 체크인부터 시작해보세요.'],
      moodSummary: [],
    };
  }

  // 감정 분포
  const emotionCounts = { '긍정': 0, '중립': 0, '부정': 0 };
  monthEvents.forEach(ev => {
    if (emotionCounts[ev.emotion] !== undefined) emotionCounts[ev.emotion]++;
  });

  // 평균 강도
  const avgIntensity = (monthEvents.reduce((s, ev) => s + (ev.intensity || 3), 0) / monthEvents.length).toFixed(1);

  // 가장 많이 연결된 사람
  const personCounts = {};
  monthEvents.forEach(ev => {
    (ev.relatedPeople || []).forEach(p => {
      personCounts[p.name] = (personCounts[p.name] || 0) + 1;
    });
  });
  const topPerson = Object.entries(personCounts).sort((a, b) => b[1] - a[1])[0];
  const mostConnectedPerson = topPerson ? { name: topPerson[0], count: topPerson[1] } : null;

  // 반복 패턴
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

  // 소모/회복 패턴
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

  // 무드 요약
  const moodCounts = {};
  monthEvents.forEach(ev => {
    if (ev.moodLabel) moodCounts[ev.moodLabel] = (moodCounts[ev.moodLabel] || 0) + 1;
  });
  const moodSummary = Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // 다음 달 제안
  const suggestions = [];
  if (emotionCounts['부정'] > emotionCounts['긍정']) {
    suggestions.push('다음 달에는 회복 시간을 의도적으로 확보해보세요');
  }
  if (mostConnectedPerson && emotionCounts['부정'] > 2) {
    suggestions.push(`${mostConnectedPerson.name}님과의 관계 패턴을 점검해보세요`);
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
    mostConnectedPerson,
    repeatedPatterns,
    drainPatterns,
    recoveryPatterns,
    suggestions,
    moodSummary,
  };
}

// ─── 체크인 AI 리플렉션 생성 ───────────────────────────
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
