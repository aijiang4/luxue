import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export interface SiderData {
  id: string;
  name: string;
  updatedAt: string;
  type: 'canvas' | 'document' | 'resource';
}

export enum SettingsModalActiveTab {
  Language = 'language',
  Subscription = 'subscription',
  Account = 'account',
}

interface SiderState {
  // state
  collapse: boolean;
  showSiderDrawer: boolean;
  canvasList: SiderData[];
  libraryList: SiderData[];
  showCanvasListModal: boolean;
  showLibraryModal: boolean;
  showSettingModal: boolean;
  settingsModalActiveTab: SettingsModalActiveTab;

  // method
  setCollapse: (val: boolean) => void;
  setShowSiderDrawer: (val: boolean) => void;
  setCanvasList: (val: SiderData[]) => void;
  setLibraryList: (val: SiderData[]) => void;
  setShowCanvasListModal: (val: boolean) => void;
  setShowLibraryModal: (val: boolean) => void;
  setShowSettingModal: (val: boolean) => void;
  setSettingsModalActiveTab: (val: SettingsModalActiveTab) => void;
  updateCanvasTitle: (canvasId: string, title: string) => void;
}

export const useSiderStore = create<SiderState>()(
  devtools((set) => ({
    collapse: false,
    showSiderDrawer: false,
    canvasList: [],
    libraryList: [],
    showLibraryModal: false,
    showCanvasListModal: false,
    showSettingModal: false,
    settingsModalActiveTab: SettingsModalActiveTab.Subscription,

    setCollapse: (val: boolean) => set({ collapse: val }),
    setShowSiderDrawer: (val: boolean) => set({ showSiderDrawer: val }),
    setCanvasList: (val: SiderData[]) => set({ canvasList: val }),
    setLibraryList: (val: SiderData[]) => set({ libraryList: val }),
    setShowCanvasListModal: (val: boolean) => set({ showCanvasListModal: val }),
    setShowLibraryModal: (val: boolean) => set({ showLibraryModal: val }),
    setShowSettingModal: (val: boolean) => set({ showSettingModal: val }),
    setSettingsModalActiveTab: (val: SettingsModalActiveTab) =>
      set({ settingsModalActiveTab: val }),
    updateCanvasTitle: (canvasId: string, title: string) => {
      set((state) => {
        const canvasList = state.canvasList.map((canvas) =>
          canvas.id === canvasId ? { ...canvas, name: title } : canvas,
        );
        return { canvasList };
      });
    },
  })),
);

export const useSiderStoreShallow = <T>(selector: (state: SiderState) => T) => {
  return useSiderStore(useShallow(selector));
};
