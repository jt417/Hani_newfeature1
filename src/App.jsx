import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

// Hooks
import { useToast } from './hooks/useToast';
import { useCurrency } from './hooks/useCurrency';

// Data
import { DIARY_INITIAL_EVENTS, computeStreak } from './data/diaryData';
import { MOOD_LABELS, summarizeEmotionFlow } from './data/relationUtils';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';

// Features
import HomeTab from './features/HomeTab';
import DiaryTab from './features/DiaryTab';
import CompatibilityTab from './features/CompatibilityTab';
import ChatTab from './features/ChatTab';
import MyTab from './features/MyTab';

export default function App() {
  // --- 전역 상태 ---
  const [activeTab, setActiveTab] = useState('home');
  const { toast, showToast } = useToast();
  const { haniCoin, orb, handleDeduct } = useCurrency(showToast);

  // --- 다이어리 공유 데이터 ---
  const [diaryEvents, setDiaryEvents] = useState(DIARY_INITIAL_EVENTS);

  // --- 궁합 결과 저장 ---
  const [savedResults, setSavedResults] = useState([]);

  // --- 채팅 공유 데이터 ---
  const [chatContextNode, setChatContextNode] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: '안녕하세요, 저는 사주 상담가 하니에요. 오늘은 어떤 주제가 가장 궁금하세요?', isWelcome: true }
  ]);

  // --- 채팅 전환 확인 ---
  const [pendingChatAction, setPendingChatAction] = useState(null);

  // --- 스트릭 계산 ---
  const streakData = useMemo(() => computeStreak(diaryEvents), [diaryEvents]);

  // --- 탭 전환 ---
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  // --- 궁합 결과 저장 콜백 ---
  const handleSaveResult = (result) => {
    setSavedResults(prev => [result, ...prev]);
    showToast('궁합 결과가 저장되었어요!');
  };

  // --- 채팅 전환 실행 ---
  const executeChatSwitch = (action) => {
    if (action.type === 'diary') {
      const events = action.data;
      setChatContextNode(null);

      // 전체 십신 + 합충형파해 통계 생성
      const effectCounts = { '충': 0, '형': 0, '합': 0, '파': 0, '해': 0 };
      const emotionCounts = { '긍정': 0, '중립': 0, '부정': 0 };
      const sipsinCounts = {};
      const allTags = {};
      let totalIntensity = 0;

      events.forEach(ev => {
        (ev.analysis?.triggeredEffects || []).forEach(e => { if (effectCounts[e] !== undefined) effectCounts[e]++; });
        if (emotionCounts[ev.emotion] !== undefined) emotionCounts[ev.emotion]++;
        const sipsinName = ev.analysis?.sipsin?.name || ev.eventType;
        sipsinCounts[sipsinName] = (sipsinCounts[sipsinName] || 0) + 1;
        (ev.analysis?.patternTags || []).forEach(tag => { allTags[tag] = (allTags[tag] || 0) + 1; });
        totalIntensity += ev.intensity;
      });

      const effectDominant = Object.entries(effectCounts).sort((a, b) => b[1] - a[1]);
      const sipsinDominant = Object.entries(sipsinCounts).sort((a, b) => b[1] - a[1]).slice(0, 3);
      const topTags = Object.entries(allTags).sort((a, b) => b[1] - a[1]).slice(0, 5);
      const avgIntensity = (totalIntensity / events.length).toFixed(1);

      const effectSummary = effectDominant.filter(([, c]) => c > 0).map(([k, c]) => `${k}(${c}회)`).join(', ');
      const sipsinSummary = sipsinDominant.map(([t, c]) => `${t}(${c}건)`).join(', ');
      const tagSummary = topTags.map(([t]) => t).join(', ');
      const emotionSummary = `긍정 ${emotionCounts['긍정']}건 / 중립 ${emotionCounts['중립']}건 / 부정 ${emotionCounts['부정']}건`;

      const moodLabelCounts = {};
      const allKeywords = {};
      events.forEach(ev => {
        if (ev.moodLabel) {
          const found = MOOD_LABELS.find(m => m.label === ev.moodLabel);
          const label = found ? `${found.emoji} ${found.label}` : ev.moodLabel;
          moodLabelCounts[label] = (moodLabelCounts[label] || 0) + 1;
        }
        (ev.keywords || []).forEach(kw => {
          allKeywords[kw] = (allKeywords[kw] || 0) + 1;
        });
      });
      const topMoods = Object.entries(moodLabelCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([m, c]) => `${m}(${c})`).join(', ');
      const topKeywords = Object.entries(allKeywords).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k).join(', ');
      const emotionFlow = summarizeEmotionFlow(events);

      const moodLine = topMoods ? `\n🌈 주요 감정: ${topMoods}` : '';
      const keywordLine = topKeywords ? `\n🏷️ 반복 키워드: ${topKeywords}` : '';
      const flowLine = `\n🌊 감정 흐름: ${emotionFlow}`;

      setChatMessages([
        {
          id: Date.now(),
          sender: 'ai',
          text:
            `안녕하세요, 하니에요.\n\n` +
            `지금까지 기록하신 ${events.length}건의 다이어리를 십신(十神) 관점에서 종합 분석했어요.\n` +
            `사주 고전 이론을 바탕으로 당신의 발현 패턴을 상담해 드릴게요.\n\n` +
            `🔮 주요 십신: ${sipsinSummary}\n` +
            `📊 합충형파해: ${effectSummary}\n` +
            `💡 핵심 패턴: ${tagSummary}\n` +
            `🎭 감정 분포: ${emotionSummary}\n` +
            `⚡ 평균 체감 강도: ${avgIntensity}/5` +
            moodLine + keywordLine + flowLine +
            `\n\n십신 분포를 보면, 당신은 ${sipsinDominant[0]?.[0] || ''}의 기운이 삶에서 가장 빈번하게 작용합니다.\n` +
            `이 패턴을 바탕으로 앞으로의 운기 흐름, 주의할 시기,\n` +
            `또는 반복되는 발현을 어떻게 활용하면 좋을지 상담해 드릴 수 있어요.\n\n` +
            `궁금한 주제를 편하게 말씀해 주세요.`
        }
      ]);
      showToast('하니와의 상담을 시작했어요.');
    }
    setActiveTab('chat');
    setPendingChatAction(null);
  };

  // --- 크로스탭 콜백: 다이어리 → 채팅 ---
  const handleStartDiaryChat = () => {
    const action = { type: 'diary', data: diaryEvents };
    const hasConversation = chatMessages.length > 1 || (chatMessages.length === 1 && !chatMessages[0].isWelcome);
    if (hasConversation) {
      setPendingChatAction(action);
    } else {
      executeChatSwitch(action);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 font-sans items-center justify-center p-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in-up text-sm font-bold flex items-center gap-2 border border-gray-700">
          <CheckCircle className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}

      {/* 모바일 프레임 */}
      <div className="w-full max-w-[393px] h-[852px] max-h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border-[8px] border-gray-900 flex flex-col">

        {/* Header */}
        <Header activeTab={activeTab} haniCoin={haniCoin} orb={orb} />

        {/* Body */}
        <div className="flex-1 overflow-hidden relative flex flex-col pb-[84px]">
          {activeTab === 'home' && (
            <HomeTab
              diaryEvents={diaryEvents}
              streakData={streakData}
              switchTab={switchTab}
              showToast={showToast}
              savedResults={savedResults}
            />
          )}

          {activeTab === 'diary' && (
            <DiaryTab
              diaryEvents={diaryEvents}
              setDiaryEvents={setDiaryEvents}
              showToast={showToast}
              onStartDiaryChat={handleStartDiaryChat}
              handleDeduct={handleDeduct}
              streakData={streakData}
            />
          )}

          {activeTab === 'compat' && (
            <CompatibilityTab
              showToast={showToast}
              handleDeduct={handleDeduct}
              haniCoin={haniCoin}
              savedResults={savedResults}
              onSaveResult={handleSaveResult}
              switchTab={switchTab}
            />
          )}

          {activeTab === 'chat' && (
            <ChatTab
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatContextNode={chatContextNode}
              showToast={showToast}
              handleDeduct={handleDeduct}
            />
          )}

          {activeTab === 'my' && (
            <MyTab
              haniCoin={haniCoin}
              orb={orb}
              showToast={showToast}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav activeTab={activeTab} switchTab={switchTab} />

        {/* 채팅 전환 확인 모달 */}
        {pendingChatAction && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setPendingChatAction(null)}>
            <div className="bg-white rounded-3xl p-6 mx-6 w-full max-w-[340px] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">새 채팅 시작</h3>
                <p className="text-sm text-gray-500">기존 하니와의 대화 내용이 초기화됩니다.<br />새로운 주제로 채팅을 시작할까요?</p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setPendingChatAction(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">취소</button>
                <button onClick={() => executeChatSwitch(pendingChatAction)} className="flex-1 bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-dark transition">시작하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
