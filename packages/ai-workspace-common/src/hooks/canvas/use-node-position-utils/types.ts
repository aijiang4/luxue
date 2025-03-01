import { Node, XYPosition } from '@xyflow/react';
import { CanvasNodeFilter } from '../use-node-selection';

export interface NodeData extends Record<string, unknown> {
  connections?: string[];
}

export interface CalculateNodePositionParams {
  nodes: Node<NodeData>[];
  sourceNodes?: Node<NodeData>[];
  connectTo?: CanvasNodeFilter[];
  defaultPosition?: XYPosition;
  edges?: any[];
}

export interface LayoutBranchOptions {
  fromRoot?: boolean; // 是否从根节点开始布局
}
