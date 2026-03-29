import React, { useState, useMemo } from 'react';
import { BookOpen, Plus, X, MessageSquare, BarChart3, Target, Calendar, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Sparkles, Flame, Lock, Star, Sun, Zap, Info, Check } from 'lucide-react';
import {
  DIARY_EVENT_TYPES, DIARY_SIPSIN_MAP, PILLAR_POSITIONS,
  EFFECT_DETAILS, SEASON_DYNAMICS, YEAR_OPTIONS, generateDiaryAnalysis, getDiaryPatternSummary,
  EMOTION_SCALE, STREAK_BADGES, computeStreak, getTodayIlwun, getFortuneMapping,
  getCalendarHeatmapData, getEmotionGraphData, getSipsinDistribution,
  DIARY_DAILY_FORM, DIARY_LIFE_EVENT_FORM
} from '../data/diaryData';
import { MOOD_LABELS, summarizeEmotionFlow } from '../data/relationUtils';

// ─── 감정 뱃지 컬러 ─────────────────────────────────
const EMOTION_COLORS = {
  '긍정': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  '중립': 'bg-gray-50 text-gray-500 border-gray-200',
  '부정': 'bg-rose-50 text-rose-600 border-rose-200',
};

// ─── 합충형파해 뱃지 컬러 ───────────────────────────
const EFFECT_BAR_COLORS = {
  '충': 'bg-amber-400',
  '형': 'bg-rose-400',
  '합': 'bg-emerald-400',
  '파': 'bg-purple-400',
  '해': 'bg-blue-400',
};

const EFFECT_DOT_COLORS = {
  '충': 'bg-amber-400',
  '형': 'bg-rose-400',
  '합': 'bg-emerald-400',
  '파': 'bg-purple-400',
  '해': 'bg-blue-400',
};

export default function DiaryTab({ diaryEvents, setDiaryEvents, showToast, onStartDiaryChat, handleDeduct, streakData }) {
  // ─── State ──────────────────────────────────────────
  const [showDailyForm, setShowDailyForm] = useState(false);
  const [showPastForm, setShowPastForm] = useState(false);
  const [dailyStep, setDailyStep] = useState(0);
  const [dailyForm, setDailyForm] = useState({ ...DIARY_DAILY_FORM });
  const [pastForm, setPastForm] = useState({ ...DIARY_LIFE_EVENT_FORM });
  const [showDashboard, setShowDashboard] = useState(false);
  const [showIlwunPopup, setShowIlwunPopup] = useState(false);
  const [showMissedPopup, setShowMissedPopup] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [savedEventSummary, setSavedEventSummary] = useState(null);
  const [dashboardPeriod, setDashboardPeriod] = useState('weekly');
  const [heatmapMonth, setHeatmapMonth] = useState(new Date().getMonth() + 1);
  const [heatmapYear, setHeatmapYear] = useState(new Date().getFullYear());
  const [showFortuneMapping, setShowFortuneMapping] = useState(false);
  const [sipsinTooltip, setSipsinTooltip] = useState(null);

  // ─── Derived data (useMemo) ────────────────────────
  const todayIlwun = useMemo(() => getTodayIlwun(), []);
  const emotionGraphData = useMemo(() => getEmotionGraphData(diaryEvents, dashboardPeriod), [diaryEvents, dashboardPeriod]);
  const sipsinDist = useMemo(() => getSipsinDistribution(diaryEvents), [diaryEvents]);
  const heatmapData = useMemo(() => getCalendarHeatmapData(diaryEvents, heatmapYear, heatmapMonth), [diaryEvents, heatmapYear, heatmapMonth]);
  const sortedEvents = useMemo(() => [...diaryEvents].sort((a, b) => b.date.localeCompare(a.date)), [diaryEvents]);

  const streakInfo = streakData || computeStreak(diaryEvents);
  const nextBadge = STREAK_BADGES.find(b => b.days > (streakInfo.longest || 0)) || STREAK_BADGES[STREAK_BADGES.length - 1];
  const badgeProgress = nextBadge ? Math.min(((streakInfo.current || 0) / nextBadge.days) * 100, 100) : 100;

  // ─── Fortune mapping for past event form ──────────
  const fortuneMapping = useMemo(() => {
    if (!showFortuneMapping) return null;
    return getFortuneMapping(pastForm.year, pastForm.month);
  }, [showFortuneMapping, pastForm.year, pastForm.month]);

  // ─── Heatmap helper: first day of month offset ────
  const heatmapFirstDayOffset = useMemo(() => {
    const firstDay = new Date(heatmapYear, heatmapMonth - 1, 1).getDay();
    return firstDay;
  }, [heatmapYear, heatmapMonth]);

  // ─── Max bar value for emotion graph ──────────────
  const emotionGraphMax = useMemo(() => {
    return Math.max(...emotionGraphData.map(d => d.total), 1);
  }, [emotionGraphData]);

  // ─── sipsin distribution max ──────────────────────
  const sipsinMax = useMemo(() => {
    return Math.max(...sipsinDist.map(s => s.count), 1);
  }, [sipsinDist]);

  // ─── Heatmap color helper ─────────────────────────
  const getHeatmapColor = (score, hasEntry) => {
    if (!hasEntry) return 'bg-gray-100';
    if (score >= 1.5) return 'bg-emerald-400';
    if (score >= 0.5) return 'bg-emerald-200';
    if (score >= 0) return 'bg-gray-300';
    if (score >= -0.5) return 'bg-rose-200';
    return 'bg-rose-400';
  };

  // ─── Date format helper ───────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.length === 10) {
      const parts = dateStr.split('-');
      return `${parts[1]}/${parts[2]}`;
    }
    if (dateStr.length === 7) {
      const parts = dateStr.split('-');
      return `${parts[0]}년 ${parseInt(parts[1])}월`;
    }
    return dateStr;
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.length === 10) {
      const d = new Date(dateStr);
      const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${dayNames[d.getDay()]})`;
    }
    if (dateStr.length === 7) {
      const parts = dateStr.split('-');
      return `${parts[0]}년 ${parseInt(parts[1])}월`;
    }
    return dateStr;
  };

  // ─── Daily Form: navigate date ────────────────────
  const navigateDailyDate = (delta) => {
    const current = new Date(dailyForm.date);
    current.setDate(current.getDate() + delta);
    const dateStr = current.toISOString().slice(0, 10);
    setDailyForm(prev => ({ ...prev, date: dateStr }));
  };

  // ─── Daily Form: get ilwun for selected date ──────
  const dailyIlwun = useMemo(() => {
    try {
      return getTodayIlwun(dailyForm.date);
    } catch {
      return todayIlwun;
    }
  }, [dailyForm.date, todayIlwun]);

  // ─── Daily Form: Save ─────────────────────────────
  const handleDailySave = () => {
    const emotionEntry = EMOTION_SCALE[dailyForm.emotionScore] || EMOTION_SCALE[3];
    const emotionLabel = dailyForm.emotionScore >= 3 ? '긍정' : dailyForm.emotionScore <= 1 ? '부정' : '중립';

    let analysis = null;
    if (dailyForm.eventTypes.length > 0) {
      // Use first selected event type for primary analysis
      analysis = generateDiaryAnalysis(
        dailyForm.eventTypes[0],
        dailyForm.date.slice(0, 4),
        dailyForm.date.slice(5, 7),
        dailyForm.intensity,
        emotionLabel
      );
    }

    const newEvent = {
      id: Date.now(),
      date: dailyForm.date,
      eventType: dailyForm.eventTypes[0] || '',
      title: dailyForm.eventTypes.length > 0
        ? dailyForm.eventTypes.join(', ')
        : (emotionEntry.label || '일상 기록'),
      memo: dailyForm.memo,
      intensity: dailyForm.intensity,
      emotion: emotionLabel,
      analyzed: !!analysis,
      analysis,
      mode: 'daily',
      emotionScore: dailyForm.emotionScore,
      eventTypes: dailyForm.eventTypes,
    };

    setDiaryEvents(prev => [newEvent, ...prev]);

    setSavedEventSummary({
      date: formatFullDate(dailyForm.date),
      emotion: emotionEntry,
      eventTypes: dailyForm.eventTypes,
      sipsinName: analysis?.sipsin?.name || null,
      sipsinHanja: analysis?.sipsin?.hanja || null,
    });
    setShowSaveConfirm(true);
    setShowDailyForm(false);
    setDailyStep(0);
    setDailyForm({ ...DIARY_DAILY_FORM });
  };

  // ─── Past Event Form: Save ────────────────────────
  const handlePastSave = () => {
    if (!pastForm.title.trim()) {
      showToast('사건 제목을 입력해주세요.');
      return;
    }

    const dateStr = `${pastForm.year}-${pastForm.month.padStart(2, '0')}`;
    const analysis = generateDiaryAnalysis(
      pastForm.eventType,
      pastForm.year,
      pastForm.month,
      pastForm.impact,
      pastForm.emotionRecall
    );

    const newEvent = {
      id: Date.now(),
      date: dateStr,
      eventType: pastForm.eventType,
      title: pastForm.title,
      memo: pastForm.detail,
      intensity: pastForm.impact,
      emotion: pastForm.emotionRecall,
      analyzed: true,
      analysis,
      mode: 'deep',
    };

    setDiaryEvents(prev => [newEvent, ...prev]);

    setSavedEventSummary({
      date: `${pastForm.year}년 ${parseInt(pastForm.month)}월`,
      emotion: null,
      eventTypes: [pastForm.eventType],
      sipsinName: analysis?.sipsin?.name || null,
      sipsinHanja: analysis?.sipsin?.hanja || null,
    });
    setShowSaveConfirm(true);
    setShowPastForm(false);
    setPastForm({ ...DIARY_LIFE_EVENT_FORM });
    setShowFortuneMapping(false);
  };

  // ─── Missed day check ────────────────────────────
  const shouldShowMissedPopup = showMissedPopup && streakInfo.current === 0 && diaryEvents.length > 0;

  // ═══════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════
  return (
    <div className="flex flex-col h-full bg-surface relative">
      <div className="flex-1 overflow-y-auto pb-4">

        {/* ═══ 1A: Streak Counter (top gradient banner) ═══ */}
        <div className="bg-gradient-to-br from-primary via-primary-light to-primary-dark px-5 pt-5 pb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="text-white/60 text-[10px] font-bold tracking-wider">HANI DIARY</span>
                </div>
                <h2 className="text-white text-lg font-extrabold leading-snug">
                  사주 다이어리
                </h2>
              </div>

              {/* Streak badge */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1.5">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-white text-xs font-bold">
                    {streakInfo.current > 0 ? `${streakInfo.current}일 연속` : '오늘 시작'}
                  </span>
                </div>
              </div>
            </div>

            {/* Earned badges */}
            {streakInfo.earnedBadges && streakInfo.earnedBadges.length > 0 && (
              <div className="flex gap-1.5 mb-2">
                {streakInfo.earnedBadges.map(badge => (
                  <span key={badge.days} className="text-[10px] bg-white/15 text-white px-2 py-0.5 rounded-full font-bold">
                    {badge.emoji} {badge.label}
                  </span>
                ))}
              </div>
            )}

            {/* Next badge progress bar */}
            {nextBadge && streakInfo.current < nextBadge.days && (
              <div className="mt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/50">다음 배지: {nextBadge.emoji} {nextBadge.label}</span>
                  <span className="text-[10px] text-white/50">{streakInfo.current}/{nextBadge.days}일</span>
                </div>
                <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${badgeProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 mt-4 space-y-4">

          {/* ═══ 1B: Today's Ilwun Card ═══ */}
          <button
            onClick={() => setShowIlwunPopup(true)}
            className="w-full bg-white rounded-2xl border border-surface-line shadow-sm overflow-hidden text-left active:scale-[0.98] transition-transform"
          >
            <div className="flex">
              {/* Left accent border */}
              <div className="w-1.5 bg-primary rounded-l-2xl shrink-0" />
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-primary">오늘의 일운</span>
                  </div>
                  <span className="text-[10px] text-gray-400">탭하여 자세히 보기</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-muted to-surface-light flex items-center justify-center">
                    <span className="text-lg font-extrabold text-primary">
                      {todayIlwun.stemKr}{todayIlwun.branchKr}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900">{todayIlwun.pillarText}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                      {todayIlwun.element} 기운 · {todayIlwun.seasonal.season} · {todayIlwun.interaction.type === '없음' ? '평온' : todayIlwun.interaction.type}
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">
                  {todayIlwun.interaction.desc}
                </p>
              </div>
            </div>
          </button>

          {/* ═══ 1C: Promotion Banner ═══ */}
          <div className="bg-gradient-to-r from-primary to-primary-light rounded-2xl p-4 shadow-sm relative overflow-hidden">
            <div className="absolute right-2 top-2 opacity-20">
              <Sparkles className="w-16 h-16 text-white" />
            </div>
            <div className="relative z-10">
              <p className="text-white text-xs font-bold mb-1">
                기록할수록 사주 상담이 더 정확해져요
              </p>
              <p className="text-white/60 text-[10px] leading-relaxed">
                일상을 기록하면 하니가 더 정확한 사주 분석을 해드려요
              </p>
            </div>
          </div>

          {/* ═══ 1D: 오늘 기록하기 CTA ═══ */}
          <button
            onClick={() => {
              setDailyStep(0);
              setDailyForm({ ...DIARY_DAILY_FORM });
              setShowDailyForm(true);
            }}
            className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-primary-dark"
          >
            <BookOpen className="w-5 h-5" />
            오늘 기록하기
          </button>

          {/* ═══ 1E: 과거 사건 기록하기 ═══ */}
          <button
            onClick={() => {
              setPastForm({ ...DIARY_LIFE_EVENT_FORM });
              setShowFortuneMapping(false);
              setShowPastForm(true);
            }}
            className="w-full bg-white border-2 border-dashed border-surface-soft text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-surface-light"
          >
            <Plus className="w-5 h-5" />
            과거 사건 기록하기
          </button>

          {/* ═══ 1F: Recent Records Timeline ═══ */}
          {sortedEvents.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-900">
                  {diaryEvents.length}건의 기록
                </span>
              </div>

              <div className="space-y-2.5">
                {sortedEvents.slice(0, 5).map((ev) => {
                  const isQuick = ev.mode === 'quick';
                  const isDaily = ev.mode === 'daily';
                  const emotionClass = EMOTION_COLORS[ev.emotion] || EMOTION_COLORS['중립'];
                  const sipsinName = ev.analysis?.sipsin?.name;
                  const sipsinHanja = ev.analysis?.sipsin?.hanja;
                  const displayTitle = isQuick
                    ? (ev.memo || ev.moodLabel || '빠른 기록')
                    : isDaily
                      ? (ev.eventTypes?.join(', ') || ev.memo || '일상 기록')
                      : (ev.title || ev.eventType || '기록');

                  return (
                    <div
                      key={ev.id}
                      className="bg-white rounded-2xl border border-surface-line shadow-sm px-4 py-3 animate-fade-in"
                    >
                      <div className="flex items-center gap-3">
                        {/* Date badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface-muted flex flex-col items-center justify-center">
                          <span className="text-[10px] font-bold text-primary leading-none">
                            {formatDate(ev.date)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{displayTitle}</p>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {sipsinName && (
                              <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                                {sipsinName}({sipsinHanja})
                              </span>
                            )}
                            {ev.memo && !isQuick && (
                              <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                                {ev.memo.slice(0, 30)}{ev.memo.length > 30 ? '...' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Emotion badge */}
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${emotionClass}`}>
                          {ev.emotion}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {sortedEvents.length > 5 && (
                <button
                  onClick={() => setShowDashboard(true)}
                  className="w-full text-center text-[11px] text-primary font-bold py-3 mt-1 hover:text-primary-dark transition"
                >
                  더보기 ({sortedEvents.length - 5}건)
                </button>
              )}
            </div>
          )}

          {diaryEvents.length === 0 && (
            <div className="text-center py-10">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-400 mb-1">아직 기록이 없어요</p>
              <p className="text-xs text-gray-300">위의 버튼으로 첫 기록을 시작해보세요</p>
            </div>
          )}

          {/* ═══ 2: Analytics Dashboard (접기/펼치기) ═══ */}
          <div className="bg-white rounded-2xl border border-surface-line shadow-sm overflow-hidden">
            <button
              onClick={() => diaryEvents.length > 0 && setShowDashboard(p => !p)}
              className="w-full p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">분석 대시보드</span>
                {diaryEvents.length > 0 && (
                  <span className="text-[9px] bg-surface-muted text-primary px-2 py-0.5 rounded-full font-bold border border-surface-line">
                    {diaryEvents.filter(ev => ev.analyzed).length}건 분석됨
                  </span>
                )}
              </div>
              {diaryEvents.length > 0 && (
                showDashboard
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showDashboard && diaryEvents.length > 0 && (
              <div className="px-4 pb-5 space-y-6 animate-fade-in">

                {/* ─── 2A: Emotion Graph ─── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold text-gray-700">감정 추이</p>
                    <div className="flex bg-surface-muted rounded-lg p-0.5">
                      <button
                        onClick={() => setDashboardPeriod('weekly')}
                        className={`text-[10px] font-bold px-3 py-1 rounded-md transition ${dashboardPeriod === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                      >
                        주간
                      </button>
                      <button
                        onClick={() => setDashboardPeriod('monthly')}
                        className={`text-[10px] font-bold px-3 py-1 rounded-md transition ${dashboardPeriod === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
                      >
                        월간
                      </button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex gap-3 mb-2">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-400" /><span className="text-[9px] text-gray-500">긍정</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300" /><span className="text-[9px] text-gray-500">중립</span></div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-400" /><span className="text-[9px] text-gray-500">부정</span></div>
                  </div>

                  {/* Bar chart */}
                  <div className="flex items-end gap-1.5 h-32 px-1">
                    {emotionGraphData.map((d, i) => {
                      const maxH = 100; // percentage
                      const totalH = d.total > 0 ? (d.total / emotionGraphMax) * maxH : 0;
                      const posH = d.total > 0 ? (d.positive / d.total) * totalH : 0;
                      const neuH = d.total > 0 ? (d.neutral / d.total) * totalH : 0;
                      const negH = d.total > 0 ? (d.negative / d.total) * totalH : 0;

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex flex-col justify-end" style={{ height: '100px' }}>
                            {d.total > 0 ? (
                              <div className="w-full rounded-t-md overflow-hidden flex flex-col justify-end">
                                {negH > 0 && <div className="bg-rose-400 w-full" style={{ height: `${negH}px` }} />}
                                {neuH > 0 && <div className="bg-gray-300 w-full" style={{ height: `${neuH}px` }} />}
                                {posH > 0 && <div className="bg-emerald-400 w-full" style={{ height: `${posH}px` }} />}
                              </div>
                            ) : (
                              <div className="w-full bg-gray-100 rounded-t-md" style={{ height: '4px' }} />
                            )}
                          </div>

                          {/* Effect dots */}
                          <div className="flex gap-0.5 min-h-[8px]">
                            {Object.entries(d.effects || {}).map(([eff]) => (
                              <div key={eff} className={`w-1.5 h-1.5 rounded-full ${EFFECT_DOT_COLORS[eff] || 'bg-gray-300'}`} />
                            ))}
                          </div>

                          <span className="text-[9px] text-gray-400 font-bold">{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ─── 2B: Sipsin Distribution ─── */}
                {sipsinDist.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-gray-700 mb-3">십신(十神) 분포</p>
                    <div className="space-y-2">
                      {sipsinDist.map(item => (
                        <div key={item.type} className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-gray-600 w-20 shrink-0 truncate">
                            {item.type} <span className="text-gray-400">{item.hanja}</span>
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${Math.max((item.count / sipsinMax) * 100, 8)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-gray-500 w-8 text-right">{item.count}건</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── 2C: Calendar Heatmap ─── */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold text-gray-700">캘린더 히트맵</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => {
                        if (heatmapMonth === 1) { setHeatmapMonth(12); setHeatmapYear(y => y - 1); }
                        else { setHeatmapMonth(m => m - 1); }
                      }} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                      <span className="text-[11px] font-bold text-primary min-w-[70px] text-center">
                        {heatmapYear}년 {heatmapMonth}월
                      </span>
                      <button onClick={() => {
                        if (heatmapMonth === 12) { setHeatmapMonth(1); setHeatmapYear(y => y + 1); }
                        else { setHeatmapMonth(m => m + 1); }
                      }} className="p-1 rounded-full hover:bg-gray-100 transition">
                        <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Day headers */}
                  <div className="grid grid-cols-7 gap-1 mb-1">
                    {['일', '월', '화', '수', '목', '금', '토'].map(d => (
                      <div key={d} className="text-[9px] text-gray-400 text-center font-bold">{d}</div>
                    ))}
                  </div>

                  {/* Heatmap grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for offset */}
                    {Array.from({ length: heatmapFirstDayOffset }).map((_, i) => (
                      <div key={`empty-${i}`} className="w-full aspect-square" />
                    ))}
                    {heatmapData.map((cell) => (
                      <div
                        key={cell.day}
                        className={`w-full aspect-square rounded-md flex items-center justify-center relative ${getHeatmapColor(cell.score, cell.hasEntry)}`}
                      >
                        <span className="text-[8px] font-bold text-gray-600">{cell.day}</span>
                        {cell.hasEntry && (
                          <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-[8px] text-gray-400">부정</span>
                    <div className="flex gap-0.5">
                      <div className="w-3 h-3 rounded-sm bg-rose-400" />
                      <div className="w-3 h-3 rounded-sm bg-rose-200" />
                      <div className="w-3 h-3 rounded-sm bg-gray-300" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-200" />
                      <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    </div>
                    <span className="text-[8px] text-gray-400">긍정</span>
                  </div>
                </div>

                {/* ─── 2D: 하니 인사이트 (Locked) ─── */}
                <div className="relative">
                  <div className="bg-gradient-to-br from-surface-light to-surface-muted rounded-2xl p-4 border border-surface-line opacity-70">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-bold text-gray-500">하니 인사이트</p>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed mb-3 blur-[2px]">
                      당신의 십신 패턴을 종합 분석한 맞춤 인사이트를 제공해요. 반복되는 감정 흐름과 사건 패턴에서 발견된 핵심 포인트를 확인하세요.
                    </p>
                    <p className="text-[10px] text-gray-400 blur-[2px]">
                      사주 고전 이론에 기반한 당신만의 패턴 리포트가 준비되어 있어요.
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 active:scale-95 transition-transform">
                      <Lock className="w-3.5 h-3.5" />
                      HANI PASS로 잠금 해제
                    </button>
                  </div>
                </div>

                {/* ─── 2E: 하니와 상담 시작 CTA ─── */}
                <button
                  onClick={() => onStartDiaryChat()}
                  className="w-full bg-primary text-white rounded-xl py-3.5 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors shadow-md active:scale-95 transition-transform"
                >
                  <MessageSquare className="w-4 h-4" />
                  하니와 상담 시작
                </button>

                <button
                  onClick={() => setShowDashboard(false)}
                  className="w-full text-center text-[11px] text-gray-400 font-bold py-1 hover:text-gray-600 transition"
                >
                  대시보드 접기
                </button>
              </div>
            )}

            {!showDashboard && diaryEvents.length === 0 && (
              <div className="px-4 pb-4 -mt-1">
                <span className="text-xs text-gray-400">기록이 쌓이면 분석 대시보드가 활성화돼요</span>
              </div>
            )}
          </div>

          {/* 하단 여백 */}
          <div className="h-2" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* 3: Daily Diary Bottom Sheet (4-step form)      */}
      {/* ═══════════════════════════════════════════════ */}
      {showDailyForm && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={() => setShowDailyForm(false)}>
          <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[90%] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">오늘 기록하기</h3>
              <button onClick={() => setShowDailyForm(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {[0, 1, 2, 3].map(step => (
                <div
                  key={step}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    step === dailyStep
                      ? 'bg-primary w-6'
                      : step < dailyStep
                        ? 'bg-primary'
                        : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* ─── Step 0: Date Selection ─── */}
            {dailyStep === 0 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3">날짜 선택</label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => navigateDailyDate(-1)}
                      className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div className="text-center min-w-[160px]">
                      <p className="text-sm font-bold text-gray-900">{formatFullDate(dailyForm.date)}</p>
                    </div>
                    <button
                      onClick={() => navigateDailyDate(1)}
                      className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Today's ilwun for selected date */}
                <div className="bg-surface-light rounded-xl p-3 border border-surface-line">
                  <div className="flex items-center gap-2 mb-1">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-bold text-primary">이날의 일운</span>
                  </div>
                  <p className="text-[11px] text-gray-600">
                    {dailyIlwun.pillarText} · {dailyIlwun.element} 기운 · {dailyIlwun.seasonal.season}
                  </p>
                </div>
              </div>
            )}

            {/* ─── Step 1: Emotion Score (0-5) ─── */}
            {dailyStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3">오늘 기분은 어떤가요?</label>
                  <div className="flex items-center justify-center gap-3">
                    {EMOTION_SCALE.map(em => (
                      <button
                        key={em.value}
                        onClick={() => setDailyForm(prev => ({ ...prev, emotionScore: em.value }))}
                        className={`flex flex-col items-center gap-1 transition-all ${
                          dailyForm.emotionScore === em.value
                            ? 'scale-125'
                            : 'opacity-50 hover:opacity-75'
                        }`}
                      >
                        <span className="text-2xl">{em.emoji}</span>
                        <span className="text-[9px] font-bold" style={{ color: em.color }}>{em.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-lg">{EMOTION_SCALE[dailyForm.emotionScore]?.emoji}</span>
                  <p className="text-xs font-bold text-gray-600 mt-1">{EMOTION_SCALE[dailyForm.emotionScore]?.label}</p>
                </div>
              </div>
            )}

            {/* ─── Step 2: Intensity (1-5) ─── */}
            {dailyStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-3">
                    오늘의 감정 강도는? <span className="text-primary">{dailyForm.intensity}/5</span>
                  </label>
                  <div className="flex items-center justify-center gap-3">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setDailyForm(prev => ({ ...prev, intensity: n }))}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                          dailyForm.intensity >= n
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-400 border-gray-200 hover:border-surface-soft'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between px-2 mt-2">
                    <span className="text-[10px] text-gray-400">약함</span>
                    <span className="text-[10px] text-gray-400">매우 강함</span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Step 3: Event Categories + Memo ─── */}
            {dailyStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">어떤 일이 있었나요? (복수 선택 가능)</label>
                  <div className="flex flex-wrap gap-2">
                    {DIARY_EVENT_TYPES.map(type => {
                      const data = DIARY_SIPSIN_MAP[type];
                      const isActive = dailyForm.eventTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => {
                            setDailyForm(prev => ({
                              ...prev,
                              eventTypes: isActive
                                ? prev.eventTypes.filter(t => t !== type)
                                : [...prev.eventTypes, type]
                            }));
                            // Show tooltip briefly
                            if (!isActive && data) {
                              setSipsinTooltip({ type, sipsin: data.sipsin, hanja: data.hanja, relation: data.elementRelation });
                              setTimeout(() => setSipsinTooltip(null), 2000);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                            isActive
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                          {data && (
                            <span className={`ml-1 text-[9px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>
                              {data.sipsin}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sipsin tooltip */}
                  {sipsinTooltip && (
                    <div className="mt-2 bg-surface-light rounded-lg px-3 py-2 border border-surface-line animate-fade-in">
                      <p className="text-[11px] text-primary font-bold">
                        {sipsinTooltip.sipsin}({sipsinTooltip.hanja})
                      </p>
                      <p className="text-[10px] text-gray-500">{sipsinTooltip.relation}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">
                    메모 <span className="text-gray-400 font-normal">({dailyForm.memo.length}/300)</span>
                  </label>
                  <textarea
                    value={dailyForm.memo}
                    onChange={e => {
                      if (e.target.value.length <= 300) {
                        setDailyForm(prev => ({ ...prev, memo: e.target.value }));
                      }
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-24"
                    placeholder="오늘 있었던 일을 자유롭게 적어주세요"
                  />
                </div>
              </div>
            )}

            {/* ─── Navigation buttons ─── */}
            <div className="flex gap-3 mt-6">
              {dailyStep > 0 && (
                <button
                  onClick={() => setDailyStep(s => s - 1)}
                  className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
                >
                  이전
                </button>
              )}
              {dailyStep < 3 ? (
                <button
                  onClick={() => setDailyStep(s => s + 1)}
                  className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition"
                >
                  다음
                </button>
              ) : (
                <button
                  onClick={handleDailySave}
                  className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition shadow-md"
                >
                  저장
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* 4: Past Event Bottom Sheet                     */}
      {/* ═══════════════════════════════════════════════ */}
      {showPastForm && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={() => setShowPastForm(false)}>
          <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[90%] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">과거 사건 기록</h3>
              <button onClick={() => setShowPastForm(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Year / Month selectors */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">발생 연도</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    value={pastForm.year}
                    onChange={e => setPastForm(prev => ({ ...prev, year: e.target.value }))}
                  >
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}년</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">발생 월</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary"
                    value={pastForm.month}
                    onChange={e => setPastForm(prev => ({ ...prev, month: e.target.value }))}
                  >
                    {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                      <option key={m} value={m}>{parseInt(m)}월</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Event type: single select */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">사건 유형</label>
                <div className="flex flex-wrap gap-2">
                  {DIARY_EVENT_TYPES.map(type => {
                    const data = DIARY_SIPSIN_MAP[type];
                    const isActive = pastForm.eventType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => setPastForm(prev => ({ ...prev, eventType: type }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                          isActive
                            ? 'bg-primary text-white border-primary'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {type}
                        {data && <span className={`ml-1 text-[9px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>{data.sipsin}</span>}
                      </button>
                    );
                  })}
                </div>
                {DIARY_SIPSIN_MAP[pastForm.eventType] && (
                  <div className="mt-2 bg-surface-light rounded-lg px-3 py-2 border border-surface-line">
                    <p className="text-[11px] text-primary font-bold mb-0.5">
                      {DIARY_SIPSIN_MAP[pastForm.eventType].sipsin}({DIARY_SIPSIN_MAP[pastForm.eventType].hanja}) — {DIARY_SIPSIN_MAP[pastForm.eventType].elementRelation}
                    </p>
                    <p className="text-[10px] text-gray-500">{DIARY_SIPSIN_MAP[pastForm.eventType].desc}</p>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  사건 제목 <span className="text-gray-400 font-normal">({pastForm.title.length}/50)</span>
                </label>
                <input
                  type="text"
                  value={pastForm.title}
                  onChange={e => {
                    if (e.target.value.length <= 50) {
                      setPastForm(prev => ({ ...prev, title: e.target.value }));
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-primary"
                  placeholder="예: 직장 내 큰 마찰, 연인과 이별"
                />
              </div>

              {/* Detail */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  상세 내용 <span className="text-gray-400 font-normal">({pastForm.detail.length}/500)</span>
                </label>
                <textarea
                  value={pastForm.detail}
                  onChange={e => {
                    if (e.target.value.length <= 500) {
                      setPastForm(prev => ({ ...prev, detail: e.target.value }));
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary resize-none h-24"
                  placeholder="당시에 어떤 일이 있었는지, 감정과 결과를 구체적으로 적어주세요."
                />
              </div>

              {/* Emotion recall: 3 buttons */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">당시 감정은?</label>
                <div className="flex gap-2">
                  {['긍정', '중립', '부정'].map(em => (
                    <button
                      key={em}
                      onClick={() => setPastForm(prev => ({ ...prev, emotionRecall: em }))}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border transition-colors ${
                        pastForm.emotionRecall === em
                          ? em === '긍정'
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                            : em === '부정'
                              ? 'bg-rose-50 text-rose-600 border-rose-300'
                              : 'bg-gray-100 text-gray-600 border-gray-300'
                          : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Impact: 1-5 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  영향도 <span className="text-primary">{pastForm.impact}/5</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setPastForm(prev => ({ ...prev, impact: n }))}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-colors ${
                        pastForm.impact === n
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white text-gray-500 border-gray-200'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fortune Mapping toggle */}
              <div>
                <button
                  onClick={() => setShowFortuneMapping(p => !p)}
                  className="flex items-center gap-2 text-xs font-bold text-primary py-2"
                >
                  <Star className="w-3.5 h-3.5" />
                  운세 매핑 보기
                  {showFortuneMapping
                    ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  }
                </button>

                {showFortuneMapping && fortuneMapping && (
                  <div className="bg-surface-light rounded-xl p-3 border border-surface-line space-y-2 animate-fade-in">
                    {[fortuneMapping.daewun, fortuneMapping.sewun, fortuneMapping.wolwun].map(fortune => (
                      <div key={fortune.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-primary">{fortune.name}</span>
                          <span className="text-[11px] text-gray-600">{fortune.label}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < fortune.stars ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    <p className="text-[9px] text-gray-400 mt-1">
                      대운(10년) &gt; 세운(1년) &gt; 월운(1개월) 순으로 영향력이 큽니다
                    </p>
                  </div>
                )}
              </div>

              {/* Save button */}
              <button
                onClick={handlePastSave}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition mt-2"
              >
                기록 저장하고 분석하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* 5: Ilwun Detail Popup                          */}
      {/* ═══════════════════════════════════════════════ */}
      {showIlwunPopup && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowIlwunPopup(false)}>
          <div className="bg-white rounded-3xl p-6 mx-5 w-full max-w-[360px] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">오늘의 일운 상세</h3>
              <button onClick={() => setShowIlwunPopup(false)} className="bg-gray-100 p-2 rounded-full text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pillar display */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-surface-muted to-surface-light flex items-center justify-center border border-surface-line">
                <span className="text-2xl font-extrabold text-primary">
                  {todayIlwun.stemKr}{todayIlwun.branchKr}
                </span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{todayIlwun.pillarText}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  천간: {todayIlwun.stemKr}({todayIlwun.stem}) · 지지: {todayIlwun.branchKr}({todayIlwun.branch})
                </p>
              </div>
            </div>

            {/* Element + Season */}
            <div className="bg-surface-light rounded-xl p-3 border border-surface-line mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-primary">오행 기운</span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                오늘은 <strong className="text-primary">{todayIlwun.element}</strong> 기운이 작용합니다.
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed mt-1">
                {todayIlwun.seasonal.desc}
              </p>
            </div>

            {/* Seasonal context */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[11px] font-bold text-gray-600">계절 맥락</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-400">계절:</span>
                  <span className="ml-1 text-gray-600 font-bold">{todayIlwun.seasonal.season}</span>
                </div>
                <div>
                  <span className="text-gray-400">주도 오행:</span>
                  <span className="ml-1 text-gray-600 font-bold">{todayIlwun.seasonal.dominant}</span>
                </div>
                <div>
                  <span className="text-gray-400">약한 오행:</span>
                  <span className="ml-1 text-gray-600 font-bold">{todayIlwun.seasonal.weak}</span>
                </div>
                <div>
                  <span className="text-gray-400">필요 오행:</span>
                  <span className="ml-1 text-gray-600 font-bold">{todayIlwun.seasonal.needed}</span>
                </div>
              </div>
            </div>

            {/* Interaction */}
            <div className="bg-white rounded-xl p-3 border border-surface-line mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-bold text-primary">
                  오늘의 작용: {todayIlwun.interaction.type === '없음' ? '평온' : todayIlwun.interaction.type}
                </span>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed mb-2">
                {todayIlwun.interaction.desc}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {todayIlwun.interaction.effects.map((eff, i) => (
                  <span key={i} className="text-[10px] bg-surface-muted text-primary px-2 py-0.5 rounded-full font-bold border border-surface-line">
                    {eff}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-surface-light to-surface-muted rounded-xl p-3 border border-surface-line">
              <p className="text-[11px] text-gray-600 leading-relaxed">{todayIlwun.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* Save Confirmation Screen                       */}
      {/* ═══════════════════════════════════════════════ */}
      {showSaveConfirm && savedEventSummary && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowSaveConfirm(false)}>
          <div className="bg-white rounded-3xl p-6 mx-5 w-full max-w-[340px] shadow-2xl animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
            {/* Checkmark animation */}
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-emerald-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">기록이 저장되었어요</h3>

            <div className="bg-surface-light rounded-xl p-3 border border-surface-line mb-4 text-left">
              <p className="text-[11px] text-gray-500 mb-1">{savedEventSummary.date}</p>
              {savedEventSummary.emotion && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{savedEventSummary.emotion.emoji}</span>
                  <span className="text-xs font-bold text-gray-700">{savedEventSummary.emotion.label}</span>
                </div>
              )}
              {savedEventSummary.eventTypes && savedEventSummary.eventTypes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {savedEventSummary.eventTypes.map(type => (
                    <span key={type} className="text-[10px] bg-surface-muted text-primary px-2 py-0.5 rounded-full font-bold border border-surface-line">
                      {type}
                    </span>
                  ))}
                </div>
              )}
              {savedEventSummary.sipsinName && (
                <p className="text-[10px] text-primary font-bold mt-2">
                  {savedEventSummary.sipsinName}({savedEventSummary.sipsinHanja}) 분석이 반영되었어요
                </p>
              )}
            </div>

            <button
              onClick={() => {
                setShowSaveConfirm(false);
                setSavedEventSummary(null);
              }}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/* 6: Missed Day Popup                            */}
      {/* ═══════════════════════════════════════════════ */}
      {shouldShowMissedPopup && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowMissedPopup(false)}>
          <div className="bg-white rounded-3xl p-6 mx-5 w-full max-w-[340px] shadow-2xl animate-fade-in-up text-center" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Flame className="w-7 h-7 text-amber-500" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">어제 기록을 놓쳤어요!</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              괜찮아요, 오늘부터 다시 시작해봐요.<br />
              꾸준한 기록이 사주 분석의 핵심이에요.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setShowMissedPopup(false)}
                className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition"
              >
                나중에
              </button>
              <button
                onClick={() => {
                  setShowMissedPopup(false);
                  setDailyStep(0);
                  setDailyForm({ ...DIARY_DAILY_FORM });
                  setShowDailyForm(true);
                }}
                className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition"
              >
                오늘 기록하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
