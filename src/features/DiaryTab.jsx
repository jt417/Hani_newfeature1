import React, { useState, useMemo } from 'react';
import { BookOpen, Activity, Sparkles, Plus, X, MessageSquare, Trash2, Edit3, UserPlus, BarChart3, Target, TrendingUp, ChevronDown, ChevronUp, BookMarked, Compass, Zap, Sun, Calendar, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import {
  DIARY_EVENT_TYPES, DIARY_INITIAL_FORM, DIARY_SIPSIN_MAP, PILLAR_POSITIONS,
  EFFECT_DETAILS, SEASON_DYNAMICS, YEAR_OPTIONS, getDiaryPatternSummary, generateDiaryAnalysis
} from '../data/diaryData';
import {
  MOOD_LABELS, QUICK_KEYWORDS, DRAIN_TRIGGERS, RECOVERY_TRIGGERS,
  generateCheckInReflection, getMonthlyReport
} from '../data/relationUtils';

const EMOTION_COLORS = {
  '긍정': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  '중립': 'bg-gray-50 text-gray-500 border-gray-200',
  '부정': 'bg-rose-50 text-rose-600 border-rose-200'
};

export default function DiaryTab({ diaryEvents, setDiaryEvents, showToast, onStartDiaryChat, relatedNodes = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...DIARY_INITIAL_FORM });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [selectedRelatedIds, setSelectedRelatedIds] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);

  // ─── 빠른 기록 상태 ─────────────────────────────────
  const [showQuickRecord, setShowQuickRecord] = useState(false);
  const [quickForm, setQuickForm] = useState({
    moodLabel: '', keywords: [], relatedPersonIds: [], memo: '', energyLevel: 3,
  });

  // ─── 체크인 상태 ───────────────────────────────────
  const [checkIn, setCheckIn] = useState(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [checkInForm, setCheckInForm] = useState({
    moodLabel: '', energyLevel: 3, concernPersonId: '', drainTrigger: '', recoveryTrigger: '',
  });

  // ─── 월간 리포트 상태 ─────────────────────────────
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [reportMonth, setReportMonth] = useState({
    year: new Date().getFullYear(), month: new Date().getMonth() + 1,
  });

  const summaryTags = getDiaryPatternSummary(diaryEvents);

  // ─── 대시보드 통계 ─────────────────────────────────
  const dashboardStats = useMemo(() => {
    if (diaryEvents.length === 0) return null;
    const sipsinCounts = {};
    DIARY_EVENT_TYPES.forEach(t => { sipsinCounts[t] = 0; });
    diaryEvents.forEach(ev => { if (sipsinCounts[ev.eventType] !== undefined) sipsinCounts[ev.eventType]++; });
    const effectCounts = { '충': 0, '형': 0, '합': 0, '파': 0, '해': 0 };
    diaryEvents.forEach(ev => { (ev.analysis?.triggeredEffects || []).forEach(e => { if (effectCounts[e] !== undefined) effectCounts[e]++; }); });
    const maxEffectCount = Math.max(...Object.values(effectCounts), 1);
    const emotionCounts = { '긍정': 0, '중립': 0, '부정': 0 };
    diaryEvents.forEach(ev => { if (emotionCounts[ev.emotion] !== undefined) emotionCounts[ev.emotion]++; });
    const pillarCounts = { '년주': 0, '월주': 0, '일주': 0, '시주': 0 };
    diaryEvents.forEach(ev => { const key = ev.analysis?.pillar?.key; if (key && pillarCounts[key] !== undefined) pillarCounts[key]++; });
    const elementCounts = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    diaryEvents.forEach(ev => { const el = ev.analysis?.seasonalContext?.element; if (el && elementCounts[el] !== undefined) elementCounts[el]++; });
    const avgIntensity = (diaryEvents.reduce((s, ev) => s + ev.intensity, 0) / diaryEvents.length).toFixed(1);
    const allTags = {};
    diaryEvents.forEach(ev => { (ev.analysis?.patternTags || []).forEach(tag => { allTags[tag] = (allTags[tag] || 0) + 1; }); });
    const sortedTags = Object.entries(allTags).sort((a, b) => b[1] - a[1]);
    const dominantSipsin = Object.entries(sipsinCounts).sort((a, b) => b[1] - a[1]).filter(([, c]) => c > 0);
    const topSipsinKey = dominantSipsin[0]?.[0];
    const topSipsinData = topSipsinKey ? DIARY_SIPSIN_MAP[topSipsinKey] : null;
    const dominantEffect = Object.entries(effectCounts).sort((a, b) => b[1] - a[1])[0];
    return {
      sipsinCounts, dominantSipsin, topSipsinData,
      effectCounts, maxEffectCount, dominantEffect: dominantEffect ? { key: dominantEffect[0], count: dominantEffect[1] } : null,
      emotionCounts, pillarCounts, elementCounts, avgIntensity, sortedTags,
      totalEvents: diaryEvents.length
    };
  }, [diaryEvents]);

  // 년도별 그루핑
  const groupedEvents = useMemo(() => {
    const grouped = {};
    diaryEvents.forEach(ev => {
      const year = ev.date.split('-')[0];
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(ev);
    });
    return Object.entries(grouped).sort((a, b) => b[0] - a[0]);
  }, [diaryEvents]);

  // 월간 리포트 데이터
  const monthlyReportData = useMemo(() => {
    if (!showMonthlyReport) return null;
    return getMonthlyReport(reportMonth.year, reportMonth.month, diaryEvents, relatedNodes);
  }, [showMonthlyReport, reportMonth, diaryEvents, relatedNodes]);

  // ─── 깊이 기록 저장 ───────────────────────────────
  const handleSave = () => {
    if (!form.title.trim() || !form.memo.trim()) {
      showToast('사건 제목과 상세 내용을 입력해주세요.');
      return;
    }
    setIsAnalyzing(true);
    setTimeout(() => {
      const analysis = generateDiaryAnalysis(form.eventType, form.year, form.month, form.intensity, form.emotion);
      const relatedPeople = selectedRelatedIds.map(id => relatedNodes.find(n => n.id === id)).filter(Boolean).map(n => ({ id: n.id, name: n.name }));
      if (editingId) {
        setDiaryEvents(prev => prev.map(ev =>
          ev.id === editingId
            ? { ...ev, date: `${form.year}-${form.month.padStart(2, '0')}`, eventType: form.eventType, title: form.title, memo: form.memo, intensity: form.intensity, emotion: form.emotion, analysis, relatedPeople }
            : ev
        ));
        showToast('다이어리가 수정되었고, 십신 패턴 분석이 갱신되었어요.');
      } else {
        const newEvent = {
          id: Date.now(), date: `${form.year}-${form.month.padStart(2, '0')}`,
          eventType: form.eventType, title: form.title, memo: form.memo,
          intensity: form.intensity, emotion: form.emotion,
          analyzed: true, analysis, relatedPeople, mode: 'deep'
        };
        setDiaryEvents(prev => [newEvent, ...prev]);
        showToast('다이어리가 저장되었고, 십신 기반 발현 분석에 반영되었어요.');
      }
      setIsAnalyzing(false);
      setShowForm(false);
      setEditingId(null);
      setForm({ ...DIARY_INITIAL_FORM });
      setSelectedRelatedIds([]);
    }, 2000);
  };

  // ─── 빠른 기록 저장 ───────────────────────────────
  const handleQuickSave = () => {
    if (!quickForm.moodLabel) {
      showToast('기분을 선택해주세요.');
      return;
    }
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const relatedPeople = quickForm.relatedPersonIds
      .map(id => relatedNodes.find(n => n.id === id))
      .filter(Boolean)
      .map(n => ({ id: n.id, name: n.name }));
    const positiveLabels = ['편안함', '설렘', '뿌듯함', '회복감'];
    const negativeLabels = ['예민함', '서운함', '답답함'];
    const emotion = positiveLabels.includes(quickForm.moodLabel) ? '긍정'
      : negativeLabels.includes(quickForm.moodLabel) ? '부정' : '중립';
    const newEvent = {
      id: Date.now(), date: dateStr, eventType: '', title: '',
      memo: quickForm.memo, mode: 'quick', moodLabel: quickForm.moodLabel,
      energyLevel: quickForm.energyLevel, keywords: quickForm.keywords,
      intensity: quickForm.energyLevel, emotion, analyzed: false, relatedPeople,
    };
    setDiaryEvents(prev => [newEvent, ...prev]);
    setShowQuickRecord(false);
    setQuickForm({ moodLabel: '', keywords: [], relatedPersonIds: [], memo: '', energyLevel: 3 });
    showToast('오늘의 기분이 기록되었어요.');
  };

  // ─── 체크인 저장 ──────────────────────────────────
  const handleCheckInSave = () => {
    if (!checkInForm.moodLabel) {
      showToast('기분을 선택해주세요.');
      return;
    }
    const concernPerson = checkInForm.concernPersonId
      ? relatedNodes.find(n => n.id === checkInForm.concernPersonId)?.name || null
      : null;
    const aiReflection = generateCheckInReflection(
      checkInForm.moodLabel, checkInForm.energyLevel, concernPerson,
      { drain: checkInForm.drainTrigger, recovery: checkInForm.recoveryTrigger }
    );
    setCheckIn({ ...checkInForm, concernPerson, aiReflection });
    setShowCheckIn(false);

    // 체크인 데이터로 빠른 기록 자동 생성
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const positiveLabels = ['편안함', '설렘', '뿌듯함', '회복감'];
    const negativeLabels = ['예민함', '서운함', '답답함'];
    const emotion = positiveLabels.includes(checkInForm.moodLabel) ? '긍정'
      : negativeLabels.includes(checkInForm.moodLabel) ? '부정' : '중립';
    const relatedPeople = checkInForm.concernPersonId
      ? [relatedNodes.find(n => n.id === checkInForm.concernPersonId)].filter(Boolean).map(n => ({ id: n.id, name: n.name }))
      : [];
    const keywords = [checkInForm.drainTrigger, checkInForm.recoveryTrigger].filter(Boolean);
    const newEvent = {
      id: Date.now() + 1, date: dateStr, eventType: '', title: '',
      memo: `체크인: ${checkInForm.moodLabel}`, mode: 'quick',
      moodLabel: checkInForm.moodLabel, energyLevel: checkInForm.energyLevel,
      keywords, intensity: checkInForm.energyLevel, emotion,
      analyzed: false, relatedPeople,
    };
    setDiaryEvents(prev => [newEvent, ...prev]);
    showToast('오늘의 체크인이 완료되었어요.');
  };

  const handleEdit = (ev) => {
    if (ev.mode === 'quick') return; // 빠른 기록은 수정 불가
    const [year, month] = ev.date.split('-');
    setForm({ ...DIARY_INITIAL_FORM, year, month, eventType: ev.eventType, title: ev.title, memo: ev.memo, intensity: ev.intensity, emotion: ev.emotion });
    setEditingId(ev.id);
    setSelectedRelatedIds((ev.relatedPeople || []).map(p => p.id));
    setShowForm(true);
  };

  const handleDelete = (id) => {
    setDiaryEvents(prev => prev.filter(ev => ev.id !== id));
    setDeleteConfirmId(null);
    showToast('기록이 삭제되었어요.');
  };

  const handleCloseForm = () => {
    if (isAnalyzing) return;
    setShowForm(false);
    setEditingId(null);
    setForm({ ...DIARY_INITIAL_FORM });
  };

  const selectedSipsin = DIARY_SIPSIN_MAP[form.eventType];

  return (
    <div className="flex flex-col h-full bg-[#F7F5FA] relative">
      {/* ─── 상단 배너 ─── */}
      <div className="bg-gradient-to-br from-[#5E4078] to-[#7C5A9B] px-5 py-5 text-white rounded-b-[2rem] shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
          <BookOpen className="w-32 h-32 -mr-4 -mt-4" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-1">다이어리</h2>
          <p className="text-[11px] text-purple-100 leading-relaxed">
            기록이 쌓일수록 사주 분석이 더 정확해져요.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto mt-1">

        {/* ═══ 오늘의 체크인 ═══ */}
        {!checkIn ? (
          <button onClick={() => setShowCheckIn(true)}
            className="w-full bg-gradient-to-r from-[#FAF7FD] to-[#F0EBF5] border border-[#EBE5F2] text-[#5E4078] font-bold py-5 rounded-2xl shadow-sm flex flex-col items-center gap-1 hover:shadow-md transition"
          >
            <Sun className="w-6 h-6 text-amber-400" />
            <span className="text-sm">오늘의 체크인</span>
            <span className="text-[10px] text-gray-400 font-normal">오늘 기분과 에너지를 30초 안에 기록해보세요</span>
          </button>
        ) : (
          <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <p className="text-xs font-bold text-[#5E4078]">오늘의 체크인</p>
              </div>
              <button onClick={() => { setCheckIn(null); setShowCheckIn(true); setCheckInForm({ moodLabel: '', energyLevel: 3, concernPersonId: '', drainTrigger: '', recoveryTrigger: '' }); }}
                className="text-[10px] text-gray-400 font-bold">다시 하기</button>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{MOOD_LABELS.find(m => m.label === checkIn.moodLabel)?.emoji}</span>
              <div>
                <p className="text-sm font-bold text-gray-800">{checkIn.moodLabel}</p>
                <p className="text-[10px] text-gray-400">에너지 {checkIn.energyLevel}/5{checkIn.concernPerson ? ` · ${checkIn.concernPerson}` : ''}</p>
              </div>
            </div>
            {checkIn.aiReflection && (
              <div className="bg-[#FAF7FD] rounded-xl p-3 border border-[#EFE7F7]">
                <div className="flex items-center gap-1 mb-1">
                  <Sparkles className="w-3 h-3 text-[#7C3AED]" />
                  <p className="text-[10px] font-bold text-[#7C3AED]">하니의 한마디</p>
                </div>
                <p className="text-[11px] text-gray-600 leading-relaxed">{checkIn.aiReflection}</p>
              </div>
            )}
          </div>
        )}

        {/* ═══ 대시보드 ═══ */}
        <div className="bg-white rounded-2xl border border-[#EBE5F2] shadow-sm overflow-hidden">
          <button onClick={() => diaryEvents.length > 0 && setShowDashboard(p => !p)} className="w-full p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#5E4078]" />
              <p className="text-xs font-bold text-[#5E4078]">십신 발현 패턴 대시보드</p>
              {dashboardStats && (
                <span className="text-[9px] bg-[#F0EBF5] text-[#5E4078] px-2 py-0.5 rounded-full font-bold border border-[#E5DDF0]">
                  {dashboardStats.totalEvents}건
                </span>
              )}
            </div>
            {diaryEvents.length > 0 && (
              showDashboard ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {!showDashboard && (
            <div className="px-4 pb-4 -mt-1">
              <div className="flex flex-wrap gap-2">
                {summaryTags.length > 0 ? summaryTags.map(tag => (
                  <span key={tag} className="px-3 py-1.5 rounded-full bg-[#F0EBF5] text-[#5E4078] text-[11px] font-bold border border-[#E5DDF0]">{tag}</span>
                )) : (
                  <span className="text-xs text-gray-400">아직 패턴 데이터가 부족해요. 사건을 더 기록해보세요.</span>
                )}
              </div>
              {summaryTags.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-2">탭하여 상세 분석 대시보드를 확인하세요</p>
              )}
            </div>
          )}

          {/* ─── 펼친 대시보드 ─── */}
          {showDashboard && dashboardStats && (
            <div className="px-4 pb-5 space-y-5 animate-fade-in">
              {/* 1. AI 종합 해석 */}
              {dashboardStats.topSipsinData && (
                <div className="bg-gradient-to-br from-[#FAF7FD] to-[#F0EBF5] rounded-xl p-4 border border-[#EFE7F7]">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-[#7C3AED]" />
                    <p className="text-[11px] font-bold text-[#7C3AED]">고전 기반 종합 해석</p>
                  </div>
                  <p className="text-[12px] text-gray-600 leading-relaxed mb-3">
                    {dashboardStats.totalEvents}건의 기록을 분석한 결과, 당신은{' '}
                    <strong className="text-[#5E4078]">{dashboardStats.topSipsinData.sipsin}({dashboardStats.topSipsinData.hanja})</strong>{' '}
                    영역의 사건이 가장 많습니다.
                    {dashboardStats.topSipsinData.elementRelation}이 삶에 자주 작용하며,{' '}
                    {dashboardStats.dominantEffect && (
                      <><strong className="text-[#5E4078]">{EFFECT_DETAILS[dashboardStats.dominantEffect.key]?.name}</strong> 작용에 가장 민감하게 반응합니다.</>
                    )}
                  </p>
                  {dashboardStats.topSipsinData.classicalQuotes[0] && (
                    <div className="bg-white/60 rounded-lg px-3 py-2 border border-[#E5DDF0]">
                      <p className="text-[11px] text-[#5E4078] font-medium italic leading-relaxed">"{dashboardStats.topSipsinData.classicalQuotes[0].text}"</p>
                      <p className="text-[9px] text-gray-400 mt-1">— {dashboardStats.topSipsinData.classicalQuotes[0].source}</p>
                    </div>
                  )}
                </div>
              )}

              {/* 2. 십신 분포 */}
              <div>
                <div className="flex items-center gap-2 mb-3"><Compass className="w-3.5 h-3.5 text-[#5E4078]" /><p className="text-[11px] font-bold text-gray-700">십신(十神) 사건 분포</p></div>
                <div className="space-y-1.5">
                  {dashboardStats.dominantSipsin.slice(0, 5).map(([type, count]) => {
                    const data = DIARY_SIPSIN_MAP[type];
                    const pct = Math.round((count / dashboardStats.totalEvents) * 100);
                    return (
                      <div key={type} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 w-16 shrink-0 truncate">{data?.sipsin || type}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                          <div className="h-full rounded-full bg-[#5E4078] transition-all duration-500" style={{ width: `${Math.max(pct, 8)}%` }} />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gray-500">{count}건</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. 합충형파해 빈도 */}
              <div>
                <div className="flex items-center gap-2 mb-3"><Activity className="w-3.5 h-3.5 text-[#5E4078]" /><p className="text-[11px] font-bold text-gray-700">합충형파해 발현 빈도</p></div>
                <div className="space-y-2">
                  {['충', '형', '합', '파', '해'].map(key => {
                    const count = dashboardStats.effectCounts[key];
                    const detail = EFFECT_DETAILS[key];
                    const pct = Math.round((count / dashboardStats.maxEffectCount) * 100);
                    const colorMap = { '충': 'bg-amber-400', '형': 'bg-rose-400', '합': 'bg-emerald-400', '파': 'bg-purple-400', '해': 'bg-blue-400' };
                    return (
                      <div key={key} className="flex items-center gap-2.5">
                        <span className="text-sm w-6 text-center shrink-0">{detail.emoji}</span>
                        <span className="text-[11px] font-bold text-gray-600 w-4 shrink-0">{key}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                          <div className={`h-full rounded-full ${colorMap[key]} transition-all duration-500`} style={{ width: `${count > 0 ? Math.max(pct, 8) : 0}%` }} />
                          {count > 0 && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500">{count}회</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. 궁위별 분포 */}
              <div>
                <div className="flex items-center gap-2 mb-3"><Target className="w-3.5 h-3.5 text-[#5E4078]" /><p className="text-[11px] font-bold text-gray-700">궁위(宮位)별 사건 분포</p></div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(PILLAR_POSITIONS).map(([key, info]) => {
                    const count = dashboardStats.pillarCounts[key] || 0;
                    const pct = dashboardStats.totalEvents > 0 ? Math.round((count / dashboardStats.totalEvents) * 100) : 0;
                    return (
                      <div key={key} className="bg-[#FAF7FD] rounded-xl p-2.5 text-center border border-[#EFE7F7]">
                        <p className="text-base mb-1">{info.emoji}</p>
                        <p className="text-[10px] font-bold text-[#5E4078]">{key}</p>
                        <p className="text-lg font-extrabold text-[#5E4078]">{pct}%</p>
                        <p className="text-[8px] text-gray-400">{count}건</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. 감정 분포 */}
              <div>
                <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-3.5 h-3.5 text-[#5E4078]" /><p className="text-[11px] font-bold text-gray-700">감정 분포</p><span className="text-[10px] text-gray-400 ml-auto">평균 강도 {dashboardStats.avgIntensity}/5</span></div>
                <div className="flex gap-2">
                  {[
                    { key: '긍정', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
                    { key: '중립', textColor: 'text-gray-600', bgColor: 'bg-gray-50' },
                    { key: '부정', textColor: 'text-rose-700', bgColor: 'bg-rose-50' }
                  ].map(({ key, textColor, bgColor }) => {
                    const count = dashboardStats.emotionCounts[key];
                    const pct = dashboardStats.totalEvents > 0 ? Math.round((count / dashboardStats.totalEvents) * 100) : 0;
                    return (
                      <div key={key} className={`flex-1 ${bgColor} rounded-xl p-3 text-center border border-gray-100`}>
                        <p className={`text-lg font-extrabold ${textColor}`}>{pct}%</p>
                        <p className="text-[10px] text-gray-500 font-bold">{key}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{count}건</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 6. 누적 패턴 태그 */}
              {dashboardStats.sortedTags.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-700 mb-2.5">누적 발현 패턴 태그</p>
                  <div className="flex flex-wrap gap-1.5">
                    {dashboardStats.sortedTags.map(([tag, count]) => (
                      <span key={tag} className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2.5 py-1 rounded-full font-bold border border-[#E5DDF0]">
                        {tag} <span className="text-[#A994C1]">x{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI 상담 + 월간 리포트 CTA */}
              <button onClick={() => onStartDiaryChat()} className="w-full bg-[#5E4078] text-white rounded-xl py-3.5 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#4A306D] transition-colors shadow-md">
                <MessageSquare className="w-4 h-4" /> 전체 발현 패턴으로 AI 상담하기
              </button>
              <button onClick={() => setShowMonthlyReport(true)} className="w-full bg-white border border-[#EBE5F2] text-[#5E4078] rounded-xl py-3 text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#FAF7FD] transition-colors">
                <Calendar className="w-4 h-4" /> 월간 리포트 보기
              </button>
              <button onClick={() => setShowDashboard(false)} className="w-full text-center text-[11px] text-gray-400 font-bold py-1 hover:text-gray-600 transition">대시보드 접기</button>
            </div>
          )}
        </div>

        {/* ═══ 기록 추가 (2버튼) ═══ */}
        <div className="flex gap-2">
          <button onClick={() => setShowQuickRecord(true)}
            className="flex-1 bg-[#5E4078] text-white font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-[#4A306D] transition-colors"
          >
            <Zap className="w-4 h-4" /> 빠른 기록
          </button>
          <button onClick={() => { setEditingId(null); setForm({ ...DIARY_INITIAL_FORM }); setSelectedRelatedIds([]); setShowForm(true); }}
            className="flex-1 bg-white border border-dashed border-[#C9B7DA] text-[#5E4078] font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
          >
            <Plus className="w-4 h-4" /> 깊이 기록
          </button>
        </div>
        <div className="bg-[#FAF7FD] rounded-xl px-4 py-2.5 border border-[#EFE7F7]">
          <p className="text-[11px] text-[#7C5A9B] text-center leading-relaxed font-medium">
            {diaryEvents.length < 5
              ? `현재 ${diaryEvents.length}건의 기록 — 10건 이상부터 사주 패턴 분석이 정확해져요`
              : diaryEvents.length < 15
                ? `${diaryEvents.length}건 기록 중 — 기록이 쌓일수록 숨겨진 사주 흐름이 보여요`
                : `${diaryEvents.length}건의 기록이 쌓였어요 — 당신만의 사주 패턴이 선명해지고 있어요`
            }
          </p>
        </div>

        {/* ═══ 타임라인 ═══ */}
        {groupedEvents.map(([year, events]) => (
          <div key={year}>
            <div className="flex items-center gap-2 mb-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-[#5E4078]"></div>
              <p className="text-sm font-extrabold text-[#5E4078]">{year}년</p>
              <div className="flex-1 h-px bg-[#E5DDF0]"></div>
              <span className="text-[10px] text-gray-400 font-bold">{events.length}건</span>
            </div>
            <div className="space-y-3 ml-1 border-l-2 border-[#E5DDF0] pl-4">
              {events.map((ev, idx) => {
                const isQuick = ev.mode === 'quick';
                const sipsinInfo = !isQuick ? DIARY_SIPSIN_MAP[ev.eventType] : null;
                const analysis = ev.analysis || {};
                const moodInfo = isQuick ? MOOD_LABELS.find(m => m.label === ev.moodLabel) : null;

                return (
                  <div key={ev.id} className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm animate-fade-in-up relative" style={{ animationDelay: `${idx * 0.06}s` }}>
                    <div className="absolute -left-[22px] top-5 w-3 h-3 rounded-full bg-white border-2 border-[#5E4078]"></div>

                    {isQuick ? (
                      /* ─── 빠른 기록 카드 ─── */
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{moodInfo?.emoji || '📝'}</span>
                            <span className="text-sm font-bold text-[#5E4078]">{ev.moodLabel}</span>
                            <span className="text-[9px] bg-[#F0EBF5] text-[#5E4078] px-1.5 py-0.5 rounded-full font-bold border border-[#E5DDF0]">빠른기록</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-gray-400">{ev.date}</span>
                            <button onClick={() => setDeleteConfirmId(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 className="w-3.5 h-3.5 text-gray-400" /></button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] text-gray-400">에너지 {ev.energyLevel}/5</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${EMOTION_COLORS[ev.emotion] || ''}`}>{ev.emotion}</span>
                        </div>
                        {ev.keywords && ev.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {ev.keywords.map(kw => (
                              <span key={kw} className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2 py-0.5 rounded-full font-bold border border-[#E5DDF0]">{kw}</span>
                            ))}
                          </div>
                        )}
                        {ev.memo && <p className="text-[12px] text-gray-500 leading-relaxed">{ev.memo}</p>}
                        {ev.relatedPeople && ev.relatedPeople.length > 0 && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <UserPlus className="w-3 h-3 text-gray-400 shrink-0" />
                            {ev.relatedPeople.map(p => (
                              <span key={p.id} className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2 py-0.5 rounded-full font-bold border border-[#E5DDF0]">{p.name}</span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      /* ─── 깊이 기록 카드 (기존) ─── */
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-extrabold text-[#5E4078]">{ev.date.replace('-', '년 ')}월</p>
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(ev)} className="p-1.5 rounded-lg hover:bg-gray-100 transition"><Edit3 className="w-3.5 h-3.5 text-gray-400" /></button>
                            <button onClick={() => setDeleteConfirmId(ev.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition"><Trash2 className="w-3.5 h-3.5 text-gray-400" /></button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {sipsinInfo && (<span className="text-[10px] bg-[#5E4078] text-white px-2 py-1 rounded-full font-bold">{sipsinInfo.sipsin}·{sipsinInfo.hanja}</span>)}
                          {analysis.pillar && (<span className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2 py-1 rounded-full font-bold border border-[#E5DDF0]">{analysis.pillar.emoji} {analysis.pillar.key}</span>)}
                          {(analysis.triggeredEffects || []).map(e => {
                            const detail = EFFECT_DETAILS[e]; if (!detail) return null;
                            const colorMap = { '충': 'bg-amber-50 text-amber-700 border-amber-200', '형': 'bg-rose-50 text-rose-700 border-rose-200', '합': 'bg-emerald-50 text-emerald-700 border-emerald-200', '파': 'bg-purple-50 text-purple-700 border-purple-200', '해': 'bg-blue-50 text-blue-700 border-blue-200' };
                            return (<span key={e} className={`text-[10px] px-2 py-1 rounded-full font-bold border ${colorMap[e] || ''}`}>{detail.emoji} {detail.name}</span>);
                          })}
                          <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-full font-bold border border-gray-200">체감 {ev.intensity}/5</span>
                          <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${EMOTION_COLORS[ev.emotion] || ''}`}>{ev.emotion}</span>
                        </div>
                        <p className="font-bold text-[#2B1B35] text-sm mb-1">{ev.title}</p>
                        <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{ev.memo}</p>
                        {ev.relatedPeople && ev.relatedPeople.length > 0 && (
                          <div className="flex items-center gap-1.5 mb-3">
                            <UserPlus className="w-3 h-3 text-gray-400 shrink-0" />
                            {ev.relatedPeople.map(p => (<span key={p.id} className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2 py-0.5 rounded-full font-bold border border-[#E5DDF0]">{p.name}</span>))}
                          </div>
                        )}
                        {analysis.summary && (
                          <div className="bg-[#FAF7FD] rounded-xl p-3.5 border border-[#EFE7F7]">
                            <div className="flex items-center gap-1.5 mb-2"><Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" /><p className="text-[11px] font-bold text-[#7C3AED]">{analysis.sipsin?.name}({analysis.sipsin?.hanja}) 분석</p></div>
                            <p className="text-[11px] text-gray-600 leading-relaxed mb-3">{analysis.summary}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                              {analysis.pillar && (<p className="text-[10px] text-gray-500"><span className="font-bold text-[#5E4078]">{analysis.pillar.emoji} 궁위:</span> {analysis.pillar.name} — {analysis.pillar.domain}</p>)}
                              {analysis.seasonalContext?.note && (<p className="text-[10px] text-gray-500"><span className="font-bold text-[#5E4078]">🌿 계절:</span> {analysis.seasonalContext.season} {analysis.seasonalContext.dominant}</p>)}
                            </div>
                            {analysis.depthInsight && (<p className="text-[10px] text-gray-500 leading-relaxed mb-3 bg-white/60 rounded-lg px-3 py-2 border border-[#EFE7F7]">{analysis.depthInsight}</p>)}
                            {analysis.classicalQuote && (
                              <div className="bg-white/60 rounded-lg px-3 py-2 border border-[#E5DDF0] mb-3">
                                <div className="flex items-center gap-1 mb-1"><BookMarked className="w-3 h-3 text-[#A994C1]" /><p className="text-[9px] font-bold text-[#A994C1]">사주 해석</p></div>
                                <p className="text-[11px] text-[#5E4078] font-medium leading-relaxed">{analysis.classicalQuote.text}</p>
                                <p className="text-[9px] text-gray-400 mt-0.5">— {analysis.classicalQuote.source}</p>
                              </div>
                            )}
                            <div className="flex flex-wrap gap-1.5">
                              {(analysis.patternTags || []).map(tag => (<span key={tag} className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2 py-1 rounded-full font-bold">{tag}</span>))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {diaryEvents.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-400 mb-1">아직 기록된 사건이 없어요</p>
            <p className="text-xs text-gray-300">위의 버튼을 눌러 첫 사건을 기록해보세요</p>
          </div>
        )}
      </div>

      {/* ═══ 삭제 확인 모달 ═══ */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setDeleteConfirmId(null)}>
          <div className="bg-white rounded-3xl p-6 mx-6 w-full max-w-[340px] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 className="w-7 h-7 text-rose-500" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">기록 삭제</h3>
              <p className="text-sm text-gray-500">이 기록을 삭제하시겠어요?<br />삭제하면 패턴 분석에서도 제외됩니다.</p>
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">취소</button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="flex-1 bg-rose-500 text-white font-bold py-3.5 rounded-xl hover:bg-rose-600 transition">삭제하기</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 빠른 기록 바텀시트 ═══ */}
      {showQuickRecord && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={() => setShowQuickRecord(false)}>
          <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[85%] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">빠른 기록</h3>
              <button onClick={() => setShowQuickRecord(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-5">
              {/* 기분 선택 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">오늘 기분은?</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_LABELS.map(mood => (
                    <button key={mood.key} onClick={() => setQuickForm(p => ({ ...p, moodLabel: mood.label }))}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${quickForm.moodLabel === mood.label ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      <span className="text-lg">{mood.emoji}</span>
                      <span className="text-[10px] font-bold">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 에너지 레벨 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">에너지 수준</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setQuickForm(p => ({ ...p, energyLevel: n }))}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-colors ${quickForm.energyLevel === n ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-500 border-gray-200'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {/* 키워드 선택 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">무슨 일이 있었나요? (선택)</label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_KEYWORDS.map(kw => {
                    const isActive = quickForm.keywords.includes(kw);
                    return (
                      <button key={kw} onClick={() => setQuickForm(p => ({ ...p, keywords: isActive ? p.keywords.filter(k => k !== kw) : [...p.keywords, kw] }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isActive ? 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]' : 'bg-white text-gray-500 border-gray-200'}`}
                      >{kw}</button>
                    );
                  })}
                </div>
              </div>

              {/* 관련 인물 */}
              {relatedNodes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2"><UserPlus className="w-3 h-3 inline mr-1" />관련 인물 (선택)</label>
                  <div className="flex flex-wrap gap-2">
                    {relatedNodes.map(node => {
                      const isSelected = quickForm.relatedPersonIds.includes(node.id);
                      return (
                        <button key={node.id} onClick={() => setQuickForm(p => ({ ...p, relatedPersonIds: isSelected ? p.relatedPersonIds.filter(id => id !== node.id) : [...p.relatedPersonIds, node.id] }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${isSelected ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/20' : 'bg-[#F0EBF5] text-[#5E4078]'}`}>{node.name.charAt(0)}</span>
                          {node.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 한줄 메모 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">한 줄 메모 (선택)</label>
                <input type="text" value={quickForm.memo} onChange={e => setQuickForm(p => ({ ...p, memo: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#5E4078]"
                  placeholder="짧게 남기고 싶은 말"
                />
              </div>

              <button onClick={handleQuickSave} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#4A306D] transition">
                기분 기록하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 체크인 바텀시트 ═══ */}
      {showCheckIn && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={() => setShowCheckIn(false)}>
          <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[85%] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">오늘의 체크인</h3>
                <p className="text-[11px] text-gray-400">30초 안에 오늘을 정리해보세요</p>
              </div>
              <button onClick={() => setShowCheckIn(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-5">
              {/* 기분 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">오늘 기분은?</label>
                <div className="grid grid-cols-4 gap-2">
                  {MOOD_LABELS.map(mood => (
                    <button key={mood.key} onClick={() => setCheckInForm(p => ({ ...p, moodLabel: mood.label }))}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${checkInForm.moodLabel === mood.label ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-600 border-gray-200'}`}
                    >
                      <span className="text-lg">{mood.emoji}</span>
                      <span className="text-[10px] font-bold">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 에너지 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">에너지 수준</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setCheckInForm(p => ({ ...p, energyLevel: n }))}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-colors ${checkInForm.energyLevel === n ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-500 border-gray-200'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {/* 가장 신경 쓰인 사람 */}
              {relatedNodes.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">가장 신경 쓰인 사람은? (선택)</label>
                  <div className="flex flex-wrap gap-2">
                    {relatedNodes.map(node => (
                      <button key={node.id} onClick={() => setCheckInForm(p => ({ ...p, concernPersonId: p.concernPersonId === node.id ? '' : node.id }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${checkInForm.concernPersonId === node.id ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-600 border-gray-200'}`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${checkInForm.concernPersonId === node.id ? 'bg-white/20' : 'bg-[#F0EBF5] text-[#5E4078]'}`}>{node.name.charAt(0)}</span>
                        {node.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 소모 트리거 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">나를 소모시킨 것은? (선택)</label>
                <div className="flex flex-wrap gap-2">
                  {DRAIN_TRIGGERS.map(t => (
                    <button key={t} onClick={() => setCheckInForm(p => ({ ...p, drainTrigger: p.drainTrigger === t ? '' : t }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${checkInForm.drainTrigger === t ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-white text-gray-500 border-gray-200'}`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* 회복 트리거 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">나를 회복시킨 것은? (선택)</label>
                <div className="flex flex-wrap gap-2">
                  {RECOVERY_TRIGGERS.map(t => (
                    <button key={t} onClick={() => setCheckInForm(p => ({ ...p, recoveryTrigger: p.recoveryTrigger === t ? '' : t }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${checkInForm.recoveryTrigger === t ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-white text-gray-500 border-gray-200'}`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleCheckInSave} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#4A306D] transition">
                체크인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ 월간 리포트 모달 ═══ */}
      {showMonthlyReport && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={() => setShowMonthlyReport(false)}>
          <div className="bg-[#F7F5FA] w-full rounded-t-[2rem] p-5 pb-10 max-h-[90%] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{reportMonth.year}년 {reportMonth.month}월 리포트</h3>
              <button onClick={() => setShowMonthlyReport(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X className="w-4 h-4" /></button>
            </div>

            {/* 월 선택기 */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <button onClick={() => setReportMonth(prev => {
                const m = prev.month - 1;
                return m < 1 ? { year: prev.year - 1, month: 12 } : { ...prev, month: m };
              })} className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
              <span className="text-sm font-bold text-[#5E4078]">{reportMonth.year}년 {reportMonth.month}월</span>
              <button onClick={() => setReportMonth(prev => {
                const m = prev.month + 1;
                return m > 12 ? { year: prev.year + 1, month: 1 } : { ...prev, month: m };
              })} className="bg-white p-2 rounded-full border border-gray-200 shadow-sm"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            </div>

            {monthlyReportData && (
              <div className="space-y-4">
                {monthlyReportData.totalEvents === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-400">이번 달 기록이 아직 없어요</p>
                    <p className="text-xs text-gray-300 mt-1">기록을 남기면 리포트가 자동으로 생성돼요</p>
                  </div>
                ) : (
                  <>
                    {/* 기록 수 + 평균 강도 */}
                    <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-gray-500">이번 달 기록</p>
                          <p className="text-2xl font-extrabold text-[#5E4078]">{monthlyReportData.totalEvents}건</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500">평균 강도</p>
                          <p className="text-2xl font-extrabold text-[#5E4078]">{monthlyReportData.avgIntensity}/5</p>
                        </div>
                      </div>
                    </div>

                    {/* 감정 분포 */}
                    <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm">
                      <p className="text-xs font-bold text-[#5E4078] mb-3">감정 분포</p>
                      <div className="flex gap-2">
                        {[
                          { key: '긍정', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
                          { key: '중립', textColor: 'text-gray-600', bgColor: 'bg-gray-50' },
                          { key: '부정', textColor: 'text-rose-700', bgColor: 'bg-rose-50' },
                        ].map(({ key, textColor, bgColor }) => {
                          const count = monthlyReportData.emotionCounts[key];
                          const pct = monthlyReportData.totalEvents > 0 ? Math.round((count / monthlyReportData.totalEvents) * 100) : 0;
                          return (
                            <div key={key} className={`flex-1 ${bgColor} rounded-xl p-3 text-center border border-gray-100`}>
                              <p className={`text-lg font-extrabold ${textColor}`}>{pct}%</p>
                              <p className="text-[10px] text-gray-500 font-bold">{key}</p>
                              <p className="text-[10px] text-gray-400">{count}건</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 가장 많이 떠올린 사람 */}
                    {monthlyReportData.mostConnectedPerson && (
                      <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm">
                        <p className="text-xs font-bold text-[#5E4078] mb-2">가장 많이 떠올린 사람</p>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#F0EBF5] border border-[#D1C5E0] flex items-center justify-center text-[#5E4078] font-bold text-sm">
                            {monthlyReportData.mostConnectedPerson.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{monthlyReportData.mostConnectedPerson.name}</p>
                            <p className="text-[10px] text-gray-400">{monthlyReportData.mostConnectedPerson.count}건의 기록과 연결</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 반복 패턴 */}
                    {monthlyReportData.repeatedPatterns.length > 0 && (
                      <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm">
                        <p className="text-xs font-bold text-[#5E4078] mb-2">반복된 패턴</p>
                        <div className="flex flex-wrap gap-1.5">
                          {monthlyReportData.repeatedPatterns.map(tag => (
                            <span key={tag} className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2.5 py-1 rounded-full font-bold border border-[#E5DDF0]">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 소모/회복 패턴 */}
                    {(monthlyReportData.drainPatterns.length > 0 || monthlyReportData.recoveryPatterns.length > 0) && (
                      <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                            <p className="text-[10px] text-rose-700 font-bold mb-2">소모 패턴</p>
                            {monthlyReportData.drainPatterns.map(p => (
                              <p key={p} className="text-[11px] text-rose-600 mb-0.5">· {p}</p>
                            ))}
                            {monthlyReportData.drainPatterns.length === 0 && <p className="text-[11px] text-rose-400">없음</p>}
                          </div>
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                            <p className="text-[10px] text-emerald-700 font-bold mb-2">회복 패턴</p>
                            {monthlyReportData.recoveryPatterns.map(p => (
                              <p key={p} className="text-[11px] text-emerald-600 mb-0.5">· {p}</p>
                            ))}
                            {monthlyReportData.recoveryPatterns.length === 0 && <p className="text-[11px] text-emerald-400">없음</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 무드 요약 */}
                    {monthlyReportData.moodSummary.length > 0 && (
                      <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm">
                        <p className="text-xs font-bold text-[#5E4078] mb-2">빠른 기록 감정 요약</p>
                        <div className="flex flex-wrap gap-2">
                          {monthlyReportData.moodSummary.map(([label, count]) => {
                            const mood = MOOD_LABELS.find(m => m.label === label);
                            return (
                              <div key={label} className="flex items-center gap-1 bg-[#FAF7FD] rounded-full px-3 py-1.5 border border-[#EFE7F7]">
                                <span className="text-sm">{mood?.emoji}</span>
                                <span className="text-[11px] font-bold text-[#5E4078]">{label}</span>
                                <span className="text-[10px] text-gray-400">{count}회</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 다음 달 제안 */}
                    <div className="bg-gradient-to-br from-[#FAF7FD] to-[#F0EBF5] rounded-2xl p-4 border border-[#EFE7F7]">
                      <div className="flex items-center gap-1 mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                        <p className="text-xs font-bold text-[#7C3AED]">다음 달 제안</p>
                      </div>
                      <div className="space-y-2">
                        {monthlyReportData.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="text-sm shrink-0">💡</span>
                            <p className="text-[11px] text-gray-600 leading-relaxed">{s}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ 깊이 기록 입력/수정 모달 ═══ */}
      {showForm && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={handleCloseForm}>
          <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[85%] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? '사건 수정' : '깊이 기록'}</h3>
              <button onClick={handleCloseForm} disabled={isAnalyzing} className={`bg-gray-100 p-2 rounded-full text-gray-500 ${isAnalyzing ? 'opacity-30 cursor-not-allowed' : ''}`}><X className="w-4 h-4" /></button>
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center animate-pulse">
                <Activity className="w-12 h-12 text-[#5E4078] mb-4" />
                <p className="font-bold text-gray-800 mb-2">십신 기반 발현 패턴 분석 중...</p>
                <p className="text-xs text-gray-500">사주 고전 이론 대조 및 합충형파해 역학 계산</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">발생 연도</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]" value={form.year} onChange={e => setForm(prev => ({ ...prev, year: e.target.value }))}>
                      {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}년</option>)}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">발생 월</label>
                    <select className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]" value={form.month} onChange={e => setForm(prev => ({ ...prev, month: e.target.value }))}>
                      {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => <option key={m} value={m}>{m}월</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">사건 유형 (십신 기반)</label>
                  <div className="flex flex-wrap gap-2">
                    {DIARY_EVENT_TYPES.map(type => {
                      const data = DIARY_SIPSIN_MAP[type];
                      const isActive = form.eventType === type;
                      return (
                        <button key={type} onClick={() => setForm(prev => ({ ...prev, eventType: type }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${isActive ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {type}
                          {data && <span className={`ml-1 text-[9px] ${isActive ? 'text-purple-200' : 'text-gray-400'}`}>{data.sipsin}</span>}
                        </button>
                      );
                    })}
                  </div>
                  {selectedSipsin && (
                    <div className="mt-2 bg-[#FAF7FD] rounded-lg px-3 py-2 border border-[#EFE7F7]">
                      <p className="text-[11px] text-[#5E4078] font-bold mb-0.5">{selectedSipsin.sipsin}({selectedSipsin.hanja}) — {selectedSipsin.elementRelation}</p>
                      <p className="text-[10px] text-gray-500">{selectedSipsin.desc}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">사건 제목</label>
                  <input type="text" value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#5E4078]" placeholder="예: 직장 내 큰 마찰, 연인과 이별" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">상세 기록</label>
                  <textarea value={form.memo} onChange={e => setForm(prev => ({ ...prev, memo: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078] resize-none h-20" placeholder="당시에 어떤 일이 있었는지, 감정과 결과를 구체적으로 적어주세요." />
                </div>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">체감 강도</label>
                    <select value={form.intensity} onChange={e => setForm(prev => ({ ...prev, intensity: Number(e.target.value) }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]">
                      <option value={1}>1 - 약함</option><option value={2}>2</option><option value={3}>3 - 보통</option><option value={4}>4</option><option value={5}>5 - 매우 큼</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 mb-1">감정 결과</label>
                    <select value={form.emotion} onChange={e => setForm(prev => ({ ...prev, emotion: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]">
                      <option>긍정</option><option>중립</option><option>부정</option>
                    </select>
                  </div>
                </div>

                {relatedNodes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2"><UserPlus className="w-3 h-3 inline mr-1" />관련 인물 (선택)</label>
                    <div className="flex flex-wrap gap-2">
                      {relatedNodes.map(node => {
                        const isSelected = selectedRelatedIds.includes(node.id);
                        return (
                          <button key={node.id} onClick={() => setSelectedRelatedIds(prev => isSelected ? prev.filter(id => id !== node.id) : [...prev, node.id])}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center gap-1 ${isSelected ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-white/20' : 'bg-[#F0EBF5] text-[#5E4078]'}`}>{node.name.charAt(0)}</span>
                            {node.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button onClick={handleSave} disabled={isAnalyzing} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg mt-1 hover:bg-[#4A306D] transition disabled:opacity-60">
                  {editingId ? '수정하고 재분석하기' : '기록 저장하고 분석하기'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
