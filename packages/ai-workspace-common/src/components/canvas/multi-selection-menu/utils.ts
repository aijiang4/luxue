import { Node } from '@xyflow/react';

// 计算新组的尺寸和位置
export const getNodeDimensions = (node: Node, latestNodes: Node[]) => {
  if (node.type === 'group') {
    // 对于组节点，需要考虑其内部节点的位置
    const groupChildren = latestNodes.filter((n) => n.parentId === node.id);
    if (groupChildren.length > 0) {
      const childPositions = groupChildren.map((child) => ({
        x: node.position.x + child.position.x,
        y: node.position.y + child.position.y,
        width: child.measured?.width ?? child.width ?? 200,
        height: child.measured?.height ?? child.height ?? 100,
      }));

      const left = Math.min(...childPositions.map((p) => p.x));
      const right = Math.max(...childPositions.map((p) => p.x + p.width));
      const top = Math.min(...childPositions.map((p) => p.y));
      const bottom = Math.max(...childPositions.map((p) => p.y + p.height));

      return {
        width: right - left + 40, // 添加一些padding
        height: bottom - top + 40,
      };
    }
    return {
      width: (node.data as any)?.metadata?.width ?? 200,
      height: (node.data as any)?.metadata?.height ?? 100,
    };
  }
  const width = node.measured?.width ?? node.width ?? 200;
  const height = node.measured?.height ?? node.height ?? 100;
  return { width, height };
};

export const calculateGroupBoundaries = (nodesToGroup: Node[], currentNodes: Node[]) => {
  // Calculate boundaries considering parent groups
  const nodeBoundaries = nodesToGroup.map((node) => {
    const { width, height } = getNodeDimensions(node, currentNodes);

    // Calculate absolute position considering parent groups
    let absoluteX = node.position.x;
    let absoluteY = node.position.y;

    // If node has a parent, add parent's position
    if (node.parentId) {
      let parent = currentNodes.find((n) => n.id === node.parentId);
      while (parent) {
        absoluteX += parent.position.x;
        absoluteY += parent.position.y;
        parent = currentNodes.find((n) => n.id === parent.parentId);
      }
    }

    return {
      left: absoluteX,
      right: absoluteX + width,
      top: absoluteY,
      bottom: absoluteY + height,
    };
  });

  const minX = Math.min(...nodeBoundaries.map((b) => b.left));
  const maxX = Math.max(...nodeBoundaries.map((b) => b.right));
  const minY = Math.min(...nodeBoundaries.map((b) => b.top));
  const maxY = Math.max(...nodeBoundaries.map((b) => b.bottom));

  const dimensions = {
    width: maxX - minX,
    height: maxY - minY,
  };

  return { dimensions, minX, minY };
};
