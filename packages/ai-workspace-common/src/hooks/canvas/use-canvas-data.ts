import { useCanvasStoreShallow } from '../../stores/canvas';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useCanvasContext } from '../../context/canvas';

export const useCanvasData = (selectedCanvasId?: string) => {
  const { canvasId: contextCanvasId } = useCanvasContext();
  const { canvasId: routeCanvasId } = useParams();
  const canvasId = selectedCanvasId ?? contextCanvasId ?? routeCanvasId;

  const { data } = useCanvasStoreShallow((state) => ({
    data: state.data,
  }));

  const nodes = useMemo(() => data[canvasId]?.nodes ?? [], [data, canvasId]);
  const edges = useMemo(() => data[canvasId]?.edges ?? [], [data, canvasId]);

  return {
    nodes,
    edges,
  };
};
