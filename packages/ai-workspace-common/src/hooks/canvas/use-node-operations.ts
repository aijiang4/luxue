import { useCallback } from 'react';
import { applyNodeChanges, NodeChange } from '@xyflow/react';
import { useCanvasStore, useCanvasStoreShallow } from '../../stores/canvas';
import { useCanvasSync } from './use-canvas-sync';
import { useContextPanelStoreShallow } from '../../stores/context-panel';
import { useCanvasId } from '@refly-packages/ai-workspace-common/hooks/canvas/use-canvas-id';

export const useNodeOperations = () => {
  const canvasId = useCanvasId();
  const { setNodes, removeNodePreview } = useCanvasStoreShallow((state) => ({
    setNodes: state.setNodes,
    removeNodePreview: state.removeNodePreview,
  }));
  const { removeContextItem } = useContextPanelStoreShallow((state) => ({
    removeContextItem: state.removeContextItem,
  }));

  const { throttledSyncNodesToYDoc } = useCanvasSync();

  const updateNodesWithSync = useCallback(
    (updatedNodes: any[]) => {
      setNodes(canvasId, updatedNodes);
      throttledSyncNodesToYDoc(updatedNodes);
    },
    [canvasId, setNodes, throttledSyncNodesToYDoc],
  );

  const onNodesChange = useCallback(
    (changes: NodeChange<any>[]) => {
      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];

      const mutableNodes = nodes.map((node) => ({
        ...node,
        measured: node.measured ? { ...node.measured } : undefined,
      }));

      // Handle deleted nodes
      const deletedNodes = changes.filter((change) => change.type === 'remove');

      if (deletedNodes.length > 0) {
        for (const change of deletedNodes) {
          const nodeId = change.id;
          // Remove from context items and node previews
          removeContextItem(nodeId);
          removeNodePreview(canvasId, nodeId);
        }
      }

      const updatedNodes = applyNodeChanges(changes, mutableNodes);
      updateNodesWithSync(updatedNodes);

      return updatedNodes;
    },
    [canvasId, updateNodesWithSync],
  );

  const setNodeSizeMode = useCallback(
    (nodeId: string, mode: 'compact' | 'adaptive') => {
      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];

      const updatedNodes = nodes.map((node) => {
        if (node.id === nodeId) {
          const newNode = { ...node };
          newNode.data = { ...node.data };
          newNode.data.metadata = { ...(node?.data?.metadata || {}) };

          // Store original width if switching to compact mode
          if (mode === 'compact') {
            newNode.data.metadata.originalWidth =
              newNode.measured?.width || Number.parseInt(newNode.style?.width as string) || 288;

            newNode.style = {
              ...newNode.style,
              width: '288px',
              height: 'auto',
              maxHeight: '384px',
            };
          } else {
            // For adaptive mode, use originalWidth or default width
            const width = newNode.data.metadata.originalWidth || 288;
            newNode.style = {
              ...newNode.style,
              width: `${width}px`,
              height: 'auto',
              maxHeight: undefined,
            };
          }

          newNode.data.metadata.sizeMode = mode;

          console.log('newNode', newNode);
          return newNode;
        }
        return node;
      });

      updateNodesWithSync(updatedNodes);
    },
    [canvasId, updateNodesWithSync],
  );

  const updateAllNodesSizeMode = useCallback(
    (mode: 'compact' | 'adaptive') => {
      const { data } = useCanvasStore.getState();
      const nodes = data[canvasId]?.nodes ?? [];

      const updatedNodes = nodes.map((node) => {
        if (node.data.metadata?.sizeMode === mode) {
          return node;
        }

        const newNode = { ...node };
        newNode.data = { ...node.data };
        newNode.data.metadata = { ...(node?.data?.metadata || {}) };

        if (mode === 'compact') {
          newNode.data.metadata.originalWidth =
            newNode.measured?.width || Number.parseInt(newNode.style?.width as string) || 288;

          newNode.style = {
            ...newNode.style,
            width: '288px',
            height: 'auto',
            maxHeight: '384px',
          };
        } else {
          const width = newNode.data.metadata.originalWidth || 288;
          newNode.style = {
            ...newNode.style,
            width: `${width}px`,
            height: 'auto',
            maxHeight: undefined,
          };
        }

        newNode.data.metadata.sizeMode = mode;
        return newNode;
      });

      updateNodesWithSync(updatedNodes);
    },
    [canvasId, updateNodesWithSync],
  );

  return {
    onNodesChange,
    updateNodesWithSync,
    setNodeSizeMode,
    updateAllNodesSizeMode,
  };
};
