import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';
import { ActionResult } from '@refly/openapi-schema';
import { persist } from 'zustand/middleware';

interface PollingState {
  notFoundErrorCount: number;
  lastPollTime: number;
  isPolling: boolean;
  version: number;
  timeoutStartTime: number | null;
  lastEventTime: number | null;
}

interface ActionResultState {
  resultMap: Record<string, ActionResult>;
  pollingStateMap: Record<string, PollingState>;

  updateActionResult: (resultId: string, result: ActionResult) => void;
  startPolling: (resultId: string, version: number) => void;
  stopPolling: (resultId: string) => void;
  incrementErrorCount: (resultId: string) => void;
  resetErrorCount: (resultId: string) => void;
  updateLastPollTime: (resultId: string) => void;
  startTimeout: (resultId: string) => void;
  updateLastEventTime: (resultId: string) => void;
  clearTimeout: (resultId: string) => void;
}

export const defaultState = {
  resultMap: {},
  pollingStateMap: {},
};

const POLLING_STATE_INITIAL: PollingState = {
  notFoundErrorCount: 0,
  lastPollTime: 0,
  isPolling: false,
  version: 0,
  timeoutStartTime: null,
  lastEventTime: null,
};

export const useActionResultStore = create<ActionResultState>()(
  persist(
    immer((set) => ({
      ...defaultState,

      updateActionResult: (resultId: string, result: ActionResult) =>
        set((state) => {
          state.resultMap[resultId] = result;
        }),

      startPolling: (resultId: string, version: number) =>
        set((state) => {
          if (!state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId] = { ...POLLING_STATE_INITIAL };
          }
          state.pollingStateMap[resultId].isPolling = true;
          state.pollingStateMap[resultId].version = version;
          state.pollingStateMap[resultId].lastPollTime = Date.now();
        }),

      stopPolling: (resultId: string) =>
        set((state) => {
          if (state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId].isPolling = false;
            state.pollingStateMap[resultId].timeoutStartTime = null;
            state.pollingStateMap[resultId].lastEventTime = null;
          }
        }),

      incrementErrorCount: (resultId: string) =>
        set((state) => {
          if (!state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId] = { ...POLLING_STATE_INITIAL };
          }
          state.pollingStateMap[resultId].notFoundErrorCount += 1;
        }),

      resetErrorCount: (resultId: string) =>
        set((state) => {
          if (state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId].notFoundErrorCount = 0;
          }
        }),

      updateLastPollTime: (resultId: string) =>
        set((state) => {
          if (state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId].lastPollTime = Date.now();
          }
        }),

      startTimeout: (resultId: string) =>
        set((state) => {
          if (!state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId] = { ...POLLING_STATE_INITIAL };
          }
          state.pollingStateMap[resultId].timeoutStartTime = Date.now();
          state.pollingStateMap[resultId].lastEventTime = Date.now();
        }),

      updateLastEventTime: (resultId: string) =>
        set((state) => {
          if (state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId].lastEventTime = Date.now();
          }
        }),

      clearTimeout: (resultId: string) =>
        set((state) => {
          if (state.pollingStateMap[resultId]) {
            state.pollingStateMap[resultId].timeoutStartTime = null;
            state.pollingStateMap[resultId].lastEventTime = null;
          }
        }),
    })),
    {
      name: 'action-result-storage',
      partialize: (state) => ({
        resultMap: state.resultMap,
        pollingStateMap: state.pollingStateMap,
      }),
    },
  ),
);

export const useActionResultStoreShallow = <T>(selector: (state: ActionResultState) => T) => {
  return useActionResultStore(useShallow(selector));
};
