import React, { useState, useRef } from 'react';
import {
  Users, Search, ChevronRight, ChevronLeft, HelpCircle,
  ArrowUpDown, Coins, MessageSquare, Sparkles, Tag, Lock, X, Shield,
  BookOpen, BarChart3, Lightbulb, Heart, EyeOff, Eye, Trash2, AlertTriangle
} from 'lucide-react';
import MapCanvas from '../components/MapCanvas';
import {
  RELATIONSHIP_STATUSES, PRIVATE_LABEL_OPTIONS,
  GROUP_MOODS, MY_ROLES, STATUS_STYLES, LABEL_STYLES,
  MOOD_LABELS, getRecommendedActions
} from '../data/relationUtils';

const SORT_LABELS = {
  recent: '최근 추가순', scoreDesc: '궁합 높은순', scoreAsc: '궁합 낮은순', name: '이름순'
};

export default function RelationMap({
  nodes, setNodes, groups, edges,
  showToast, handleDeduct,
  onStartChatWithNode, onOpenRoom, onConfirmPending,
  nodeEnrichedData = {}, diaryEvents = [], groupEnrichedData = {}
}) {
  const [mapStep, setMapStep] = useState('main');
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState('recent');
  const [activeGroupIds, setActiveGroupIds] = useState(groups.map(g => g.id));
  const [statusFilters] = useState(['checked']);
  const [specialFilter, setSpecialFilter] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);
  const [showHiddenNodes, setShowHiddenNodes] = useState(false);
  const [showNodeDeleteConfirm, setShowNodeDeleteConfirm] = useState(false);
  const mapRef = useRef(null);

  // 그룹 추가 시 activeGroupIds 동기화
  React.useEffect(() => {
    setActiveGroupIds(groups.map(g => g.id));
  }, [groups]);

  const cycleSortMode = () => {
    const modes = ['recent', 'scoreDesc', 'scoreAsc', 'name'];
    setSortMode(modes[(modes.indexOf(sortMode) + 1) % modes.length]);
  };

  const getSortedFilteredNodes = () => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = nodes.filter(node => {
      if (node.isDeleted) return false;
      if (node.isHidden && !showHiddenNodes) return false;
      if (!statusFilters.includes(node.status)) return false;
      if (node.status === 'checked' && !node.groups.some(g => activeGroupIds.includes(g))) return false;
      if (specialFilter === 'detailAvailable' && (node.status !== 'checked' || node.isDetailUnlocked)) return false;
      if (specialFilter === 'matchRecommended' && !node.isMatchable) return false;
      if (q) {
        const groupNames = node.groups.map(gId => groups.find(g => g.id === gId)?.name || '').join(' ').toLowerCase();
        return node.name.toLowerCase().includes(q) || groupNames.includes(q) || (node.roleLabel || '').toLowerCase().includes(q) || (node.summary || '').toLowerCase().includes(q);
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sortMode === 'scoreDesc') return (b.score === '?' ? -1 : b.score) - (a.score === '?' ? -1 : a.score);
      if (sortMode === 'scoreAsc') return (a.score === '?' ? 999 : a.score) - (b.score === '?' ? 999 : b.score);
      if (sortMode === 'name') return a.name.localeCompare(b.name);
      return parseInt(b.id.replace(/[^\d]/g, '')) - parseInt(a.id.replace(/[^\d]/g, ''));
    });
  };

  const handleUnlockDetail = () => {
    if (selectedNode.isDetailUnlocked) return;
    setShowUnlockConfirm(true);
  };

  const confirmUnlock = () => {
    setShowUnlockConfirm(false);
    handleDeduct(300, 'hani', () => {
      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, isDetailUnlocked: true } : n));
      setSelectedNode(prev => ({ ...prev, isDetailUnlocked: true }));
      showToast('정밀 해설이 해금되었습니다!');
    });
  };

  const handleStartChat = () => {
    onStartChatWithNode(selectedNode);
  };

  // === RENDER: main ===
  if (mapStep === 'main') {
    return (
      <>
        {/* 그룹 궁합 배너 */}
        <div className="mx-4 mt-4 mb-2 relative cursor-pointer group" onClick={onOpenRoom}>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-[#6B4E90] rounded-2xl blur opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-[#6B4E90] to-[#4A306D] rounded-2xl p-4 text-white shadow-lg overflow-hidden border border-white/10">
            <div className="flex justify-between items-center relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-inner">
                  <Users className="w-6 h-6 text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]" />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-[#4A306D] text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">HOT</span>
                    <h3 className="font-extrabold text-base tracking-tight">다자간 그룹 궁합</h3>
                  </div>
                  <p className="text-[11px] text-purple-100 font-medium">우리 모임의 진짜 분위기와 내 역할은?</p>
                </div>
              </div>
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:bg-white/20 transition-colors">
                <ChevronRight className="w-5 h-5 text-white drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* 검색 + 뷰 토글 */}
        <div className="bg-white px-4 pb-3 shadow-sm z-20 flex flex-col gap-3 pt-2">
          <div className="flex gap-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="이름, 모임명 검색..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#5E4078]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={() => { setViewMode(p => p === 'map' ? 'list' : 'map'); setSpecialFilter(null); }} className="bg-[#F0EBF5] p-2 rounded-xl text-[#5E4078] font-bold text-xs flex items-center justify-center min-w-[55px]">
              {viewMode === 'map' ? '리스트' : '맵 뷰'}
            </button>
          </div>
          {/* 그룹 필터 칩 */}
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setActiveGroupIds(groups.map(g => g.id))}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${activeGroupIds.length === groups.length ? 'bg-[#5E4078] text-white border-[#5E4078]' : 'bg-white text-gray-500 border-gray-200'}`}
            >전체</button>
            {groups.map(g => {
              const isActive = activeGroupIds.includes(g.id);
              const gMood = groupEnrichedData[g.id];
              const moodEmoji = gMood ? (GROUP_MOODS.find(m => m.key === gMood.mood)?.emoji || '') : '';
              return (
                <button
                  key={g.id}
                  onClick={() => {
                    if (isActive && activeGroupIds.length === 1) return;
                    setActiveGroupIds(prev =>
                      isActive ? prev.filter(id => id !== g.id) : [...prev, g.id]
                    );
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-colors ${isActive ? 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]' : 'bg-white text-gray-400 border-gray-200'}`}
                >{moodEmoji && <span className="mr-0.5">{moodEmoji}</span>}{g.name}</button>
              );
            })}
          </div>
        </div>

        {viewMode === 'map' ? (
          <>
          {/* 상태 요약 카드 (맵 위 오버레이) */}
          {(() => {
            const statusCounts = { comfortable: 0, tension: 0, longing: 0, distance: 0, recovery: 0, fatigue: 0 };
            let mostRecorded = null;
            let maxCount = 0;
            Object.entries(nodeEnrichedData).forEach(([, data]) => {
              if (data.relationshipStatus) statusCounts[data.relationshipStatus]++;
              if (data.totalCount > maxCount) {
                maxCount = data.totalCount;
                const node = nodes.find(n => n.id === Object.keys(nodeEnrichedData).find(k => nodeEnrichedData[k] === data));
                if (node) mostRecorded = node.name;
              }
            });
            // 가장 많이 기록된 사람 다시 계산
            let topName = null; let topCnt = 0;
            nodes.filter(n => n.status === 'checked').forEach(n => {
              const d = nodeEnrichedData[n.id];
              if (d && d.totalCount > topCnt) { topCnt = d.totalCount; topName = n.name; }
            });
            const comfortable = statusCounts.comfortable + statusCounts.recovery;
            const tense = statusCounts.tension + statusCounts.fatigue;
            if (comfortable === 0 && tense === 0 && !topName) return null;
            return (
              <div className="mx-4 mt-2 mb-1 bg-white/95 backdrop-blur-sm rounded-xl px-3.5 py-2 border border-[#EBE5F2] shadow-sm flex items-center gap-2 flex-wrap text-[10px] font-bold z-10 relative">
                {comfortable > 0 && <span className="text-emerald-600">🌿 편안 {comfortable}</span>}
                {tense > 0 && <span className="text-amber-600">⚡ 예민 {tense}</span>}
                {(statusCounts.longing + statusCounts.distance) > 0 && <span className="text-gray-500">🌫️ 거리감 {statusCounts.longing + statusCounts.distance}</span>}
                {topName && topCnt > 0 && <span className="text-[#5E4078] ml-auto">최근 기록: {topName}</span>}
              </div>
            );
          })()}
          <MapCanvas
            nodes={nodes} groups={groups} edges={edges}
            activeGroupIds={activeGroupIds} statusFilters={statusFilters}
            specialFilter={specialFilter} searchQuery={searchQuery}
            zoomLevel={zoomLevel} setZoomLevel={setZoomLevel}
            focusedNodeId={focusedNodeId} setFocusedNodeId={setFocusedNodeId}
            onNodeClick={(node) => { setSelectedNode(node); setMapStep('detail'); }}
            onMeClick={() => setShowMyProfile(true)}
            mapRef={mapRef} setShowOnboarding={setShowOnboarding}
            nodeEnrichedData={nodeEnrichedData}
            groupEnrichedData={groupEnrichedData}
          />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto bg-white pb-10">
            {/* 그룹 컨디션 카드 (단일 그룹 선택 시) */}
            {(() => {
              const singleGroup = activeGroupIds.length === 1 && activeGroupIds[0] !== 'all'
                ? groups.find(g => g.id === activeGroupIds[0])
                : null;
              const gData = singleGroup ? groupEnrichedData[singleGroup.id] : null;
              if (!singleGroup || !gData) return null;
              const moodObj = GROUP_MOODS.find(m => m.key === gData.mood);
              const roleObj = MY_ROLES.find(r => r.key === gData.myRole);
              return (
                <div className="mx-4 mt-3 mb-1 bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2] animate-fade-in">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-[#5E4078]" />
                    <p className="text-xs font-bold text-[#5E4078]">{singleGroup.name} 컨디션</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2.5">
                    <div className="bg-[#FAF7FD] rounded-xl p-2.5 border border-[#EFE7F7] text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">분위기</p>
                      <p className="text-sm font-bold text-gray-800">{moodObj?.emoji} {moodObj?.label || '분석 중'}</p>
                    </div>
                    <div className="bg-[#FAF7FD] rounded-xl p-2.5 border border-[#EFE7F7] text-center">
                      <p className="text-[10px] text-gray-400 mb-0.5">내 역할</p>
                      <p className="text-sm font-bold text-gray-800">{roleObj?.emoji} {roleObj?.label || '관찰자'}</p>
                    </div>
                  </div>
                  {gData.attentionPerson && (
                    <div className="bg-rose-50 rounded-xl p-2.5 border border-rose-100 mb-2">
                      <p className="text-[11px] text-rose-600 font-bold">⚠️ 주목 인물: {gData.attentionPerson}</p>
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500">{gData.recentIssueSummary}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div className="bg-[#5E4078] h-1.5 rounded-full transition-all" style={{ width: `${gData.stabilityScore || 50}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-[#5E4078]">안정도 {gData.stabilityScore || 50}%</span>
                  </div>
                </div>
              );
            })()}

            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 font-medium">이름 및 요약</span>
                <button onClick={() => setShowHiddenNodes(p => !p)}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${showHiddenNodes ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}
                >
                  {showHiddenNodes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {showHiddenNodes ? '숨김 표시 중' : '숨긴 인물'}
                </button>
              </div>
              <button onClick={cycleSortMode} className="flex items-center gap-1 text-xs font-bold text-[#5E4078] bg-[#F0EBF5] px-2 py-1.5 rounded-lg border border-[#D1C5E0] shadow-sm">
                {SORT_LABELS[sortMode]} <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {getSortedFilteredNodes().length === 0 && (
                <div className="text-center py-16">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-gray-400 mb-1">표시할 인물이 없어요</p>
                  <p className="text-xs text-gray-300">검색어나 필터를 변경해보세요</p>
                </div>
              )}
              {getSortedFilteredNodes().map((node) => {
                const enriched = nodeEnrichedData[node.id];
                const statusKey = enriched?.relationshipStatus;
                const statusObj = statusKey ? RELATIONSHIP_STATUSES.find(s => s.key === statusKey) : null;
                const statusStyle = statusKey ? STATUS_STYLES[statusKey] : null;
                const energyImpact = enriched?.energyImpact;
                const activeLabels = (node.privateLabels || []).map(k => PRIVATE_LABEL_OPTIONS.find(l => l.key === k)).filter(Boolean);
                return (
                  <div key={node.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer relative" onClick={() => { setSelectedNode(node); setMapStep('detail'); }}>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border border-white shadow-sm ${node.badge}`}>
                          {node.name.charAt(0)}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm flex items-center gap-1 flex-wrap">
                          {node.name}
                          <span className="font-normal text-gray-400 text-xs ml-1">{node.roleLabel || ''}</span>
                          {node.isDetailUnlocked && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full font-bold border border-emerald-100">해금</span>}
                        </p>
                        {(
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {statusObj && statusStyle && (
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                                {statusObj.emoji} {statusObj.label}
                              </span>
                            )}
                            {enriched && enriched.totalCount > 0 && (
                              <span className="text-[9px] text-gray-400 font-medium">기록 {enriched.totalCount}건</span>
                            )}
                            {energyImpact && energyImpact !== '중립' && (
                              <span className={`text-[9px] font-bold ${energyImpact === '회복' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {energyImpact === '회복' ? '🌿회복' : '🔥소모'}
                              </span>
                            )}
                            {activeLabels.map(l => (
                              <span key={l.key} className={`text-[8px] font-bold px-1 py-0.5 rounded ${LABEL_STYLES[l.color]?.bg || 'bg-gray-50'} ${LABEL_STYLES[l.color]?.text || 'text-gray-500'}`}>
                                {l.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-sm font-extrabold ${node.score === '?' ? 'text-gray-300' : 'text-[#5E4078]'}`}>
                        {node.score === '?' ? '?' : node.score + '점'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 맵 보는 법 온보딩 오버레이 */}
        {showOnboarding && (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-end animate-fade-in" onClick={() => setShowOnboarding(false)}>
            <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[85%] overflow-y-auto animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-900">관계맵 보는 법</h3>
                <button onClick={() => setShowOnboarding(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-5">
                {/* 1. 클러스터 구조 설명 */}
                <div className="bg-[#FAF7FD] rounded-2xl p-4 border border-[#EFE7F7]">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#5E4078] rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm shadow-sm">나</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 mb-1">내가 중심인 관계 지도</p>
                      <p className="text-[12px] text-gray-500 leading-relaxed">화면 가운데 <strong className="text-[#5E4078]">'나'</strong>를 중심으로, 각 모임이 주변에 클러스터로 배치됩니다. 한눈에 내 관계 전체를 볼 수 있어요.</p>
                    </div>
                  </div>
                </div>

                {/* 2. 노드 상태 */}
                <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2]">
                  <p className="text-sm font-bold text-gray-800 mb-3">인물 노드 상태</p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="absolute -inset-0.5 rounded-full border-2 border-emerald-400" />
                        <div className="w-10 h-10 rounded-full bg-[#E3D9F0] border-2 border-[#C3AEE0] flex items-center justify-center text-[#5E4078] font-bold text-sm">김</div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">분석 완료 + 관계 상태</p>
                        <p className="text-[11px] text-gray-400">테두리 색으로 편안/긴장/거리감 등 상태를 표시</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#E3D9F0] border-2 border-[#C3AEE0] ring-2 ring-yellow-300 flex items-center justify-center text-[#5E4078] font-bold text-sm shrink-0 shadow-[0_0_8px_rgba(253,224,71,0.3)]">조</div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">정밀 해설 해금됨</p>
                        <p className="text-[11px] text-gray-400">골드 테두리가 빛나며, 상세 해설 확인 가능</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 조작법 */}
                <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2]">
                  <p className="text-sm font-bold text-gray-800 mb-3">조작 방법</p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3">
                      <span className="bg-[#F0EBF5] text-[#5E4078] text-[10px] font-extrabold px-2 py-1 rounded-lg shrink-0 border border-[#E5DDF0]">인물 탭</span>
                      <p className="text-[12px] text-gray-600 leading-relaxed">한 번 탭하면 하단에 <strong>프리뷰</strong>가 나타나요. <strong>'상세 보기'</strong>를 눌러 상세 페이지로 이동할 수 있어요.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-[#F0EBF5] text-[#5E4078] text-[10px] font-extrabold px-2 py-1 rounded-lg shrink-0 border border-[#E5DDF0]">그룹 탭</span>
                      <p className="text-[12px] text-gray-600 leading-relaxed">모임 영역을 탭하면 해당 <strong>그룹만 확대</strong>되어 모든 멤버를 볼 수 있어요.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-[#F0EBF5] text-[#5E4078] text-[10px] font-extrabold px-2 py-1 rounded-lg shrink-0 border border-[#E5DDF0]">빈 공간 탭</span>
                      <p className="text-[12px] text-gray-600 leading-relaxed">포커스를 해제하고 <strong>전체 보기</strong>로 돌아갑니다.</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="bg-[#F0EBF5] text-[#5E4078] text-[10px] font-extrabold px-2 py-1 rounded-lg shrink-0 border border-[#E5DDF0]">하단 버튼</span>
                      <p className="text-[12px] text-gray-600 leading-relaxed">좌측 <strong>전체 맞춤/내 위치</strong> 버튼으로 빠르게 이동, 우측으로 <strong>확대/축소</strong>할 수 있어요.</p>
                    </div>
                  </div>
                </div>

                {/* 4. 모임 영역 */}
                <div className="bg-white rounded-2xl p-4 border border-[#EBE5F2]">
                  <p className="text-sm font-bold text-gray-800 mb-3">모임 영역</p>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-[#D1C5E0] bg-[#F0EBF5]/40 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-[#5E4078] opacity-50" />
                    </div>
                    <p className="text-[12px] text-gray-600 leading-relaxed">원은 <strong>모임(그룹)</strong>을 나타냅니다. 그룹당 주요 인물만 먼저 보이고, <strong>+N명</strong>을 탭하면 전체 멤버로 확장돼요.</p>
                  </div>
                </div>

                <button onClick={() => setShowOnboarding(false)} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#4A306D] transition">
                  확인했어요
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // === RENDER: detail ===
  if (mapStep === 'detail' && selectedNode) {
    const nodeGroups = (selectedNode.groups || [])
      .map(gId => groups.find(g => g.id === gId))
      .filter(Boolean);

    return (
      <div className="h-full flex flex-col animate-fade-in bg-gray-50 pb-24 overflow-y-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center px-4 sticky top-0 bg-gray-50 py-3 z-10">
          <button onClick={() => setMapStep('main')} className="text-gray-500 text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> 뒤로</button>
        </div>

        <div className="px-4 space-y-3">
          {/* 프로필 카드 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center font-bold text-2xl border-2 ${selectedNode.badge}`}>
              {selectedNode.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedNode.name}</h2>
            <span className="inline-block bg-[#F0EBF5] text-[#5E4078] text-xs font-bold px-3 py-1 rounded-full border border-[#E5DDF0] mb-3">
              {selectedNode.roleLabel || '역할 미정'}
            </span>
            <p className="text-[#5E4078] font-extrabold text-2xl mb-1">어울림 {selectedNode.score}점</p>
          </div>

          {/* 소속 그룹 */}
          {nodeGroups.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
              <div className="flex items-center gap-2 mb-2.5">
                <Users className="w-4 h-4 text-[#5E4078]" />
                <p className="text-xs font-bold text-[#5E4078]">소속 모임</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {nodeGroups.map(g => (
                  <span key={g.id} className="px-3 py-1.5 rounded-full bg-[#F0EBF5] text-[#5E4078] text-[11px] font-bold border border-[#E5DDF0]">
                    {g.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 기본 궁합 요약 (checked 상태만) */}
          {(
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="w-4 h-4 text-[#5E4078]" />
                <p className="text-xs font-bold text-[#5E4078]">궁합 요약</p>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">{selectedNode.summary}</p>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-bold border border-purple-100">
                      <Tag className="w-2.5 h-2.5 inline mr-0.5" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 프라이빗 라벨 */}
          {(
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
              <div className="flex items-center gap-2 mb-2.5">
                <Heart className="w-4 h-4 text-[#5E4078]" />
                <p className="text-xs font-bold text-[#5E4078]">프라이빗 라벨</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRIVATE_LABEL_OPTIONS.map(opt => {
                  const isActive = (selectedNode.privateLabels || []).includes(opt.key);
                  const style = LABEL_STYLES[opt.color] || {};
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        const updated = isActive
                          ? (selectedNode.privateLabels || []).filter(k => k !== opt.key)
                          : [...(selectedNode.privateLabels || []), opt.key];
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, privateLabels: updated } : n));
                        setSelectedNode(prev => ({ ...prev, privateLabels: updated }));
                      }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                        isActive
                          ? `${style.bg} ${style.text} ${style.border}`
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 인물 관리 (숨기기/잠금/삭제) */}
          {(
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <p className="text-xs font-bold text-gray-600">인물 관리</p>
              </div>
              <div className="space-y-2">
                {/* 숨기기 토글 */}
                <button
                  onClick={() => {
                    const updated = !selectedNode.isHidden;
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, isHidden: updated } : n));
                    setSelectedNode(prev => ({ ...prev, isHidden: updated }));
                    showToast(updated ? '인물이 숨겨졌어요. 숨긴 인물 보기로 확인할 수 있어요.' : '인물 숨기기가 해제되었어요.');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${selectedNode.isHidden ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                >
                  <EyeOff className={`w-4 h-4 ${selectedNode.isHidden ? 'text-amber-600' : 'text-gray-400'}`} />
                  <span className={`text-[11px] font-bold ${selectedNode.isHidden ? 'text-amber-700' : 'text-gray-600'}`}>
                    {selectedNode.isHidden ? '숨김 해제하기' : '이 인물 숨기기'}
                  </span>
                </button>
                {/* 잠금 토글 */}
                <button
                  onClick={() => {
                    const updated = !selectedNode.isLocked;
                    setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, isLocked: updated } : n));
                    setSelectedNode(prev => ({ ...prev, isLocked: updated }));
                    showToast(updated ? '인물 정보가 잠금 처리되었어요.' : '인물 잠금이 해제되었어요.');
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${selectedNode.isLocked ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
                >
                  <Lock className={`w-4 h-4 ${selectedNode.isLocked ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`text-[11px] font-bold ${selectedNode.isLocked ? 'text-purple-700' : 'text-gray-600'}`}>
                    {selectedNode.isLocked ? '잠금 해제하기' : '이 인물 잠그기'}
                  </span>
                </button>
                {/* 삭제 버튼 */}
                <button
                  onClick={() => setShowNodeDeleteConfirm(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-600">이 인물 삭제하기</span>
                </button>
              </div>
            </div>
          )}

          {/* 최근 기록 타임라인 */}
          {(() => {
            const nodeEvents = diaryEvents
              .filter(ev => (ev.relatedPeople || []).some(p => p.id === selectedNode.id))
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5);
            if (nodeEvents.length === 0) return null;
            return (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-2.5">
                  <BookOpen className="w-4 h-4 text-[#5E4078]" />
                  <p className="text-xs font-bold text-[#5E4078]">최근 기록</p>
                  <span className="text-[10px] text-gray-400 ml-auto">{nodeEvents.length}건</span>
                </div>
                <div className="space-y-2">
                  {nodeEvents.map(ev => {
                    const moodObj = ev.moodLabel ? MOOD_LABELS.find(m => m.label === ev.moodLabel) : null;
                    return (
                      <div key={ev.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-400 font-medium">{ev.date}</span>
                          {ev.emotion && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              ev.emotion === '긍정' ? 'bg-emerald-50 text-emerald-600' :
                              ev.emotion === '부정' ? 'bg-rose-50 text-rose-600' :
                              'bg-gray-100 text-gray-500'
                            }`}>{ev.emotion}</span>
                          )}
                        </div>
                        {moodObj && (
                          <p className="text-xs font-bold text-gray-700 mb-0.5">{moodObj.emoji} {moodObj.label}</p>
                        )}
                        <p className="text-[11px] text-gray-500 line-clamp-2">{ev.memo || ev.title || ev.eventType || ''}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* 감정 분포 */}
          {(() => {
            const enriched = nodeEnrichedData[selectedNode.id];
            if (!enriched || enriched.totalCount === 0) return null;
            const { positive, neutral, negative, totalCount } = enriched;
            const pct = (v) => totalCount > 0 ? Math.round((v / totalCount) * 100) : 0;
            return (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[#5E4078]" />
                  <p className="text-xs font-bold text-[#5E4078]">감정 분포</p>
                  <span className="text-[10px] text-gray-400 ml-auto">총 {totalCount}건</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-600 w-8">긍정</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className="bg-emerald-400 h-2.5 rounded-full transition-all" style={{ width: `${pct(positive)}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-12 text-right">{positive}건 ({pct(positive)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500 w-8">중립</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className="bg-gray-400 h-2.5 rounded-full transition-all" style={{ width: `${pct(neutral)}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-12 text-right">{neutral}건 ({pct(neutral)}%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-rose-600 w-8">부정</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                      <div className="bg-rose-400 h-2.5 rounded-full transition-all" style={{ width: `${pct(negative)}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-12 text-right">{negative}건 ({pct(negative)}%)</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 추천 액션 */}
          {(() => {
            const actions = getRecommendedActions(selectedNode.id, diaryEvents);
            if (actions.length === 0) return null;
            return (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-[#5E4078]">추천 액션</p>
                </div>
                <div className="space-y-2">
                  {actions.map((action, i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                      <p className="text-[11px] text-amber-800 font-medium">💡 {action}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* 사주 변경 재분석 경고 */}
          {selectedNode.isDetailUnlocked && selectedNode.sajuDataChangedAt && (
            <div className="bg-amber-50 rounded-2xl p-4 shadow-sm border border-amber-200 animate-fade-in">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-800 mb-1">사주 정보가 변경되었어요</p>
                  <p className="text-[11px] text-amber-600 leading-relaxed mb-3">
                    {selectedNode.name}님의 사주 정보가 수정되었습니다. 기존 분석이 정확하지 않을 수 있어요.
                  </p>
                  <button
                    onClick={() => {
                      handleDeduct(150, 'hani', () => {
                        setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, sajuDataChangedAt: null } : n));
                        setSelectedNode(prev => ({ ...prev, sajuDataChangedAt: null }));
                        showToast('재분석이 완료되었습니다!');
                      });
                    }}
                    className="bg-amber-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 hover:bg-amber-600 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> 재분석하기 <Coins className="w-3.5 h-3.5 text-amber-200" /> 150 HANI (반값)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 정밀 해설 영역 */}
          {selectedNode.isDetailUnlocked && selectedNode.detailReport ? (
            /* ── 해금됨: 카드형 리포트 ── */
            <div className="space-y-3 animate-fade-in">
              {/* 리포트 헤더 */}
              <div className="bg-gradient-to-br from-[#5E4078] to-[#7C3AED] rounded-2xl p-5 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-purple-200" />
                  <p className="text-xs font-bold text-purple-200">정밀 궁합 리포트</p>
                  <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold ml-auto">해금됨</span>
                </div>
                <p className="text-white text-sm font-bold leading-relaxed">{selectedNode.detailReport.headline}</p>
              </div>

              {/* 핵심 축 카드 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4 text-[#5E4078]" />
                  <p className="text-xs font-bold text-[#5E4078]">핵심 궁합 축</p>
                </div>
                <div className="space-y-3">
                  {selectedNode.detailReport.axes.map(axis => (
                    <div key={axis.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-gray-700">{axis.name}</span>
                        <span className="text-[11px] font-extrabold text-[#5E4078]">{axis.score}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                        <div className={`h-2 rounded-full transition-all ${
                          axis.score >= 80 ? 'bg-emerald-400' : axis.score >= 60 ? 'bg-amber-400' : 'bg-rose-400'
                        }`} style={{ width: `${axis.score}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400">{axis.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 사주적 근거 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-[#5E4078]" />
                  <p className="text-xs font-bold text-[#5E4078]">왜 이런 궁합인지</p>
                </div>
                <div className="space-y-2.5">
                  {selectedNode.detailReport.sajuBasis.map((basis, i) => (
                    <div key={i} className="bg-[#FAF7FD] rounded-xl p-3 border border-[#EFE7F7]">
                      <p className="text-[11px] font-bold text-[#5E4078] mb-1">{basis.title}</p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">{basis.easy}</p>
                      <p className="text-[10px] text-gray-400 mt-1.5 pt-1.5 border-t border-[#EFE7F7]">📐 {basis.technical}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 잘 맞는 상황 / 흔들리는 상황 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[11px] font-bold text-emerald-600 mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> 잘 맞는 상황
                    </p>
                    <div className="space-y-1.5">
                      {selectedNode.detailReport.goodSituations.map((s, i) => (
                        <div key={i} className="bg-emerald-50 rounded-lg p-2 border border-emerald-100">
                          <p className="text-[10px] text-emerald-700 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-rose-500 mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" /> 흔들리는 상황
                    </p>
                    <div className="space-y-1.5">
                      {selectedNode.detailReport.badSituations.map((s, i) => (
                        <div key={i} className="bg-rose-50 rounded-lg p-2 border border-rose-100">
                          <p className="text-[10px] text-rose-600 leading-relaxed">{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 갈등 패턴 & 회복 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-[#5E4078]">갈등 패턴과 회복 방식</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '갈등 시작', text: selectedNode.detailReport.conflictPattern.trigger, color: 'bg-amber-50 border-amber-100 text-amber-700' },
                    { label: '커지는 이유', text: selectedNode.detailReport.conflictPattern.escalation, color: 'bg-orange-50 border-orange-100 text-orange-700' },
                    { label: '생기는 오해', text: selectedNode.detailReport.conflictPattern.misconception, color: 'bg-rose-50 border-rose-100 text-rose-600' },
                    { label: '회복 방식', text: selectedNode.detailReport.conflictPattern.recovery, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                  ].map(item => (
                    <div key={item.label} className={`rounded-xl p-2.5 border ${item.color}`}>
                      <p className="text-[9px] font-bold mb-1 opacity-70">{item.label}</p>
                      <p className="text-[10px] leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 관계 유형별 해석 */}
              {selectedNode.detailReport.relationContext && (() => {
                const ctxMap = { friend: '친구', romance: '연애/썸', work: '직장', family: '가족' };
                const ctxEmoji = { friend: '👫', romance: '💕', work: '💼', family: '🏠' };
                return (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-[#5E4078]" />
                      <p className="text-xs font-bold text-[#5E4078]">관계 유형별 해석</p>
                    </div>
                    <div className="space-y-2.5">
                      {Object.entries(selectedNode.detailReport.relationContext).map(([key, tips]) => (
                        <div key={key} className="bg-[#FAF7FD] rounded-xl p-3 border border-[#EFE7F7]">
                          <p className="text-[11px] font-bold text-[#5E4078] mb-1.5">{ctxEmoji[key]} {ctxMap[key]}</p>
                          <div className="space-y-1">
                            {tips.map((tip, i) => (
                              <p key={i} className="text-[10px] text-gray-600 leading-relaxed flex items-start gap-1">
                                <span className="text-[#5E4078] mt-0.5">·</span> {tip}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 실전 행동 가이드 */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-[#5E4078]">실전 행동 가이드</p>
                </div>
                <div className="space-y-2">
                  {selectedNode.detailReport.actionGuide.map((tip, i) => (
                    <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100 flex items-start gap-2">
                      <span className="text-amber-500 text-xs font-extrabold mt-0.5">{i + 1}</span>
                      <p className="text-[11px] text-amber-800 leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 장기 전망 */}
              <div className="bg-gradient-to-br from-[#FAF7FD] to-[#F0EBF5] rounded-2xl p-4 shadow-sm border border-[#EBE5F2]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#5E4078]" />
                  <p className="text-xs font-bold text-[#5E4078]">장기 전망</p>
                </div>
                <p className="text-[11px] text-gray-700 leading-relaxed">{selectedNode.detailReport.longTermOutlook}</p>
              </div>
            </div>
          ) : (
            /* ── 미해금: 티저 + 잠금 ── */
            <div className="space-y-3">
              {/* 정밀 해설 티저 카드 */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#EBE5F2] overflow-hidden">
                <div className="bg-gradient-to-r from-[#5E4078] to-[#7C3AED] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-200" />
                    <p className="text-xs font-bold text-white">정밀 궁합 해설</p>
                  </div>
                  <p className="text-[11px] text-purple-200 mt-1">이 관계의 감정 흐름, 갈등 패턴, 회복 방식까지 더 깊게 볼 수 있어요</p>
                </div>
                <div className="p-4">
                  <p className="text-[11px] font-bold text-gray-500 mb-2.5">해금하면 볼 수 있어요</p>
                  <div className="space-y-2">
                    {[
                      { icon: '📊', text: '핵심 궁합 축 5가지 분석' },
                      { icon: '✅', text: '잘 맞는 상황 · 흔들리는 상황' },
                      { icon: '🔄', text: '갈등 패턴과 회복 방식' },
                      { icon: '👫', text: '친구/연애/직장/가족 맞춤 해석' },
                      { icon: '💡', text: '실전 행동 가이드' },
                    ].map(item => (
                      <div key={item.text} className="flex items-center gap-2.5 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                        <span className="text-sm">{item.icon}</span>
                        <span className="text-[11px] text-gray-600 font-medium">{item.text}</span>
                        <Lock className="w-3 h-3 text-gray-300 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
                {/* 유도 카피 */}
                <div className="px-4 pb-4">
                  <div className="bg-[#FAF7FD] rounded-xl p-3 border border-[#EFE7F7] text-center">
                    <p className="text-[11px] text-[#5E4078] font-bold">좋은 이유보다, 흔들릴 때를 더 정확히 알고 싶다면</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">단순 총평이 아닌 상황별 반응 패턴을 분석해드려요</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="space-y-2.5 pt-1 pb-4">
            {!selectedNode.isDetailUnlocked && (
              <button onClick={handleUnlockDetail} className="w-full bg-[#2D2D2D] text-white py-4 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 hover:bg-black transition">
                정밀 궁합 해설 해금 <Coins className="w-4 h-4 text-yellow-400" /> 300 HANI
              </button>
            )}
            {selectedNode.isDetailUnlocked && (
              <>
                <button onClick={handleStartChat} className="w-full bg-[#5E4078] text-white py-3.5 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 hover:bg-[#4A306D] transition">
                  <MessageSquare className="w-4 h-4" /> AI 하니에게 이 관계 더 물어보기
                </button>
                <button className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-gray-200 transition text-sm">
                  <BookOpen className="w-4 h-4" /> 이 사람과 관련된 기록 보기
                </button>
              </>
            )}
          </div>
        </div>

        {/* 결제 확인 모달 */}
        {showUnlockConfirm && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowUnlockConfirm(false)}>
            <div className="bg-white rounded-3xl p-6 mx-6 w-full max-w-[340px] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#5E4078] to-[#7C3AED] rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">정밀 궁합 리포트 해금</h3>
                <p className="text-sm text-gray-500">{selectedNode.name}님과의 관계를<br />깊이 분석해드릴게요</p>
              </div>
              <div className="space-y-1.5 mb-4">
                {['핵심 궁합 축 5가지', '상황별 해석', '갈등/회복 가이드', '실전 행동 팁'].map(item => (
                  <div key={item} className="flex items-center gap-2 px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5E4078]" />
                    <span className="text-[11px] text-gray-600 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <div className="bg-[#FAF7FD] rounded-xl p-3 border border-[#EFE7F7] mb-5 text-center">
                <p className="text-xs text-gray-500 mb-1">차감 금액</p>
                <p className="text-xl font-extrabold text-[#5E4078] flex items-center justify-center gap-1">
                  <Coins className="w-5 h-5 text-yellow-500" /> 300 HANI
                </p>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setShowUnlockConfirm(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">취소</button>
                <button onClick={confirmUnlock} className="flex-1 bg-[#2D2D2D] text-white font-bold py-3.5 rounded-xl hover:bg-black transition">해금하기</button>
              </div>
            </div>
          </div>
        )}
        {/* 인물 삭제 확인 모달 */}
        {showNodeDeleteConfirm && selectedNode && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in" onClick={() => setShowNodeDeleteConfirm(false)}>
            <div className="bg-white rounded-3xl p-6 mx-6 w-full max-w-[340px] shadow-2xl animate-fade-in-up" onClick={e => e.stopPropagation()}>
              <div className="text-center mb-5">
                <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trash2 className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">인물 삭제</h3>
                <p className="text-sm text-gray-500"><strong>{selectedNode.name}</strong>님을 삭제하시겠어요?</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    삭제해도 이 인물과 관련된 다이어리 기록은 유지됩니다. 관계맵과 그룹룸에서만 제외돼요.
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button onClick={() => setShowNodeDeleteConfirm(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition">취소</button>
                <button onClick={() => {
                  setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, isDeleted: true } : n));
                  setShowNodeDeleteConfirm(false);
                  setMapStep('main');
                  setSelectedNode(null);
                  showToast('인물이 삭제되었어요. 다이어리 기록은 유지됩니다.');
                }} className="flex-1 bg-rose-500 text-white font-bold py-3.5 rounded-xl hover:bg-rose-600 transition">삭제하기</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
