import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import { persist } from 'zustand/middleware';

interface LaunchpadState {
  // state
  chatHistoryOpen: boolean;
  recommendQuestionsOpen: boolean;
  showPremiumBanner: boolean;

  // method
  setChatHistoryOpen: (val: boolean) => void;
  setRecommendQuestionsOpen: (val: boolean) => void;
  setShowPremiumBanner: (val: boolean) => void;
}

export const useLaunchpadStore = create<LaunchpadState>()(
  devtools(
    persist(
      (set) => ({
        chatHistoryOpen: true,
        recommendQuestionsOpen: false,
        showPremiumBanner: true,

        setChatHistoryOpen: (open: boolean) => set({ chatHistoryOpen: open }),
        setRecommendQuestionsOpen: (open: boolean) => set({ recommendQuestionsOpen: open }),
        setShowPremiumBanner: (open: boolean) => set({ showPremiumBanner: open }),
      }),
      {
        name: 'launchpad-storage',
        partialize: (state) => ({
          showPremiumBanner: state.showPremiumBanner,
        }),
      },
    ),
  ),
);

export const useLaunchpadStoreShallow = <T>(selector: (state: LaunchpadState) => T) => {
  return useLaunchpadStore(useShallow(selector));
};
