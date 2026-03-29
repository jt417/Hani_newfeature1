import React, { useState, useMemo } from 'react';
import {
  User, ChevronRight, Bell, Crown, Clock,
  Settings, CreditCard, HelpCircle, FileText, Check, Sparkles
} from 'lucide-react';

// ─── 출석 체크 요일 라벨 ───────────────────────────
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

// ─── 더미 거래 내역 ─────────────────────────────────
const DUMMY_TRANSACTIONS = [
  { id: 1, label: '궁합 분석 (조멀티)', type: 'spend', amount: -5, currency: 'Orb', date: '03/26' },
  { id: 2, label: '출석 보상', type: 'earn', amount: +2, currency: 'HANI', date: '03/25' },
  { id: 3, label: '하니 사주 상담', type: 'spend', amount: -3, currency: 'Orb', date: '03/24' },
];

export default function MyTab({ haniCoin, orb, showToast }) {
  const [notificationOn, setNotificationOn] = useState(true);
  const [checkedDays, setCheckedDays] = useState([true, true, true, true, false, false, false]); // 월~일

  // ─── 오늘 요일 인덱스 (월=0) ─────────────────────
  const todayIdx = useMemo(() => {
    const day = new Date().getDay(); // 0=일 ~ 6=토
    return day === 0 ? 6 : day - 1;  // 월=0 ~ 일=6
  }, []);

  // ─── 출석 체크 핸들러 ────────────────────────────
  const handleAttendance = () => {
    if (checkedDays[todayIdx]) {
      showToast('이미 오늘 출석했어요!', 'info');
      return;
    }
    const updated = [...checkedDays];
    updated[todayIdx] = true;
    setCheckedDays(updated);
    showToast('+2 HANI 코인 지급!', 'success');
  };

  return (
    <div className="flex-1 overflow-y-auto pb-[72px] bg-surface animate-fade-in">

      {/* ═══ 프로필 헤더 ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-primary-deep px-5 pt-4 pb-6">
        {/* 배경 데코 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 flex items-center gap-4">
          {/* 아바타 */}
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
            <span className="text-xl font-extrabold text-white">김</span>
          </div>

          <div className="flex-1">
            <h2 className="text-white text-lg font-extrabold">김하니</h2>
            <p className="text-white/60 text-xs mt-0.5">1996년 5월 15일 丙子</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-amber-300 text-[10px] font-bold">일반 회원</span>
            </div>
          </div>

          <button className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <Settings className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* ═══ 포인트 카드 ═══ */}
        <div className="bg-white rounded-3xl border border-surface-line shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-gray-900">내 재화</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* HANI 코인 */}
            <div className="bg-gradient-to-br from-surface-muted to-white rounded-2xl p-3.5 border border-surface-line">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">💰</span>
                <span className="text-[10px] font-bold text-primary">HANI 코인</span>
              </div>
              <p className="text-xl font-extrabold text-gray-900">{haniCoin}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">출석·이벤트로 획득</p>
            </div>

            {/* Orb */}
            <div className="bg-gradient-to-br from-surface-muted to-white rounded-2xl p-3.5 border border-surface-line">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base">🔮</span>
                <span className="text-[10px] font-bold text-primary">Orb</span>
              </div>
              <p className="text-xl font-extrabold text-gray-900">{orb}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">분석·채팅에 사용</p>
            </div>
          </div>
        </div>

        {/* ═══ 출석 체크 ═══ */}
        <div className="bg-white rounded-3xl border border-surface-line shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-gray-900">출석체크</span>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {checkedDays.filter(Boolean).length}/7일 완료
            </span>
          </div>

          {/* 7일 그리드 */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {WEEKDAY_LABELS.map((day, idx) => {
              const isChecked = checkedDays[idx];
              const isToday = idx === todayIdx;
              return (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[10px] font-bold ${isToday ? 'text-primary' : 'text-gray-400'}`}>
                    {day}
                  </span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all
                    ${isChecked
                      ? 'bg-primary text-white'
                      : isToday
                        ? 'bg-surface-muted border-2 border-primary border-dashed'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    {isChecked ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleAttendance}
            className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-95
              ${checkedDays[todayIdx]
                ? 'bg-gray-100 text-gray-400 cursor-default'
                : 'bg-primary text-white'
              }`}
          >
            {checkedDays[todayIdx] ? '오늘 출석 완료' : '출석하기 (+2 HANI)'}
          </button>
        </div>

        {/* ═══ 거래 내역 ═══ */}
        <div className="bg-white rounded-3xl border border-surface-line shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-gray-900">거래 내역</span>
            </div>
            <button className="flex items-center gap-0.5 text-[11px] text-primary font-bold">
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {DUMMY_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    tx.type === 'earn' ? 'bg-emerald-50' : 'bg-rose-50'
                  }`}>
                    <span className="text-sm">{tx.type === 'earn' ? '💰' : '🔮'}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{tx.label}</p>
                    <p className="text-[10px] text-gray-400">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-xs font-extrabold ${
                  tx.type === 'earn' ? 'text-emerald-600' : 'text-rose-500'
                }`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount} {tx.currency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 설정 섹션 ═══ */}
        <div className="bg-white rounded-3xl border border-surface-line shadow-sm overflow-hidden">
          {/* 알림 토글 */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-800">알림 설정</span>
            </div>
            <button
              onClick={() => {
                setNotificationOn(!notificationOn);
                showToast(notificationOn ? '알림을 끌게요' : '알림을 켤게요', 'info');
              }}
              className={`w-11 h-6 rounded-full transition-all relative ${
                notificationOn ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                notificationOn ? 'left-[22px]' : 'left-0.5'
              }`} />
            </button>
          </div>

          {/* HANI PASS 프리미엄 CTA */}
          <button className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <Crown className="w-4 h-4 text-amber-500" />
              <div className="text-left">
                <span className="text-xs font-bold text-gray-800">HANI PASS</span>
                <p className="text-[10px] text-gray-400 mt-0.5">프리미엄 분석 무제한 이용</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-primary bg-surface-muted px-2 py-0.5 rounded-full">구독하기</span>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </div>
          </button>
        </div>

        {/* ═══ 하단 링크 ═══ */}
        <div className="bg-white rounded-3xl border border-surface-line shadow-sm overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-800">서비스 문의</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>

          <button className="w-full flex items-center justify-between px-4 py-3.5 active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-bold text-gray-800">이용약관</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        </div>

        {/* 앱 버전 */}
        <div className="text-center py-4">
          <p className="text-[10px] text-gray-300">HANI v1.0.0</p>
        </div>

        {/* 하단 여백 */}
        <div className="h-2" />
      </div>
    </div>
  );
}
