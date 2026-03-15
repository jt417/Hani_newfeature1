import React, { useState, useEffect, useRef } from 'react';
import {
  Users, Sparkles, Lock, ChevronLeft, ChevronRight, ScanLine,
  Map as MapIcon, Heart, Copy, Share2, Check, Star
} from 'lucide-react';
import {
  GROUP_CATEGORIES, GROUP_RELATION_TYPES, COUPLE_RELATION_TYPES,
  MOOD_PRESETS, GROUP_INTENT_TAGS, COUPLE_INTENT_TAGS,
  ANALYZING_STEPS, ANALYZING_TEASERS,
  GROUP_RESULT_NAMES, COUPLE_RESULT_NAMES,
  GROUP_ROLE_CARDS, COUPLE_ROLE_CARDS,
  GROUP_CAUTION_COPIES, COUPLE_CAUTION_COPIES,
  BEHAVIOR_GUIDES, RESULT_METRICS, ROLE_COLOR_STYLES
} from '../data/groupRoomData';

export default function GroupRoom({ showToast, onSaveToMap, onViewMap }) {
  const [roomStep, setRoomStep] = useState('landing');
  const [roomForm, setRoomForm] = useState({
    mode: '',               // 'group' | 'couple'
    categoryKey: '',        // GROUP_CATEGORIES key
    relationType: '',       // relation type label
    roomName: '',
    moodPreset: '',
    intentTags: [],
    maxMembers: 5,
  });
  const [participants, setParticipants] = useState([
    { id: 'me', name: '나(김하니)', role: 'host', ready: true, status: 'done' }
  ]);
  const [joinCode, setJoinCode] = useState('');
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [copied, setCopied] = useState(false);

  // ─── 분석 애니메이션 ────────────────────────────────
  useEffect(() => {
    if (roomStep !== 'analyzing') return;
    setAnalyzeStep(0);
    const timers = [];
    ANALYZING_STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setAnalyzeStep(i), i * 800));
    });
    timers.push(setTimeout(() => setRoomStep('result_public'), ANALYZING_STEPS.length * 800 + 600));
    return () => timers.forEach(clearTimeout);
  }, [roomStep]);

  const handleCopyCode = () => {
    setCopied(true);
    showToast('참여 코드가 복사되었습니다!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveRoomToMap = () => {
    onSaveToMap({
      name: roomForm.roomName || '새로운 모임',
      category: roomForm.relationType,
      participantIds: participants.map(p => p.id)
    });
    setRoomStep('save_complete');
  };

  const intentTags = roomForm.mode === 'couple' ? COUPLE_INTENT_TAGS : GROUP_INTENT_TAGS;
  const toggleIntent = (key) => {
    setRoomForm(prev => ({
      ...prev,
      intentTags: prev.intentTags.includes(key)
        ? prev.intentTags.filter(k => k !== key)
        : prev.intentTags.length < 2 ? [...prev.intentTags, key] : prev.intentTags,
    }));
  };

  // 더미 결과값
  const dummyScore = 82;
  const dummyMetrics = [78, 85, 72];
  const resultNames = roomForm.mode === 'couple' ? COUPLE_RESULT_NAMES : GROUP_RESULT_NAMES;
  const roleCards = roomForm.mode === 'couple' ? COUPLE_ROLE_CARDS : GROUP_ROLE_CARDS;
  const cautionCopies = roomForm.mode === 'couple' ? COUPLE_CAUTION_COPIES : GROUP_CAUTION_COPIES;
  const metrics = RESULT_METRICS[roomForm.mode || 'group'] || RESULT_METRICS.group;
  const guides = BEHAVIOR_GUIDES[roomForm.mode || 'group'] || BEHAVIOR_GUIDES.group;

  // ═══════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════

  switch (roomStep) {

    // ────────────── 1. LANDING ──────────────────────────
    case 'landing':
      return (
        <div className="flex-1 overflow-y-auto bg-white pb-24 animate-fade-in">
          {/* 히어로 */}
          <div className="bg-gradient-to-b from-[#6B4E90] to-[#4A306D] px-6 pt-10 pb-8 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative z-10">
              <h1 className="text-2xl font-extrabold mb-2 leading-tight">같이 보면 더 재밌는<br />관계 궁합</h1>
              <p className="text-purple-200 text-sm mb-5">우리 모임의 분위기, 역할, 케미를 한 번에</p>
              <div className="flex flex-wrap justify-center gap-1.5">
                {['연결자', '분위기메이커', '속도 차', '갈등 완충자', '설렘형'].map(tag => (
                  <span key={tag} className="bg-white/15 backdrop-blur-sm text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 -mt-4 relative z-10 space-y-3">
            {/* 그룹 궁합 카드 */}
            <button onClick={() => { setRoomForm(f => ({ ...f, mode: 'group' })); setRoomStep('create_setup'); }}
              className="w-full bg-white rounded-2xl p-5 shadow-md border border-[#EBE5F2] text-left hover:shadow-lg transition group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#F0EBF5] rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7 text-[#5E4078]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">그룹 궁합</h3>
                  <p className="text-xs text-gray-500 mb-2.5 leading-relaxed">친구, 팀, 가족, 모임의 분위기와 역할 분석</p>
                  <div className="flex flex-wrap gap-1">
                    {['분위기', '역할', '갈등 포인트'].map(t => (
                      <span key={t} className="text-[9px] font-bold bg-[#F0EBF5] text-[#5E4078] px-2 py-0.5 rounded-full border border-[#E5DDF0]">{t}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-1 group-hover:text-[#5E4078] transition" />
              </div>
            </button>

            {/* 커플/썸 궁합 카드 */}
            <button onClick={() => { setRoomForm(f => ({ ...f, mode: 'couple' })); setRoomStep('create_setup'); }}
              className="w-full bg-white rounded-2xl p-5 shadow-md border border-pink-100 text-left hover:shadow-lg transition group">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Heart className="w-7 h-7 text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-gray-900 text-base mb-1">커플/썸 궁합</h3>
                  <p className="text-xs text-gray-500 mb-2.5 leading-relaxed">표현 방식, 감정 온도, 관계 리듬 분석</p>
                  <div className="flex flex-wrap gap-1">
                    {['설렘', '속도 차', '표현 차이'].map(t => (
                      <span key={t} className="text-[9px] font-bold bg-pink-50 text-pink-600 px-2 py-0.5 rounded-full border border-pink-100">{t}</span>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 shrink-0 mt-1 group-hover:text-pink-500 transition" />
              </div>
            </button>
          </div>

          {/* 하단 입장 버튼 */}
          <div className="px-5 mt-6 flex gap-2">
            <button onClick={() => setRoomStep('qr_scan')} className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm">
              <ScanLine className="w-4 h-4" /> QR 스캔
            </button>
            <button onClick={() => setRoomStep('join_input')} className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 font-bold py-3.5 rounded-xl shadow-sm hover:bg-gray-100 transition flex items-center justify-center gap-2 text-sm">
              <Users className="w-4 h-4" /> 코드 입력
            </button>
          </div>
        </div>
      );

    // ────────────── QR SCAN (기존 유지) ────────────────
    case 'qr_scan':
      return (
        <div className="flex flex-col h-full bg-black relative animate-fade-in">
          <div className="p-6 flex justify-between items-center text-white z-10 relative">
            <button onClick={() => setRoomStep('landing')} className="p-2"><ChevronLeft className="w-6 h-6" /></button>
            <span className="font-bold">QR 스캔</span><div className="w-10" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center relative pb-20">
            <p className="text-white font-bold mb-8 text-lg">QR 코드를 사각형 안에 맞춰주세요</p>
            <div className="w-64 h-64 border-2 border-white/20 relative overflow-hidden bg-white/5 backdrop-blur-sm cursor-pointer" onClick={() => { setJoinCode('AB23XZ'); setRoomStep('join_input'); }}>
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

    // ────────────── JOIN INPUT ─────────────────────────
    case 'join_input':
      return (
        <div className="p-6 flex flex-col h-full animate-fade-in bg-white">
          <button onClick={() => setRoomStep('landing')} className="mb-4 text-gray-500 flex items-center gap-1 text-sm"><ChevronLeft className="w-4 h-4" /> 뒤로</button>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">참여 코드 입력</h2>
          <div className="flex-1">
            <input type="text" placeholder="참여 코드 6자리 입력"
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-center text-xl font-mono tracking-widest uppercase bg-gray-50 focus:bg-white focus:outline-none focus:border-[#5E4078] transition-colors mb-4"
              value={joinCode} onChange={e => setJoinCode(e.target.value)} />
            {joinCode.length >= 6 ? (
              <button onClick={() => setRoomStep('invite_lobby')} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#4A306D] transition mt-4">방 입장하기</button>
            ) : (
              <button onClick={() => setJoinCode('AB23XZ')} className="w-full bg-white border border-[#D1C5E0] text-[#5E4078] font-bold py-4 rounded-xl shadow-sm hover:bg-[#F7F5FA] transition mt-2">샘플 코드로 붙여넣기</button>
            )}
          </div>
        </div>
      );

    // ────────────── 2. CREATE SETUP ───────────────────
    case 'create_setup': {
      const isCouple = roomForm.mode === 'couple';
      const relationOptions = isCouple
        ? COUPLE_RELATION_TYPES
        : (GROUP_RELATION_TYPES[roomForm.categoryKey] || []);
      const canProceed = roomForm.relationType && roomForm.roomName.trim();

      return (
        <div className="flex flex-col h-full animate-fade-in bg-white">
          {/* 상단 */}
          <div className="px-5 pt-4 pb-3">
            <button onClick={() => { if (!roomForm.relationType && !isCouple && roomForm.categoryKey) { setRoomForm(f => ({ ...f, categoryKey: '' })); } else { setRoomStep('landing'); setRoomForm(f => ({ ...f, mode: '', categoryKey: '', relationType: '' })); } }}
              className="text-gray-500 flex items-center gap-1 text-sm mb-3"><ChevronLeft className="w-4 h-4" /> 뒤로</button>
            {/* 진행 바 */}
            <div className="flex gap-1.5 mb-4">
              <div className="h-1 flex-1 rounded-full bg-[#5E4078]" />
              <div className={`h-1 flex-1 rounded-full ${roomForm.relationType ? 'bg-[#5E4078]' : 'bg-gray-200'}`} />
              <div className={`h-1 flex-1 rounded-full ${canProceed ? 'bg-[#5E4078]' : 'bg-gray-200'}`} />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {isCouple ? '커플/썸 궁합 방' : '그룹 궁합 방'} 만들기
            </h2>
            <p className="text-xs text-gray-400">방의 컨셉을 설정하면 결과가 더 정확해져요</p>
          </div>

          {/* 본문 스크롤 */}
          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5">
            {/* 그룹: 카테고리 선택 */}
            {!isCouple && !roomForm.categoryKey && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">모임 유형</label>
                <div className="grid grid-cols-2 gap-2">
                  {GROUP_CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setRoomForm(f => ({ ...f, categoryKey: cat.key }))}
                      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:border-[#D1C5E0] hover:bg-[#FAF7FD] transition">
                      <span className="text-2xl mb-1 block">{cat.emoji}</span>
                      <span className="text-sm font-bold text-gray-800">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 모임 종류 선택 */}
            {(isCouple || roomForm.categoryKey) && (
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  {isCouple ? '관계 유형' : '모임 종류'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {(isCouple ? COUPLE_RELATION_TYPES : relationOptions).map(rt => (
                    <button key={rt.key} onClick={() => setRoomForm(f => ({ ...f, relationType: rt.label }))}
                      className={`px-3.5 py-2 rounded-full text-xs font-bold border transition-all ${
                        roomForm.relationType === rt.label
                          ? (isCouple ? 'bg-pink-500 border-pink-500 text-white' : 'bg-[#5E4078] border-[#5E4078] text-white')
                          : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>
                      {rt.emoji} {rt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 방 이름 */}
            {roomForm.relationType && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">방 이름</label>
                  <input type="text" placeholder="예: 주말 러닝크루, 베프 모임" maxLength={20}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5E4078] focus:bg-white transition"
                    value={roomForm.roomName} onChange={e => setRoomForm(f => ({ ...f, roomName: e.target.value }))} />
                </div>

                {/* 현재 분위기 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">지금 분위기 <span className="text-gray-400 font-normal text-xs">(선택)</span></label>
                  <div className="flex flex-wrap gap-2">
                    {MOOD_PRESETS.map(mp => (
                      <button key={mp.key} onClick={() => setRoomForm(f => ({ ...f, moodPreset: f.moodPreset === mp.key ? '' : mp.key }))}
                        className={`px-3 py-2 rounded-full text-xs font-bold border transition ${
                          roomForm.moodPreset === mp.key
                            ? 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]'
                            : 'bg-white text-gray-500 border-gray-200'
                        }`}>
                        {mp.emoji} {mp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 궁금한 포인트 */}
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-1">궁금한 포인트 <span className="text-gray-400 font-normal text-xs">(최대 2개)</span></label>
                  <div className="space-y-1.5 mt-2">
                    {intentTags.map(it => (
                      <button key={it.key} onClick={() => toggleIntent(it.key)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold border transition ${
                          roomForm.intentTags.includes(it.key)
                            ? 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]'
                            : 'bg-white text-gray-600 border-gray-200'
                        }`}>
                        {it.emoji} {it.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 하단 CTA */}
          {canProceed && (
            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <button onClick={() => {
                setParticipants([{ id: 'me', name: '나(김하니)', role: 'host', ready: true, status: 'done' }]);
                setRoomStep('invite_lobby');
              }} className={`w-full font-bold py-4 rounded-xl shadow-lg transition ${
                isCouple ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-[#5E4078] text-white hover:bg-[#4A306D]'
              }`}>
                방 생성 완료
              </button>
            </div>
          )}
        </div>
      );
    }

    // ────────────── 3. LOBBY ──────────────────────────
    case 'invite_lobby': {
      const roomCode = 'AB23XZ';
      const randomTeaser = ANALYZING_TEASERS[Math.floor(Date.now() / 10000) % ANALYZING_TEASERS.length];
      const isCouple = roomForm.mode === 'couple';

      return (
        <div className="flex flex-col h-full animate-fade-in bg-[#F7F5FA]">
          {/* 헤더 */}
          <div className="px-5 pt-4 pb-2">
            <button onClick={() => setRoomStep('create_setup')} className="text-gray-500 flex items-center gap-1 text-sm mb-2"><ChevronLeft className="w-4 h-4" /> 뒤로</button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-3">
            {/* 방 정보 카드 */}
            <div className={`rounded-2xl p-5 shadow-sm border text-center ${
              isCouple ? 'bg-gradient-to-br from-pink-50 to-white border-pink-100' : 'bg-gradient-to-br from-[#FAF7FD] to-white border-[#EBE5F2]'
            }`}>
              <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-2 ${
                isCouple ? 'bg-pink-100 text-pink-600' : 'bg-[#F0EBF5] text-[#5E4078]'
              }`}>{roomForm.relationType}</span>
              <h2 className="text-xl font-extrabold text-gray-900 mb-1">{roomForm.roomName || '새로운 모임'}</h2>
              <p className="text-xs text-gray-400">{participants.length}명 참여 중</p>
              {roomForm.intentTags.length > 0 && (
                <div className="mt-3 flex flex-wrap justify-center gap-1">
                  {roomForm.intentTags.map(key => {
                    const tag = intentTags.find(t => t.key === key);
                    return tag ? (
                      <span key={key} className="text-[9px] font-bold bg-white px-2 py-1 rounded-full border border-gray-200 text-gray-600">{tag.emoji} {tag.label.split(' ').slice(0, 3).join(' ')}...</span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* 참여자 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-sm">참여자</h3>
                <button onClick={() => setParticipants(p => [...p, { id: `d_${Date.now()}`, name: ['조멀티', '김서하', '박준영', '이민지'][p.length - 1] || '참여자', role: 'member', ready: true, status: ['done', 'inputting', 'waiting'][Math.floor(Math.random() * 3)] }])}
                  className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2.5 py-1 rounded-lg font-bold border border-[#E5DDF0]">+ 추가</button>
              </div>
              <div className="space-y-2">
                {participants.map(p => {
                  const statusLabel = p.status === 'done' ? '입장 완료' : p.status === 'inputting' ? '정보 입력 중' : '대기 중';
                  const statusColor = p.status === 'done' ? 'text-emerald-600 bg-emerald-50' : p.status === 'inputting' ? 'text-amber-600 bg-amber-50' : 'text-gray-400 bg-gray-100';
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        p.role === 'host' ? 'bg-[#5E4078] text-white' : 'bg-[#F0EBF5] text-[#5E4078]'
                      }`}>{p.name.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${statusColor}`}>{statusLabel}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 분석 미리보기 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-3">분석에서 알 수 있는 것</h3>
              <div className="flex flex-wrap gap-1.5">
                {(isCouple
                  ? ['감정 온도', '표현 방식', '관계 리듬', '속마음은 각자만']
                  : ['분위기 메이커', '갈등 완충자', '대화 리듬', '속마음은 각자만']
                ).map(item => (
                  <span key={item} className="text-[10px] font-bold bg-gray-50 text-gray-600 px-2.5 py-1.5 rounded-full border border-gray-200">{item}</span>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 mt-3 italic">"  {randomTeaser}"</p>
            </div>

            {/* 초대 영역 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-3">친구 초대하기</h3>
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-200 mb-2">
                <span className="flex-1 font-mono text-lg tracking-widest text-gray-800 text-center font-bold">{roomCode}</span>
                <button onClick={handleCopyCode} className={`p-2 rounded-lg transition ${copied ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-gray-500 border border-gray-200'}`}>
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button className="w-full bg-gray-50 border border-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-gray-100 transition">
                <Share2 className="w-3.5 h-3.5" /> 초대 링크 공유
              </button>
            </div>
          </div>

          {/* 하단 CTA */}
          <div className="px-5 py-4 border-t border-gray-100 bg-white">
            <button onClick={() => setRoomStep('analyzing')}
              className={`w-full font-bold py-4 rounded-xl shadow-lg transition ${
                participants.length >= 2
                  ? 'bg-[#2D2D2D] text-white hover:bg-black'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              disabled={participants.length < 2}>
              {participants.length >= 2 ? '분석 시작' : `${2 - participants.length}명 더 필요해요`}
            </button>
          </div>
        </div>
      );
    }

    // ────────────── 4. ANALYZING ─────────────────────
    case 'analyzing': {
      const teaser = ANALYZING_TEASERS[Math.floor(Date.now() / 50000) % ANALYZING_TEASERS.length];
      return (
        <div className="flex flex-col h-full items-center justify-center bg-[#2D2D2D] text-white p-6 animate-fade-in pb-20 relative">
          {/* 취소 버튼 */}
          <button onClick={() => setRoomStep('invite_lobby')}
            className="absolute top-4 right-4 text-white/50 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition z-10">
            취소
          </button>
          {/* 떠다니는 아바타 */}
          <div className="flex gap-3 mb-10">
            {participants.map((p, i) => (
              <div key={p.id} className="w-12 h-12 rounded-full bg-[#5E4078]/60 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20"
                style={{ animation: `bounce 1.5s ease-in-out ${i * 0.3}s infinite` }}>
                {p.name.charAt(0)}
              </div>
            ))}
          </div>

          {/* 단계 표시 */}
          <div className="space-y-3 mb-8 w-full max-w-[280px]">
            {ANALYZING_STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${
                i <= analyzeStep ? 'opacity-100' : 'opacity-20'
              }`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                  i < analyzeStep ? 'bg-emerald-500' : i === analyzeStep ? 'bg-[#5E4078] animate-pulse' : 'bg-gray-600'
                }`}>
                  {i < analyzeStep ? <Check className="w-3 h-3" /> : step.emoji}
                </div>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-400 text-center italic">"{teaser}"</p>
        </div>
      );
    }

    // ────────────── 5. PUBLIC RESULT ─────────────────
    case 'result_public': {
      const isCouple = roomForm.mode === 'couple';
      const resultName = resultNames[Math.floor(Date.now() / 100000) % resultNames.length];
      const dummyParticipantNames = participants.map(p => p.name.replace('(김하니)', '').replace('나', '나'));

      return (
        <div className="bg-[#F7F5FA] flex-1 overflow-y-auto pb-24 animate-fade-in">
          <div className="p-4 space-y-3">
            {/* 요약 카드 */}
            <div className={`p-6 rounded-3xl shadow-sm border text-center relative overflow-hidden ${
              isCouple ? 'bg-gradient-to-br from-pink-50 to-white border-pink-100' : 'bg-white border-gray-100'
            }`}>
              <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-3 ${
                isCouple ? 'bg-pink-100 text-pink-600' : 'bg-[#F0EBF5] text-[#5E4078]'
              }`}>다 함께 보는 {isCouple ? '커플' : '그룹'} 총평</span>
              <h2 className="text-4xl font-extrabold text-[#2D2D2D] mb-2">{dummyScore}점</h2>
              <p className="text-sm font-bold text-gray-800 mb-1">{resultName}</p>
              <p className="text-xs text-gray-400">{roomForm.roomName || '새로운 모임'} · {participants.length}명</p>
            </div>

            {/* 핵심 지표 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-3">핵심 지표</h3>
              <div className="grid grid-cols-3 gap-2">
                {metrics.map((m, i) => (
                  <div key={m.key} className="text-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-lg mb-0.5">{m.emoji}</p>
                    <p className="text-[10px] text-gray-400 mb-1">{m.label}</p>
                    <p className="text-base font-extrabold text-gray-800">{dummyMetrics[i]}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 역할/케미 카드 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                {isCouple ? <Heart className="w-4 h-4 text-pink-500" /> : <Users className="w-4 h-4 text-[#5E4078]" />}
                {isCouple ? '케미 분석' : '역할 배지'}
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                {roleCards.map((rc, i) => {
                  const cs = ROLE_COLOR_STYLES[rc.color] || ROLE_COLOR_STYLES.purple;
                  return (
                    <div key={rc.role} className={`${cs.bg} p-3.5 rounded-xl border ${cs.border}`}>
                      <p className={`text-xs ${cs.text} font-bold mb-1`}>{rc.emoji} {rc.role}</p>
                      <p className="font-bold text-gray-800 text-sm mb-1">{dummyParticipantNames[i] || '—'}</p>
                      <p className="text-[10px] text-gray-400 leading-snug">{rc.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 주의 포인트 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 text-sm mb-3">주의 포인트</h3>
              <div className="space-y-2">
                {cautionCopies.slice(0, 2).map((c, i) => (
                  <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <p className="text-[11px] text-amber-800 font-medium">⚠️ {c}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 space-y-2.5">
              <button onClick={() => setRoomStep('result_private')}
                className="w-full bg-[#2D2D2D] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-black transition">
                <Lock className="w-4 h-4 text-yellow-400" /> 내 개인 결과 보기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ────────────── 6. PRIVATE RESULT ────────────────
    case 'result_private': {
      const isCouple = roomForm.mode === 'couple';
      const myRole = roleCards[0];
      const comfortPerson = participants[1]?.name || '조멀티';
      const cautionPerson = participants[2]?.name || '박준영';

      return (
        <div className="bg-slate-900 flex-1 overflow-y-auto pb-24 animate-fade-in text-white">
          {/* 헤더 */}
          <div className="px-5 pt-5">
            <button onClick={() => setRoomStep('result_public')} className="text-gray-400 flex items-center gap-1 text-sm mb-4"><ChevronLeft className="w-4 h-4" /> 공용 결과</button>
          </div>

          <div className="px-5 space-y-5">
            {/* 내 역할 */}
            <div className="text-center pt-4 pb-2">
              <p className="text-sm text-purple-300 mb-2">이 {isCouple ? '관계' : '모임'}에서의 내 역할</p>
              <h2 className="text-2xl font-extrabold mb-2 leading-tight">{myRole.emoji} {myRole.role}</h2>
              <p className="text-sm text-gray-400">{myRole.desc}</p>
            </div>

            {/* 편한 사람 / 조심할 사람 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-900/30 rounded-2xl p-4 border border-emerald-800/30">
                <p className="text-[10px] text-emerald-400 font-bold mb-2">편안한 사람</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-800/50 flex items-center justify-center text-emerald-300 font-bold text-xs">{comfortPerson.charAt(0)}</div>
                  <span className="text-sm font-bold">{comfortPerson}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">에너지 방향이 비슷해 자연스럽게 어울려요</p>
              </div>
              <div className="bg-amber-900/30 rounded-2xl p-4 border border-amber-800/30">
                <p className="text-[10px] text-amber-400 font-bold mb-2">조심할 상황</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-800/50 flex items-center justify-center text-amber-300 font-bold text-xs">{cautionPerson.charAt(0)}</div>
                  <span className="text-sm font-bold">{cautionPerson}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">템포 차이로 가끔 엇갈릴 수 있어요</p>
              </div>
            </div>

            {/* 분위기 영향 */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-purple-300 font-bold mb-2">내가 분위기에 주는 영향</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                대화를 먼저 여는 편이라 분위기 전환에 강해요. 다만 피곤한 날엔 직설적으로 들릴 수 있어요.
              </p>
            </div>

            {/* 행동 가이드 */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-purple-300 font-bold mb-3">오늘의 행동 가이드</p>
              <div className="space-y-2">
                {guides.slice(0, 3).map((g, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <Star className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-gray-300 leading-relaxed">{g}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-2 space-y-2.5 pb-4">
              <button onClick={handleSaveRoomToMap}
                className="w-full bg-white text-[#2D2D2D] font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition">
                <MapIcon className="w-5 h-5" /> 관계맵에 저장하기
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ────────────── 7. SAVE COMPLETE ────────────────
    case 'save_complete':
      return (
        <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-fade-in bg-white pb-20">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 border border-emerald-100">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">저장 완료!</h2>
          <p className="text-sm text-gray-500 mb-2">
            <strong className="text-[#5E4078]">{roomForm.roomName || '새로운 모임'}</strong>이<br />
            관계맵에 추가되었어요
          </p>
          <p className="text-xs text-gray-400 mb-8">맵에서 그룹을 탭하면 분석 결과를 다시 볼 수 있어요</p>

          <div className="w-full space-y-2.5">
            <button onClick={onViewMap} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#4A306D] transition flex items-center justify-center gap-2">
              <MapIcon className="w-5 h-5" /> 관계맵에서 확인하기
            </button>
            <button onClick={() => { setRoomStep('landing'); setRoomForm({ mode: '', categoryKey: '', relationType: '', roomName: '', moodPreset: '', intentTags: [], maxMembers: 5 }); }}
              className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">
              홈으로 가기
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
