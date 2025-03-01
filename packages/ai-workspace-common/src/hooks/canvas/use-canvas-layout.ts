import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import Dagre from '@dagrejs/dagre';
import { CanvasNode } from '../../components/canvas/nodes';
import { Edge } from '@xyflow/react';
import { useCanvasStoreShallow } from '../../stores/canvas';
import { useCanvasSync } from './use-canvas-sync';
import { useCanvasContext } from '@refly-packages/ai-workspace-common/context/canvas';

const getLayoutedElements = (
  nodes: CanvasNode<any>[],
  edges: Edge[],
  options: { direction: 'TB' | 'LR' },
) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: options.direction,
    nodesep: 100,
    ranksep: 80,
    marginx: 50,
    marginy: 50,
  });

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }
  for (const node of nodes) {
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width ?? 288,
      height: node.measured?.height ?? 320,
    });
  }

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = g.node(node.id);
      return {
        ...node,
        position: { x: nodeWithPosition.x, y: nodeWithPosition.y },
      };
    }),
    edges,
  };
};

export const useCanvasLayout = () => {
  const { canvasId } = useCanvasContext();
  const { data, setNodes, setEdges } = useCanvasStoreShallow((state) => ({
    data: state.data,
    setNodes: state.setNodes,
    setEdges: state.setEdges,
  }));

  const { syncNodesToYDoc, syncEdgesToYDoc } = useCanvasSync();
  const { fitView } = useReactFlow();

  const onLayout = useCallback(
    (direction: 'TB' | 'LR') => {
      const nodes = data[canvasId]?.nodes ?? [];
      const edges = data[canvasId]?.edges ?? [];
      const layouted = getLayoutedElements(nodes, edges, { direction });

      setNodes(canvasId, layouted.nodes);
      setEdges(canvasId, layouted.edges);
      syncNodesToYDoc(layouted.nodes);
      syncEdgesToYDoc(layouted.edges);

      window.requestAnimationFrame(() => {
        fitView({
          padding: 0.2,
          duration: 200,
          maxZoom: 1,
        });
      });
    },
    [canvasId, fitView, setNodes, setEdges, data, syncNodesToYDoc, syncEdgesToYDoc],
  );

  return {
    onLayout,
  };
};
