import { Node, XYPosition } from '@xyflow/react';
import { LayoutBranchOptions } from './types';
import Dagre from '@dagrejs/dagre';
import { SPACING } from './constants';

export const getAbsolutePosition = (node: Node, nodes: Node[]) => {
  const position = { x: node.position.x, y: node.position.y };
  let parent = nodes.find((n) => n.id === node.parentId);

  while (parent) {
    position.x += parent.position.x;
    position.y += parent.position.y;
    parent = nodes.find((n) => n.id === parent.parentId);
  }
  return position;
};

// Get the level of a node from root
export const getNodeLevel = (
  nodeId: string,
  _nodes: Node[],
  edges: any[],
  rootNodes: Node[],
): number => {
  const visited = new Set<string>();
  const queue: Array<{ id: string; level: number }> = rootNodes.map((node) => ({
    id: node.id,
    level: 0,
  }));

  while (queue.length > 0) {
    const item = queue.shift() ?? { id: '', level: -1 };
    const { id, level } = item;

    if (id && id === nodeId) return level;
    if (visited.has(id) || !id) continue;
    visited.add(id);

    const nextIds = edges
      .filter((edge) => edge.source === id)
      .map((edge) => ({ id: edge.target, level: level + 1 }));

    queue.push(...nextIds);
  }

  return -1;
};

// Helper function to get node height
export const getNodeHeight = (node: Node): number => {
  return node.measured?.height ?? 320;
};

// Add helper function to get node width
export const getNodeWidth = (node: Node): number => {
  return node.measured?.width ?? 288;
};

// Helper function to get all nodes in a branch starting from specific nodes
const _getBranchNodes = (
  startNodeIds: string[],
  nodes: Node[],
  edges: any[],
  visited: Set<string> = new Set(),
): Node[] => {
  const branchNodes: Node[] = [];
  const queue = [...startNodeIds];

  while (queue.length > 0) {
    const currentId = queue.shift() ?? '';
    if (visited.has(currentId) || !currentId) continue;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (node) {
      branchNodes.push(node);

      // Only get outgoing connections to maintain hierarchy
      const outgoingIds = edges.filter((e) => e.source === currentId).map((e) => e.target);

      queue.push(...outgoingIds);
    }
  }

  return branchNodes;
};

// Get nodes at specific level
const _getNodesAtLevel = (
  nodes: Node[],
  edges: any[],
  level: number,
  rootNodes: Node[],
): Node[] => {
  const result: Node[] = [];
  const visited = new Set<string>();
  const queue: Array<{ node: Node; level: number }> = rootNodes.map((node) => ({ node, level: 0 }));

  while (queue.length > 0) {
    const item = queue.shift() ?? { node: null, level: -1 };
    const { node, level: currentLevel } = item;

    if (visited.has(node.id) || !node) continue;
    visited.add(node.id);

    if (currentLevel === level) {
      result.push(node);
      continue;
    }

    // Add next level nodes to queue
    const nextNodes = edges
      .filter((edge) => edge.source === node.id)
      .map((edge) => nodes.find((n) => n.id === edge.target))
      .filter((n): n is Node => n !== undefined)
      .map((node) => ({ node, level: currentLevel + 1 }));

    queue.push(...nextNodes);
  }

  return result;
};

// Layout a branch using Dagre while preserving root positions
const _layoutBranch = (
  branchNodes: Node[],
  edges: any[],
  rootNodes: Node[],
  options: LayoutBranchOptions = {},
): Node[] => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

  // Configure the layout with consistent spacing
  g.setGraph({
    rankdir: 'LR',
    nodesep: SPACING.Y,
    // Use consistent spacing as calculatePosition
    ranksep: SPACING.X,
    marginx: 50,
    marginy: 50,
  });

  // Add all nodes to the graph with their actual dimensions
  for (const node of branchNodes) {
    const nodeWidth = getNodeWidth(node);
    const nodeHeight = getNodeHeight(node);
    g.setNode(node.id, {
      ...node,
      width: nodeWidth,
      height: nodeHeight,
      // Store original dimensions for later use
      originalWidth: nodeWidth,
      originalHeight: nodeHeight,
    });
  }

  // Add edges
  for (const edge of edges) {
    if (
      branchNodes.some((n) => n.id === edge.source) &&
      branchNodes.some((n) => n.id === edge.target)
    ) {
      g.setEdge(edge.source, edge.target);
    }
  }

  // Get the maximum level in the branch
  const maxLevel = Math.max(
    ...branchNodes.map((node) => getNodeLevel(node.id, branchNodes, edges, rootNodes)),
  );

  // Fix positions based on mode
  for (const node of branchNodes) {
    const level = getNodeLevel(node.id, branchNodes, edges, rootNodes);
    const isRoot = rootNodes.some((root) => root.id === node.id);
    const shouldFixPosition = options.fromRoot ? isRoot : level < maxLevel;

    if (shouldFixPosition) {
      const nodeWidth = getNodeWidth(node);
      g.setNode(node.id, {
        ...g.node(node.id),
        x: node.position.x + nodeWidth / 2, // Adjust x position to account for node width
        y: node.position.y,
        fixed: true,
      });
    }
  }

  // Apply layout
  Dagre.layout(g);

  // Return nodes with updated positions, adjusting for node widths
  return branchNodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const level = getNodeLevel(node.id, branchNodes, edges, rootNodes);
    const isRoot = rootNodes.some((root) => root.id === node.id);
    const shouldPreservePosition = options.fromRoot ? isRoot : level < maxLevel;

    if (shouldPreservePosition) {
      return node; // Keep original position for fixed nodes
    }

    // For non-fixed nodes, ensure they maintain relative Y position to their source nodes
    const sourceEdges = edges.filter((edge) => edge.target === node.id);
    if (sourceEdges.length > 0 && !options.fromRoot) {
      const sourceNodes = sourceEdges
        .map((edge) => branchNodes.find((n) => n.id === edge.source))
        .filter((n): n is Node => n !== undefined);

      if (sourceNodes.length > 0) {
        const avgSourceY =
          sourceNodes.reduce((sum, n) => sum + n.position.y, 0) / sourceNodes.length;
        const nodeWidth = getNodeWidth(node);
        return {
          ...node,
          position: {
            x: nodeWithPosition.x - nodeWidth / 2, // Adjust back from Dagre's center position
            y: avgSourceY,
          },
        };
      }
    }

    // For other nodes, adjust position based on node width
    const nodeWidth = getNodeWidth(node);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2, // Adjust back from Dagre's center position
        y: nodeWithPosition.y,
      },
    };
  });
};

// Get the branch cluster that a node belongs to
const _getBranchCluster = (nodeId: string, nodes: Node[], edges: any[]): Node[] => {
  const visited = new Set<string>();
  const cluster = new Set<string>();
  const queue = [nodeId];

  // First traverse upwards to find root
  while (queue.length > 0) {
    const currentId = queue.shift() ?? '';
    if (visited.has(currentId) || !currentId) continue;
    visited.add(currentId);
    cluster.add(currentId);

    // Add parent nodes
    const parentIds = edges.filter((edge) => edge.target === currentId).map((edge) => edge.source);
    queue.push(...parentIds);
  }

  // Then traverse downwards from all found nodes
  const downQueue = Array.from(cluster);
  visited.clear();

  while (downQueue.length > 0) {
    const currentId = downQueue.shift() ?? '';
    if (visited.has(currentId) || !currentId) continue;
    visited.add(currentId);

    // Add child nodes
    const childIds = edges.filter((edge) => edge.source === currentId).map((edge) => edge.target);
    downQueue.push(...childIds);
    for (const id of childIds) {
      cluster.add(id);
    }
  }

  return nodes.filter((node) => cluster.has(node.id));
};

// Get all connected nodes to the right of a given node
const _getRightwardNodes = (nodeId: string, nodes: Node[], edges: any[]): Node[] => {
  const visited = new Set<string>();
  const rightwardNodes: Node[] = [];
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift() ?? '';
    if (visited.has(currentId) || !currentId) continue;
    visited.add(currentId);

    const currentNode = nodes.find((n) => n.id === currentId);
    if (currentNode) {
      rightwardNodes.push(currentNode);

      // Only follow outgoing edges to nodes that are to the right
      const outgoingIds = edges
        .filter((edge) => edge.source === currentId)
        .map((edge) => edge.target)
        .filter((targetId) => {
          const targetNode = nodes.find((n) => n.id === targetId);
          return targetNode && targetNode.position.x >= currentNode.position.x;
        });

      queue.push(...outgoingIds);
    }
  }

  return rightwardNodes;
};

// Helper function to get root nodes (nodes with no incoming edges)
export const getRootNodes = (nodes: Node[], edges: any[]): Node[] => {
  return nodes.filter((node) => !edges.some((edge) => edge.target === node.id));
};

// Get the rightmost position for a new node
export const getRightmostPosition = (
  sourceNodes: Node[],
  nodes: Node[],
  _edges: any[],
): XYPosition => {
  // Convert source nodes to absolute positions if they are in groups
  const sourceNodesAbsolute = sourceNodes.map((node) => ({
    ...node,
    position: getNodeAbsolutePosition(node, nodes),
    width: getNodeWidth(node),
  }));

  // Calculate X position considering node width
  const rightmostX = Math.max(...sourceNodesAbsolute.map((n) => n.position.x + n.width / 2));
  const targetX = rightmostX + SPACING.X;

  // Get all nodes at the same X level
  const nodesAtTargetLevel = nodes
    .filter((node) => {
      const absPos = getNodeAbsolutePosition(node, nodes);
      return Math.abs(absPos.x - targetX) < SPACING.X / 2;
    })
    .map((node) => ({
      ...node,
      position: getNodeAbsolutePosition(node, nodes),
    }))
    .sort((a, b) => a.position.y - b.position.y);

  // Calculate average Y of source nodes
  const avgSourceY =
    sourceNodesAbsolute.reduce((sum, n) => sum + n.position.y, 0) / sourceNodesAbsolute.length;

  // If no nodes at this level, place at average Y of source nodes
  if (nodesAtTargetLevel.length === 0) {
    return {
      x: targetX,
      y: avgSourceY,
    };
  }

  // Calculate the best position based on existing nodes
  const fixedSpacing = SPACING.Y;

  // Calculate position for new node
  let bestY = avgSourceY;
  let minOverlap = Number.POSITIVE_INFINITY;

  // Try different Y positions around the average source Y
  const range = Math.max(fixedSpacing * 3, getNodeHeight(nodesAtTargetLevel[0]));
  const step = fixedSpacing / 4;

  for (let y = avgSourceY - range; y <= avgSourceY + range; y += step) {
    let hasOverlap = false;
    let totalOverlap = 0;

    // Check overlap with existing nodes considering node heights
    for (const node of nodesAtTargetLevel) {
      const nodeHeight = getNodeHeight(node);
      const newNodeHeight = 320; // Default height for new node

      // Calculate the vertical overlap between the two nodes
      const nodeTop = node.position.y - nodeHeight / 2;
      const nodeBottom = node.position.y + nodeHeight / 2;
      const newNodeTop = y - newNodeHeight / 2;
      const newNodeBottom = y + newNodeHeight / 2;

      // Check if the nodes overlap vertically
      if (!(newNodeBottom < nodeTop - fixedSpacing || newNodeTop > nodeBottom + fixedSpacing)) {
        hasOverlap = true;
        // Calculate the amount of overlap
        const overlap = Math.min(
          Math.abs(newNodeBottom - nodeTop),
          Math.abs(newNodeTop - nodeBottom),
        );
        totalOverlap += overlap;
      }
    }

    // If this position has less overlap, use it
    if (totalOverlap < minOverlap) {
      minOverlap = totalOverlap;
      bestY = y;
    }

    // If we found a position with no overlap, use it immediately
    if (!hasOverlap) {
      bestY = y;
      break;
    }
  }

  // If we still have overlap, try to find the largest gap
  if (minOverlap > 0) {
    const gaps: { start: number; end: number }[] = [];
    const firstNode = nodesAtTargetLevel[0];
    const firstNodeHeight = getNodeHeight(firstNode);

    // Add gap before first node
    gaps.push({
      start: avgSourceY - range,
      end: firstNode.position.y - firstNodeHeight / 2 - fixedSpacing,
    });

    // Add gaps between nodes
    for (let i = 0; i < nodesAtTargetLevel.length - 1; i++) {
      const currentNode = nodesAtTargetLevel[i];
      const nextNode = nodesAtTargetLevel[i + 1];
      const currentNodeHeight = getNodeHeight(currentNode);
      const nextNodeHeight = getNodeHeight(nextNode);

      gaps.push({
        start: currentNode.position.y + currentNodeHeight / 2 + fixedSpacing,
        end: nextNode.position.y - nextNodeHeight / 2 - fixedSpacing,
      });
    }

    // Add gap after last node
    const lastNode = nodesAtTargetLevel[nodesAtTargetLevel.length - 1];
    const lastNodeHeight = getNodeHeight(lastNode);
    gaps.push({
      start: lastNode.position.y + lastNodeHeight / 2 + fixedSpacing,
      end: avgSourceY + range,
    });

    // Find the best gap
    let bestGap = { start: 0, end: 0, size: 0, distanceToAvg: Number.POSITIVE_INFINITY };
    for (const gap of gaps) {
      const size = gap.end - gap.start;
      if (size >= fixedSpacing + 320) {
        // Consider minimum space needed for new node
        const gapCenter = (gap.start + gap.end) / 2;
        const distanceToAvg = Math.abs(gapCenter - avgSourceY);
        if (distanceToAvg < bestGap.distanceToAvg) {
          bestGap = { ...gap, size, distanceToAvg };
        }
      }
    }

    if (bestGap.size > 0) {
      bestY = (bestGap.start + bestGap.end) / 2;
    }
  }

  return {
    x: targetX,
    y: bestY,
  };
};

// Get the leftmost bottom position for new nodes
export const getLeftmostBottomPosition = (nodes: Node[], spacing = SPACING): XYPosition => {
  if (nodes.length === 0) {
    return {
      x: SPACING.INITIAL_X,
      y: SPACING.INITIAL_Y,
    };
  }

  // Convert nodes to absolute positions
  const nodesAbsolute = nodes.map((node) => ({
    ...node,
    position: getNodeAbsolutePosition(node, nodes),
  }));

  // Find the leftmost x position among all nodes
  const leftmostX = Math.min(...nodesAbsolute.map((n) => n.position.x));

  // Find all nodes at the leftmost position
  const leftmostNodes = nodesAbsolute
    .filter((n) => Math.abs(n.position.x - leftmostX) < spacing.X / 2)
    .sort((a, b) => a.position.y - b.position.y);

  if (leftmostNodes.length === 0) {
    return {
      x: leftmostX,
      y: SPACING.INITIAL_Y,
    };
  }

  // Find gaps between nodes
  const gaps: { start: number; end: number }[] = [];
  const fixedSpacing = spacing.Y;
  const nodeHeight = 320; // Default node height

  // Add gap before first node
  const firstNode = leftmostNodes[0];
  const firstNodeTop = firstNode.position.y - (firstNode.measured?.height ?? nodeHeight) / 2;
  if (firstNodeTop > SPACING.INITIAL_Y + fixedSpacing + nodeHeight) {
    gaps.push({
      start: SPACING.INITIAL_Y,
      end: firstNodeTop - fixedSpacing,
    });
  }

  // Add gaps between nodes
  for (let i = 0; i < leftmostNodes.length - 1; i++) {
    const currentNode = leftmostNodes[i];
    const nextNode = leftmostNodes[i + 1];
    const currentNodeBottom =
      currentNode.position.y + (currentNode.measured?.height ?? nodeHeight) / 2;
    const nextNodeTop = nextNode.position.y - (nextNode.measured?.height ?? nodeHeight) / 2;

    if (nextNodeTop - currentNodeBottom >= fixedSpacing + nodeHeight) {
      gaps.push({
        start: currentNodeBottom + fixedSpacing,
        end: nextNodeTop - fixedSpacing,
      });
    }
  }

  // Add gap after last node
  const lastNode = leftmostNodes[leftmostNodes.length - 1];
  const lastNodeBottom = lastNode.position.y + (lastNode.measured?.height ?? nodeHeight) / 2;
  gaps.push({
    start: lastNodeBottom + fixedSpacing,
    end: lastNodeBottom + fixedSpacing + nodeHeight,
  });

  // If we found any suitable gaps, use the first one
  if (gaps.length > 0) {
    // Find the first gap that's big enough
    const suitableGap = gaps.find((gap) => gap.end - gap.start >= nodeHeight);
    if (suitableGap) {
      return {
        x: leftmostX,
        y: suitableGap.start + nodeHeight / 2,
      };
    }
  }

  // If no suitable gaps found, place below the last node
  return {
    x: leftmostX,
    y: lastNodeBottom + fixedSpacing + nodeHeight / 2,
  };
};

// Add this helper function before calculateNodePosition
export const getNodeAbsolutePosition = (node: Node, nodes: Node[]): XYPosition => {
  if (!node) {
    return { x: 0, y: 0 };
  }

  if (!node.parentId) {
    return node.position;
  }

  const parent = nodes.find((n) => n.id === node.parentId);
  if (!parent) {
    return node.position;
  }

  const parentPos = getNodeAbsolutePosition(parent, nodes);
  return {
    x: parentPos.x + node.position.x,
    y: parentPos.y + node.position.y,
  };
};
