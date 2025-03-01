import { useCallback } from 'react';
import { Connection, Edge, applyEdgeChanges, EdgeChange } from '@xyflow/react';
import { useCanvasStore, useCanvasStoreShallow } from '../../stores/canvas';
import { genUniqueId } from '@refly-packages/utils/id';
import { useEdgeStyles, getEdgeStyles } from '../../components/canvas/constants';
import { useCanvasSync } from './use-canvas-sync';
import { useCanvasId } from '@refly-packages/ai-workspace-common/hooks/canvas/use-canvas-id';

export const useEdgeOperations = (_selectedCanvasId?: string) => {
  const canvasId = useCanvasId();
  const { setEdges } = useCanvasStoreShallow((state) => ({
    setEdges: state.setEdges,
  }));

  const edgeStyles = useEdgeStyles();
  const { throttledSyncEdgesToYDoc } = useCanvasSync();

  const onEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const { data } = useCanvasStore.getState();
      const edges = data[canvasId]?.edges ?? [];
      const updatedEdges = applyEdgeChanges(changes, edges);
      setEdges(canvasId, updatedEdges);
      throttledSyncEdgesToYDoc(updatedEdges);
    },
    [canvasId, setEdges, throttledSyncEdgesToYDoc],
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params?.source || !params?.target) {
        console.warn('Invalid connection parameters');
        return;
      }

      const newEdge = {
        ...params,
        id: `edge-${genUniqueId()}`,
        animated: false,
        style: edgeStyles.default,
      };

      const { data } = useCanvasStore.getState();
      const edges = data[canvasId]?.edges ?? [];
      const updatedEdges = [...edges, newEdge];
      setEdges(canvasId, updatedEdges);
      throttledSyncEdgesToYDoc(updatedEdges);
    },
    [canvasId, setEdges, edgeStyles, throttledSyncEdgesToYDoc],
  );

  const updateAllEdgesStyle = useCallback(
    (showEdges: boolean) => {
      const { data } = useCanvasStore.getState();
      const edges = data[canvasId]?.edges ?? [];
      const edgeStyles = getEdgeStyles(showEdges);
      const updatedEdges = edges.map((edge) => ({
        ...edge,
        style: edgeStyles.default,
      }));
      setEdges(canvasId, updatedEdges);
      throttledSyncEdgesToYDoc(updatedEdges);
    },
    [canvasId, setEdges, throttledSyncEdgesToYDoc],
  );

  return {
    onEdgesChange,
    onConnect,
    updateAllEdgesStyle,
  };
};
