import React, { useState, useMemo } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';

// Hooks
import { useToast } from './hooks/useToast';
import { useCurrency } from './hooks/useCurrency';

// Data
import { FIXED_GROUPS, FIXED_NODES, GROUP_SLOTS } from './data/mapData';
import { DIARY_INITIAL_EVENTS } from './data/diaryData';
import {
  MOOD_LABELS,
  getNodeEmotionSummary,
  classifyRelationshipStatus,
  computeEnergyImpact,
  getGroupMood,
  summarizeEmotionFlow,
} from './data/relationUtils';

// Components
import Header from './components/Header';
import BottomNav from './components/BottomNav';

// Features
import DiaryTab from './features/DiaryTab';
import RelationMap from './features/RelationMap';
import GroupRoom from './features/GroupRoom';
import ChatTab from './features/ChatTab';

export default function App() {
  // --- 전역 상태 ---
  const [activeTab, setActiveTab] = useState('diary');
  const { toast, showToast } = useToast();
  const { haniCoin, orb, handleDeduct } = useCurrency(showToast);

  // --- 관계맵 공유 데이터 ---
  const [groups, setGroups] = useState(FIXED_GROUPS);
  const [nodes, setNodes] = useState(FIXED_NODES);
  const [groupSlotIndex, setGroupSlotIndex] = useState(0);

  // --- 다이어리 공유 데이터 ---
  const [diaryEvents, setDiaryEvents] = useState(DIARY_INITIAL_EVENTS);

  // --- 채팅 공유 데이터 ---
  const [chatContextNode, setChatContextNode] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: '안녕하세요, 저는 사주 상담가 하니에요. 오늘은 어떤 주제가 가장 궁금하세요?', isWelcome: true }
  ]);

  // --- 채팅 전환 확인 ---
  const [pendingChatAction, setPendingChatAction] = useState(null);

  // --- 엣지 계산 (관계맵 + 그룹룸 공유) ---
  const edges = useMemo(() => {
    const edgeList = [];
    nodes.forEach((node) => {
      if (node.status === 'checked') {
        edgeList.push({ source: 'me', target: node.id, type: 'solid' });
        const targetNode = nodes.find(n => n.id !== node.id && n.status === 'checked' && n.groups.some(g => node.groups.includes(g)));
        if (targetNode && node.id < targetNode.id) edgeList.push({ source: node.id, target: targetNode.id, type: 'group' });
      } else {
        edgeList.push({ source: 'me', target: node.id, type: 'dashed' });
      }
    });
    return edgeList;
  }, [nodes]);

  // --- 노드별 enriched 데이터 (관계 상태, 에너지 영향 등) ---
  const nodeEnrichedData = useMemo(() => {
    const result = {};
    nodes.forEach(node => {
      if (node.status === 'checked') {
        const summary = getNodeEmotionSummary(node.id, diaryEvents);
        const status = classifyRelationshipStatus(node.id, diaryEvents);
        const energy = computeEnergyImpact(node.id, diaryEvents);
        result[node.id] = { ...summary, relationshipStatus: status, energyImpact: energy };
      }
    });
    return result;
  }, [nodes, diaryEvents]);

  // --- 그룹별 enriched 데이터 (분위기, 역할 등) ---
  const groupEnrichedData = useMemo(() => {
    const result = {};
    groups.forEach(group => {
      result[group.id] = getGroupMood(group.id, diaryEvents, nodes);
    });
    return result;
  }, [groups, diaryEvents, nodes]);

  // --- 탭 전환 ---
  const switchTab = (tab) => {
    setActiveTab(tab);
  };

  // --- 채팅 전환 실행 ---
  const executeChatSwitch = (action) => {
    if (action.type === 'diary') {
      const events = action.data; // 전체 다이어리 이벤트 배열
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

      // 빠른 기록 무드 라벨 통계
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
      showToast('십신 기반 전체 패턴으로 AI 채팅을 시작했어요.');
    } else if (action.type === 'node') {
      const node = action.data;
      setChatContextNode(node);

      // 노드 enriched 데이터 활용
      const enriched = nodeEnrichedData[node.id];
      let contextLines = '';
      if (enriched && enriched.totalCount > 0) {
        const statusObj = enriched.relationshipStatus
          ? { comfortable: '편안함', tension: '긴장감', longing: '그리움', distance: '거리감', recovery: '회복감', fatigue: '피로감' }[enriched.relationshipStatus]
          : null;
        const energyEmoji = enriched.energyImpact === '회복' ? '🌿' : enriched.energyImpact === '소모' ? '🔥' : '⚖️';
        contextLines =
          `\n\n📋 다이어리 기록: ${enriched.totalCount}건 (최근 30일 ${enriched.recentCount30d}건)` +
          (statusObj ? `\n🔮 현재 관계 흐름: ${statusObj}` : '') +
          `\n${energyEmoji} 에너지 영향: ${enriched.energyImpact}` +
          (enriched.frequentKeywords.length > 0 ? `\n🏷️ 자주 등장하는 키워드: ${enriched.frequentKeywords.join(', ')}` : '');
      }

      setChatMessages([
        { id: Date.now(), sender: 'ai', text: `안녕하세요, 저는 사주 상담가 하니에요.\n${node.name}님과의 궁합 데이터를 확인했어요.${contextLines}\n\n오늘은 어떤 주제가 가장 궁금하세요?` }
      ]);
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

  // --- 크로스탭 콜백: 관계맵 → 채팅 ---
  const handleStartChatWithNode = (node) => {
    const action = { type: 'node', data: node };
    const hasConversation = chatMessages.length > 1 || (chatMessages.length === 1 && !chatMessages[0].isWelcome);
    if (hasConversation) {
      setPendingChatAction(action);
    } else {
      executeChatSwitch(action);
    }
  };

  // --- 크로스탭 콜백: 그룹룸 → 관계맵 저장 ---
  const handleSaveRoomToMap = ({ name, category, participantIds }) => {
    const slot = GROUP_SLOTS[groupSlotIndex % GROUP_SLOTS.length];
    const newGroupId = `g_room_${Date.now()}`;
    const newGroup = {
      id: newGroupId, name, category,
      color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
      cx: slot.cx, cy: slot.cy
    };

    setGroupSlotIndex(p => p + 1);
    setGroups(prev => [...prev, newGroup]);
    setNodes(prev => prev.map(n => {
      if (participantIds.includes(n.id)) return { ...n, groups: [...n.groups, newGroupId], status: 'checked' };
      return n;
    }));
  };

  // --- 크로스탭 콜백: 그룹룸 → 관계맵 보기 ---
  const handleViewMap = () => {
    setActiveTab('map');
  };

  // --- 크로스탭 콜백: 관계맵 → 그룹룸 열기 ---
  const handleOpenRoom = () => {
    setActiveTab('room');
  };

  // --- 크로스탭 콜백: Pending 노드 확인 전환 ---
  const handleConfirmPendingNode = (nodeId, sajuData) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== nodeId) return n;
      const score = 50 + Math.floor(Math.random() * 45);
      const roles = ['연결자', '완충자', '추진자', '관찰자', '참여자'];
      const summaries = [
        '서로 다른 강점이 조화를 이루는 관계입니다.',
        '편안한 소통이 가능하고 신뢰가 쌓이기 좋은 궁합입니다.',
        '에너지 방향이 비슷해 함께 하면 시너지가 생깁니다.',
        '서로 부족한 부분을 채워줄 수 있는 보완적 관계입니다.'
      ];
      return {
        ...n,
        status: 'checked',
        score,
        groups: ['g1'],
        roleLabel: roles[Math.floor(Math.random() * roles.length)],
        summary: summaries[Math.floor(Math.random() * summaries.length)],
        detailSummary: `${n.name}님의 사주를 분석한 결과, ${summaries[Math.floor(Math.random() * summaries.length)]} 주기적으로 소통하면 관계가 더 깊어질 수 있습니다.`,
        tags: ['새로운 인연', '확인 완료'],
        isDetailUnlocked: false,
        isMatchable: true,
        badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]',
        sajuData
      };
    }));
    showToast(`${nodes.find(n => n.id === nodeId)?.name}님의 궁합 분석이 완료되었어요!`);
  };

  // --- 포인트 탭 (간단) ---
  const renderPointTab = () => (
    <div className="flex flex-col h-full bg-[#F7F5FA] pb-[72px] overflow-y-auto animate-fade-in">
      <div className="bg-[#5E4078] px-4 pt-2 pb-6 relative rounded-b-[2rem]">
        <div className="bg-white/10 p-1 rounded-xl flex">
          <button className="flex-1 bg-white text-[#5E4078] font-bold py-2.5 rounded-lg text-sm shadow-sm">출석체크</button>
          <button className="flex-1 text-white/80 font-medium py-2.5 rounded-lg text-sm">충전/사용내역</button>
        </div>
      </div>
    </div>
  );

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
          {activeTab === 'chat' && (
            <ChatTab
              chatMessages={chatMessages}
              setChatMessages={setChatMessages}
              chatContextNode={chatContextNode}
              showToast={showToast}
              handleDeduct={handleDeduct}
              nodes={nodes}
              setNodes={setNodes}
            />
          )}

          {activeTab === 'room' && (
            <GroupRoom
              showToast={showToast}
              onSaveToMap={handleSaveRoomToMap}
              onViewMap={handleViewMap}
            />
          )}

          {activeTab === 'map' && (
            <RelationMap
              nodes={nodes}
              setNodes={setNodes}
              groups={groups}
              edges={edges}
              showToast={showToast}
              handleDeduct={handleDeduct}
              onStartChatWithNode={handleStartChatWithNode}
              onOpenRoom={handleOpenRoom}
              onConfirmPending={handleConfirmPendingNode}
              nodeEnrichedData={nodeEnrichedData}
              diaryEvents={diaryEvents}
              groupEnrichedData={groupEnrichedData}
            />
          )}

          {activeTab === 'diary' && (
            <DiaryTab
              diaryEvents={diaryEvents}
              setDiaryEvents={setDiaryEvents}
              showToast={showToast}
              onStartDiaryChat={handleStartDiaryChat}
              relatedNodes={nodes.filter(n => n.status === 'checked')}
            />
          )}

          {activeTab === 'points' && renderPointTab()}

          {activeTab === 'more' && (
            <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-400 font-bold">서비스 준비 중입니다</div>
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
                <p className="text-sm text-gray-500">기존 AI 대화 내용이 초기화됩니다.<br />새로운 주제로 채팅을 시작할까요?</p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setPendingChatAction(null)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">취소</button>
                <button onClick={() => executeChatSwitch(pendingChatAction)} className="flex-1 bg-[#5E4078] text-white font-bold py-3.5 rounded-xl hover:bg-[#4A306D] transition">시작하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
