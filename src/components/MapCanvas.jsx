import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import {
  X, HelpCircle, ZoomIn, ZoomOut, Maximize, Crown, ChevronRight,
  Home, Eye, Link2
} from 'lucide-react';
import {
  buildGroupLayout, buildNodeLayout, buildBridgeLines, getAutoFitZoom, getCenterScroll,
  getStatusRingColor, MAP_CENTER, MAX_VISIBLE_NODES
} from '../utils/buildMapLayout';
import { RELATIONSHIP_STATUSES } from '../data/relationUtils';

export default function MapCanvas({
  nodes, groups, edges, activeGroupIds, statusFilters, specialFilter,
  searchQuery, zoomLevel, setZoomLevel, focusedNodeId, setFocusedNodeId,
  onNodeClick, onMeClick, mapRef, setShowOnboarding,
  nodeEnrichedData = {}, groupEnrichedData = {}
}) {
  const [legendCollapsed, setLegendCollapsed] = useState(true);
  const [focusMode, setFocusMode] = useState('overview'); // 'overview' | 'group' | 'node'
  const [focusGroupId, setFocusGroupId] = useState(null);
  const hasAutoFitted = useRef(false);

  // ─── 필터링 ────────────────────────────────────────────
  const filteredNodes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return nodes.filter(node => {
      if (!statusFilters.includes(node.status)) return false;
      if (node.status === 'checked') {
        const matchesGroup = node.groups.some(g => activeGroupIds.includes(g));
        if (!matchesGroup) return false;
      }
      if (specialFilter === 'detailAvailable' && node.status !== 'checked') return false;
      if (specialFilter === 'detailAvailable' && (node.status !== 'checked' || node.isDetailUnlocked)) return false;
      if (specialFilter === 'matchRecommended' && !node.isMatchable) return false;
      if (q) {
        const groupNames = node.groups.map(gId => groups.find(g => g.id === gId)?.name || '').join(' ').toLowerCase();
        return node.name.toLowerCase().includes(q) || groupNames.includes(q) ||
          (node.roleLabel || '').toLowerCase().includes(q) || (node.summary || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [nodes, groups, activeGroupIds, statusFilters, specialFilter, searchQuery]);

  // ─── 자동 레이아웃 ─────────────────────────────────────
  const groupLayouts = useMemo(
    () => buildGroupLayout(groups, activeGroupIds),
    [groups, activeGroupIds]
  );
  const nodeLayouts = useMemo(
    () => buildNodeLayout(filteredNodes, groupLayouts),
    [filteredNodes, groupLayouts]
  );
  const bridgeLines = useMemo(
    () => buildBridgeLines(nodeLayouts),
    [nodeLayouts]
  );

  const focusedNode = useMemo(() => {
    if (!focusedNodeId || focusedNodeId === 'me') return null;
    return nodes.find(n => n.id === focusedNodeId);
  }, [focusedNodeId, nodes]);

  // ─── 첫 진입 auto-fit ─────────────────────────────────
  useEffect(() => {
    if (!hasAutoFitted.current && mapRef.current) {
      hasAutoFitted.current = true;
      const vw = mapRef.current.clientWidth;
      const vh = mapRef.current.clientHeight;
      const fitZoom = getAutoFitZoom(vw, vh, groupLayouts.length);
      setZoomLevel(fitZoom);
      requestAnimationFrame(() => {
        const { scrollLeft, scrollTop } = getCenterScroll(vw, vh, fitZoom);
        if (mapRef.current) {
          mapRef.current.scrollLeft = scrollLeft;
          mapRef.current.scrollTop = scrollTop;
        }
      });
    }
  }, [groupLayouts.length]);

  // ─── 검색 매치 ID 목록 ──────────────────────────────────
  const searchMatchIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const ids = new Set();
    nodeLayouts.forEach(n => {
      if (n.name.toLowerCase().includes(q)) ids.add(n.id);
    });
    return ids.size > 0 ? ids : null;
  }, [searchQuery, nodeLayouts]);

  // ─── 검색 자동 센터링 ──────────────────────────────────
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || !mapRef.current) return;
    const matched = nodeLayouts.filter(n =>
      n.name.toLowerCase().includes(q.toLowerCase())
    );
    if (matched.length === 1) {
      const node = matched[0];
      const vw = mapRef.current.clientWidth;
      const vh = mapRef.current.clientHeight;
      const { scrollLeft, scrollTop } = getCenterScroll(vw, vh, zoomLevel, node.layoutX, node.layoutY);
      mapRef.current.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
      setFocusedNodeId(node.id);
      setFocusMode('node');
    }
  }, [searchQuery]);

  // ─── 인터랙션 핸들러 ──────────────────────────────────
  // 싱글탭 → 프리뷰 시트 (더블탭 제거)
  const handleNodeTap = useCallback((e, node) => {
    e.stopPropagation();
    setFocusedNodeId(node.id);
    setFocusMode('node');
    setFocusGroupId(null);
  }, [setFocusedNodeId]);

  // 그룹 탭 → 그룹 포커스 줌
  const handleGroupTap = useCallback((e, group) => {
    e.stopPropagation();
    setFocusMode('group');
    setFocusGroupId(group.id);
    setFocusedNodeId(null);
    if (mapRef.current) {
      const vw = mapRef.current.clientWidth;
      const vh = mapRef.current.clientHeight;
      const gl = groupLayouts.find(g => g.id === group.id);
      if (gl) {
        const targetZoom = Math.min(0.95, zoomLevel + 0.25);
        setZoomLevel(targetZoom);
        requestAnimationFrame(() => {
          const { scrollLeft, scrollTop } = getCenterScroll(vw, vh, targetZoom, gl.layoutCx, gl.layoutCy);
          mapRef.current?.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
        });
      }
    }
  }, [groupLayouts, zoomLevel, setZoomLevel, setFocusedNodeId, mapRef]);

  // 전체 보기 복귀
  const resetToOverview = useCallback(() => {
    setFocusMode('overview');
    setFocusGroupId(null);
    setFocusedNodeId(null);
    if (mapRef.current) {
      const vw = mapRef.current.clientWidth;
      const vh = mapRef.current.clientHeight;
      const fitZoom = getAutoFitZoom(vw, vh, groupLayouts.length);
      setZoomLevel(fitZoom);
      requestAnimationFrame(() => {
        const { scrollLeft, scrollTop } = getCenterScroll(vw, vh, fitZoom);
        mapRef.current?.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
      });
    }
  }, [setZoomLevel, setFocusedNodeId, mapRef, groupLayouts.length]);

  // ─── 가시성 규칙 (다중 그룹 인스턴스 대응) ─────────────
  const isNodeInstanceVisible = (inst) => {
    if (focusMode === 'group' && focusGroupId) {
      // 그룹 포커스: 해당 그룹의 인스턴스만 표시
      return inst.instanceGroupId === focusGroupId;
    }
    if (focusMode === 'node' && focusedNodeId) {
      // 노드 포커스: 원본(primary) 인스턴스만, 고스트는 숨김
      if (inst.isGhost) return false;
      if (inst.id === focusedNodeId) return true;
      return edges.some(e =>
        (e.source === focusedNodeId && e.target === inst.id) ||
        (e.target === focusedNodeId && e.source === inst.id)
      );
    }
    // overview: overflow 숨김 (고스트 포함)
    return !inst.isOverflowNode;
  };

  const isNodeHighlighted = (nodeId) => {
    // 검색 다중 결과: 매치된 노드만 강조
    if (searchMatchIds && focusMode === 'overview') {
      return nodeId === 'me' || searchMatchIds.has(nodeId);
    }
    if (focusMode === 'overview') return true;
    if (focusMode === 'group' && focusGroupId) {
      if (nodeId === 'me') return true;
      // 해당 그룹 소속이면 강조
      return nodeLayouts.some(n => n.id === nodeId && n.instanceGroupId === focusGroupId);
    }
    if (focusMode === 'node') {
      if (nodeId === focusedNodeId || nodeId === 'me') return true;
      return edges.some(e =>
        (e.source === focusedNodeId && e.target === nodeId) ||
        (e.target === focusedNodeId && e.source === nodeId)
      );
    }
    return true;
  };

  const isEdgeVisible = (edge) => {
    if (focusMode === 'overview') {
      return edge.source === 'me' || edge.target === 'me';
    }
    if (focusMode === 'group' && focusGroupId) {
      const sn = nodeLayouts.find(n => n.id === edge.source);
      const tn = nodeLayouts.find(n => n.id === edge.target);
      return edge.source === 'me' || edge.target === 'me' ||
        sn?.groups?.includes(focusGroupId) || tn?.groups?.includes(focusGroupId);
    }
    if (focusMode === 'node') {
      return edge.source === focusedNodeId || edge.target === focusedNodeId;
    }
    return true;
  };

  const getOverflowCount = (groupId) => {
    if (focusMode === 'group' && focusGroupId === groupId) return 0;
    // 해당 그룹 인스턴스 전체 카운트 (primary + ghost 모두)
    const count = nodeLayouts.filter(n => n.instanceGroupId === groupId).length;
    return Math.max(0, count - MAX_VISIBLE_NODES);
  };

  // ─── 노드 좌표 룩업 (엣지용: 원본 인스턴스 우선) ────
  const getNodePos = (id) => {
    if (id === 'me') return { x: MAP_CENTER.x, y: MAP_CENTER.y };
    // primary(원본) 인스턴스를 먼저 찾고, 없으면 아무 인스턴스
    const primary = nodeLayouts.find(nd => nd.id === id && !nd.isGhost);
    if (primary) return { x: primary.layoutX, y: primary.layoutY };
    const any = nodeLayouts.find(nd => nd.id === id);
    return any ? { x: any.layoutX, y: any.layoutY } : null;
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="flex-1 relative overflow-hidden bg-[#F7F5FA]"
      onClick={() => { if (focusMode !== 'overview') resetToOverview(); }}
    >
      {/* 약화된 배경 도트 */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{ backgroundImage: 'radial-gradient(#5E4078 0.7px, transparent 0.7px)', backgroundSize: '32px 32px' }}
      />

      {/* ─── 포커스 모드 배너 ──────────────────────────── */}
      {focusMode !== 'overview' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-2.5 animate-fade-in-up border border-[#EBE5F2]">
          <span className="font-bold text-xs text-[#5E4078]">
            {focusMode === 'group'
              ? groups.find(g => g.id === focusGroupId)?.name || ''
              : focusedNodeId === 'me' ? '나' : nodes.find(n => n.id === focusedNodeId)?.name
            }
          </span>
          <span className="text-[10px] text-gray-400">중심 보기</span>
          <button onClick={(e) => { e.stopPropagation(); resetToOverview(); }}
            className="text-[10px] text-[#5E4078] font-bold flex items-center gap-0.5 bg-[#F0EBF5] px-2 py-1 rounded-full border border-[#E5DDF0]">
            <X className="w-3 h-3" /> 전체
          </button>
        </div>
      )}

      {/* ─── 접을 수 있는 범례 ────────────────────────── */}
      <div className="absolute top-2 left-2 z-20">
        {legendCollapsed ? (
          <button onClick={(e) => { e.stopPropagation(); setLegendCollapsed(false); }}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-purple-100 shadow-sm text-[#5E4078] hover:bg-white transition">
            <Eye className="w-4 h-4" />
          </button>
        ) : (
          <div className="bg-white/95 backdrop-blur-sm p-2.5 rounded-xl border border-purple-100 text-[10px] text-gray-600 shadow-sm flex flex-col items-start gap-1.5 animate-fade-in">
            <div className="flex items-center justify-between w-full mb-0.5">
              <span className="font-bold text-[#5E4078] text-[11px]">범례</span>
              <button onClick={(e) => { e.stopPropagation(); setLegendCollapsed(true); }} className="text-gray-400 p-0.5">
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#5E4078] border-2 border-white shadow-sm" />분석 완료</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-400" />편안</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-amber-400" />긴장</div>
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full border-2 border-gray-400" />거리감</div>
            <button onClick={(e) => { e.stopPropagation(); setShowOnboarding(true); }}
              className="mt-1 flex items-center gap-1 text-[#5E4078] font-bold bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
              <HelpCircle className="w-3 h-3" /> 맵 보는 법
            </button>
          </div>
        )}
      </div>

      {/* ─── 맵 캔버스 ────────────────────────────────── */}
      <div ref={mapRef} className="w-full h-full overflow-auto relative scrollbar-hide">
        <div style={{
          width: '1200px', height: '1200px',
          transform: `scale(${zoomLevel})`, transformOrigin: '0 0',
          transition: 'transform 0.3s ease-out'
        }} className="relative">

          <svg width="1200" height="1200" className="absolute inset-0 pointer-events-none z-0">
            {/* ── 그룹 영역 (소프트 블롭) ─────────────── */}
            {groupLayouts.map(g => {
              const isGroupFocused = focusMode === 'group' && focusGroupId === g.id;
              // 해당 그룹의 인스턴스 수 (primary + ghost)
              const memberCount = nodeLayouts.filter(n => n.instanceGroupId === g.id).length;
              const blobR = isGroupFocused ? 150 : (memberCount <= 3 ? 95 : 110);
              const opacity = (focusMode === 'group' && focusGroupId && focusGroupId !== g.id) ? 0.15 : 1;

              // 그룹 컨디션에 따른 블롭 색상
              const gMood = groupEnrichedData[g.id]?.mood;
              const blobFills = {
                stable:   '#F0EBF5',
                active:   '#FEF9E7',
                sensitive:'#FFF3E0',
                draining: '#FDE8E8',
              };
              const blobFill = blobFills[gMood] || '#F0EBF5';

              return (
                <g key={`grp-${g.id}`} style={{ transition: 'opacity 0.3s' }} opacity={opacity}>
                  <circle
                    cx={g.layoutCx} cy={g.layoutCy} r={blobR}
                    fill={blobFill} fillOpacity={isGroupFocused ? 0.6 : 0.35}
                    stroke="#E5DDF0" strokeWidth="1.5"
                    strokeDasharray={isGroupFocused ? 'none' : '5 4'}
                  />
                  <text
                    x={g.layoutCx} y={g.layoutCy - blobR - 10}
                    textAnchor="middle" fill="#5E4078"
                    fontSize={isGroupFocused ? '13' : '11'} fontWeight="bold"
                    opacity={isGroupFocused ? 1 : 0.65}
                  >
                    {g.name}
                  </text>
                </g>
              );
            })}

            {/* ── 나→그룹 연결선 (은은한 곡선) ──────── */}
            {groupLayouts.map(g => {
              const dim = focusMode === 'group' && focusGroupId && focusGroupId !== g.id;
              const cx = MAP_CENTER.x, cy = MAP_CENTER.y;
              const mx = (cx + g.layoutCx) / 2;
              const my = (cy + g.layoutCy) / 2 - 20;
              return (
                <path key={`me-g-${g.id}`}
                  d={`M ${cx} ${cy} Q ${mx} ${my}, ${g.layoutCx} ${g.layoutCy}`}
                  fill="none" stroke="#D1C5E0" strokeWidth="1.5"
                  opacity={dim ? 0.06 : 0.2}
                  style={{ transition: 'opacity 0.3s' }}
                />
              );
            })}

            {/* ── 다중 그룹 브릿지 라인 (점선) ────────── */}
            {focusMode === 'overview' && bridgeLines.map(bl => {
              const mx = (bl.x1 + bl.x2) / 2;
              const my = (bl.y1 + bl.y2) / 2 - 15;
              return (
                <path key={`bridge-${bl.nodeId}-${bl.x2}`}
                  d={`M ${bl.x1} ${bl.y1} Q ${mx} ${my}, ${bl.x2} ${bl.y2}`}
                  fill="none" stroke="#B8A5D0" strokeWidth="1"
                  strokeDasharray="3 3" opacity="0.35"
                  style={{ transition: 'opacity 0.3s' }}
                />
              );
            })}

            {/* ── 엣지 (포커스 모드별 필터링) ────────── */}
            {edges.map((edge, i) => {
              if (!isEdgeVisible(edge)) return null;
              const sp = getNodePos(edge.source);
              const tp = getNodePos(edge.target);
              if (!sp || !tp) return null;

              // overflow 노드 엣지는 overview에서 숨김
              if (focusMode === 'overview') {
                const sLayout = nodeLayouts.find(n => n.id === edge.source);
                const tLayout = nodeLayouts.find(n => n.id === edge.target);
                if (sLayout?.isOverflowNode || tLayout?.isOverflowNode) return null;
              }

              const highlighted = isNodeHighlighted(edge.source) && isNodeHighlighted(edge.target);
              const isFocusedEdge = focusMode === 'node' && (edge.source === focusedNodeId || edge.target === focusedNodeId);
              let stroke = edge.type === 'dashed' ? '#D1C5E0' : '#B8A5D0';
              let sw = (edge.source === 'me' || edge.target === 'me') ? 1.5 : 1;
              let dash = edge.type === 'dashed' ? '4 4' : 'none';
              let op = highlighted ? 0.4 : 0.06;

              if (isFocusedEdge) {
                op = 0.7; sw = 2; stroke = '#8B6BAE';
              }

              if (edge.source === 'me' || edge.target === 'me') {
                const s = edge.source === 'me' ? sp : tp;
                const t = edge.source === 'me' ? tp : sp;
                const mx = (s.x + t.x) / 2;
                const my = (s.y + t.y) / 2 - 25;
                return (
                  <path key={`e-${i}`}
                    d={`M ${s.x} ${s.y} Q ${mx} ${my}, ${t.x} ${t.y}`}
                    fill="none" stroke={stroke} strokeWidth={sw}
                    strokeDasharray={dash} opacity={op}
                    style={{ transition: 'opacity 0.3s' }}
                  />
                );
              }
              return (
                <line key={`e-${i}`}
                  x1={sp.x} y1={sp.y} x2={tp.x} y2={tp.y}
                  stroke={stroke} strokeWidth={sw}
                  strokeDasharray={dash} opacity={op}
                  style={{ transition: 'opacity 0.3s' }}
                />
              );
            })}
          </svg>

          {/* ── 그룹 탭 영역 (투명 클릭존) ──────────── */}
          {groupLayouts.map(g => {
            const memberCount = nodeLayouts.filter(n => n.instanceGroupId === g.id).length;
            const hitR = memberCount <= 3 ? 100 : 115;
            return (
              <div key={`gtap-${g.id}`}
                onClick={(e) => handleGroupTap(e, g)}
                className="absolute rounded-full cursor-pointer z-5"
                style={{
                  left: `${g.layoutCx - hitR}px`, top: `${g.layoutCy - hitR}px`,
                  width: `${hitR * 2}px`, height: `${hitR * 2}px`,
                }}
              />
            );
          })}

          {/* ── '나' 중앙 노드 ──────────────────────── */}
          <div
            onClick={(e) => { e.stopPropagation(); setFocusedNodeId('me'); setFocusMode('node'); onMeClick(); }}
            className={`absolute w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#7B5EA7] to-[#5E4078] border-[3px] border-white shadow-xl flex flex-col items-center justify-center font-bold text-white z-30 transition-all cursor-pointer hover:scale-105
              ${isNodeHighlighted('me') ? 'opacity-100 scale-100 ring-3 ring-[#D1C5E0]/50' : 'opacity-25 scale-90'}`}
            style={{ left: `${MAP_CENTER.x - 30}px`, top: `${MAP_CENTER.y - 30}px` }}
          >
            <span className="text-base">나</span>
            <Crown className="w-3 h-3 text-yellow-300 absolute -top-1 -right-1 drop-shadow-md" />
          </div>

          {/* ── 인물 노드 (다중 그룹: primary + ghost) ── */}
          {nodeLayouts.map(inst => {
            if (!isNodeInstanceVisible(inst)) return null;
            const highlighted = isNodeHighlighted(inst.id);
            const enriched = nodeEnrichedData[inst.id];
            const ringColor = getStatusRingColor(enriched?.relationshipStatus);
            const isGhost = inst.isGhost;

            // 크기: 고스트는 약간 작게
            let size = 42;
            if (inst.isDetailUnlocked) size = 48;
            if (focusMode === 'node' && inst.id === focusedNodeId) size = 52;
            if (focusMode === 'group' && focusGroupId && inst.instanceGroupId === focusGroupId) size = 46;
            if (isGhost && focusMode !== 'group') size = Math.round(size * 0.85);

            const half = size / 2;
            // 고스트: overview에서 반투명 + 점선 테두리
            const ghostOpacityCls = isGhost && focusMode !== 'group' ? 'opacity-50' : '';

            return (
              <div key={inst.layoutKey}
                onClick={(e) => handleNodeTap(e, inst)}
                className={`absolute flex flex-col items-center cursor-pointer transition-all duration-300 z-20
                  ${highlighted ? `scale-100 ${ghostOpacityCls || 'opacity-100'}` : 'scale-85 opacity-15 blur-[0.5px]'}
                `}
                style={{ left: `${inst.layoutX - half}px`, top: `${inst.layoutY - half}px` }}
              >
                <div className="relative">
                  {/* 관계 상태 링 */}
                  {ringColor && !isGhost && (
                    <div className="absolute rounded-full pointer-events-none"
                      style={{
                        width: `${size + 8}px`, height: `${size + 8}px`,
                        left: '-4px', top: '-4px',
                        border: `2.5px solid ${ringColor}`,
                        opacity: highlighted ? 0.75 : 0.2,
                        transition: 'opacity 0.3s',
                      }}
                    />
                  )}

                  {/* 메인 노드 원 */}
                  <div
                    className={`rounded-full flex items-center justify-center font-bold text-sm transition-all
                      ${inst.badge}
                      ${isGhost && focusMode !== 'group' ? 'border-2 border-dashed border-[#C3AEE0]' : ''}
                      ${inst.isDetailUnlocked && !isGhost ? 'ring-2 ring-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.3)]' : 'shadow-md'}
                    `}
                    style={{ width: `${size}px`, height: `${size}px` }}
                  >
                    {inst.name.substring(0, 1)}
                  </div>

                  {/* 고스트 링크 아이콘 (overview에서만) */}
                  {isGhost && focusMode !== 'group' && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#F0EBF5] rounded-full w-3.5 h-3.5 flex items-center justify-center border border-[#D1C5E0] z-10">
                      <Link2 className="w-2 h-2 text-[#5E4078]" />
                    </div>
                  )}

                  {/* 다중 그룹 배지 (primary에만, 2그룹 이상) */}
                  {!isGhost && inst.multiGroupCount >= 2 && (
                    <div className="absolute -bottom-0.5 -right-1 bg-[#5E4078] text-white rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center shadow-sm border border-white z-10 font-bold leading-none">
                      {inst.multiGroupCount}
                    </div>
                  )}

                  {/* 해금 배지 (소형, primary만) */}
                  {inst.isDetailUnlocked && !isGhost && (
                    <div className="absolute -top-0.5 -right-1 bg-white rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center shadow-sm border border-gray-100 z-10">🔓</div>
                  )}
                  {/* NEW 배지 (소형, primary만) */}
                  {inst.isRecent && !isGhost && (
                    <div className="absolute -top-0.5 -left-1 bg-pink-500 text-white rounded-full text-[7px] w-3.5 h-3.5 flex items-center justify-center shadow-sm border border-white z-10 font-bold leading-none">N</div>
                  )}
                </div>

                {/* 이름 라벨 */}
                <div className={`mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm border whitespace-nowrap transition-all duration-300
                  bg-white/90 text-gray-700 border-gray-200
                  ${highlighted && !isGhost ? 'opacity-100' : highlighted && isGhost ? 'opacity-60' : 'opacity-0'}
                `}>
                  {inst.name}
                </div>
              </div>
            );
          })}

          {/* ── 그룹별 "+N명" 오버플로우 표시 ───────── */}
          {focusMode === 'overview' && groupLayouts.map(g => {
            const overflow = getOverflowCount(g.id);
            if (overflow <= 0) return null;
            const memberCount = nodeLayouts.filter(n => n.instanceGroupId === g.id).length;
            const blobR = memberCount <= 3 ? 95 : 110;
            return (
              <div key={`of-${g.id}`}
                onClick={(e) => handleGroupTap(e, g)}
                className="absolute z-25 cursor-pointer"
                style={{ left: `${g.layoutCx + blobR * 0.5}px`, top: `${g.layoutCy + blobR * 0.5}px` }}
              >
                <div className="bg-white/95 text-[#5E4078] text-[10px] font-bold px-2 py-1 rounded-full border border-[#E5DDF0] shadow-sm hover:bg-[#F0EBF5] transition">
                  +{overflow}명
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 인물 프리뷰 시트 (싱글탭) ────────────────── */}
      {focusedNode && focusedNodeId !== 'me' && focusMode === 'node' && (
        <div className="absolute bottom-20 left-4 right-4 z-40 animate-fade-in-up" onClick={e => e.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-lg border border-[#EBE5F2] overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              {/* 프리뷰 아바타 + 상태 링 */}
              <div className="relative shrink-0">
                {(() => {
                  const enriched = nodeEnrichedData[focusedNode.id];
                  const rc = getStatusRingColor(enriched?.relationshipStatus);
                  return rc ? <div className="absolute -inset-1 rounded-full" style={{ border: `2px solid ${rc}` }} /> : null;
                })()}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-base border ${focusedNode.badge}`}>
                  {focusedNode.name.charAt(0)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  {focusedNode.name}
                  {focusedNode.roleLabel && <span className="text-[10px] font-normal text-gray-400">{focusedNode.roleLabel}</span>}
                </p>
                {focusedNode.summary && (
                  <p className="text-[11px] text-gray-500 truncate">{focusedNode.summary}</p>
                )}
                {/* 관계 상태 · 기록 수 · 에너지 · 접점 */}
                {(() => {
                  const enriched = nodeEnrichedData[focusedNode.id];
                  if (!enriched) return null;
                  const statusObj = enriched.relationshipStatus
                    ? RELATIONSHIP_STATUSES.find(s => s.key === enriched.relationshipStatus) : null;
                  const parts = [];
                  if (statusObj) parts.push(`${statusObj.emoji} ${statusObj.label}`);
                  if (enriched.totalCount > 0) parts.push(`기록 ${enriched.totalCount}건`);
                  if (enriched.energyImpact && enriched.energyImpact !== '중립') {
                    parts.push(enriched.energyImpact === '회복' ? '🌿회복' : '🔥소모');
                  }
                  if (enriched.lastContactAt) parts.push(`접점 ${enriched.lastContactAt}`);
                  if (parts.length === 0) return null;
                  return <p className="text-[10px] text-gray-400 mt-0.5 truncate">{parts.join(' · ')}</p>;
                })()}
              </div>
              {focusedNode.score !== '?' && (
                <span className="text-sm font-extrabold text-[#5E4078] shrink-0">{focusedNode.score}점</span>
              )}
            </div>
            {/* 상세 보기 CTA */}
            <button
              onClick={() => onNodeClick(focusedNode)}
              className="w-full bg-[#5E4078] text-white font-bold py-3 text-sm flex items-center justify-center gap-1.5 hover:bg-[#4A306D] transition"
            >
              상세 보기 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ─── 좌하단: 빠른 내비게이션 ─────────────────── */}
      <div className="absolute bottom-4 left-4 flex gap-1.5 z-30">
        <button
          onClick={(e) => { e.stopPropagation(); resetToOverview(); }}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-xl shadow-md border border-gray-200 text-gray-500 hover:bg-gray-100 transition"
          title="전체 맞춤"
        >
          <Maximize className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (mapRef.current) {
              const vw = mapRef.current.clientWidth;
              const vh = mapRef.current.clientHeight;
              const { scrollLeft, scrollTop } = getCenterScroll(vw, vh, zoomLevel);
              mapRef.current.scrollTo({ left: scrollLeft, top: scrollTop, behavior: 'smooth' });
            }
          }}
          className="bg-white/90 backdrop-blur-sm p-2.5 rounded-xl shadow-md border border-gray-200 text-gray-500 hover:bg-gray-100 transition"
          title="내 위치"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* ─── 우하단: 줌 컨트롤 ───────────────────────── */}
      <div className="absolute bottom-4 right-4 bg-white/90 p-1 rounded-2xl shadow-lg border border-gray-200 flex flex-col gap-0.5 z-30 backdrop-blur-sm">
        <button onClick={(e) => { e.stopPropagation(); setZoomLevel(p => Math.min(p + 0.12, 1.3)); }}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-gray-200" />
        <button onClick={(e) => { e.stopPropagation(); setZoomLevel(p => Math.max(p - 0.12, 0.3)); }}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition">
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
