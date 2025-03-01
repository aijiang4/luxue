import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import {
  CanvasNode,
  ResponseNodeMeta,
} from '@refly-packages/ai-workspace-common/components/canvas/nodes';

export const useFindThreadHistory = () => {
  const { getNode, getNodes, getEdges } = useReactFlow();

  return useCallback(
    ({ resultId, startNode }: { resultId?: string; startNode?: CanvasNode<ResponseNodeMeta> }) => {
      if (!startNode && !resultId) return [];

      if (!startNode) {
        const nodes = getNodes();
        startNode = nodes.find(
          (node) => node.data?.entityId === resultId,
        ) as CanvasNode<ResponseNodeMeta>;
      }

      if (!startNode || startNode.type !== 'skillResponse') return [];

      const edges = getEdges();
      const targetToSourceMap = new Map(edges.map((edge) => [edge.target, edge.source]));
      const history = [startNode];

      // Helper function to recursively find source nodes
      const findSourceNodes = (nodeId: string, visited = new Set<string>()) => {
        // Prevent infinite loops in case of circular dependencies
        if (visited.has(nodeId)) return;
        visited.add(nodeId);

        const sourceId = targetToSourceMap.get(nodeId);
        const sourceNode = getNode(sourceId);
        if (sourceNode?.type === 'skillResponse') {
          history.push(sourceNode as CanvasNode<ResponseNodeMeta>);
          findSourceNodes(sourceId, visited);
        }
      };

      // Start the recursive search from the start node
      findSourceNodes(startNode.id);

      // Return nodes in reverse order (oldest to newest)
      return history.reverse();
    },
    [getNode, getNodes, getEdges],
  );
};
