import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { Mark } from '@refly/common-types';
import { CanvasNodeType, SelectionKey } from '@refly/openapi-schema';

export interface FilterErrorInfo {
  [key: string]: {
    limit: number;
    currentCount: number;
    required?: boolean;
  };
}

export interface Selection {
  content: string;
  sourceTitle?: string;
  sourceEntityId?: string;
  sourceEntityType?: CanvasNodeType;
}

export interface IContextItem {
  title: string;
  entityId: string;
  type: CanvasNodeType | SelectionKey;
  selection?: Selection;
  metadata?: Record<string, any>;
  isPreview?: boolean; // is preview mode
  isCurrentContext?: boolean;
}

interface ContextPanelState {
  // Canvas selected context items
  contextItems: IContextItem[];

  // selection text
  currentSelectedMark: Mark;
  enableMultiSelect: boolean;

  currentSelectedMarks: Mark[]; // 作为唯一的 context items 来源
  filterErrorInfo: FilterErrorInfo;
  formErrors: Record<string, string>;

  // selected text context 面板相关的内容
  updateCurrentSelectedMark: (mark: Mark) => void;
  updateEnableMultiSelect: (enableMultiSelect: boolean) => void;
  updateCurrentSelectedMarks: (marks: Mark[]) => void;
  updateFilterErrorInfo: (errorInfo: FilterErrorInfo) => void;
  setFormErrors: (errors: Record<string, string>) => void;

  resetState: () => void;

  addContextItem: (item: IContextItem) => void;
  setContextItems: (items: IContextItem[]) => void;
  removeContextItem: (entityId: string) => void;
  clearContextItems: () => void;
  updateContextItem: (item: IContextItem) => void;
}

export const defaultSelectedTextCardState = {
  currentSelectedMark: null as Mark,
  enableMultiSelect: true, // default enable multi select, later to see if we need to enable multiSelect ability
  currentSelectedMarks: [] as Mark[],
  filterErrorInfo: {} as FilterErrorInfo,
  formErrors: {} as Record<string, string>,
};

export const defaultState = {
  contextPanelPopoverVisible: false,
  importPopoverVisible: false,
  contextItems: [],
  checkedKeys: [],
  expandedKeys: [],

  ...defaultSelectedTextCardState,
};

export const useContextPanelStore = create<ContextPanelState>()(
  devtools((set) => ({
    ...defaultState,

    // selected text
    updateCurrentSelectedMark: (mark: Mark) =>
      set((state) => ({ ...state, currentSelectedMark: mark })),
    updateEnableMultiSelect: (enableMultiSelect: boolean) =>
      set((state) => ({ ...state, enableMultiSelect })),
    updateCurrentSelectedMarks: (marks: Mark[]) =>
      set((state) => ({ ...state, currentSelectedMarks: marks })),
    updateFilterErrorInfo: (errorInfo: FilterErrorInfo) =>
      set((state) => ({ ...state, filterErrorInfo: { ...state.filterErrorInfo, ...errorInfo } })),
    setFormErrors: (errors: Record<string, string>) =>
      set((state) => ({ ...state, formErrors: errors })),

    addContextItem: (item: IContextItem) =>
      set((state) => {
        const existingIndex = state.contextItems.findIndex(
          (contextItem) => contextItem.entityId === item.entityId,
        );

        if (existingIndex >= 0) {
          // Update existing item
          const updatedItems = [...state.contextItems];
          updatedItems[existingIndex] = item;
          return {
            ...state,
            contextItems: updatedItems,
          };
        }

        // Add new item to end
        return {
          ...state,
          contextItems: [...state.contextItems, item],
        };
      }),
    setContextItems: (items: IContextItem[]) => set((state) => ({ ...state, contextItems: items })),
    removeContextItem: (entityId: string) =>
      set((state) => ({
        ...state,
        contextItems: state.contextItems.filter((item) => item.entityId !== entityId),
      })),
    clearContextItems: () => set((state) => ({ ...state, contextItems: [] })),
    updateContextItem: (updatedItem: IContextItem) =>
      set((state) => ({
        ...state,
        contextItems: state.contextItems.map((item) =>
          item.entityId === updatedItem.entityId ? { ...item, ...updatedItem } : item,
        ),
      })),

    resetState: () => set((state) => ({ ...state, ...defaultState })),
  })),
);

export const useContextPanelStoreShallow = <T>(selector: (state: ContextPanelState) => T) => {
  return useContextPanelStore(useShallow(selector));
};
