import { create } from 'zustand';
import { CanvasNodeType } from '../requests/types.gen';

interface CanvasNodesState {
  pendingNode: {
    type: CanvasNodeType;
    data: any;
    position: { x: number; y: number };
  } | null;
  setPendingNode: (node: any) => void;
  clearPendingNode: () => void;
}

export const useCanvasNodesStore = create<CanvasNodesState>((set) => ({
  pendingNode: null,
  setPendingNode: (node) => set({ pendingNode: node }),
  clearPendingNode: () => set({ pendingNode: null }),
}));
