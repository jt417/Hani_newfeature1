import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Users, QrCode, Sparkles, Activity, Link as LinkIcon, AlertTriangle, 
  CheckCircle, ChevronRight, MessageCircle, ShieldAlert,
  Map as MapIcon, UserPlus, HeartHandshake, Lock, Search, Coins,
  Settings, PhoneForwarded, X, Eye, EyeOff, ZoomIn, ZoomOut, Maximize, 
  List, Grid, Filter, ArrowUpDown, HelpCircle, ChevronLeft, Info,
  Share2, Send, CloudSun, Zap, Sun, CloudRain, Flame, Crown, Skull,
  FileText, CalendarDays, Swords, Archive, Check, Camera, MessageSquare, 
  BookOpen, Database, User, ChevronUp, ScanLine, Unlock, UserCheck, Plus
} from 'lucide-react';

// ==========================================
// 더미 데이터 (V3: 상태 및 특성 추가, 고정 레이아웃)
// ==========================================
const FIXED_GROUPS = [
  { id: 'g1', name: 'A프로젝트 TF', category: '직장동료', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', cx: 300, cy: 500 },
  { id: 'g2', name: '주말 러닝크루', category: '동호회', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', cx: 600, cy: 300 },
  { id: 'g3', name: '동네 베프들', category: '친구', color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', cx: 900, cy: 500 },
];

const GROUP_SLOTS = [
  { cx: 220, cy: 220 }, { cx: 980, cy: 220 }, { cx: 320, cy: 430 },
  { cx: 860, cy: 430 }, { cx: 600, cy: 580 }, { cx: 220, cy: 650 }
];

const FIXED_NODES = [
  { id: 'c1', name: '조멀티', groups: ['g1', 'g2'], score: 91, status: 'checked', tags: ['대화 잘 통함', '속도감 좋음'], summary: '추진력과 실행력이 잘 맞는 관계', detailSummary: '서로 판단이 빠르고 행동 전환이 빨라 함께 시너지가 큽니다.', roleLabel: '연결자', isDetailUnlocked: true, isRecent: false, isMatchable: true, badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]', x: 450, y: 400 },
  { id: 'c2', name: '김서하', groups: ['g3'], score: 84, status: 'checked', tags: ['정서적 안정', '오래 가는 관계'], summary: '편안하고 지속성이 높은 관계', detailSummary: '감정 소모가 적고, 시간이 지날수록 편안함이 쌓이는 타입입니다.', roleLabel: '완충자', isDetailUnlocked: true, isRecent: false, isMatchable: true, badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', x: 950, y: 450 },
  { id: 'c3', name: '박준영', groups: ['g1'], score: 65, status: 'checked', tags: ['경쟁심', '긴장감'], summary: '협업은 좋지만 주도권 충돌 가능성 있음', detailSummary: '성과를 낼 때는 좋지만, 책임 범위가 겹치면 긴장감이 높아질 수 있습니다.', roleLabel: '경쟁자', isDetailUnlocked: false, isRecent: false, isMatchable: false, badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]', x: 250, y: 550 },
  { id: 'c4', name: '이민지', groups: ['g1'], score: 78, status: 'checked', tags: ['무난한 업무'], summary: '원만하게 소통하는 직장동료', detailSummary: '서로 선을 지키며 원만한 관계입니다.', roleLabel: '참여자', isDetailUnlocked: false, isRecent: true, isMatchable: true, badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', x: 350, y: 600 },
  { id: 'c5', name: '최현우', groups: ['g2'], score: 88, status: 'checked', tags: ['취미 공유', '활기참'], summary: '함께 운동할 때 즐거운 사이', detailSummary: '공통의 관심사가 있어 빠르게 친해질 수 있습니다.', roleLabel: '분위기메이커', isDetailUnlocked: false, isRecent: false, isMatchable: true, badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', x: 650, y: 250 },
  { id: 'p1', name: '이은진', groups: ['pending'], score: '?', status: 'pending', isRecent: true, badge: 'bg-gray-100 text-gray-400 border-gray-300 border-dashed', x: 250, y: 150 },
  { id: 'p2', name: '한재호', groups: ['pending'], score: '?', status: 'pending', isRecent: false, badge: 'bg-gray-100 text-gray-400 border-gray-300 border-dashed', x: 800, y: 180 },
];

// ==========================================
// 공통 컴포넌트: 맵 캔버스 (Tree Layout)
// ==========================================
const MapCanvas = ({ nodes, groups, edges, activeGroupIds, statusFilters, specialFilter, searchQuery, zoomLevel, setZoomLevel, focusedNodeId, setFocusedNodeId, onNodeClick, onMeClick, mapRef, setShowOnboarding }) => {
  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter(node => {
      if (!statusFilters.includes(node.status)) return false;
      if (node.status === 'checked') {
        const matchesGroup = node.groups.some(g => activeGroupIds.includes(g));
        if (!matchesGroup) return false;
      }
      if (specialFilter === 'pendingOnly' && node.status !== 'pending') return false;
      if (specialFilter === 'detailAvailable' && (node.status !== 'checked' || node.isDetailUnlocked)) return false;
      if (specialFilter === 'matchRecommended' && !node.isMatchable) return false;

      if (q) {
        const groupNames = node.groups.map(gId => groups.find(g => g.id === gId)?.name || '').join(' ').toLowerCase();
        return node.name.toLowerCase().includes(q) || groupNames.includes(q) || (node.roleLabel || '').toLowerCase().includes(q) || (node.summary || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [nodes, groups, activeGroupIds, statusFilters, specialFilter, searchQuery]);

  const isNodeConnected = (nodeId) => {
    if (!focusedNodeId) return true; 
    if (nodeId === focusedNodeId || nodeId === 'me') return true;
    return edges.some(e => (e.source === focusedNodeId && e.target === nodeId) || (e.target === focusedNodeId && e.source === nodeId) || (e.source === 'me' && e.target === nodeId && focusedNodeId === 'me'));
  };

  const isEdgeHighlighted = (edge) => {
    if (!focusedNodeId) return true;
    return edge.source === focusedNodeId || edge.target === focusedNodeId || (focusedNodeId === 'me' && (edge.source === 'me' || edge.target === 'me'));
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-[#F7F5FA]" onClick={() => setFocusedNodeId(null)}>
      <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(#5E4078 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      {focusedNodeId && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-gray-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 animate-fade-in-up border border-gray-700">
          <span className="font-bold text-sm">
            {focusedNodeId === 'me' ? '나' : nodes.find(n => n.id === focusedNodeId)?.name} 중심으로 보는 중
          </span>
          <div className="w-px h-4 bg-gray-600"></div>
          <button onClick={(e) => { e.stopPropagation(); setFocusedNodeId(null); }} className="text-xs text-yellow-300 font-bold flex items-center gap-1 hover:text-yellow-200">
            <X className="w-3.5 h-3.5"/> 전체보기
          </button>
        </div>
      )}

      <div className="absolute top-2 left-2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-xl border border-purple-100 text-[10px] text-gray-600 shadow-sm pointer-events-none flex flex-col items-start gap-1.5">
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#5E4078] border-2 border-white shadow-sm"></div>정밀/일반 완료</div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-gray-200 border-2 border-gray-400 border-dashed opacity-70"></div>미확인</div>
        <button onClick={(e) => { e.stopPropagation(); setShowOnboarding(true); }} className="mt-1 flex items-center gap-1 text-[#5E4078] font-bold bg-purple-50 px-2 py-1 rounded-md pointer-events-auto border border-purple-100">
          <HelpCircle className="w-3 h-3"/> 맵 보는 법
        </button>
      </div>

      <div ref={mapRef} className="w-full h-full overflow-auto relative scrollbar-hide">
        <div style={{ width: '1200px', height: '1200px', transform: `scale(${zoomLevel})`, transformOrigin: '0 0', transition: 'transform 0.2s ease-out' }} className="relative">
          
          <svg width="1200" height="1200" className="absolute inset-0 pointer-events-none z-0">
            <defs>
              <linearGradient id="treeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EBE5F2" />
                <stop offset="100%" stopColor="#D1C5E0" />
              </linearGradient>
            </defs>

            <path d="M 560 1200 Q 580 1050 600 950 Q 620 1050 640 1200 Z" fill="url(#treeGradient)" />

            {groups.map(g => activeGroupIds.includes(g.id) && (
              <g key={`branch-group-${g.id}`}>
                <path d={`M 600 950 C 600 ${g.cy + 150}, ${g.cx} ${g.cy + 200}, ${g.cx} ${g.cy}`} fill="none" stroke="url(#treeGradient)" strokeWidth="24" strokeLinecap="round" />
                <circle cx={g.cx} cy={g.cy} r="160" fill="#F0EBF5" fillOpacity="0.4" stroke="#D1C5E0" strokeWidth="2" strokeDasharray="8 8" />
                <text x={g.cx} y={g.cy - 180} textAnchor="middle" fill="#5E4078" fontSize="14" fontWeight="bold" opacity="0.6" className="tracking-wide">{g.name}</text>
              </g>
            ))}

            {edges.map((edge, i) => {
              const sourceNode = edge.source === 'me' ? { x: 600, y: 950 } : filteredNodes.find(n => n.id === edge.source);
              const targetNode = edge.target === 'me' ? { x: 600, y: 950 } : filteredNodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted = isEdgeHighlighted(edge);
              let strokeColor = edge.type === 'dashed' ? '#D1C5E0' : (edge.type === 'solid' ? '#A994C1' : '#E2D8EE');
              let strokeWidth = edge.type === 'solid' ? (edge.source === 'me' ? 2.5 : 1.5) : 1.5;
              let strokeDasharray = edge.type === 'dashed' ? '6 6' : 'none';
              let opacity = isHighlighted ? 0.9 : 0.15;

              if (edge.source === 'me' || edge.target === 'me') {
                const isTargetMe = edge.target === 'me';
                const start = isTargetMe ? targetNode : sourceNode;
                const end = isTargetMe ? sourceNode : targetNode;
                const diffY = start.y - end.y;
                const d = `M ${start.x} ${start.y} C ${start.x} ${start.y - diffY * 0.4}, ${end.x} ${end.y + diffY * 0.6}, ${end.x} ${end.y}`;
                return <path key={`edge-${i}`} d={d} fill="none" stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} opacity={opacity} style={{ transition: 'opacity 0.3s' }}/>;
              }
              return <line key={`edge-${i}`} x1={sourceNode.x} y1={sourceNode.y} x2={targetNode.x} y2={targetNode.y} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} opacity={opacity} style={{ transition: 'opacity 0.3s' }}/>;
            })}
          </svg>

          {/* '나' 뿌리 노드 */}
          <div 
            onClick={(e) => { e.stopPropagation(); setFocusedNodeId('me'); onMeClick(); }}
            className={`absolute w-[70px] h-[70px] rounded-full bg-[#5E4078] border-[4px] border-white shadow-xl flex flex-col items-center justify-center font-bold text-white z-30 transition-all cursor-pointer ${isNodeConnected('me') ? 'opacity-100 scale-100 hover:scale-105 ring-4 ring-[#D1C5E0]' : 'opacity-30 scale-95'}`} 
            style={{ left: '565px', top: '915px' }}
          >
            <span className="text-lg">나</span>
            <Crown className="w-3 h-3 text-yellow-300 absolute -top-1.5 -right-1.5 drop-shadow-md"/>
          </div>

          {/* 인물 노드 */}
          {filteredNodes.map(node => {
            const isHighlighted = isNodeConnected(node.id);
            const isPending = node.status === 'pending';
            let sizeClass = isPending ? 'w-[44px] h-[44px]' : (node.isDetailUnlocked ? 'w-[56px] h-[56px] ring-4 ring-yellow-300 shadow-[0_0_15px_rgba(253,224,71,0.5)]' : 'w-[48px] h-[48px] ring-2 ring-white shadow-md');
            let colorClass = isPending ? 'bg-gray-50 text-gray-400 border-2 border-gray-300 border-dashed' : node.badge;

            return (
              <div 
                key={node.id} 
                onClick={(e) => { e.stopPropagation(); setFocusedNodeId(node.id); onNodeClick(node); }}
                className={`absolute flex flex-col items-center cursor-pointer transition-all duration-300 z-20
                  ${isHighlighted ? 'scale-100 opacity-100' : 'scale-90 opacity-20 blur-[1px] hover:opacity-100'}
                `} 
                style={{ left: `${node.x - 20}px`, top: `${node.y - 20}px` }}
              >
                <div className="relative">
                  <div className={`rounded-full flex items-center justify-center font-bold text-sm ${sizeClass} ${colorClass}`}>
                    {isPending ? <HelpCircle className="w-5 h-5 opacity-50"/> : node.name.substring(0,1)}
                  </div>
                  {!isPending && node.isDetailUnlocked && (
                    <div className="absolute -top-1 -right-2 bg-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center shadow-sm border border-gray-100 z-10" title="정밀 해설 완료">🔓</div>
                  )}
                  {node.isRecent && (
                    <div className="absolute -top-1 -left-2 bg-pink-500 text-white rounded-full text-[8px] px-1.5 py-0.5 shadow-sm border border-white z-10 font-bold">NEW</div>
                  )}
                </div>
                <div className={`mt-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm border whitespace-nowrap transition-opacity 
                  ${isPending ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-white/95 text-gray-800 border-gray-200'}`}
                >
                  {isPending ? '미확인' : node.name}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* V3: Zoom Controls */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-1.5 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-1 z-30 backdrop-blur-sm">
        <button onClick={(e) => { e.stopPropagation(); setZoomLevel(p => Math.min(p + 0.2, 1.5)); }} className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition"><ZoomIn className="w-5 h-5"/></button>
        <div className="w-full h-px bg-gray-200"></div>
        <button onClick={(e) => { 
          e.stopPropagation(); setZoomLevel(0.8); 
          if(mapRef.current) { mapRef.current.scrollLeft = (1200 * 0.8 - mapRef.current.clientWidth) / 2; mapRef.current.scrollTop = (1200 * 0.8) - mapRef.current.clientHeight - 40; }
        }} className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition"><Maximize className="w-5 h-5"/></button>
        <div className="w-full h-px bg-gray-200"></div>
        <button onClick={(e) => { e.stopPropagation(); setZoomLevel(p => Math.max(p - 0.2, 0.4)); }} className="p-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition"><ZoomOut className="w-5 h-5"/></button>
      </div>
    </div>
  );
};

// ==========================================
// 메인 애플리케이션
// ==========================================
export default function App() {
  const [activeTab, setActiveTab] = useState('diary'); // 기본탭을 다이어리로 설정하여 바로 보여주기 위함 (시연용)
  const [toast, setToast] = useState(null);
  
  const toastTimerRef = useRef(null);
  const showToast = (msg) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); };
  }, []);

  const [haniCoin, setHaniCoin] = useState(1500); 
  const [orb, setOrb] = useState(30); 

  const handleDeduct = (amount, type, onSuccess) => {
    if (type === 'orb') {
      if (orb >= amount) { setOrb(p => p - amount); onSuccess(); } 
      else { showToast("Orb가 부족합니다. 포인트 탭에서 획득해주세요."); }
    } else if (type === 'hani') {
      if (haniCoin >= amount) { setHaniCoin(p => p - amount); onSuccess(); } 
      else { showToast("HANI가 부족합니다. 충전해주세요."); }
    }
  };

  // --- ROOM STATES ---
  const [roomStep, setRoomStep] = useState('landing'); 
  const [roomForm, setRoomForm] = useState({ relationType: '동네 친구', roomName: '', maxMembers: 5 });
  const [participants, setParticipants] = useState([{ id: 'me', name: '나(김하니)', role: 'host', ready: true }]);
  const [joinCode, setJoinCode] = useState('');
  
  // --- MAP STATES ---
  const [mapStep, setMapStep] = useState('main'); 
  const [selectedNode, setSelectedNode] = useState(null);
  const [matchTab, setMatchTab] = useState('map'); 
  const [matchTarget, setMatchTarget] = useState(null);
  const [newPersonForm, setNewPersonForm] = useState({ name: '', relation: '소개팅' });
  const [sortMode, setSortMode] = useState('recent');
  
  const [zoomLevel, setZoomLevel] = useState(0.8);
  const [viewMode, setViewMode] = useState('list'); 
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  const [activeGroupIds, setActiveGroupIds] = useState(['g1', 'g2', 'g3']);
  const [statusFilters, setStatusFilters] = useState(['checked', 'pending']);
  const [specialFilter, setSpecialFilter] = useState(null);
  const [focusedNodeId, setFocusedNodeId] = useState(null);

  const [groups, setGroups] = useState(FIXED_GROUPS);
  const [nodes, setNodes] = useState(FIXED_NODES);
  const [groupSlotIndex, setGroupSlotIndex] = useState(0);

  // --- DIARY STATES (형충합파해 실증 기록 시스템) ---
  const [diaryEvents, setDiaryEvents] = useState([
    {
      id: 1,
      date: '2023-04',
      eventType: '연애/이별',
      title: '연인과 큰 갈등 후 관계 종료',
      memo: '감정 충돌이 누적되다가 결국 관계가 끝남',
      intensity: 5,
      emotion: '부정',
      analyzed: true,
      analysis: {
        triggeredEffects: ['충'],
        targetArea: ['일지'],
        summary: '관계 축에 충 작용이 강하게 들어오며 감정 단절이 현실 사건으로 나타난 흐름입니다.',
        patternTags: ['충민감', '관계변화형']
      }
    },
    {
      id: 2,
      date: '2022-11',
      eventType: '직장 문제',
      title: '이직 고민이 본격화됨',
      memo: '업무 압박과 인간관계 피로가 겹치며 퇴사 생각이 강해짐',
      intensity: 4,
      emotion: '부정',
      analyzed: true,
      analysis: {
        triggeredEffects: ['형', '파'],
        targetArea: ['월지'],
        summary: '형과 파의 작용으로 심리 압박과 실무 흐름의 균열이 함께 드러난 시기입니다.',
        patternTags: ['형압박형', '파현실문제형']
      }
    },
    {
      id: 3,
      date: '2021-06',
      eventType: '시험/합격',
      title: '원하던 자격증 합격',
      memo: '오래 준비한 시험에 드디어 합격해서 자신감이 올라옴',
      intensity: 4,
      emotion: '긍정',
      analyzed: true,
      analysis: {
        triggeredEffects: ['합'],
        targetArea: ['월지'],
        summary: '합의 작용이 집중력과 결과 연결성으로 이어지면서 성과로 발현된 흐름입니다.',
        patternTags: ['합성과형']
      }
    }
  ]);
  const [showDiaryForm, setShowDiaryForm] = useState(false);
  const [diaryForm, setDiaryForm] = useState({
    year: '2024',
    month: '01',
    eventType: '갈등/충돌',
    title: '',
    memo: '',
    intensity: 3,
    emotion: '중립'
  });
  const [isAnalyzingDiary, setIsAnalyzingDiary] = useState(false);

  // --- CHAT STATES ---
  const [chatContextNode, setChatContextNode] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: '안녕하세요, 저는 사주 상담가 하니에요. 오늘은 어떤 주제가 가장 궁금하세요?', isWelcome: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSajuForm, setManualSajuForm] = useState({ name: '', date: '', gender: 'W' });
  const chatScrollRef = useRef(null);

  // MODAL STATES
  const [showSettings, setShowSettings] = useState(false);
  const [showShareTicket, setShowShareTicket] = useState(false);
  const [showTriageReport, setShowTriageReport] = useState(false);
  const [showAnonymousHint, setShowAnonymousHint] = useState(false);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(false);
  const [showGroupMatch, setShowGroupMatch] = useState(false);
  const [groupMatchStep, setGroupMatchStep] = useState('select'); 
  const [targetGroupMatch, setTargetGroupMatch] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGhostModal, setShowGhostModal] = useState(false);
  const [ghostName, setGhostName] = useState('');

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

  useEffect(() => {
    if (activeTab === 'room' && roomStep === 'analyzing') {
      const timer = setTimeout(() => setRoomStep('result_public'), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeTab, roomStep]);

  // --- EVENT HANDLERS ---

  // 다이어리 발현 패턴 요약 계산
  const getDiaryPatternSummary = () => {
    const tags = diaryEvents.flatMap(ev => ev.analysis?.patternTags || []);
    const countMap = {};
    tags.forEach(tag => { countMap[tag] = (countMap[tag] || 0) + 1; });
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([tag]) => tag);
  };

  // 다이어리 → AI 채팅 진입
  const handleStartDiaryChat = (event) => {
    setActiveTab('chat');
    setChatContextNode(null);
    setChatMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text:
          `안녕하세요, 하니에요.\n\n` +
          `${event.date.replace('-', '년 ')}월에 기록하신 "${event.title}" 사건을 기준으로,\n` +
          `당시의 형충합파해 작용과 이 패턴이 앞으로 어떻게 반복될 가능성이 있는지 함께 볼게요.\n\n` +
          `• 사건 유형: ${event.eventType}\n` +
          `• 체감 강도: ${event.intensity}/5\n` +
          `• 감정 결과: ${event.emotion}\n` +
          `• 주요 작용: ${event.analysis?.triggeredEffects?.join(', ') || '-'}\n\n` +
          `궁금한 점이 있으면 편하게 물어봐 주세요.`
      }
    ]);
    showToast('다이어리 기록을 바탕으로 AI 채팅을 시작했어요.');
  };

  const handleSaveDiary = () => {
    if (!diaryForm.title.trim() || !diaryForm.memo.trim()) {
      showToast('사건 제목과 상세 내용을 입력해주세요.');
      return;
    }

    setIsAnalyzingDiary(true);

    setTimeout(() => {
      const effectMap = {
        '갈등/충돌': {
          triggeredEffects: ['충', '형'],
          targetArea: ['일지', '월지'],
          summary: '충과 형 작용이 겹치며 감정 충돌, 압박, 관계 파열이 사건화되기 쉬운 흐름입니다.',
          patternTags: ['충민감', '형압박형']
        },
        '연애/이별': {
          triggeredEffects: ['충', '해'],
          targetArea: ['일지'],
          summary: '관계 축의 충과 해 작용으로 정서적 거리감, 이별, 관계 재편이 나타나기 쉬운 흐름입니다.',
          patternTags: ['관계변화형', '해관계소모형']
        },
        '재회/연락': {
          triggeredEffects: ['합'],
          targetArea: ['일지', '시지'],
          summary: '합의 작용으로 끊어진 흐름이 다시 이어지거나 관계가 재접속되는 형태로 발현될 수 있습니다.',
          patternTags: ['합재접속형']
        },
        '직장 문제': {
          triggeredEffects: ['형', '파'],
          targetArea: ['월지'],
          summary: '형과 파의 작용으로 실무 스트레스, 조직 내 마찰, 일정 균열이 현실 문제로 나타나기 쉽습니다.',
          patternTags: ['형압박형', '파현실문제형']
        },
        '이동/변동': {
          triggeredEffects: ['충'],
          targetArea: ['월지', '시지'],
          summary: '충의 작용으로 자리 이동, 계획 변경, 생활 리듬 재편이 발생하기 쉬운 시기입니다.',
          patternTags: ['충변동형']
        },
        '건강/사고': {
          triggeredEffects: ['형', '충'],
          targetArea: ['일지', '시지'],
          summary: '형과 충의 압박이 몸과 생활 리듬에 작용하며 건강 이슈나 돌발 사건으로 이어질 수 있습니다.',
          patternTags: ['형신체압박형', '충사건화형']
        },
        '금전/계약': {
          triggeredEffects: ['파', '해'],
          targetArea: ['월지', '일지'],
          summary: '파와 해의 작용으로 계약 균열, 금전 손실, 약속 이탈 같은 형태가 나타나기 쉬운 흐름입니다.',
          patternTags: ['파금전형', '해손실형']
        },
        '시험/합격': {
          triggeredEffects: ['합'],
          targetArea: ['월지'],
          summary: '합의 작용이 집중력과 결과 연결성으로 이어지면 성과/합격으로 발현될 수 있습니다.',
          patternTags: ['합성과형']
        },
        '가족 이슈': {
          triggeredEffects: ['형', '해'],
          targetArea: ['년지', '월지'],
          summary: '가족 축에서 형과 해가 작용하면 정서적 소모, 오해, 거리감이 커질 수 있습니다.',
          patternTags: ['가족압박형', '해정서소모형']
        },
        '심리 변화': {
          triggeredEffects: ['형'],
          targetArea: ['일지'],
          summary: '형의 압박이 내면에 먼저 작동하며 불안, 예민함, 자기압박으로 체감되기 쉬운 흐름입니다.',
          patternTags: ['형내면압박형']
        }
      };

      const picked = effectMap[diaryForm.eventType] || {
        triggeredEffects: ['충'],
        targetArea: ['일지'],
        summary: '해당 시기의 기운이 사건 형태로 강하게 발현된 것으로 보입니다.',
        patternTags: ['사건화형']
      };

      const newEvent = {
        id: Date.now(),
        date: `${diaryForm.year}-${diaryForm.month.padStart(2, '0')}`,
        eventType: diaryForm.eventType,
        title: diaryForm.title,
        memo: diaryForm.memo,
        intensity: diaryForm.intensity,
        emotion: diaryForm.emotion,
        analyzed: true,
        analysis: picked
      };

      setDiaryEvents(prev => [newEvent, ...prev]);
      setIsAnalyzingDiary(false);
      setShowDiaryForm(false);

      setDiaryForm({
        year: '2024',
        month: '01',
        eventType: '갈등/충돌',
        title: '',
        memo: '',
        intensity: 3,
        emotion: '중립'
      });

      showToast('다이어리가 저장되었고, 발현 패턴 분석에 반영되었어요.');
    }, 1800);
  };

  const handleSaveRoomToMap = () => {
    const slot = GROUP_SLOTS[groupSlotIndex % GROUP_SLOTS.length];
    const newGroupId = `g_room_${Date.now()}`;
    const newGroup = {
      id: newGroupId, name: roomForm.roomName || '새로운 모임', category: roomForm.relationType,
      color: 'text-[#5E4078]', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', cx: slot.cx, cy: slot.cy
    };
    
    setGroupSlotIndex(p => p + 1);
    setGroups(prev => [...prev, newGroup]);
    setActiveGroupIds(prev => [...prev, newGroupId]);
    
    const participantIds = participants.map(p => p.id); 
    setNodes(prev => prev.map(n => {
      if (participantIds.includes(n.id)) return { ...n, groups: [...n.groups, newGroupId], status: 'checked' };
      return n;
    }));
    
    setRoomStep('save_complete'); 
  };

  const handleUnlockDetail = () => {
    if (selectedNode.isDetailUnlocked) return;
    handleDeduct(300, 'hani', () => { 
      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, isDetailUnlocked: true } : n));
      setSelectedNode(prev => ({ ...prev, isDetailUnlocked: true }));
      showToast("정밀 해설이 해금되었습니다!");
    });
  };

  const handleMatch = () => { 
    handleDeduct(5, 'orb', () => { 
      setMapStep('match_result'); 
      showToast("매칭 결과를 분석했습니다.");
    }); 
  };

  const handleUnlockPending = () => {
    handleDeduct(10, 'orb', () => { 
      setNodes(prev => prev.map(n => n.id === selectedNode.id ? { ...n, status: 'checked', score: 85, groups: ['g1'], badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]', tags: ["새로운 인연"], summary: "최근 이어진 관계", detailSummary: "서로에게 좋은 영향을 줄 수 있습니다.", roleLabel: "조력자", isDetailUnlocked: false, isRecent: true } : n));
      setSelectedNode(prev => ({ ...prev, status: 'checked', score: 85, groups: ['g1'], badge: 'bg-[#E3D9F0] text-[#5E4078] border-[#C3AEE0]', tags: ["새로운 인연"], summary: "최근 이어진 관계", detailSummary: "서로에게 좋은 영향을 줄 수 있습니다.", roleLabel: "조력자", isDetailUnlocked: false, isRecent: true }));
      showToast("1:1 궁합이 정식으로 해금되었습니다!");
    });
  };

  const handleStartChatWithNode = () => {
    setActiveTab('chat');
    setChatContextNode(selectedNode);
    setChatMessages([
      { id: Date.now(), sender: 'ai', text: `안녕하세요, 저는 사주 상담가 하니에요.\n${selectedNode.name}님과의 궁합 데이터를 확인했어요.\n오늘은 어떤 주제가 가장 궁금하세요?` }
    ]);
  };

  const handleSendChat = (textOrEvent) => {
    let textToSend = chatInput;
    if (typeof textOrEvent === 'string') textToSend = textOrEvent;
    if(!textToSend.trim()) return;
    
    setChatMessages(p => [...p, { id: Date.now(), sender: 'user', text: textToSend }]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setChatMessages(p => [...p, { id: Date.now()+1, sender: 'ai', text: `사주 흐름상 ${chatContextNode?.name || '상대방'}님의 고집이 조금 강해지는 시기라 부딪힘이 있었던 것 같네요. 당분간은 먼저 경청해주고 공감해주는 화법을 써보시는 걸 추천드려요.` }]);
    }, 1500);
  };

  const handleSubmitManualSaju = () => {
    if(!manualSajuForm.name) { showToast("이름을 입력해주세요"); return; }
    handleDeduct(10, 'orb', () => { 
      setShowManualForm(false);
      const newNode = { 
        id: `m_${Date.now()}`, name: manualSajuForm.name, groups: ['g3'], score: 88, status: 'checked', 
        tags: ['수동입력', '새로운 인연'], summary: '직접 입력한 명식', detailSummary: '상세 분석을 위해 추가된 데이터입니다.', roleLabel: '상담대상', badge: 'bg-[#F0EBF5] text-[#5E4078] border-[#D1C5E0]', isDetailUnlocked: true, x: 700, y: 500, isRecent: true 
      };
      setNodes(p => [...p, newNode]);

      setChatMessages(p => [
        ...p, 
        { id: Date.now(), sender: 'user', text: `${manualSajuForm.name}님의 사주 정보를 입력했어. 궁합을 분석해줘.` },
      ]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setChatMessages(p => [...p, { id: Date.now()+1, sender: 'ai', text: `입력해주신 ${manualSajuForm.name}님의 명식을 분석 완료했습니다! 당신과의 궁합 점수는 88점으로 매우 좋은 편이네요.\n이 분과의 관계에서 어떤 점이 가장 궁금하신가요?` }]);
      }, 1500);
    });
  };

  const cycleSortMode = () => {
    const modes = ['recent', 'scoreDesc', 'scoreAsc', 'name'];
    const nextIndex = (modes.indexOf(sortMode) + 1) % modes.length;
    setSortMode(modes[nextIndex]);
  };

  const sortLabelMap = { recent: '최근 추가순', scoreDesc: '궁합 높은순', scoreAsc: '궁합 낮은순', name: '이름순' };

  const getSortedFilteredNodes = () => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = nodes.filter(node => {
      if (!statusFilters.includes(node.status)) return false;
      if (node.status === 'checked' && !node.groups.some(g => activeGroupIds.includes(g))) return false;
      if (specialFilter === 'pendingOnly' && node.status !== 'pending') return false;
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
      else if (sortMode === 'scoreAsc') return (a.score === '?' ? 999 : a.score) - (b.score === '?' ? 999 : b.score);
      else if (sortMode === 'name') return a.name.localeCompare(b.name);
      return parseInt(b.id.replace(/[^\d]/g, '')) - parseInt(a.id.replace(/[^\d]/g, ''));
    });
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    if(tab === 'map') { setMapStep('main'); setSpecialFilter(null); }
  };

  // ==========================================
  // RENDER: DIARY TAB (형충합파해 실증 기록 시스템)
  // ==========================================
  const renderDiaryTab = () => {
    const summaryTags = getDiaryPatternSummary();
    const emotionColors = { '긍정': 'bg-emerald-50 text-emerald-600', '중립': 'bg-gray-100 text-gray-600', '부정': 'bg-rose-50 text-rose-600' };
    const effectEmoji = { '충': '⚡', '형': '🔥', '합': '🤝', '파': '💔', '해': '🌊' };

    return (
      <div className="flex flex-col h-full bg-[#F7F5FA] relative pb-[84px]">
        {/* 상단 배너 */}
        <div className="bg-gradient-to-br from-[#5E4078] to-[#7C5A9B] px-5 py-6 text-white rounded-b-[2rem] shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10">
            <BookOpen className="w-32 h-32 -mr-4 -mt-4" />
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-bold mb-2">사주 다이어리</h2>
            <p className="text-[11px] text-purple-100 leading-relaxed">
              과거 사건을 기록해 두면, HANI가 그 시기의{' '}
              <strong className="text-white">형충합파해(合沖刑破害)</strong>를 대조해
              당신에게 어떤 방식으로 발현되는지 학습합니다.
              <br />
              이 기록은 AI 채팅에서 미래 운기 예측의 정확도를 높이는 데 활용돼요.
            </p>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto mt-1">
          {/* 내 발현 패턴 요약 카드 */}
          <div className="bg-white p-4 rounded-2xl border border-[#EBE5F2] shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#5E4078]" />
              <p className="text-xs font-bold text-[#5E4078]">내 발현 패턴 요약</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {summaryTags.length > 0 ? (
                summaryTags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-full bg-[#F0EBF5] text-[#5E4078] text-[11px] font-bold border border-[#E5DDF0]"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">
                  아직 패턴 데이터가 부족해요. 사건을 더 기록해보세요.
                </span>
              )}
            </div>
            {summaryTags.length > 0 && (
              <p className="text-[10px] text-gray-400 mt-2.5 leading-relaxed">
                기록이 쌓일수록 AI가 당신의 운기 발현 방식을 더 정밀하게 파악할 수 있어요.
              </p>
            )}
          </div>

          {/* 기록 추가 버튼 */}
          <button
            onClick={() => setShowDiaryForm(true)}
            className="w-full bg-white border border-dashed border-[#C9B7DA] text-[#5E4078] font-bold py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors"
          >
            <div className="bg-[#F0EBF5] p-1.5 rounded-full"><Plus className="w-4 h-4" /></div>
            사건 기록 추가하기
          </button>

          {/* 타임라인 리스트 */}
          <div className="space-y-3">
            {diaryEvents.map((ev, idx) => (
              <div
                key={ev.id}
                className="bg-white rounded-2xl p-4 border border-[#EBE5F2] shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* 상단: 날짜 */}
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-extrabold text-[#5E4078]">{ev.date.replace('-', '년 ')}월</p>
                </div>

                {/* 태그 뱃지들 */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-1 rounded-full font-bold border border-purple-100">
                    {ev.eventType}
                  </span>
                  <span className="text-[10px] bg-gray-50 text-gray-600 px-2 py-1 rounded-full font-bold border border-gray-200">
                    체감 {ev.intensity}/5
                  </span>
                  <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${emotionColors[ev.emotion] || 'bg-gray-100 text-gray-600'}`}>
                    {ev.emotion}
                  </span>
                  {ev.analysis?.triggeredEffects?.map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full font-bold border border-yellow-200"
                    >
                      {effectEmoji[tag] || '⚡'} {tag}
                    </span>
                  ))}
                </div>

                {/* 사건 제목 + 메모 */}
                <p className="font-bold text-[#2B1B35] text-sm mb-1">{ev.title}</p>
                <p className="text-[12px] text-gray-500 leading-relaxed mb-3">{ev.memo}</p>

                {/* AI 분석 카드 */}
                {ev.analysis && (
                  <div className="bg-[#FAF7FD] rounded-xl p-3.5 border border-[#EFE7F7] mb-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <p className="text-[11px] font-bold text-[#7C3AED]">AI 발현 분석</p>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-2.5">
                      {ev.analysis.summary}
                    </p>
                    {ev.analysis.targetArea && (
                      <p className="text-[10px] text-gray-400 mb-2">
                        작용 위치: {ev.analysis.targetArea.join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {(ev.analysis.patternTags || []).map(tag => (
                        <span
                          key={tag}
                          className="text-[10px] bg-[#F0EBF5] text-[#5E4078] px-2 py-1 rounded-full font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 이 패턴으로 AI 채팅하기 */}
                <button
                  onClick={() => handleStartDiaryChat(ev)}
                  className="w-full bg-[#F5F1FA] text-[#5E4078] rounded-xl py-2.5 text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#EBE5F2] transition-colors border border-[#E5DDF0]"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  이 패턴으로 AI 채팅하기
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 입력 모달 (바텀시트) */}
        {showDiaryForm && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end animate-fade-in" onClick={() => !isAnalyzingDiary && setShowDiaryForm(false)}>
            <div className="bg-white w-full rounded-t-[2rem] p-5 pb-10 max-h-[85%] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-900">사건 기록</h3>
                <button onClick={() => setShowDiaryForm(false)} className="bg-gray-100 p-2 rounded-full text-gray-500"><X className="w-4 h-4" /></button>
              </div>

              {isAnalyzingDiary ? (
                <div className="py-12 flex flex-col items-center justify-center animate-pulse">
                  <Activity className="w-12 h-12 text-[#5E4078] mb-4" />
                  <p className="font-bold text-gray-800 mb-2">형충합파해 발현 패턴 분석 중...</p>
                  <p className="text-xs text-gray-500">대운, 세운, 월운의 합충형파해 대조 중</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 연도 / 월 */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">발생 연도</label>
                      <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]"
                        value={diaryForm.year}
                        onChange={e => setDiaryForm(prev => ({ ...prev, year: e.target.value }))}
                      >
                        {['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'].map(y => (
                          <option key={y} value={y}>{y}년</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">발생 월</label>
                      <select
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]"
                        value={diaryForm.month}
                        onChange={e => setDiaryForm(prev => ({ ...prev, month: e.target.value }))}
                      >
                        {['01','02','03','04','05','06','07','08','09','10','11','12'].map(m => (
                          <option key={m} value={m}>{m}월</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 사건 유형 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">사건 유형</label>
                    <div className="flex flex-wrap gap-2">
                      {['갈등/충돌', '연애/이별', '재회/연락', '직장 문제', '이동/변동', '건강/사고', '금전/계약', '시험/합격', '가족 이슈', '심리 변화'].map(type => (
                        <button
                          key={type}
                          onClick={() => setDiaryForm(prev => ({ ...prev, eventType: type }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                            diaryForm.eventType === type
                              ? 'bg-[#5E4078] text-white border-[#5E4078]'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 사건 제목 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">사건 제목</label>
                    <input
                      type="text"
                      value={diaryForm.title}
                      onChange={e => setDiaryForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#5E4078]"
                      placeholder="예: 직장 내 큰 마찰, 연인과 이별"
                    />
                  </div>

                  {/* 상세 기록 */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">상세 기록</label>
                    <textarea
                      value={diaryForm.memo}
                      onChange={e => setDiaryForm(prev => ({ ...prev, memo: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078] resize-none h-20"
                      placeholder="당시에 어떤 일이 있었는지, 감정과 결과를 구체적으로 적어주세요."
                    />
                  </div>

                  {/* 체감 강도 / 감정 결과 */}
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">체감 강도</label>
                      <select
                        value={diaryForm.intensity}
                        onChange={e => setDiaryForm(prev => ({ ...prev, intensity: Number(e.target.value) }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]"
                      >
                        <option value={1}>1 - 약함</option>
                        <option value={2}>2</option>
                        <option value={3}>3 - 보통</option>
                        <option value={4}>4</option>
                        <option value={5}>5 - 매우 큼</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-gray-500 mb-1">감정 결과</label>
                      <select
                        value={diaryForm.emotion}
                        onChange={e => setDiaryForm(prev => ({ ...prev, emotion: e.target.value }))}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#5E4078]"
                      >
                        <option>긍정</option>
                        <option>중립</option>
                        <option>부정</option>
                      </select>
                    </div>
                  </div>

                  {/* 저장 버튼 */}
                  <button
                    onClick={handleSaveDiary}
                    disabled={isAnalyzingDiary}
                    className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg mt-1 hover:bg-[#4A306D] transition disabled:opacity-60"
                  >
                    기록 저장하고 분석하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // RENDER: MAP & MULTI-PERSON ROOM
  // ==========================================
  const renderRoom = () => {
    switch (roomStep) {
      case 'landing':
        return (
          <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-fade-in bg-white pb-20">
            <div className="w-24 h-24 bg-[#F7F5FA] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#EBE5F2]">
              <Users className="w-12 h-12 text-[#5E4078]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">그룹 궁합</h2>
            <p className="text-gray-500 text-sm mb-10 leading-relaxed">친구들과 함께 보는 그룹 궁합<br/><strong className="text-purple-600 font-medium">민감한 해석은 각자만 볼 수 있어요</strong></p>
            <button onClick={() => setRoomStep('create')} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg mb-3 hover:bg-[#4A306D] transition">방 만들기</button>
            <div className="flex gap-2 w-full mb-3">
              <button onClick={() => setRoomStep('qr_scan')} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"><ScanLine className="w-5 h-5"/> QR 스캔</button>
              <button onClick={() => setRoomStep('join_input')} className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold py-4 rounded-xl shadow-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"><Users className="w-5 h-5"/> 코드 입력</button>
            </div>
          </div>
        );
      case 'qr_scan':
        return (
          <div className="flex flex-col h-full bg-black relative animate-fade-in">
            <div className="p-6 flex justify-between items-center text-white z-10 relative">
              <button onClick={() => setRoomStep('landing')} className="p-2"><ChevronLeft className="w-6 h-6"/></button>
              <span className="font-bold">QR 스캔</span><div className="w-10"></div>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative pb-20">
              <p className="text-white font-bold mb-8 text-lg">QR 코드를 사각형 안에 맞춰주세요</p>
              <div className="w-64 h-64 border-2 border-white/20 relative overflow-hidden bg-white/5 backdrop-blur-sm cursor-pointer" onClick={() => { setJoinCode('AB23XZ'); setRoomStep('join_input'); }}>
                <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-green-400"></div><div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-green-400"></div><div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-green-400"></div><div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-green-400"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_#4ade80] animate-scan"></div>
              </div>
              <p className="text-white/60 text-xs mt-8">화면을 터치하면 스캔이 완료됩니다 (더미)</p>
            </div>
          </div>
        );
      case 'create':
        return (
          <div className="p-6 flex flex-col h-full animate-fade-in bg-white overflow-y-auto pb-24">
            <button onClick={() => setRoomStep('landing')} className="mb-4 text-gray-500 flex items-center gap-1 text-sm"><ChevronLeft className="w-4 h-4"/> 뒤로</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">방 만들기</h2>
            <div className="flex-1 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1">모임 종류</label>
                <div className="space-y-4">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {['동네 친구', '대학 친구', '운동 모임'].map((type) => (
                        <button key={type} onClick={() => setRoomForm({...roomForm, relationType: type, maxMembers: 5})} className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors ${roomForm.relationType === type ? 'bg-[#5E4078] border-[#5E4078] text-white' : 'bg-white border-gray-200 text-gray-600'}`}>{type}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button onClick={() => { setRoomStep('lobby'); setParticipants([{ id: 'me', name: '나(김하니)', role: 'host', ready: true }]); }} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg mb-4 mt-4">방 생성 완료</button>
          </div>
        );
      case 'join_input':
        return (
          <div className="p-6 flex flex-col h-full animate-fade-in bg-white">
            <button onClick={() => setRoomStep('landing')} className="mb-4 text-gray-500 flex items-center gap-1 text-sm"><ChevronLeft className="w-4 h-4"/> 뒤로</button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">참여 코드 입력</h2>
            <div className="flex-1">
              <input type="text" placeholder="참여 코드 6자리 입력" className="w-full border border-gray-300 rounded-xl px-4 py-4 text-center text-xl font-mono tracking-widest uppercase bg-gray-50 focus:bg-white focus:outline-none focus:border-[#5E4078] transition-colors mb-4" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
              {joinCode.length >= 6 ? (
                <button onClick={() => setRoomStep('lobby')} className="w-full bg-[#5E4078] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#4A306D] transition mt-4">방 입장하기</button>
              ) : (
                <button onClick={() => setJoinCode('AB23XZ')} className="w-full bg-white border border-[#D1C5E0] text-[#5E4078] font-bold py-4 rounded-xl shadow-sm hover:bg-[#F7F5FA] transition mt-2">샘플 코드로 붙여넣기</button>
              )}
            </div>
          </div>
        );
      case 'lobby':
        return (
          <div className="p-6 flex flex-col h-full animate-fade-in bg-[#F7F5FA] relative pb-24">
            <div className="text-center mb-6 mt-2">
              <span className="bg-white text-[#5E4078] border border-[#D1C5E0] text-xs px-3 py-1 rounded-full font-bold mb-3 inline-block">{roomForm.relationType}</span>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{roomForm.roomName || '새로운 모임'}</h2>
            </div>
            <div className="flex-1 bg-white rounded-3xl p-5 shadow-sm border border-gray-100 overflow-y-auto mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm">참여자 리스트</h3>
                <button onClick={() => setParticipants(p => [...p, {id:`d_${Date.now()}`, name:'지인', role:'member', ready:true}])} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded font-bold">임시 추가</button>
              </div>
              <div className="space-y-3 mb-4">
                {participants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border bg-white border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-[#F0EBF5] flex items-center justify-center text-[#5E4078] font-bold">{p.name.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-800 text-sm">{p.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setRoomStep('analyzing')} className={`w-full font-bold py-4 rounded-xl shadow-lg transition-colors ${participants.length >= 2 ? 'bg-[#2D2D2D] text-white hover:bg-black' : 'bg-gray-300 text-gray-500'}`}>분석 시작</button>
          </div>
        );
      case 'analyzing':
        return (
          <div className="flex flex-col h-full items-center justify-center bg-[#2D2D2D] text-white p-6 animate-pulse pb-20">
            <Sparkles className="w-16 h-16 text-[#A994C1] mb-6" />
            <h2 className="text-xl font-bold mb-4 text-center leading-relaxed">상호작용 분석 중...</h2>
          </div>
        );
      case 'result_public':
        return (
          <div className="bg-[#F7F5FA] flex-1 overflow-y-auto pb-24 animate-fade-in relative">
            <div className="p-4 space-y-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 text-center relative">
                <span className="bg-[#F0EBF5] text-[#5E4078] px-3 py-1 rounded-full text-xs font-bold mb-3 inline-block">다 함께 보는 그룹 총평</span>
                <h2 className="text-4xl font-extrabold text-[#2D2D2D] mb-1">82점</h2>
                <p className="text-sm font-bold text-gray-800 mb-4">대화가 끊이지 않고 활기찬 모임</p>
              </div>
              <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-[#5E4078]"/> 역할 배지</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#F7F5FA] p-3 rounded-xl border border-[#EBE5F2]"><p className="text-xs text-[#5E4078] font-bold mb-1">🔥 추진자</p><p className="font-bold text-gray-800 text-sm">나(김하니)</p></div>
                  <div className="bg-green-50 p-3 rounded-xl border border-green-100"><p className="text-xs text-green-700 font-bold mb-1">🔗 연결자</p><p className="font-bold text-gray-800 text-sm">조멀티</p></div>
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100"><p className="text-xs text-blue-700 font-bold mb-1">🛡️ 완충자</p><p className="font-bold text-gray-800 text-sm">김서하</p></div>
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-100"><p className="text-xs text-orange-700 font-bold mb-1">⚖️ 정리왕</p><p className="font-bold text-gray-800 text-sm">박준영</p></div>
                </div>
              </div>
              <div className="pt-6 text-center">
                <button onClick={() => setRoomStep('result_private')} className="w-full bg-[#2D2D2D] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-yellow-400"/> 내 개인 결과 보기
                </button>
              </div>
            </div>
          </div>
        );
      case 'result_private':
        return (
          <div className="bg-slate-900 flex-1 overflow-y-auto pb-24 animate-fade-in relative text-white p-4">
            <div className="text-center mb-8">
              <p className="text-sm text-purple-300 mb-2">이 모임에서의 내 역할</p>
              <h2 className="text-3xl font-bold mb-3 leading-tight">분위기를 주도하는<br/>중심축 🔥</h2>
            </div>
            <button onClick={() => setRoomStep('result_advice')} className="w-full bg-[#6B4E90] text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 mt-10 hover:bg-[#5D3F7D]">
              👉 행동 가이드 보기
            </button>
          </div>
        );
      case 'result_advice':
        return (
          <div className="bg-slate-900 flex-1 overflow-y-auto pb-24 animate-fade-in relative text-white p-4">
             <div className="pt-6 pb-6 space-y-3">
                <button onClick={handleSaveRoomToMap} className="w-full bg-white text-[#2D2D2D] font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-colors">
                  <MapIcon className="w-5 h-5"/> 관계맵에 저장하고 끝내기
                </button>
              </div>
          </div>
        );
      case 'save_complete':
        return (
          <div className="flex flex-col h-full items-center justify-center p-6 text-center animate-fade-in bg-white pb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">저장 완료!</h2>
            <div className="w-full space-y-3">
              <button onClick={() => switchTab('map')} className="w-full bg-[#6B4E90] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#5D3F7D] transition">
                내 관계맵에서 확인하기
              </button>
            </div>
          </div>
        );
    }
  };

  const renderMapMain = () => {
    const pendingCount = nodes.filter(n => n.status === 'pending').length;
    const detailCount = nodes.filter(n => n.isDetailUnlocked).length;
    const matchableCount = nodes.filter(n => n.isMatchable).length;

    return (
      <>
        <div className="mx-4 mt-4 mb-2 relative cursor-pointer group" onClick={() => switchTab('room')}>
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
                <ChevronRight className="w-5 h-5 text-white drop-shadow-md"/>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white px-4 pb-3 shadow-sm z-20 flex flex-col gap-3 pt-2">
          <div className="flex gap-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="이름, 모임명 검색..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[#5E4078]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={() => { setViewMode(p => p === 'map' ? 'list' : 'map'); setSpecialFilter(null); }} className="bg-[#F0EBF5] p-2 rounded-xl text-[#5E4078] font-bold text-xs flex items-center justify-center min-w-[55px]">
              {viewMode === 'map' ? '리스트' : '맵 뷰'}
            </button>
          </div>
        </div>

        {viewMode === 'map' ? (
          <MapCanvas nodes={nodes} groups={groups} edges={edges} activeGroupIds={activeGroupIds} statusFilters={statusFilters} specialFilter={specialFilter} searchQuery={searchQuery} setShowOnboarding={setShowOnboarding} zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} focusedNodeId={focusedNodeId} setFocusedNodeId={setFocusedNodeId} onNodeClick={(node) => { setSelectedNode(node); setMapStep('detail'); }} onMeClick={() => setShowMyProfile(true)} mapRef={mapRef} />
        ) : (
          <div className="flex-1 overflow-y-auto bg-white pb-10">
            <div className="p-4 flex justify-between items-center border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10">
              <span className="text-sm text-gray-500 font-medium">이름 및 요약</span>
              <button onClick={cycleSortMode} className="flex items-center gap-1 text-xs font-bold text-[#5E4078] bg-[#F0EBF5] px-2 py-1.5 rounded-lg border border-[#D1C5E0] shadow-sm">
                {sortLabelMap[sortMode]} <ArrowUpDown className="w-3 h-3"/>
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {getSortedFilteredNodes().map((node, i) => (
                <div key={node.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition cursor-pointer relative" onClick={() => { setSelectedNode(node); setMapStep('detail'); }}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border ${node.status === 'pending' ? 'bg-gray-100 text-gray-400 border-gray-200' : 'border-white shadow-sm ' + node.badge}`}>
                        {node.status === 'pending' ? <HelpCircle className="w-5 h-5 opacity-50"/> : node.name.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm flex items-center gap-1">
                        {node.name} 
                        <span className="font-normal text-gray-400 text-xs ml-1">{node.roleLabel || '미확인'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderMapDetail = () => {
    if (!selectedNode) return null;
    return (
      <div className="p-4 h-full flex flex-col animate-fade-in bg-gray-50 pb-24 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 py-2 z-10">
          <button onClick={() => setMapStep('main')} className="text-gray-500 text-sm flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> 맵으로</button>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedNode.name}</h2>
          <p className="text-[#5E4078] font-bold mb-4 text-lg">어울림 {selectedNode.score}점</p>
        </div>
        <div className="flex-1 space-y-3 mb-4">
          {!selectedNode.isDetailUnlocked ? (
            <button onClick={handleUnlockDetail} className="w-full bg-[#2D2D2D] text-white py-4 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 hover:bg-black transition">
              정밀 궁합 해설 해금 <Coins className="w-4 h-4 text-yellow-400" /> 300 HANI
            </button>
          ) : (
            <button onClick={handleStartChatWithNode} className="w-full bg-[#5E4078] text-white py-3.5 rounded-xl font-bold shadow-md flex justify-center items-center gap-2 hover:bg-[#4A306D] transition">
              <MessageSquare className="w-4 h-4" /> AI 하니와 추가 상담하기
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMapMatch = () => {
    return (
      <div className="p-4 h-full flex flex-col animate-fade-in bg-white pb-24 overflow-y-auto">
        <button onClick={() => setMapStep('detail')} className="text-gray-500 text-sm mb-4 flex items-center gap-1"><ChevronLeft className="w-4 h-4"/> 취소</button>
        <h2 className="text-2xl font-bold mb-2">관계 매칭</h2>
      </div>
    );
  };

  const renderChat = () => {
    return (
      <div className="flex flex-col h-full bg-[#F9F9F9] relative pb-[80px] pt-2">
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
          {chatMessages.map((msg, idx) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3.5 max-w-[260px] text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#F0EBF5] text-[#5E4078] rounded-2xl rounded-tr-sm font-medium' : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-tl-sm'}`}>
                  {msg.text.split('\n').map((line, i) => <React.Fragment key={i}>{line}<br/></React.Fragment>)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white p-3 flex gap-2 items-center z-10 shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          <input 
            type="text" 
            placeholder="하니와 대화를 시작해보세요" 
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#5E4078] transition"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
          />
          <button 
            onClick={() => handleSendChat()}
            disabled={!chatInput.trim() || isTyping}
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${chatInput.trim() && !isTyping ? 'bg-[#5E4078] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderPointTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F7F5FA] pb-[72px] overflow-y-auto animate-fade-in">
        <div className="bg-[#5E4078] px-4 pt-2 pb-6 relative rounded-b-[2rem]">
          <div className="bg-white/10 p-1 rounded-xl flex">
            <button className="flex-1 bg-white text-[#5E4078] font-bold py-2.5 rounded-lg text-sm shadow-sm">출석체크</button>
            <button className="flex-1 text-white/80 font-medium py-2.5 rounded-lg text-sm">충전/사용내역</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900 font-sans items-center justify-center p-4">
      {toast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-fade-in-up text-sm font-bold flex items-center gap-2 border border-gray-700">
          <CheckCircle className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}

      {/* 모바일 프레임 */}
      <div className="w-full max-w-[393px] h-[852px] max-h-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden relative border-[8px] border-gray-900 flex flex-col">
        
        {/* HEADER */}
        <div className={`pt-12 pb-3 px-5 z-30 flex justify-between items-center relative transition-colors ${activeTab === 'points' ? 'bg-[#654479]' : 'bg-white border-b border-gray-100'}`}>
          <h1 className={`text-xl font-extrabold ${activeTab === 'points' ? 'text-white' : 'text-gray-900'}`}>
            {activeTab === 'chat' ? '채팅' : activeTab === 'map' || activeTab === 'room' ? '관계 맵' : activeTab === 'diary' ? '다이어리' : '포인트'}
          </h1>
          <div className="flex items-center gap-1.5">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${activeTab === 'points' ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500'}`}>
              💰 {haniCoin} HANI
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${activeTab === 'points' ? 'bg-white/10 text-white' : 'bg-[#F0EBF5] text-[#5E4078]'}`}>
              🔮 {orb} Orb
            </div>
          </div>
        </div>

        {/* BODY AREA */}
        <div className="flex-1 overflow-hidden relative flex flex-col pb-[84px]">
          {activeTab === 'chat' && renderChat()}
          {activeTab === 'room' && renderRoom()}
          {activeTab === 'map' && mapStep === 'main' && renderMapMain()}
          {activeTab === 'map' && mapStep === 'detail' && renderMapDetail()}
          {activeTab === 'map' && (mapStep === 'match_select' || mapStep === 'match_result') && renderMapMatch()}
          {activeTab === 'points' && renderPointTab()}
          {activeTab === 'diary' && renderDiaryTab()}
          {activeTab === 'more' && (
             <div className="flex flex-1 items-center justify-center bg-gray-50 text-gray-400 font-bold">서비스 준비 중입니다</div>
          )}
        </div>

        {/* BOTTOM NAVIGATION TAB BAR */}
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center h-[84px] pb-6 pt-3 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
          <button onClick={() => switchTab('chat')} className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${activeTab === 'chat' ? 'text-[#5E4078]' : 'text-gray-400 hover:text-gray-600'}`}>
            <MessageSquare className={`w-6 h-6 ${activeTab === 'chat' ? 'fill-[#EBE5F2]' : ''}`} />
            <span className="text-[10px] font-medium">채팅</span>
          </button>
          
          <button onClick={() => switchTab('map')} className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${activeTab === 'map' || activeTab === 'room' ? 'text-[#5E4078]' : 'text-gray-400 hover:text-gray-600'}`}>
            <MapIcon className={`w-6 h-6 ${activeTab === 'map' || activeTab === 'room' ? 'fill-[#EBE5F2]' : ''}`} />
            <span className="text-[10px] font-medium">관계 맵</span>
          </button>

          <button onClick={() => switchTab('diary')} className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${activeTab === 'diary' ? 'text-[#5E4078]' : 'text-gray-400 hover:text-gray-600'}`}>
            <BookOpen className={`w-6 h-6 ${activeTab === 'diary' ? 'fill-[#EBE5F2]' : ''}`} />
            <span className="text-[10px] font-medium">다이어리</span>
          </button>

          <button onClick={() => switchTab('points')} className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${activeTab === 'points' ? 'text-[#5E4078]' : 'text-gray-400 hover:text-gray-600'}`}>
            <Database className={`w-6 h-6 ${activeTab === 'points' ? 'fill-[#EBE5F2]' : ''}`} />
            <span className="text-[10px] font-medium">포인트</span>
          </button>

          <button onClick={() => switchTab('more')} className={`flex flex-col items-center gap-1.5 w-1/5 transition-colors ${activeTab === 'more' ? 'text-[#5E4078]' : 'text-gray-400 hover:text-gray-600'}`}>
            <User className={`w-6 h-6 ${activeTab === 'more' ? 'fill-[#EBE5F2]' : ''}`} />
            <span className="text-[10px] font-medium">더보기</span>
          </button>
        </div>

      </div>
    </div>
  );
}