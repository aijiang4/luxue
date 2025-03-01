import { useCallback } from 'react';
import { Node } from '@xyflow/react';
import { useCanvasStore } from '../../stores/canvas';
import { useGroupNodes } from './use-batch-nodes-selection/use-group-nodes';
import { useNodePosition } from './use-node-position';
import { useNodeOperations } from './use-node-operations';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';

export const useNodeCluster = () => {
  const { canvasId } = useCanvasContext();
  const { createGroupFromSelectedNodes } = useGroupNodes();
  const { layoutBranchAndUpdatePositions } = useNodePosition();
  const { updateNodesWithSync } = useNodeOperations();

  // Helper function to get all target nodes recursively
  const getTargetNodesCluster = useCallback(
    (canvasId: string, nodeIds: string | string[]): Node[] => {
      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];
      const edges = data[canvasId]?.edges ?? [];
      const visited = new Set<string>();
      const cluster: Node[] = [];

      const traverse = (currentId: string) => {
        if (visited.has(currentId)) return;
        visited.add(currentId);

        const node = nodes.find((n) => n.id === currentId);
        if (node) {
          cluster.push(node);
          // Find all target nodes
          for (const edge of edges) {
            if (edge.source === currentId) {
              traverse(edge.target);
            }
          }
        }
      };

      // Support both single nodeId and array of nodeIds
      const sourceNodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
      for (const nodeId of sourceNodeIds) {
        traverse(nodeId);
      }

      return cluster;
    },
    [],
  );

  // Select all target nodes in the cluster
  const selectNodeCluster = useCallback(
    (nodeIds: string | string[]) => {
      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];
      const cluster = getTargetNodesCluster(canvasId, nodeIds);

      const updatedNodes = nodes.map((node) => ({
        ...node,
        selected: cluster.some((n) => n.id === node.id),
      }));

      updateNodesWithSync(updatedNodes);
    },
    [getTargetNodesCluster, updateNodesWithSync, canvasId],
  );

  // Create a group from the node cluster
  const groupNodeCluster = useCallback(
    (nodeIds: string | string[]) => {
      // First select all nodes in the cluster
      selectNodeCluster(nodeIds);
      // Then create a group from the selected nodes
      createGroupFromSelectedNodes();
    },
    [selectNodeCluster, createGroupFromSelectedNodes],
  );

  // Layout the node cluster
  const layoutNodeCluster = useCallback(
    (nodeIds: string | string[]) => {
      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];
      const edges = data[canvasId]?.edges ?? [];

      const sourceNodeIds = Array.isArray(nodeIds) ? nodeIds : [nodeIds];
      const sourceNodes = nodes.filter((node) => sourceNodeIds.includes(node.id));

      layoutBranchAndUpdatePositions(
        sourceNodes,
        nodes,
        edges,
        { fromRoot: true },
        {
          targetNodeId: sourceNodeIds[0],
          needSetCenter: false,
        },
      );
    },
    [layoutBranchAndUpdatePositions, canvasId],
  );

  return {
    selectNodeCluster,
    groupNodeCluster,
    layoutNodeCluster,
  };
};
