import { useCallback } from 'react';
import { useCanvasStore, useCanvasStoreShallow } from '../../stores/canvas';
import { useCanvasContext } from '../../context/canvas';
import { useParams } from 'react-router-dom';
import { CanvasNodeData } from '../../components/canvas/nodes';
import { useCanvasSync } from './use-canvas-sync';
import { CSSProperties } from 'react';

export const useNodeData = () => {
  const { canvasId: contextCanvasId } = useCanvasContext();
  const { canvasId: routeCanvasId } = useParams();
  const { setNodes } = useCanvasStoreShallow((state) => ({
    setNodes: state.setNodes,
  }));

  const { syncNodesToYDoc } = useCanvasSync();

  const setNodeData = useCallback(
    <T = any>(nodeId: string, nodeData: Partial<CanvasNodeData<T>>, selectedCanvasId?: string) => {
      const { data } = useCanvasStore.getState();

      const canvasId = selectedCanvasId ?? contextCanvasId ?? routeCanvasId;
      const currentNodes = data[canvasId]?.nodes ?? [];
      const updatedNodes = currentNodes.map((n) => ({
        ...n,
        data: n.id === nodeId ? { ...n.data, ...nodeData } : n.data,
      }));
      setNodes(canvasId, updatedNodes);
      syncNodesToYDoc(updatedNodes);
    },
    [contextCanvasId, routeCanvasId, setNodes, syncNodesToYDoc],
  );

  const setNodeStyle = useCallback(
    (nodeId: string, style: Partial<CSSProperties>, selectedCanvasId?: string) => {
      const { data } = useCanvasStore.getState();
      const canvasId = selectedCanvasId ?? contextCanvasId ?? routeCanvasId;
      const currentNodes = data[canvasId]?.nodes ?? [];

      const updatedNodes = currentNodes.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            style: {
              ...(n.style ?? {}),
              ...style,
            },
          };
        }
        return n;
      });

      setNodes(canvasId, updatedNodes);
      syncNodesToYDoc(updatedNodes);
    },
    [contextCanvasId, routeCanvasId, setNodes, syncNodesToYDoc],
  );

  return {
    setNodeData,
    setNodeStyle,
  };
};
