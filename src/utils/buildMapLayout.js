// ═══════════════════════════════════════════════════════════
// 관계맵 자동 레이아웃 엔진
// 하드코딩 좌표 → 방사형 클러스터 배치
// ═══════════════════════════════════════════════════════════

const CENTER_X = 600;
const CENTER_Y = 520;
const MAX_VISIBLE_NODES = 4;

/**
 * 그룹 수에 따른 방사형 반경 결정
 */
function getGroupRadius(count) {
  if (count <= 2) return 170;
  if (count <= 4) return 200;
  return 230;
}

/**
 * 그룹을 '나' 중심 방사형으로 자동 배치
 */
export function buildGroupLayout(groups, activeGroupIds) {
  const activeGroups = groups.filter(g => activeGroupIds.includes(g.id));
  const count = activeGroups.length;
  if (count === 0) return [];

  const radius = getGroupRadius(count);

  return activeGroups.map((group, i) => {
    // 12시 방향(-π/2)부터 시계방향 배치
    const angle = (2 * Math.PI * i / count) - Math.PI / 2;
    return {
      ...group,
      layoutCx: Math.round(CENTER_X + radius * Math.cos(angle)),
      layoutCy: Math.round(CENTER_Y + radius * Math.sin(angle)),
    };
  });
}

/**
 * 노드를 소속 그룹 중심 기준 자동 배치
 *
 * 다중 그룹 처리:
 *   한 사람이 2개 이상의 그룹에 속한 경우,
 *   첫 번째 그룹에는 원본(primary), 나머지 그룹에는
 *   고스트(ghost) 인스턴스를 생성한다.
 *   - layoutKey: 렌더링용 고유 키 (`nodeId` 또는 `nodeId__groupId`)
 *   - isGhost: true이면 부 그룹 고스트
 *   - multiGroupCount: 소속 그룹 수 (1이면 단일 그룹)
 *
 * overflow 규칙:
 *   그룹당 MAX_VISIBLE_NODES 초과분은 isOverflowNode=true
 *   (고스트 포함하여 카운트)
 */
export function buildNodeLayout(nodes, groupLayouts) {
  // 1) 그룹별로 소속 노드 수집 (primary + secondary 모두)
  const groupNodeMap = {};   // groupId → [{ node, isGhost }]
  const pendingNodes = [];

  const activeGroupIds = new Set(groupLayouts.map(g => g.id));

  nodes.forEach(node => {
    if (node.status === 'pending' || !node.groups || node.groups[0] === 'pending') {
      pendingNodes.push(node);
      return;
    }
    const realGroups = node.groups.filter(gId => activeGroupIds.has(gId));
    const multiGroupCount = realGroups.length;

    realGroups.forEach((gId, idx) => {
      if (!groupNodeMap[gId]) groupNodeMap[gId] = [];
      groupNodeMap[gId].push({
        node,
        isGhost: idx > 0,          // 첫 그룹 = 원본, 나머지 = 고스트
        multiGroupCount,
        primaryGroupId: realGroups[0],
      });
    });
  });

  // 2) 그룹별 배치
  const result = [];
  const placedPrimaries = new Set(); // 중복 방지

  Object.entries(groupNodeMap).forEach(([groupId, entries]) => {
    const gl = groupLayouts.find(g => g.id === groupId);
    if (!gl) return;

    // score 내림차순 정렬
    const sorted = [...entries].sort((a, b) => {
      const sa = typeof a.node.score === 'number' ? a.node.score : 0;
      const sb = typeof b.node.score === 'number' ? b.node.score : 0;
      return sb - sa;
    });

    const count = sorted.length;
    const nodeRadius = count <= 2 ? 60 : count <= 4 ? 72 : 85;

    sorted.forEach((entry, i) => {
      const { node, isGhost, multiGroupCount, primaryGroupId } = entry;
      const angle = (2 * Math.PI * i / count) - Math.PI / 2;

      result.push({
        ...node,
        layoutKey: isGhost ? `${node.id}__${groupId}` : node.id,
        layoutX: Math.round(gl.layoutCx + nodeRadius * Math.cos(angle)),
        layoutY: Math.round(gl.layoutCy + nodeRadius * Math.sin(angle)),
        isOverflowNode: i >= MAX_VISIBLE_NODES,
        isGhost,
        multiGroupCount,
        primaryGroupId,
        instanceGroupId: groupId,
      });
    });
  });

  // 3) 미확인 노드: 하단 영역 가로 정렬
  if (pendingNodes.length > 0) {
    const spacing = 75;
    const startX = CENTER_X - ((pendingNodes.length - 1) * spacing) / 2;
    pendingNodes.forEach((node, i) => {
      result.push({
        ...node,
        layoutKey: node.id,
        layoutX: Math.round(startX + i * spacing),
        layoutY: CENTER_Y + getGroupRadius(groupLayouts.length) + 130,
        isOverflowNode: false,
        isGhost: false,
        multiGroupCount: 0,
        primaryGroupId: null,
        instanceGroupId: null,
      });
    });
  }

  return result;
}

/**
 * 다중 그룹 노드의 브릿지 라인 데이터 생성
 * 같은 노드의 primary ↔ ghost 인스턴스를 연결하는 선 목록
 */
export function buildBridgeLines(nodeLayouts) {
  const primaryMap = {};  // nodeId → { x, y }
  const ghosts = [];

  nodeLayouts.forEach(n => {
    if (!n.isGhost && n.multiGroupCount > 1) {
      primaryMap[n.id] = { x: n.layoutX, y: n.layoutY };
    }
    if (n.isGhost) {
      ghosts.push(n);
    }
  });

  return ghosts
    .filter(g => primaryMap[g.id])
    .map(g => ({
      nodeId: g.id,
      x1: primaryMap[g.id].x,
      y1: primaryMap[g.id].y,
      x2: g.layoutX,
      y2: g.layoutY,
    }));
}

/**
 * 뷰포트에 맞는 자동 줌 계산
 */
export function getAutoFitZoom(viewportWidth, viewportHeight, groupCount = 5) {
  const radius = getGroupRadius(groupCount);
  // 콘텐츠 범위: 중심 ± (그룹반경 + 노드반경 + 패딩)
  const contentSpan = (radius + 100) * 2;
  const padding = 60;

  const zoomX = viewportWidth / (contentSpan + padding);
  const zoomY = viewportHeight / (contentSpan + padding + 80); // 하단 pending 영역 여유

  return Math.min(zoomX, zoomY, 0.85);
}

/**
 * 특정 좌표를 뷰포트 중앙에 맞추는 스크롤 값
 */
export function getCenterScroll(viewportWidth, viewportHeight, zoomLevel, targetX = CENTER_X, targetY = CENTER_Y) {
  return {
    scrollLeft: Math.max(0, targetX * zoomLevel - viewportWidth / 2),
    scrollTop: Math.max(0, targetY * zoomLevel - viewportHeight / 2),
  };
}

/**
 * 관계 상태 → 링 색상 매핑
 */
export function getStatusRingColor(relationshipStatus) {
  const colors = {
    comfortable: '#34D399', // 민트/그린
    tension:     '#FBBF24', // 앰버
    longing:     '#60A5FA', // 블루
    distance:    '#9CA3AF', // 그레이
    recovery:    '#2DD4BF', // 틸
    fatigue:     '#FB7185', // 로즈
  };
  return colors[relationshipStatus] || null;
}

export const MAP_CENTER = { x: CENTER_X, y: CENTER_Y };
export { MAX_VISIBLE_NODES };
