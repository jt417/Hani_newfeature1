import React, { useState, useEffect } from 'react';
import {
  Users, Sparkles, Lock, ChevronLeft, ChevronRight, ScanLine,
  Heart, Copy, Share2, Check, Star, Crown,
  AlertTriangle, Clock, Calendar, UserCheck, Zap, Trophy,
  Shield, Target, MessageCircle, RefreshCw, X, UserMinus
} from 'lucide-react';
import {
  GROUP_CATEGORIES, GROUP_RELATION_TYPES, COUPLE_RELATION_TYPES,
  ANALYZING_STEPS, ANALYZING_TEASERS,
  GROUP_RESULT_NAMES, COUPLE_RESULT_NAMES,
  GROUP_ROLE_CARDS, COUPLE_ROLE_CARDS,
  GROUP_CAUTION_COPIES, COUPLE_CAUTION_COPIES,
  BEHAVIOR_GUIDES, ROLE_COLOR_STYLES
} from '../data/groupRoomData';
import { getDisplayName } from '../utils/nameUtils';

const ANALYSIS_COST = 300;

// --- Room code generator (excludes confusing chars: O,0,I,1,L) ---
const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

// --- Pair score generator ---
const generatePairScores = (participants) => {
  const pairs = [];
  for (let i = 0; i < participants.length; i++) {
    for (let j = i + 1; j < participants.length; j++) {
      pairs.push({
        p1: participants[i],
        p2: participants[j],
        score: 50 + Math.floor(Math.random() * 50),
      });
    }
  }
  return pairs;
};

// --- Score color helper ---
const getScoreColor = (score) => {
  if (score >= 85) return { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', border: 'border-emerald-200' };
  if (score >= 70) return { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500', border: 'border-blue-200' };
  if (score >= 55) return { bg: 'bg-amber-50', text: 'text-amber-600', bar: 'bg-amber-500', border: 'border-amber-200' };
  return { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-400', border: 'border-rose-200' };
};

export default function CompatibilityTab({ showToast, handleDeduct, haniCoin, savedResults = [], onSaveResult, switchTab }) {
  const [roomStep, setRoomStep] = useState('landing');
  const [roomForm, setRoomForm] = useState({
    mode: '',
    categoryKey: '',
    relationType: '',
    roomName: '',
    maxMembers: 5,
    paymentMethod: '',
    designatedPayer: null,
  });
  const [participants, setParticipants] = useState([
    { id: 'me', name: '나(김하니)', role: 'host', ready: true, status: 'done' }
  ]);
  const [joinCode, setJoinCode] = useState('');
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrExpiry, setQrExpiry] = useState(null);
  const [qrRemaining, setQrRemaining] = useState(null);
  const [viewingResult, setViewingResult] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [showManageModal, setShowManageModal] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  // --- 1:1 궁합 state ---
  const [coupleForm, setCoupleForm] = useState({
    partnerName: '',
    partnerBirthYear: '',
    partnerBirthMonth: '',
    partnerBirthDay: '',
    partnerGender: '',
    relationType: '',
  });

  // --- Analyzing animation ---
  useEffect(() => {
    if (roomStep !== 'analyzing') return;
    setAnalyzeStep(0);
    const timers = [];
    ANALYZING_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setAnalyzeStep(i), i * 800));
    });
    timers.push(setTimeout(() => {
      const pairScores = generatePairScores(participants);
      const groupScore = Math.floor(70 + Math.random() * 25);
      const roleCards = roomForm.mode === 'couple' ? COUPLE_ROLE_CARDS : GROUP_ROLE_CARDS;
      const roleAssignments = participants.map((p, i) => ({
        participant: p,
        role: roleCards[i % roleCards.length],
      }));
      const bestPair = pairScores.length > 0
        ? pairScores.reduce((best, cur) => cur.score > best.score ? cur : best, pairScores[0])
        : null;

      // 개인 결과 데이터 생성
      const myPairScores = pairScores.filter(ps =>
        ps.p1.id === 'me' || ps.p2.id === 'me'
      ).map(ps => ({
        other: ps.p1.id === 'me' ? ps.p2 : ps.p1,
        score: ps.score,
      })).sort((a, b) => b.score - a.score);

      const otherParticipants = participants.filter(p => p.id !== 'me');
      const comfortPerson = myPairScores[0]?.other || otherParticipants[0] || { name: '참여자' };
      const cautionPerson = myPairScores[myPairScores.length - 1]?.other || otherParticipants[1] || otherParticipants[0] || { name: '참여자' };

      const myRoleAssignment = roleAssignments.find(ra => ra.participant.id === 'me') || roleAssignments[0];

      const privateData = {
        myRole: myRoleAssignment?.role || roleCards[0],
        myPairScores,
        comfortPerson,
        cautionPerson,
        insiderStrategies: [
          '대화 초반에 가벼운 질문을 던지면 자연스럽게 중심이 돼요',
          '리액션을 조금 크게 하면 상대방이 더 마음을 열어요',
          '1:1로 따로 대화하는 시간을 만들면 깊은 유대가 생겨요',
          '모임 끝나고 짧은 메시지를 보내면 인상이 오래 남아요',
        ],
        myStrengths: [
          { label: '분위기 전환 능력', score: 60 + Math.floor(Math.random() * 35) },
          { label: '갈등 완충력', score: 50 + Math.floor(Math.random() * 40) },
          { label: '대화 주도력', score: 55 + Math.floor(Math.random() * 40) },
          { label: '공감 능력', score: 60 + Math.floor(Math.random() * 35) },
        ],
      };

      const newResult = {
        id: Date.now(),
        date: new Date().toISOString(),
        mode: roomForm.mode,
        roomName: roomForm.roomName || '새로운 모임',
        relationType: roomForm.relationType,
        categoryKey: roomForm.categoryKey,
        participants: [...participants],
        groupScore,
        pairScores,
        roleAssignments,
        bestPair,
        privateData,
      };

      setCurrentResult(newResult);

      // 기획서 3-8: 결과는 영구 저장
      if (onSaveResult) onSaveResult(newResult);

      setRoomStep('result_public');
    }, ANALYZING_STEPS.length * 800 + 600));
    return () => timers.forEach(clearTimeout);
  }, [roomStep]);

  // --- QR 30-minute timer ---
  useEffect(() => {
    if (roomStep !== 'invite_lobby' || !qrExpiry) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, qrExpiry - Date.now());
      setQrRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        setRoomStep('landing');
        setQrExpiry(null);
        showToast('방 코드가 만료되었어요. 다시 방을 생성해주세요.');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [roomStep, qrExpiry]);

  const formatRemaining = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, '0')}`;
  };

  const handleCopyCode = () => {
    setCopied(true);
    showToast('참여 코드가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  const resetRoom = () => {
    setRoomStep('landing');
    setRoomForm({
      mode: '', categoryKey: '', relationType: '', roomName: '',
      maxMembers: 5, paymentMethod: '', designatedPayer: null,
    });
    setParticipants([{ id: 'me', name: '나(김하니)', role: 'host', ready: true, status: 'done' }]);
    setCurrentResult(null);
    setViewingResult(null);
    setRoomCode('');
    setShowManageModal(false);
  };

  const resultNames = roomForm.mode === 'couple' ? COUPLE_RESULT_NAMES : GROUP_RESULT_NAMES;
  const roleCards = roomForm.mode === 'couple' ? COUPLE_ROLE_CARDS : GROUP_ROLE_CARDS;
  const cautionCopies = roomForm.mode === 'couple' ? COUPLE_CAUTION_COPIES : GROUP_CAUTION_COPIES;
  const guides = BEHAVIOR_GUIDES[roomForm.mode || 'group'] || BEHAVIOR_GUIDES.group;

  // ================================================================
  // SCREENS
  // ================================================================

  switch (roomStep) {

    // ================================================================
    // 1. LANDING — 궁합 메인
    // ================================================================
    case 'landing':
      return (
        <div className="flex-1 overflow-y-auto bg-surface pb-24 animate-fade-in">
          {/* Hero section */}
          <div className="bg-gradient-to-b from-accent-rich to-primary-dark px-6 pt-10 pb-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
            <div className="relative z-10">
              <h1 className="text-2xl font-extrabold mb-2 leading-tight">같이 보면 더 재밌는<br />관계 궁합</h1>
              <p className="text-purple-200 text-sm mb-5">우리 사이의 케미, 역할, 시너지를 한 번에</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['베스트 케미', '역할 분석', '속마음', 'N:N 매칭', '인싸 전략'].map(tag => (
                  <span key={tag} className="bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 -mt-4 relative z-10 space-y-3">
            {/* Two big cards side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1:1 Couple */}
              <button
                onClick={() => { setRoomForm(f => ({ ...f, mode: 'couple' })); setRoomStep('couple_input'); }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-pink-100 text-left active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                  <Heart className="w-6 h-6 text-pink-500" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-1">1:1 궁합</h3>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-2">표현 방식, 감정 온도,<br />관계 리듬 분석</p>
                <span className="text-[9px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">2인</span>
              </button>

              {/* Group */}
              <button
                onClick={() => { setRoomForm(f => ({ ...f, mode: 'group' })); setRoomStep('create_setup'); }}
                className="bg-white rounded-2xl p-4 shadow-sm border border-surface-line text-left active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-surface-muted to-surface-light rounded-2xl flex items-center justify-center mb-3 shadow-sm">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-1">그룹 궁합</h3>
                <p className="text-[10px] text-gray-400 leading-relaxed mb-2">분위기, 역할, 갈등<br />포인트 분석</p>
                <span className="text-[9px] font-bold bg-surface-muted text-primary px-2 py-0.5 rounded-full border border-surface-soft">3~5인</span>
              </button>
            </div>

            {/* 내 궁합 기록 — 항상 표시 */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" /> 내 궁합 기록
                </h3>
                <span className="text-[10px] text-gray-400">{savedResults.length}건</span>
              </div>

              {savedResults.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="w-10 h-10 text-surface-soft mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-400 mb-1">아직 궁합 기록이 없어요</p>
                  <p className="text-[10px] text-gray-300">그룹 궁합을 시작하면 결과가 자동 저장됩니다</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedResults.slice(0, 5).map(result => (
                    <button
                      key={result.id}
                      onClick={() => { setViewingResult(result); setRoomStep('view_saved'); }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-surface-line hover:bg-surface-light transition text-left active:scale-[0.98] transition-transform overflow-hidden relative"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        result.mode === 'couple' ? 'bg-pink-50' : 'bg-surface-muted'
                      }`}>
                        {result.mode === 'couple'
                          ? <Heart className="w-5 h-5 text-pink-500" />
                          : <Users className="w-5 h-5 text-primary" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">{result.roomName}</p>
                        <p className="text-[10px] text-gray-400">
                          {result.relationType} · {result.participants?.length || 0}명 · {new Date(result.date).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-extrabold ${result.groupScore >= 80 ? 'text-emerald-600' : result.groupScore >= 65 ? 'text-blue-600' : 'text-amber-600'}`}>
                          {result.groupScore}점
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                    </button>
                  ))}
                  {savedResults.length > 5 && (
                    <p className="text-center text-[10px] text-gray-400 pt-1">
                      외 {savedResults.length - 5}건 더
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* 초대받았나요? */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <ScanLine className="w-4 h-4 text-primary" /> 초대받았나요?
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setRoomStep('qr_scan')}
                  className="flex-1 bg-surface border border-surface-outline text-gray-700 font-bold py-3 rounded-xl hover:bg-surface-light transition flex items-center justify-center gap-2 text-xs active:scale-95 transition-transform"
                >
                  <ScanLine className="w-4 h-4" /> QR 스캔
                </button>
                <button
                  onClick={() => setRoomStep('join_input')}
                  className="flex-1 bg-surface border border-surface-outline text-gray-700 font-bold py-3 rounded-xl hover:bg-surface-light transition flex items-center justify-center gap-2 text-xs active:scale-95 transition-transform"
                >
                  <Users className="w-4 h-4" /> 코드 입력
                </button>
              </div>
            </div>
          </div>
        </div>
      );

    // ================================================================
    // 1:1 궁합 — 상대 정보 입력 (별도 화면, 초대 불필요)
    // ================================================================
    case 'couple_input':
      return (
        <div className="flex flex-col h-full animate-fade-in bg-white">
          <div className="px-5 pt-4 pb-3">
            <button onClick={() => { setCoupleForm({ partnerName: '', partnerBirthYear: '', partnerBirthMonth: '', partnerBirthDay: '', partnerGender: '', relationType: '' }); setRoomStep('landing'); }}
              className="text-gray-500 flex items-center gap-1 text-sm mb-3 active:scale-95 transition-transform">
              <ChevronLeft className="w-4 h-4" /> 뒤로
            </button>
            <h2 className="text-xl font-bold text-gray-900 mb-1">1:1 궁합</h2>
            <p className="text-xs text-gray-400">상대방의 정보를 입력하면 바로 궁합을 볼 수 있어요</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
            {/* 관계 유형 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">관계 유형</label>
              <div className="flex flex-wrap gap-2">
                {COUPLE_RELATION_TYPES.map(rt => (
                  <button key={rt.key} onClick={() => setCoupleForm(f => ({ ...f, relationType: rt.label }))}
                    className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                      coupleForm.relationType === rt.label
                        ? 'bg-pink-500 border-pink-500 text-white'
                        : 'bg-white border-surface-line text-gray-600 hover:border-surface-outline'
                    }`}>
                    {rt.emoji} {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 상대방 이름 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">상대방 이름</label>
              <input type="text" placeholder="이름 입력" maxLength={10}
                className="w-full bg-surface border border-surface-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                value={coupleForm.partnerName} onChange={e => setCoupleForm(f => ({ ...f, partnerName: e.target.value }))} />
            </div>

            {/* 생년월일 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">상대방 생년월일</label>
              <div className="grid grid-cols-3 gap-2">
                <input type="text" placeholder="년 (예: 1995)" maxLength={4}
                  className="bg-surface border border-surface-line rounded-xl px-3 py-3 text-sm text-center focus:outline-none focus:border-primary focus:bg-white transition"
                  value={coupleForm.partnerBirthYear} onChange={e => setCoupleForm(f => ({ ...f, partnerBirthYear: e.target.value.replace(/\D/g, '') }))} />
                <input type="text" placeholder="월" maxLength={2}
                  className="bg-surface border border-surface-line rounded-xl px-3 py-3 text-sm text-center focus:outline-none focus:border-primary focus:bg-white transition"
                  value={coupleForm.partnerBirthMonth} onChange={e => setCoupleForm(f => ({ ...f, partnerBirthMonth: e.target.value.replace(/\D/g, '') }))} />
                <input type="text" placeholder="일" maxLength={2}
                  className="bg-surface border border-surface-line rounded-xl px-3 py-3 text-sm text-center focus:outline-none focus:border-primary focus:bg-white transition"
                  value={coupleForm.partnerBirthDay} onChange={e => setCoupleForm(f => ({ ...f, partnerBirthDay: e.target.value.replace(/\D/g, '') }))} />
              </div>
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">상대방 성별</label>
              <div className="flex gap-2">
                {[{ key: 'male', label: '남성', emoji: '👨' }, { key: 'female', label: '여성', emoji: '👩' }].map(g => (
                  <button key={g.key} onClick={() => setCoupleForm(f => ({ ...f, partnerGender: g.key }))}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm border transition active:scale-95 ${
                      coupleForm.partnerGender === g.key ? 'bg-pink-500 text-white border-pink-500' : 'bg-white text-gray-600 border-surface-line'
                    }`}>
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          {coupleForm.relationType && coupleForm.partnerName.trim() && coupleForm.partnerBirthYear.length === 4 && coupleForm.partnerGender && (
            <div className="px-5 py-4 border-t border-surface-line bg-white">
              <button onClick={() => {
                // Set up participants for couple mode
                setParticipants([
                  { id: 'me', name: '나(김하니)', role: 'host', ready: true, status: 'done' },
                  { id: 'partner', name: coupleForm.partnerName, role: 'member', ready: true, status: 'done' },
                ]);
                setRoomForm(f => ({ ...f, mode: 'couple', relationType: coupleForm.relationType, roomName: `나 & ${coupleForm.partnerName}` }));
                // Deduct cost then analyze
                handleDeduct(300, 'hani', () => {
                  showToast('300 HANI 차감되었습니다.');
                  setRoomStep('analyzing');
                });
              }}
                className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                <Heart className="w-5 h-5" /> 궁합 보기 (300 HANI)
              </button>
            </div>
          )}
        </div>
      );

    // ================================================================
    // 2. CREATE SETUP — 방 생성
    // ================================================================
    case 'create_setup': {
      const isCouple = roomForm.mode === 'couple';
      const relationOptions = isCouple
        ? COUPLE_RELATION_TYPES
        : (GROUP_RELATION_TYPES[roomForm.categoryKey] || []);
      const canProceed = roomForm.relationType && roomForm.roomName.trim();

      return (
        <div className="flex flex-col h-full animate-fade-in bg-white">
          <div className="px-5 pt-4 pb-3">
            <button
              onClick={() => {
                if (!roomForm.relationType && !isCouple && roomForm.categoryKey) {
                  setRoomForm(f => ({ ...f, categoryKey: '' }));
                } else {
                  resetRoom();
                }
              }}
              className="text-gray-500 flex items-center gap-1 text-sm mb-3 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" /> 뒤로
            </button>
            {/* Progress bar (3 steps) */}
            <div className="flex gap-1.5 mb-4">
              <div className="h-1 flex-1 rounded-full bg-primary" />
              <div className={`h-1 flex-1 rounded-full ${roomForm.relationType ? 'bg-primary' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded-full ${canProceed ? 'bg-primary' : 'bg-gray-200'}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {isCouple ? '1:1 궁합 방' : '그룹 궁합 방'} 만들기
            </h2>
            <p className="text-xs text-gray-400">방의 컨셉을 설정하면 결과가 더 정확해져요</p>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
            {/* Group: category selection grid */}
            {!isCouple && !roomForm.categoryKey && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">모임 유형</label>
                <div className="grid grid-cols-2 gap-2">
                  {GROUP_CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setRoomForm(f => ({ ...f, categoryKey: cat.key }))}
                      className="bg-white border border-surface-line rounded-xl p-4 text-left hover:border-surface-outline hover:bg-surface-light transition active:scale-95 transition-transform"
                    >
                      <span className="text-2xl mb-1 block">{cat.emoji}</span>
                      <span className="text-sm font-bold text-gray-800">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Relation type chips */}
            {(isCouple || roomForm.categoryKey) && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  {isCouple ? '관계 유형' : '모임 종류'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(isCouple ? COUPLE_RELATION_TYPES : relationOptions).map(rt => (
                    <button
                      key={rt.key}
                      onClick={() => setRoomForm(f => ({ ...f, relationType: rt.label }))}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all active:scale-95 ${
                        roomForm.relationType === rt.label
                          ? (isCouple ? 'bg-pink-500 border-pink-500 text-white' : 'bg-primary border-primary text-white')
                          : 'bg-white border-surface-line text-gray-600 hover:border-surface-outline'
                      }`}
                    >
                      {rt.emoji} {rt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Room name + mood + intent + member count */}
            {roomForm.relationType && (
              <>
                {/* Room name input */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">방 이름</label>
                  <input
                    type="text"
                    placeholder="예: 주말 러닝크루, 베프 모임"
                    maxLength={20}
                    className="w-full bg-surface border border-surface-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:bg-white transition"
                    value={roomForm.roomName}
                    onChange={e => setRoomForm(f => ({ ...f, roomName: e.target.value }))}
                  />
                </div>

                {/* Member count selector (group only) */}
                {!isCouple && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-2">인원 설정</h3>
                    <div className="flex gap-2">
                      {[3, 4, 5].map(n => (
                        <button
                          key={n}
                          onClick={() => setRoomForm(p => ({ ...p, maxMembers: n }))}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm border transition active:scale-95 ${
                            roomForm.maxMembers === n
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-600 border-surface-line'
                          }`}
                        >
                          {n}인
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom CTA: 방 생성 완료 */}
          {canProceed && (
            <div className="px-5 py-4 border-t border-surface-line bg-white">
              <button
                onClick={() => {
                  setParticipants([{ id: 'me', name: '나(김하니)', role: 'host', ready: true, status: 'done' }]);
                  setRoomCode(generateRoomCode());
                  setQrExpiry(Date.now() + 30 * 60 * 1000);
                  setRoomStep('invite_lobby');
                }}
                className={`w-full font-bold py-4 rounded-xl shadow-lg transition active:scale-95 ${
                  isCouple ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                방 생성 완료
              </button>
            </div>
          )}
        </div>
      );
    }

    // ================================================================
    // 3. INVITE LOBBY — 대기실
    // ================================================================
    case 'invite_lobby': {
      const isCouple = roomForm.mode === 'couple';

      return (
        <div className="flex flex-col h-full animate-fade-in bg-surface">
          <div className="px-5 pt-4 pb-2">
            <button
              onClick={() => setRoomStep('create_setup')}
              className="text-gray-500 flex items-center gap-1 text-sm mb-2 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" /> 뒤로
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
            {/* Room info card */}
            <div className={`rounded-2xl p-5 shadow-sm border text-center ${
              isCouple
                ? 'bg-gradient-to-br from-pink-50 to-white border-pink-100'
                : 'bg-gradient-to-br from-surface-light to-white border-surface-line'
            }`}>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${
                isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
              }`}>{roomForm.relationType}</span>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">{roomForm.roomName || '새로운 모임'}</h2>
              <p className="text-xs text-gray-400">{participants.length}명 참여 중</p>

              {/* QR timer with 30min countdown, warning <5min */}
              {qrRemaining != null && (
                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                  qrRemaining < 5 * 60 * 1000
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-surface border border-surface-line text-gray-500'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>남은 시간 {formatRemaining(qrRemaining)}</span>
                </div>
              )}

            </div>

            {/* Participant list with status badges */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-sm">참여자</h3>
                <button
                  onClick={() => setParticipants(p => [...p, {
                    id: `d_${Date.now()}`,
                    name: ['조멀티', '김서하', '박준영', '이민지'][p.length - 1] || '참여자',
                    role: 'member', ready: true,
                    status: ['done', 'inputting', 'waiting'][Math.floor(Math.random() * 3)]
                  }])}
                  className="text-[10px] bg-surface-muted text-primary px-2.5 py-1 rounded-lg font-bold border border-surface-soft active:scale-95 transition-transform"
                >
                  + 추가
                </button>
              </div>
              <div className="space-y-2">
                {participants.map(p => {
                  const statusLabel = p.status === 'done' ? '입장 완료' : p.status === 'inputting' ? '정보 입력 중' : '대기 중';
                  const statusColor = p.status === 'done'
                    ? 'text-emerald-600 bg-emerald-50'
                    : p.status === 'inputting'
                      ? 'text-amber-600 bg-amber-50'
                      : 'text-gray-400 bg-gray-100';
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-line">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        p.role === 'host' ? 'bg-primary text-white' : 'bg-surface-muted text-primary'
                      }`}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{getDisplayName(p)}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                    </div>
                  );
                })}
              </div>

              {/* Host-only controls */}
              <div className="mt-4 pt-4 border-t border-surface-line">
                <p className="text-[10px] text-gray-400 font-bold mb-2">방장 전용</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-surface text-gray-600 font-bold py-2.5 rounded-xl text-xs border border-surface-line active:scale-95 transition-transform">
                    인원 변경
                  </button>
                  <button
                    onClick={() => setShowManageModal(true)}
                    className="flex-1 bg-surface text-gray-600 font-bold py-2.5 rounded-xl text-xs border border-surface-line active:scale-95 transition-transform"
                  >
                    참여자 관리
                  </button>
                  <button
                    onClick={() => { setRoomStep('landing'); showToast('방이 삭제되었어요.'); }}
                    className="flex-1 bg-rose-50 text-rose-600 font-bold py-2.5 rounded-xl text-xs border border-rose-200 active:scale-95 transition-transform"
                  >
                    방 삭제
                  </button>
                </div>
              </div>
            </div>

            {/* Participant manage modal (bottom sheet) */}
            {showManageModal && (
              <div
                className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center animate-fade-in"
                onClick={() => setShowManageModal(false)}
              >
                <div
                  className="bg-white w-full max-w-[393px] rounded-t-[2rem] p-6 animate-fade-in-up"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">참여자 관리</h3>
                    <button onClick={() => setShowManageModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {participants.filter(p => p.role !== 'host').length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-6">아직 참여자가 없어요.</p>
                    )}
                    {participants.filter(p => p.role !== 'host').map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-surface-line">
                        <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center font-bold text-sm text-primary shrink-0">
                          {p.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-sm">{getDisplayName(p)}</p>
                        </div>
                        <button
                          onClick={() => {
                            setParticipants(prev => prev.filter(pp => pp.id !== p.id));
                            showToast(`${getDisplayName(p)}님을 내보냈어요.`);
                          }}
                          className="flex items-center gap-1 bg-rose-50 text-rose-600 font-bold py-1.5 px-3 rounded-xl text-xs border border-rose-200 active:scale-95 transition-transform"
                        >
                          <UserMinus className="w-3.5 h-3.5" /> 내보내기
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowManageModal(false)}
                    className="w-full mt-4 bg-surface text-gray-600 font-bold py-3 rounded-xl text-sm"
                  >
                    닫기
                  </button>
                </div>
              </div>
            )}

            {/* QR Code visual placeholder */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-sm">친구 초대하기</h3>
                <button
                  onClick={() => {
                    const newCode = generateRoomCode();
                    setRoomCode(newCode);
                    setQrExpiry(Date.now() + 30 * 60 * 1000);
                    showToast('새 코드가 생성되었어요!');
                  }}
                  className="text-xs text-primary font-bold underline flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <RefreshCw className="w-3 h-3" /> 코드 갱신
                </button>
              </div>
              {/* QR grid pattern */}
              <div className="flex flex-col items-center mb-3">
                <div className="w-40 h-40 bg-white rounded-2xl border-2 border-surface-line flex items-center justify-center mb-2 relative">
                  <div className="w-32 h-32 bg-surface-muted rounded-xl flex items-center justify-center">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`w-4 h-4 rounded-sm ${Math.random() > 0.4 ? 'bg-primary' : 'bg-transparent'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white rounded-full p-1 shadow-sm border border-surface-line">
                    <Sparkles className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">QR로 바로 입장 가능</p>
              </div>
              {/* Room code display with copy */}
              <div className="flex items-center gap-2 bg-surface rounded-xl p-3 border border-surface-line mb-2">
                <span className="flex-1 font-mono text-lg tracking-widest text-gray-800 text-center font-bold">{roomCode}</span>
                <button
                  onClick={handleCopyCode}
                  className={`p-2 rounded-lg transition active:scale-95 ${
                    copied ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-500 border border-surface-line'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              {/* Share link button */}
              <button className="w-full bg-surface border border-surface-line text-gray-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-surface-light transition active:scale-95 transition-transform">
                <Share2 className="w-3.5 h-3.5" /> 초대 링크 공유
              </button>
            </div>

            {/* Payment method selection */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-1">결제 방식</h3>
              <p className="text-[10px] text-gray-400 mb-3">궁합 분석 비용 {ANALYSIS_COST} HANI</p>
              <div className="grid grid-cols-3 gap-2">
                {/* Dutch pay */}
                <button
                  onClick={() => setRoomForm(f => ({ ...f, paymentMethod: 'dutch', designatedPayer: null }))}
                  className={`relative p-3 rounded-xl border-2 transition-all text-left active:scale-95 ${
                    roomForm.paymentMethod === 'dutch'
                      ? (isCouple ? 'border-pink-400 bg-pink-50' : 'border-primary bg-surface-light')
                      : 'border-surface-line bg-white hover:border-surface-outline'
                  }`}
                >
                  {roomForm.paymentMethod === 'dutch' && (
                    <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      isCouple ? 'bg-pink-500' : 'bg-primary'
                    }`}><Check className="w-2.5 h-2.5 text-white" /></div>
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    roomForm.paymentMethod === 'dutch' ? (isCouple ? 'bg-pink-100' : 'bg-surface-muted') : 'bg-surface'
                  }`}>
                    <Users className={`w-4 h-4 ${
                      roomForm.paymentMethod === 'dutch' ? (isCouple ? 'text-pink-500' : 'text-primary') : 'text-gray-400'
                    }`} />
                  </div>
                  <p className={`text-xs font-bold mb-0.5 ${roomForm.paymentMethod === 'dutch' ? 'text-gray-900' : 'text-gray-700'}`}>더치페이</p>
                  <p className="text-[9px] text-gray-400 leading-snug">모두 나눠서</p>
                  <p className={`text-[10px] font-extrabold mt-1 ${
                    roomForm.paymentMethod === 'dutch' ? (isCouple ? 'text-pink-600' : 'text-primary') : 'text-gray-500'
                  }`}>
                    인당 {Math.ceil(ANALYSIS_COST / Math.max(participants.length, 2))}
                  </p>
                </button>

                {/* Host pay */}
                <button
                  onClick={() => setRoomForm(f => ({ ...f, paymentMethod: 'host_pay', designatedPayer: null }))}
                  className={`relative p-3 rounded-xl border-2 transition-all text-left active:scale-95 ${
                    roomForm.paymentMethod === 'host_pay'
                      ? (isCouple ? 'border-pink-400 bg-pink-50' : 'border-primary bg-surface-light')
                      : 'border-surface-line bg-white hover:border-surface-outline'
                  }`}
                >
                  {roomForm.paymentMethod === 'host_pay' && (
                    <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      isCouple ? 'bg-pink-500' : 'bg-primary'
                    }`}><Check className="w-2.5 h-2.5 text-white" /></div>
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    roomForm.paymentMethod === 'host_pay' ? (isCouple ? 'bg-pink-100' : 'bg-surface-muted') : 'bg-surface'
                  }`}>
                    <Crown className={`w-4 h-4 ${
                      roomForm.paymentMethod === 'host_pay' ? (isCouple ? 'text-pink-500' : 'text-primary') : 'text-gray-400'
                    }`} />
                  </div>
                  <p className={`text-xs font-bold mb-0.5 ${roomForm.paymentMethod === 'host_pay' ? 'text-gray-900' : 'text-gray-700'}`}>방장이 쏜다</p>
                  <p className="text-[9px] text-gray-400 leading-snug">방장 전액</p>
                  <p className={`text-[10px] font-extrabold mt-1 ${
                    roomForm.paymentMethod === 'host_pay' ? (isCouple ? 'text-pink-600' : 'text-primary') : 'text-gray-500'
                  }`}>
                    {ANALYSIS_COST}
                  </p>
                </button>

                {/* Designated payer */}
                <button
                  onClick={() => setRoomForm(f => ({ ...f, paymentMethod: 'designated', designatedPayer: null }))}
                  className={`relative p-3 rounded-xl border-2 transition-all text-left active:scale-95 ${
                    roomForm.paymentMethod === 'designated'
                      ? (isCouple ? 'border-pink-400 bg-pink-50' : 'border-primary bg-surface-light')
                      : 'border-surface-line bg-white hover:border-surface-outline'
                  }`}
                >
                  {roomForm.paymentMethod === 'designated' && (
                    <div className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                      isCouple ? 'bg-pink-500' : 'bg-primary'
                    }`}><Check className="w-2.5 h-2.5 text-white" /></div>
                  )}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${
                    roomForm.paymentMethod === 'designated' ? (isCouple ? 'bg-pink-100' : 'bg-surface-muted') : 'bg-surface'
                  }`}>
                    <Target className={`w-4 h-4 ${
                      roomForm.paymentMethod === 'designated' ? (isCouple ? 'text-pink-500' : 'text-primary') : 'text-gray-400'
                    }`} />
                  </div>
                  <p className={`text-xs font-bold mb-0.5 ${roomForm.paymentMethod === 'designated' ? 'text-gray-900' : 'text-gray-700'}`}>지정 결제</p>
                  <p className="text-[9px] text-gray-400 leading-snug">특정인 부담</p>
                  <p className={`text-[10px] font-extrabold mt-1 ${
                    roomForm.paymentMethod === 'designated' ? (isCouple ? 'text-pink-600' : 'text-primary') : 'text-gray-500'
                  }`}>
                    {ANALYSIS_COST}
                  </p>
                </button>
              </div>

              {/* Designated payer selector */}
              {roomForm.paymentMethod === 'designated' && participants.length >= 2 && (
                <div className="mt-3 bg-surface rounded-xl p-3 border border-surface-line">
                  <p className="text-[10px] font-bold text-gray-500 mb-2">결제할 사람 선택</p>
                  <div className="flex flex-wrap gap-1.5">
                    {participants.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setRoomForm(f => ({ ...f, designatedPayer: p.id }))}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition active:scale-95 ${
                          roomForm.designatedPayer === p.id
                            ? (isCouple ? 'bg-pink-500 text-white border-pink-500' : 'bg-primary text-white border-primary')
                            : 'bg-white text-gray-600 border-surface-line'
                        }`}
                      >
                        {getDisplayName(p)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom CTA: 분석 시작 */}
          <div className="px-5 py-4 border-t border-surface-line bg-white">
            {roomForm.paymentMethod && participants.length >= 2 && (
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs text-gray-400">
                  {roomForm.paymentMethod === 'dutch' ? '더치페이' : roomForm.paymentMethod === 'host_pay' ? '방장이 쏜다' : '지정 결제'}
                </span>
                <span className="text-sm font-extrabold text-primary">
                  {roomForm.paymentMethod === 'dutch'
                    ? `${Math.ceil(ANALYSIS_COST / participants.length)} HANI (내 몫)`
                    : roomForm.paymentMethod === 'designated' && roomForm.designatedPayer
                      ? `${ANALYSIS_COST} HANI (${getDisplayName(participants.find(p => p.id === roomForm.designatedPayer) || {})})`
                      : `${ANALYSIS_COST} HANI`
                  }
                </span>
              </div>
            )}
            <button
              onClick={() => {
                if (!roomForm.paymentMethod) {
                  showToast('결제 방식을 선택해주세요.');
                  return;
                }
                if (roomForm.paymentMethod === 'designated' && !roomForm.designatedPayer) {
                  showToast('결제할 사람을 지정해주세요.');
                  return;
                }
                let myShare;
                if (roomForm.paymentMethod === 'dutch') {
                  myShare = Math.ceil(ANALYSIS_COST / participants.length);
                } else if (roomForm.paymentMethod === 'host_pay') {
                  myShare = ANALYSIS_COST;
                } else {
                  myShare = roomForm.designatedPayer === 'me' ? ANALYSIS_COST : 0;
                }
                if (myShare > 0) {
                  handleDeduct(myShare, 'hani', () => {
                    showToast(`${myShare} HANI 차감되었습니다.`);
                    setRoomStep('analyzing');
                  });
                } else {
                  showToast('분석을 시작합니다!');
                  setRoomStep('analyzing');
                }
              }}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition active:scale-95 ${
                participants.length >= 2 && roomForm.paymentMethod
                  ? 'bg-primary-deep text-white hover:bg-gray-900'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={participants.length < 2}
            >
              {participants.length < 2
                ? `${2 - participants.length}명 더 필요해요`
                : !roomForm.paymentMethod
                  ? '결제 방식을 선택해주세요'
                  : '분석 시작'
              }
            </button>
          </div>
        </div>
      );
    }

    // ================================================================
    // 4. ANALYZING — 분석 중 애니메이션
    // ================================================================
    case 'analyzing': {
      const teaser = ANALYZING_TEASERS[Math.floor(Date.now() / 50000) % ANALYZING_TEASERS.length];
      return (
        <div className="flex flex-col h-full items-center justify-center bg-primary-deep text-white p-6 animate-fade-in pb-20 relative">
          <button
            onClick={() => setRoomStep('invite_lobby')}
            className="absolute top-4 right-4 text-white/50 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition z-10 active:scale-95"
          >
            취소
          </button>

          {/* Participant avatars bouncing */}
          <div className="flex gap-3 mb-10">
            {participants.map((p, i) => (
              <div
                key={p.id}
                className="w-12 h-12 rounded-full bg-primary/60 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20"
                style={{ animation: `bounce 1.5s ease-in-out ${i * 0.3}s infinite` }}
              >
                {p.name.charAt(0)}
              </div>
            ))}
          </div>

          {/* Step-by-step progress */}
          <div className="space-y-3 mb-8 w-full max-w-[280px]">
            {ANALYZING_STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  i <= analyzeStep ? 'opacity-100' : 'opacity-20'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                  i < analyzeStep ? 'bg-emerald-500' : i === analyzeStep ? 'bg-primary animate-pulse' : 'bg-gray-600'
                }`}>
                  {i < analyzeStep ? <Check className="w-3 h-3" /> : step.emoji}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>

          {/* Teaser quote */}
          <p className="text-xs text-gray-400 text-center italic">"{teaser}"</p>
        </div>
      );
    }

    // ================================================================
    // 5. RESULT PUBLIC — 공유 결과
    // ================================================================
    case 'result_public': {
      if (!currentResult) return null;
      const isCouple = currentResult.mode === 'couple';
      const resultName = resultNames[Math.floor(Date.now() / 100000) % resultNames.length];
      const { groupScore, pairScores, roleAssignments, bestPair } = currentResult;

      return (
        <div className="bg-surface flex-1 overflow-y-auto pb-24 animate-fade-in">
          <div className="p-4 space-y-3">
            {/* Share button at top */}
            <button
              onClick={() => showToast('공유 링크가 복사되었어요!')}
              className="flex items-center justify-center gap-2 w-full bg-surface-muted text-primary font-bold py-3 rounded-xl active:scale-95 transition-transform"
            >
              <Share2 className="w-4 h-4" /> 결과 공유하기
            </button>

            {/* Summary card: group score, result name, room info */}
            <div className={`p-6 rounded-3xl shadow-sm border text-center relative overflow-hidden ${
              isCouple ? 'bg-gradient-to-br from-pink-50 to-white border-pink-100' : 'bg-white border-surface-line'
            }`}>
              {/* 데코 요소 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-3 ${
                isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
              }`}>다 함께 보는 {isCouple ? '커플' : '그룹'} 총평</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">{groupScore}점</h2>
              <p className="text-sm font-bold text-gray-800 mb-1">{resultName}</p>
              <p className="text-xs text-gray-400">{currentResult.roomName} · {currentResult.participants.length}명</p>
            </div>

            {/* N:N 케미 매트릭스 (group only, 3+ people) */}
            {!isCouple && pairScores.length > 1 && (
              <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" /> N:N 케미 매트릭스
                </h3>
                <p className="text-[10px] text-gray-400 mb-3">조합별 궁합 점수를 한눈에</p>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-12" />
                        {currentResult.participants.map(p => (
                          <th key={p.id} className="text-center p-1">
                            <div className="w-8 h-8 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold text-primary">
                              {p.name.charAt(0)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentResult.participants.map((rowP, ri) => (
                        <tr key={rowP.id}>
                          <td className="p-1">
                            <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold text-primary">
                              {rowP.name.charAt(0)}
                            </div>
                          </td>
                          {currentResult.participants.map((colP, ci) => {
                            if (ri === ci) {
                              return (
                                <td key={colP.id} className="text-center p-1">
                                  <div className="w-10 h-10 mx-auto rounded-lg bg-surface flex items-center justify-center">
                                    <span className="text-[10px] text-gray-300">-</span>
                                  </div>
                                </td>
                              );
                            }
                            const pair = pairScores.find(ps =>
                              (ps.p1.id === rowP.id && ps.p2.id === colP.id) ||
                              (ps.p1.id === colP.id && ps.p2.id === rowP.id)
                            );
                            const score = pair ? pair.score : 0;
                            const sc = getScoreColor(score);
                            return (
                              <td key={colP.id} className="text-center p-1">
                                <div className={`w-10 h-10 mx-auto rounded-lg ${sc.bg} border ${sc.border} flex items-center justify-center`}>
                                  <span className={`text-xs font-extrabold ${sc.text}`}>{score}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 베스트 케미 조합 highlight */}
            {bestPair && (
              <div className={`p-4 rounded-2xl shadow-sm border ${
                isCouple
                  ? 'bg-gradient-to-r from-pink-50 to-white border-pink-100'
                  : 'bg-gradient-to-r from-surface-light to-white border-surface-line'
              }`}>
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                  <Trophy className={`w-4 h-4 ${isCouple ? 'text-pink-500' : 'text-primary'}`} /> 베스트 케미 조합
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
                  }`}>{bestPair.p1.name.charAt(0)}</div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`text-lg font-extrabold ${isCouple ? 'text-pink-500' : 'text-primary'}`}>{bestPair.score}점</div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full ${isCouple ? 'bg-pink-400' : 'bg-primary'}`} style={{ width: `${bestPair.score}%` }} />
                    </div>
                  </div>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
                  }`}>{bestPair.p2.name.charAt(0)}</div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  {getDisplayName(bestPair.p1)} & {getDisplayName(bestPair.p2)} - 에너지 방향이 가장 잘 맞는 조합이에요
                </p>
              </div>
            )}

            {/* 주의 조합 (spec: part of matrix area) */}
            {(() => {
              const worstPair = pairScores.length > 0
                ? [...pairScores].sort((a, b) => a.score - b.score)[0]
                : null;
              return worstPair ? (
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-800">주의 조합</span>
                  </div>
                  <p className="text-[11px] text-amber-700">
                    {getDisplayName(worstPair.p1)} & {getDisplayName(worstPair.p2)} ({worstPair.score}점) — 서로 배려하면 좋은 관계!
                  </p>
                </div>
              ) : null;
            })()}

            {/* 역할 배지 cards (2-col grid with role colors) */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                {isCouple ? <Heart className="w-4 h-4 text-pink-500" /> : <Users className="w-4 h-4 text-primary" />}
                {isCouple ? '케미 분석' : '역할 배지'}
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {roleAssignments.map((ra, i) => {
                  const cs = ROLE_COLOR_STYLES[ra.role.color] || ROLE_COLOR_STYLES.purple;
                  return (
                    <div key={i} className={`${cs.bg} p-3.5 rounded-xl border ${cs.border}`}>
                      <p className={`text-xs ${cs.text} font-bold mb-1`}>{ra.role.emoji} {ra.role.role}</p>
                      <p className="font-bold text-gray-800 text-sm mb-1">{getDisplayName(ra.participant)}</p>
                      <p className="text-[10px] text-gray-400 leading-snug">{ra.role.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 모임 조언 section */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-primary" /> 이 모임을 위한 조언
              </h3>
              <div className="space-y-2">
                {guides.slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-surface-light rounded-xl p-3 border border-surface-line">
                    <Star className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-700 leading-relaxed">{g}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* "내 개인 결과 보기" CTA (dark button with lock icon) */}
            <div className="pt-2 space-y-2.5">
              <button
                onClick={() => setRoomStep('result_private')}
                className="w-full bg-primary-deep text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-900 transition active:scale-95 transition-transform"
              >
                <Lock className="w-4 h-4 text-yellow-400" /> 내 개인 결과 보기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ================================================================
    // 6. RESULT PRIVATE — 개인 결과
    // ================================================================
    case 'view_saved_private':
    case 'result_private': {
      // view_saved_private: 저장된 결과의 개인 결과 보기
      // result_private: 방금 생성된 결과의 개인 결과 보기
      const sourceResult = roomStep === 'view_saved_private' ? viewingResult : currentResult;
      if (!sourceResult) { setRoomStep('landing'); return null; }
      const isCouple = sourceResult.mode === 'couple';
      const pd = sourceResult.privateData || {};
      const myRole = pd.myRole || (sourceResult.roleAssignments?.[0]?.role) || { emoji: '🔮', role: '분석 중', desc: '' };
      const myPairScores = pd.myPairScores || [];
      const comfortPerson = pd.comfortPerson || { name: '참여자' };
      const cautionPerson = pd.cautionPerson || { name: '참여자' };
      const insiderStrategies = pd.insiderStrategies || [
        '대화 초반에 가벼운 질문을 던지면 자연스럽게 중심이 돼요',
        '리액션을 조금 크게 하면 상대방이 더 마음을 열어요',
        '1:1로 따로 대화하는 시간을 만들면 깊은 유대가 생겨요',
      ];
      const myStrengths = pd.myStrengths || [];
      const backStep = roomStep === 'view_saved_private' ? 'view_saved' : 'result_public';

      return (
        <div className="bg-slate-900 flex-1 overflow-y-auto pb-24 animate-fade-in text-white">
          <div className="px-5 pt-5">
            <button
              onClick={() => setRoomStep(backStep)}
              className="text-gray-400 flex items-center gap-1 text-sm mb-4 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" /> {roomStep === 'view_saved_private' ? '공유 결과' : '공용 결과'}
            </button>
          </div>

          <div className="px-5 space-y-5">
            {/* My role description */}
            <div className="text-center pt-4 pb-2">
              <p className="text-sm text-purple-300 mb-2">이 {isCouple ? '관계' : '모임'}에서의 내 역할</p>
              <h2 className="text-2xl font-extrabold mb-2 leading-tight">{myRole.emoji} {myRole.role}</h2>
              <p className="text-sm text-gray-400">{myRole.desc}</p>
            </div>

            {/* My compatibility with each member (score bars) */}
            {myPairScores.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <p className="text-xs text-purple-300 font-bold mb-3 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> 나와의 궁합
                </p>
                <div className="space-y-2.5">
                  {myPairScores.map((mp, i) => {
                    const sc = getScoreColor(mp.score);
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {mp.other.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold">{getDisplayName(mp.other)}</span>
                            <span className={`text-xs font-extrabold ${sc.text}`}>{mp.score}점</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${sc.bar} transition-all`} style={{ width: `${mp.score}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comfort person / Caution person cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-900/30 rounded-2xl p-4 border border-emerald-800/30">
                <p className="text-[10px] text-emerald-400 font-bold mb-2">편안한 사람</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-300 font-bold text-xs">
                    {comfortPerson.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold">{getDisplayName(comfortPerson)}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">에너지 방향이 비슷해 자연스럽게 어울려요</p>
              </div>
              <div className="bg-amber-900/30 rounded-2xl p-4 border border-amber-800/30">
                <p className="text-[10px] text-amber-400 font-bold mb-2">조심할 상황</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-800/50 flex items-center justify-center text-amber-300 font-bold text-xs">
                    {cautionPerson.name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold">{getDisplayName(cautionPerson)}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">템포 차이로 가끔 엇갈릴 수 있어요</p>
              </div>
            </div>

            {/* 인싸 전략 (numbered tips, purple gradient bg) */}
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/30 rounded-2xl p-4 border border-purple-700/30">
              <p className="text-xs text-purple-300 font-bold mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 인싸 전략
              </p>
              <div className="space-y-2">
                {insiderStrategies.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-purple-300 font-bold">{i + 1}</span>
                    </div>
                    <p className="text-[12px] text-gray-300 leading-relaxed">{s}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 주의할 관계 */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-amber-400 font-bold mb-3 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> 주의할 관계
              </p>
              <div className="space-y-2">
                {cautionCopies.slice(0, 2).map((c, i) => (
                  <div key={i} className="bg-amber-900/20 rounded-xl p-3 border border-amber-800/30">
                    <p className="text-[11px] text-amber-200 font-medium">{c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 나의 강점 (score bars) */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-purple-300 font-bold mb-3 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> 나의 강점
              </p>
              <div className="space-y-2.5">
                {myStrengths.map((s, i) => {
                  const sc = getScoreColor(s.score);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-gray-400">{s.label}</span>
                        <span className={`text-xs font-extrabold ${sc.text}`}>{s.score}</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${sc.bar} transition-all`} style={{ width: `${s.score}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy notice */}
            <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-500 shrink-0" />
              <p className="text-[11px] text-gray-500 font-medium">개인 결과는 공유할 수 없어요. 나만 볼 수 있는 분석이에요.</p>
            </div>

            {/* CTAs */}
            <div className="pt-2 space-y-2.5 pb-4">
              <button
                onClick={resetRoom}
                className="w-full bg-white text-gray-900 font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition active:scale-95 transition-transform"
              >
                <Calendar className="w-5 h-5 text-primary" /> 내 궁합 기록 보기
              </button>
              <button
                onClick={() => { resetRoom(); switchTab('home'); }}
                className="w-full bg-white/10 text-white font-bold py-3.5 rounded-xl hover:bg-white/20 transition border border-white/10 active:scale-95 transition-transform"
              >
                홈으로 가기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ================================================================
    // 7. VIEW SAVED — 저장된 결과 보기
    // ================================================================
    case 'view_saved': {
      if (!viewingResult) { setRoomStep('landing'); return null; }
      const vr = viewingResult;
      const isCouple = vr.mode === 'couple';
      const vrPairScores = vr.pairScores || [];
      const vrBestPair = vrPairScores.length > 0
        ? vrPairScores.reduce((best, cur) => cur.score > best.score ? cur : best, vrPairScores[0])
        : null;
      const vrWorstPair = vrPairScores.length > 0
        ? [...vrPairScores].sort((a, b) => a.score - b.score)[0]
        : null;
      const vrGuides = BEHAVIOR_GUIDES[vr.mode || 'group'] || BEHAVIOR_GUIDES.group;

      return (
        <div className="flex-1 overflow-y-auto bg-surface pb-24 animate-fade-in">
          <div className="px-5 pt-4">
            <button
              onClick={() => { setViewingResult(null); setRoomStep('landing'); }}
              className="text-gray-500 flex items-center gap-1 text-sm mb-3 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-4 h-4" /> 뒤로
            </button>
          </div>
          <div className="px-4 space-y-3">

            {/* 공유 결과 공유 버튼 */}
            <button
              onClick={() => showToast('공유 링크가 복사되었어요!')}
              className="flex items-center justify-center gap-2 w-full bg-surface-muted text-primary font-bold py-3 rounded-xl active:scale-95 transition-transform"
            >
              <Share2 className="w-4 h-4" /> 결과 공유하기
            </button>

            {/* 점수 요약 카드 */}
            <div className={`p-6 rounded-3xl shadow-sm border text-center relative overflow-hidden ${
              isCouple ? 'bg-gradient-to-br from-pink-50 to-white border-pink-100' : 'bg-white border-surface-line'
            }`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-3 ${
                isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
              }`}>{vr.relationType}</span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-1">{vr.groupScore}점</h2>
              <p className="text-sm font-bold text-gray-800 mb-1">{vr.roomName}</p>
              <p className="text-xs text-gray-400">{vr.participants?.length || 0}명 · {new Date(vr.date).toLocaleDateString('ko-KR')}</p>
            </div>

            {/* N:N 매트릭스 (그룹 3인 이상) */}
            {!isCouple && vrPairScores.length > 1 && vr.participants && (
              <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" /> N:N 케미 매트릭스
                </h3>
                <p className="text-[10px] text-gray-400 mb-3">조합별 궁합 점수를 한눈에</p>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="w-12" />
                        {vr.participants.map(p => (
                          <th key={p.id} className="text-center p-1">
                            <div className="w-8 h-8 mx-auto rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold text-primary">
                              {p.name.charAt(0)}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vr.participants.map((rowP, ri) => (
                        <tr key={rowP.id}>
                          <td className="p-1">
                            <div className="w-8 h-8 rounded-full bg-surface-muted flex items-center justify-center text-[10px] font-bold text-primary">
                              {rowP.name.charAt(0)}
                            </div>
                          </td>
                          {vr.participants.map((colP, ci) => {
                            if (ri === ci) {
                              return (
                                <td key={colP.id} className="text-center p-1">
                                  <div className="w-10 h-10 mx-auto rounded-lg bg-surface flex items-center justify-center">
                                    <span className="text-[10px] text-gray-300">-</span>
                                  </div>
                                </td>
                              );
                            }
                            const pair = vrPairScores.find(ps =>
                              (ps.p1.id === rowP.id && ps.p2.id === colP.id) ||
                              (ps.p1.id === colP.id && ps.p2.id === rowP.id)
                            );
                            const score = pair ? pair.score : 0;
                            const psc = getScoreColor(score);
                            return (
                              <td key={colP.id} className="text-center p-1">
                                <div className={`w-10 h-10 mx-auto rounded-lg ${psc.bg} border ${psc.border} flex items-center justify-center`}>
                                  <span className={`text-xs font-extrabold ${psc.text}`}>{score}</span>
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 조합별 케미 점수 (커플 or 간단 리스트) */}
            {(isCouple || vrPairScores.length === 1) && vrPairScores.length > 0 && (
              <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3">조합별 케미 점수</h3>
                <div className="space-y-2">
                  {vrPairScores.map((pair, i) => {
                    const pc = getScoreColor(pair.score);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-500 w-20 truncate">
                          {pair.p1?.name?.charAt(0)} - {pair.p2?.name?.charAt(0)}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pc.bar} transition-all`} style={{ width: `${pair.score}%` }} />
                        </div>
                        <span className={`text-xs font-extrabold ${pc.text} w-8 text-right`}>{pair.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 베스트 케미 조합 */}
            {vrBestPair && (
              <div className={`p-4 rounded-2xl shadow-sm border ${
                isCouple ? 'bg-gradient-to-r from-pink-50 to-white border-pink-100' : 'bg-gradient-to-r from-surface-light to-white border-surface-line'
              }`}>
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                  <Trophy className={`w-4 h-4 ${isCouple ? 'text-pink-500' : 'text-primary'}`} /> 베스트 케미 조합
                </h3>
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
                  }`}>{vrBestPair.p1.name.charAt(0)}</div>
                  <div className="flex flex-col items-center flex-1">
                    <div className={`text-lg font-extrabold ${isCouple ? 'text-pink-500' : 'text-primary'}`}>{vrBestPair.score}점</div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full ${isCouple ? 'bg-pink-400' : 'bg-primary'}`} style={{ width: `${vrBestPair.score}%` }} />
                    </div>
                  </div>
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCouple ? 'bg-pink-100 text-pink-600' : 'bg-surface-muted text-primary'
                  }`}>{vrBestPair.p2.name.charAt(0)}</div>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  {getDisplayName(vrBestPair.p1)} & {getDisplayName(vrBestPair.p2)} - 에너지 방향이 가장 잘 맞는 조합이에요
                </p>
              </div>
            )}

            {/* 주의 조합 */}
            {vrWorstPair && (
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-amber-800">주의 조합</span>
                </div>
                <p className="text-[11px] text-amber-700">
                  {getDisplayName(vrWorstPair.p1)} & {getDisplayName(vrWorstPair.p2)} ({vrWorstPair.score}점) — 서로 배려하면 좋은 관계!
                </p>
              </div>
            )}

            {/* 역할 배지 */}
            {vr.roleAssignments && (
              <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
                <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> 역할 배지
                </h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {vr.roleAssignments.map((ra, i) => {
                    const cs = ROLE_COLOR_STYLES[ra.role.color] || ROLE_COLOR_STYLES.purple;
                    return (
                      <div key={i} className={`${cs.bg} p-3.5 rounded-xl border ${cs.border}`}>
                        <p className={`text-xs ${cs.text} font-bold mb-1`}>{ra.role.emoji} {ra.role.role}</p>
                        <p className="font-bold text-gray-800 text-sm mb-1">{getDisplayName(ra.participant)}</p>
                        <p className="text-[10px] text-gray-400 leading-snug">{ra.role.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 모임 조언 */}
            <div className="bg-white rounded-2xl border border-surface-line shadow-sm p-4">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-primary" /> 이 모임을 위한 조언
              </h3>
              <div className="space-y-2">
                {vrGuides.slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-surface-light rounded-xl p-3 border border-surface-line">
                    <Star className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-700 leading-relaxed">{g}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 내 개인 결과 보기 */}
            {vr.privateData && (
              <div className="pt-2">
                <button
                  onClick={() => setRoomStep('view_saved_private')}
                  className="w-full bg-primary-deep text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Lock className="w-4 h-4 text-yellow-400" /> 내 개인 결과 보기
                </button>
              </div>
            )}

            {/* 하단 여백 */}
            <div className="h-2" />
          </div>
        </div>
      );
    }

    // ================================================================
    // 8. QR SCAN — QR 스캔 화면
    // ================================================================
    case 'qr_scan':
      return (
        <div className="flex flex-col h-full bg-black relative animate-fade-in">
          <div className="p-6 flex justify-between items-center text-white z-10 relative">
            <button
              onClick={() => setRoomStep('landing')}
              className="p-2 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <span className="font-bold">QR 스캔</span>
            <div className="w-10" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative pb-20">
            <p className="text-white font-bold mb-8 text-lg">QR 코드를 사각형 안에 맞춰주세요</p>
            <div
              className="w-64 h-64 border-2 border-white/20 relative overflow-hidden bg-white/5 backdrop-blur-sm cursor-pointer"
              onClick={() => { setJoinCode(generateRoomCode()); setRoomStep('join_input'); }}
            >
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-400" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-400" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-400" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-400" />
              <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_#4ade80] animate-scan" />
            </div>
            <p className="text-white/60 text-xs mt-8">화면을 터치하면 스캔이 완료됩니다 (더미)</p>
          </div>
        </div>
      );

    // ================================================================
    // 9. JOIN INPUT — 참여 코드 입력
    // ================================================================
    case 'join_input':
      return (
        <div className="p-6 flex flex-col h-full animate-fade-in bg-white">
          <button
            onClick={() => setRoomStep('landing')}
            className="mb-4 text-gray-500 flex items-center gap-1 text-sm active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-4 h-4" /> 뒤로
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">참여 코드 입력</h2>
          <div className="flex-1">
            <input
              type="text"
              placeholder="참여 코드 6자리 입력"
              className="w-full border border-surface-line rounded-xl px-4 py-4 text-center text-xl font-mono tracking-widest uppercase bg-surface focus:bg-white focus:outline-none focus:border-primary transition-colors mb-4"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
            />
            {joinCode.length >= 6 ? (
              <button
                onClick={() => { setQrExpiry(Date.now() + 30 * 60 * 1000); setRoomStep('invite_lobby'); }}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg hover:bg-primary-dark transition mt-4 active:scale-95 transition-transform"
              >
                방 입장하기
              </button>
            ) : (
              <button
                onClick={() => setJoinCode(generateRoomCode())}
                className="w-full bg-white border border-surface-outline text-primary font-bold py-4 rounded-xl shadow-sm hover:bg-surface transition mt-2 active:scale-95 transition-transform"
              >
                샘플 코드로 붙여넣기
              </button>
            )}
          </div>
        </div>
      );

    default:
      return null;
  }
}
