import React, { useMemo, useState, useEffect } from 'react';
import {
  BookOpen, Users, MessageSquare, Sparkles, Flame,
  ChevronRight, Calendar, Clock, Heart, WifiOff,
  Sun, Plus, BarChart3, Zap, Star, Target
} from 'lucide-react';
import { getTodayIlwun, EMOTION_SCALE, DIARY_SIPSIN_MAP, EFFECT_DETAILS } from '../data/diaryData';
import { MOOD_LABELS } from '../data/relationUtils';

// ─── 합충형파해 뱃지 색상 ─────────────────────────────
const INTERACTION_BADGE = {
  '충': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  '합': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  '형': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
  '파': { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  '해': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200' },
  '없음': { bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
};

const EMOTION_COLORS = {
  '긍정': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  '중립': 'bg-gray-50 text-gray-500 border-gray-200',
  '부정': 'bg-rose-50 text-rose-600 border-rose-200',
};

// ─── 스트릭 게이미피케이션 뱃지 ──────────────────────
const getStreakBadge = (days) => {
  if (days >= 365) return { emoji: '\u{1F3C6}', label: '365일 달성!' };
  if (days >= 100) return { emoji: '\u{1F48E}', label: '100일 달성!' };
  if (days >= 30) return { emoji: '\u{1F31F}', label: '30일 달성!' };
  if (days >= 7) return { emoji: '\u{1F525}', label: '7일 달성!' };
  return { emoji: '\u{1F525}', label: '' };
};

// ─── 궁합 점수 색상 ──────────────────────────────────
const getScoreColor = (score) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 55) return 'text-amber-600';
  return 'text-rose-600';
};

export default function HomeTab({ diaryEvents, streakData, switchTab, showToast, savedResults = [] }) {
  // ─── 오프라인 감지 ────────────────────────────────
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── 오늘의 일운 ─────────────────────────────────
  const todayIlwun = useMemo(() => getTodayIlwun(), []);

  // ─── 오늘 기록 여부 확인 ────────────────────────
  const hasTodayEntry = useMemo(() => {
    if (!diaryEvents || diaryEvents.length === 0) return false;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayMonth = todayStr.slice(0, 7);
    return diaryEvents.some(ev => ev.date === todayStr || ev.date === todayMonth);
  }, [diaryEvents]);

  // ─── 최근 다이어리 3건 ──────────────────────────
  const recentEntries = useMemo(() => {
    if (!diaryEvents || diaryEvents.length === 0) return [];
    const sorted = [...diaryEvents].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.slice(0, 3);
  }, [diaryEvents]);

  // ─── 관계 맵 데이터 ─────────────────────────────
  const uniquePeople = useMemo(() => {
    if (!savedResults || savedResults.length === 0) return [];
    const nameSet = new Set();
    savedResults.forEach(r => {
      if (r.participants) {
        r.participants.forEach(p => {
          if (p.name) nameSet.add(p.name);
        });
      }
    });
    return [...nameSet].slice(0, 5);
  }, [savedResults]);

  // ─── 최근 궁합 결과 2건 ─────────────────────────
  const recentCompat = useMemo(() => {
    if (!savedResults || savedResults.length === 0) return [];
    return savedResults.slice(0, 2);
  }, [savedResults]);

  // ─── 분석 완료 기록 수 ──────────────────────────
  const analyzedCount = useMemo(() => {
    if (!diaryEvents) return 0;
    return diaryEvents.filter(ev => ev.analyzed).length;
  }, [diaryEvents]);

  // ─── 날짜 포맷 ──────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.length === 7) {
      const [y, m] = dateStr.split('-');
      return `${parseInt(m)}월`;
    }
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // ─── 감정 라벨 찾기 ─────────────────────────────
  const getMoodEmoji = (moodLabel) => {
    const found = MOOD_LABELS.find(m => m.label === moodLabel);
    return found ? found.emoji : '';
  };

  // ─── 에너지/감정 이모지 ─────────────────────────
  const getEnergyEmoji = (level) => {
    const found = EMOTION_SCALE.find(e => e.value === level);
    return found ? found.emoji : '\u{1F610}';
  };

  const interBadge = INTERACTION_BADGE[todayIlwun.interaction.type] || INTERACTION_BADGE['\uC5C6\uC74C'];
  const streakBadge = streakData ? getStreakBadge(streakData.current) : null;

  return (
    <div className="flex-1 overflow-y-auto pb-[72px] bg-surface animate-fade-in">

      {/* ═══ 1. Hero Banner ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-deep px-6 pt-6 pb-8">
        {/* 배경 데코 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/[0.03] rounded-full" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span className="text-white/70 text-xs font-bold tracking-wider">HANI SAJU</span>
          </div>
          <h2 className="text-white text-lg font-extrabold leading-snug mb-1">
            매일의 기록이<br />사주 패턴을 완성해요
          </h2>
          <p className="text-white/60 text-xs">
            {todayIlwun.dateLabel}
          </p>

          {/* 스트릭 뱃지 */}
          {streakData && streakData.current > 0 && (
            <div className="mt-4 inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3.5 py-1.5">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-white text-xs font-bold">
                {streakData.current}일 연속 기록중
              </span>
              {streakBadge && streakBadge.label && (
                <span className="text-white/80 text-[10px] ml-1">
                  {streakBadge.emoji} {streakBadge.label}
                </span>
              )}
            </div>
          )}

          {/* 최장 스트릭 */}
          {streakData && streakData.longest > 0 && streakData.longest > streakData.current && (
            <p className="text-white/40 text-[10px] mt-1.5 ml-0.5">
              최장 기록: {streakData.longest}일
            </p>
          )}
        </div>
      </div>

      {/* ═══ 9. 오프라인 배너 ═══ */}
      {isOffline && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span className="text-[11px] font-bold text-amber-700">오프라인 상태입니다. 일부 기능이 제한될 수 있어요.</span>
        </div>
      )}

      <div className="px-4 mt-4 space-y-4">

        {/* ═══ 2. 오늘의 일운 카드 ═══ */}
        <button
          onClick={() => switchTab('diary')}
          className="w-full text-left bg-white rounded-2xl border border-surface-line shadow-sm overflow-hidden active:scale-[0.98] transition-transform"
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
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${interBadge.bg} ${interBadge.text} ${interBadge.border}`}>
                  {todayIlwun.interaction.type === '없음' ? '평온' : todayIlwun.interaction.type}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-surface-muted to-surface-light flex items-center justify-center">
                  <span className="text-lg font-extrabold text-primary">
                    {todayIlwun.pillar ? todayIlwun.pillar.split(' ')[0] : ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900">{todayIlwun.pillar}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {todayIlwun.interaction.type === '없음' ? '평온한 하루' : todayIlwun.interaction.type} · {todayIlwun.dateLabel}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 leading-relaxed">
                {todayIlwun.interaction.desc}
              </p>

              {todayIlwun.interaction.detail && (
                <div className="bg-surface rounded-xl px-3 py-2 mt-2">
                  <p className="text-[11px] text-primary font-medium">{todayIlwun.interaction.detail}</p>
                </div>
              )}

              <p className="text-[10px] text-gray-400 text-right mt-2">탭하여 자세히 보기</p>
            </div>
          </div>
        </button>

        {/* ═══ 3. 오늘 기록하기 CTA ═══ */}
        <button
          onClick={() => switchTab('diary')}
          className="w-full bg-gradient-to-r from-primary via-primary-dark to-primary-deep text-white rounded-2xl px-5 py-4 flex items-center gap-3 shadow-lg active:scale-95 transition-transform"
        >
          <div className="w-11 h-11 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-extrabold leading-tight">
              {hasTodayEntry ? '오늘 기록 수정하기' : '오늘 하루를 기록해보세요'}
            </p>
            <p className="text-[11px] text-white/60 mt-0.5">
              {hasTodayEntry ? '기록을 업데이트할 수 있어요' : '기록할수록 사주 패턴이 선명해져요'}
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
        </button>

        {/* ═══ 3B. 프로모션 배너 ═══ */}
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

        {/* ═══ 4. 퀵 액션 그리드 ═══ */}
        <div className="grid grid-cols-3 gap-3">
          {/* 사주일기 */}
          <button
            onClick={() => switchTab('diary')}
            className="bg-white rounded-2xl border border-surface-line shadow-sm p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 leading-tight text-center">사주<br />일기</span>
          </button>

          {/* 궁합 분석 */}
          <button
            onClick={() => switchTab('compat')}
            className="bg-white rounded-2xl border border-surface-line shadow-sm p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-iris to-primary flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 leading-tight text-center">궁합<br />분석</span>
          </button>

          {/* 하니에게 물어보기 */}
          <button
            onClick={() => switchTab('chat')}
            className="bg-white rounded-2xl border border-surface-line shadow-sm p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-lilac to-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 leading-tight text-center">하니에게<br />물어보기</span>
          </button>
        </div>

        {/* ═══ 5. 내 관계 맵 미니뷰 ═══ */}
        {uniquePeople.length > 0 && (
          <div className="bg-white rounded-3xl border border-surface-line shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-gray-900">내 관계 맵</span>
              </div>
              <button
                onClick={() => switchTab('compat')}
                className="flex items-center gap-0.5 text-[11px] text-primary font-bold active:scale-95 transition-transform"
              >
                더보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {uniquePeople.map((name, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-accent-iris to-primary flex items-center justify-center shadow-sm">
                    <span className="text-white text-xs font-extrabold">{name.slice(0, 2)}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 font-medium truncate w-12 text-center">{name}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 flex items-center gap-3 text-[10px] text-gray-400">
              <span>{uniquePeople.length}명의 인연</span>
              <span>·</span>
              <span>{savedResults.length}개 궁합 분석</span>
            </div>
          </div>
        )}

        {/* ═══ 6. 최근 기록 타임라인 ═══ */}
        {recentEntries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-bold text-gray-900">최근 기록</span>
              <button
                onClick={() => switchTab('diary')}
                className="flex items-center gap-0.5 text-[11px] text-primary font-bold active:scale-95 transition-transform"
              >
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentEntries.map((entry) => {
                const isQuick = entry.mode === 'quick';
                const isDaily = entry.mode === 'daily';
                const displayTitle = isQuick
                  ? (entry.memo || entry.moodLabel || '빠른 기록')
                  : isDaily
                    ? (entry.eventTypes?.join(', ') || entry.memo || '일상 기록')
                    : (entry.title || entry.eventType || '기록');
                const emotionTag = entry.emotion;
                const emotionClass = EMOTION_COLORS[emotionTag] || EMOTION_COLORS['중립'];
                const sipsinName = entry.analysis?.sipsin?.name;
                const sipsinHanja = entry.analysis?.sipsin?.hanja;

                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-surface-line shadow-sm px-4 py-3 animate-fade-in"
                  >
                    <div className="flex items-center gap-3">
                      {/* 날짜 */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface-muted flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-primary leading-none">{formatDate(entry.date)}</span>
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{displayTitle}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {sipsinName && (
                            <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">
                              {sipsinName}{sipsinHanja ? `(${sipsinHanja})` : ''}
                            </span>
                          )}
                          {isQuick && entry.moodLabel && (
                            <span className="text-[10px] text-gray-500">
                              {getMoodEmoji(entry.moodLabel)} {entry.moodLabel}
                            </span>
                          )}
                          {isQuick && entry.energyLevel !== undefined && (
                            <span className="text-[10px] text-gray-400">
                              {getEnergyEmoji(entry.energyLevel)}
                            </span>
                          )}
                          {!isQuick && !sipsinName && entry.eventType && (
                            <span className="text-[10px] text-gray-500">
                              {DIARY_SIPSIN_MAP[entry.eventType]?.sipsin || entry.eventType}
                            </span>
                          )}
                          {entry.memo && !isQuick && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                              {entry.memo.slice(0, 30)}{entry.memo.length > 30 ? '...' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 감정 태그 */}
                      {emotionTag && (
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${emotionClass}`}>
                          {emotionTag}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 6B. 과거 사건 기록 ═══ */}
        <button
          onClick={() => switchTab('diary')}
          className="w-full bg-white border-2 border-dashed border-surface-soft text-primary font-bold py-4 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-surface-light"
        >
          <Plus className="w-5 h-5" />
          과거 사건 기록하기
        </button>

        {/* ═══ 6C. 분석 대시보드 티저 ═══ */}
        {diaryEvents && diaryEvents.length > 0 && (
          <button
            onClick={() => switchTab('diary')}
            className="w-full bg-white rounded-2xl border border-surface-line shadow-sm overflow-hidden text-left active:scale-[0.98] transition-transform"
          >
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-primary">분석 대시보드</span>
                <span className="text-[9px] bg-surface-muted text-primary px-2 py-0.5 rounded-full font-bold border border-surface-line">
                  {diaryEvents.filter(ev => ev.analyzed).length}건 분석됨
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        )}

        {/* ═══ 7. 최근 궁합 요약 ═══ */}
        {recentCompat.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-bold text-gray-900">최근 궁합</span>
              <button
                onClick={() => switchTab('compat')}
                className="flex items-center gap-0.5 text-[11px] text-primary font-bold active:scale-95 transition-transform"
              >
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentCompat.map((result, idx) => {
                const names = result.participants
                  ? result.participants.map(p => p.name).join(' & ')
                  : (result.roomName || '궁합 결과');
                const score = result.groupScore ?? null;
                const modeLabel = result.mode === 'group' ? '그룹' : '1:1';
                const participantCount = result.participants ? result.participants.length : 0;
                const scoreColor = score !== null ? getScoreColor(score) : 'text-primary';

                return (
                  <button
                    key={idx}
                    onClick={() => switchTab('compat')}
                    className="w-full bg-white rounded-2xl border border-surface-line shadow-sm px-4 py-3 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-surface-muted to-surface-warm flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{names}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400">{modeLabel} 궁합</span>
                        {participantCount > 0 && (
                          <span className="text-[10px] text-gray-400">· {participantCount}명</span>
                        )}
                      </div>
                    </div>
                    {score !== null && (
                      <div className="flex-shrink-0 text-right">
                        <span className={`text-sm font-extrabold ${scoreColor}`}>{score}</span>
                        <span className="text-[10px] text-gray-400 ml-0.5">점</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 8. 패턴 요약 카드 (기록 3건 이상) ═══ */}
        {analyzedCount >= 3 && (
          <div className="bg-gradient-to-br from-surface-muted to-white rounded-3xl border border-surface-line shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">나의 사주 패턴</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed mb-1">
              {analyzedCount}건의 기록이 쌓였어요. 기록이 쌓일수록 사주 흐름의 패턴이 더 선명해져요.
            </p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              하니에게 깊이 있는 분석을 받아보세요.
            </p>
            <button
              onClick={() => switchTab('chat')}
              className="mt-3 w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl active:scale-95 transition-transform"
            >
              하니에게 패턴 분석 요청하기
            </button>
          </div>
        )}

        {/* 하단 여백 */}
        <div className="h-2" />
      </div>
    </div>
  );
}
