import React, { useMemo } from 'react';
import {
  BookOpen, Users, MessageSquare, Sparkles, Flame,
  ChevronRight, Calendar, Clock
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

export default function HomeTab({ diaryEvents, streakData, switchTab, showToast }) {
  // ─── 오늘의 일운 ─────────────────────────────────
  const todayIlwun = useMemo(() => getTodayIlwun(), []);

  // ─── 최근 다이어리 3건 ──────────────────────────
  const recentEntries = useMemo(() => {
    if (!diaryEvents || diaryEvents.length === 0) return [];
    const sorted = [...diaryEvents].sort((a, b) => b.date.localeCompare(a.date));
    return sorted.slice(0, 3);
  }, [diaryEvents]);

  // ─── 날짜 포맷 ──────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // ─── 감정 라벨 찾기 (빠른 기록용) ────────────────
  const getMoodEmoji = (moodLabel) => {
    const found = MOOD_LABELS.find(m => m.label === moodLabel);
    return found ? found.emoji : '';
  };

  // ─── 에너지/감정 이모지 ─────────────────────────
  const getEnergyEmoji = (level) => {
    const found = EMOTION_SCALE.find(e => e.value === level);
    return found ? found.emoji : '😐';
  };

  const interBadge = INTERACTION_BADGE[todayIlwun.interaction.type] || INTERACTION_BADGE['없음'];

  return (
    <div className="flex-1 overflow-y-auto pb-[72px] bg-surface animate-fade-in">

      {/* ═══ Hero Banner ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-deep px-6 pt-6 pb-8">
        {/* 배경 데코 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

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
              <span className="text-white text-xs font-bold">{streakData.current}일 연속 기록중</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* ═══ 오늘의 일운 카드 ═══ */}
        <div className="bg-white rounded-3xl border border-surface-line shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-gray-900">오늘의 일운</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${interBadge.bg} ${interBadge.text} ${interBadge.border}`}>
              {todayIlwun.interaction.type === '없음' ? '평온' : todayIlwun.interaction.type}
            </span>
          </div>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-surface-muted to-surface-warm flex items-center justify-center">
              <span className="text-xl font-extrabold text-primary">
                {todayIlwun.pillar.split(' ')[0]}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{todayIlwun.pillar}</p>
              <p className="text-xs text-gray-500 mt-0.5">{todayIlwun.interaction.desc}</p>
            </div>
          </div>

          {todayIlwun.interaction.detail && (
            <div className="bg-surface rounded-xl px-3 py-2">
              <p className="text-[11px] text-primary font-medium">{todayIlwun.interaction.detail}</p>
            </div>
          )}
        </div>

        {/* ═══ 퀵 액션 그리드 ═══ */}
        <div className="grid grid-cols-3 gap-3">
          {/* 오늘 기록하기 */}
          <button
            onClick={() => switchTab('diary')}
            className="bg-white rounded-2xl border border-surface-line shadow-sm p-4 flex flex-col items-center gap-2.5 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-[11px] font-bold text-gray-700 leading-tight text-center">오늘<br />기록하기</span>
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

        {/* ═══ 최근 기록 섹션 ═══ */}
        {recentEntries.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-sm font-bold text-gray-900">최근 기록</span>
              <button
                onClick={() => switchTab('diary')}
                className="flex items-center gap-0.5 text-[11px] text-primary font-bold"
              >
                전체보기 <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {recentEntries.map((entry) => {
                const isQuick = entry.mode === 'quick';
                const displayTitle = isQuick
                  ? (entry.memo || '빠른 기록')
                  : (entry.title || entry.eventType || '기록');
                const emotionTag = entry.emotion;
                const emotionClass = EMOTION_COLORS[emotionTag] || EMOTION_COLORS['중립'];

                return (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl border border-surface-line shadow-sm px-4 py-3 flex items-center gap-3"
                  >
                    {/* 날짜 */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-surface-muted flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-primary leading-none">{formatDate(entry.date)}</span>
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{displayTitle}</p>
                      <div className="flex items-center gap-1.5 mt-1">
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
                        {!isQuick && entry.eventType && (
                          <span className="text-[10px] text-gray-500">
                            {DIARY_SIPSIN_MAP[entry.eventType]?.sipsin || entry.eventType}
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
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ 패턴 요약 (기록 3건 이상일 때) ═══ */}
        {diaryEvents && diaryEvents.filter(ev => ev.analyzed).length >= 3 && (
          <div className="bg-gradient-to-br from-surface-muted to-white rounded-3xl border border-surface-line shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary">나의 사주 패턴</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              기록이 쌓일수록 사주 흐름의 패턴이 더 선명해져요. 하니에게 깊이 있는 분석을 받아보세요.
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
