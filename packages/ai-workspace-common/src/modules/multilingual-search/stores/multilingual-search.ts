import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { Source, SearchStep } from '@refly/openapi-schema';

export const defaultLocalesMap = {
  en: [
    { code: 'en', name: 'English' },
    { code: 'zh-CN', name: 'Simplified Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh-Hant', name: 'Traditional Chinese' },
    { code: 'fr', name: 'French' },
    { code: 'de-DE', name: 'Standard German' },
    { code: 'ko', name: 'Korean' },
    { code: 'hi', name: 'Hindi' },
    { code: 'es', name: 'Spanish' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'tr', name: 'Turkish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'id', name: 'Indonesian' },
    { code: 'th', name: 'Thai' },
    { code: 'ar', name: 'Arabic' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'fa', name: 'Persian' },
  ],
  'zh-CN': [
    { code: 'en', name: '英语' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'ja', name: '日语' },
    { code: 'zh-Hant', name: '繁体中文' },
    { code: 'fr', name: '法语' },
    { code: 'de-DE', name: '标准德语' },
    { code: 'ko', name: '韩语' },
    { code: 'hi', name: '印地语' },
    { code: 'es', name: '西班牙语' },
    { code: 'ru', name: '俄语' },
    { code: 'de', name: '德语' },
    { code: 'it', name: '意大利语' },
    { code: 'tr', name: '土耳其语' },
    { code: 'pt', name: '葡萄牙语' },
    { code: 'vi', name: '越南语' },
    { code: 'id', name: '印度尼西亚语' },
    { code: 'th', name: '泰语' },
    { code: 'ar', name: '阿拉伯语' },
    { code: 'mn', name: '蒙古语' },
    { code: 'fa', name: '波斯语' },
  ],
};

// 使用英文作为默认值
const defaultLocales = defaultLocalesMap.en;

export type SearchPageState = 'home' | 'results';

const defaultSelectedLocales = ['en', 'zh-CN', 'ja'];

export interface SearchLocale {
  code: string;
  name: string;
}

export interface SearchState {
  query: string;
  searchLocales: SearchLocale[];
  outputLocale: SearchLocale;
  isSearching: boolean;
  searchProgress: number;
  searchSteps: SearchStep[];
  results: Source[];

  selectedItems: Source[];
  setSelectedItems: (items: Source[]) => void;
  toggleSelectedItem: (item: Source, checked: boolean) => void;
  clearSelectedItems: () => void;

  setQuery: (query: string) => void;
  setIsSearching: (isSearching: boolean) => void;
  setSearchLocales: (locales: SearchLocale[]) => void;
  setOutputLocale: (locale: SearchLocale) => void;
  updateProgress: (progress: number) => void;
  addSearchStep: (step: SearchStep) => void;
  setProcessingStep: () => void;
  setResults: (results: Source[]) => void;
  resetSearch: () => void;

  pageState: SearchPageState;
  setPageState: (state: SearchPageState) => void;

  resetAll: () => void;

  clearSearchSteps: () => void;
}

export const useMultilingualSearchStore = create<SearchState>((set) => ({
  query: '',
  searchLocales: defaultLocales.filter((locale) => defaultSelectedLocales.includes(locale.code)),
  outputLocale: { code: '', name: '' },
  isSearching: false,
  searchProgress: 0,
  searchSteps: [],
  results: [],

  selectedItems: [],
  setSelectedItems: (items) => set({ selectedItems: items }),
  toggleSelectedItem: (item, checked) =>
    set((state) => ({
      selectedItems: checked
        ? [...state.selectedItems, item]
        : state.selectedItems.filter((i) => i !== item),
    })),
  clearSelectedItems: () => set({ selectedItems: [] }),

  setQuery: (query) => set({ query }),
  setSearchLocales: (locales) => set({ searchLocales: locales }),
  setOutputLocale: (locale) => set({ outputLocale: locale }),
  setIsSearching: (isSearching) =>
    set((state) => ({
      isSearching,
      searchSteps: isSearching ? [] : state.searchSteps,
      searchProgress: isSearching ? 0 : state.searchProgress,
    })),

  updateProgress: (progress) => set({ searchProgress: progress }),
  addSearchStep: (step) =>
    set((state) => ({
      searchSteps: [...state.searchSteps.filter((s) => s.step !== 'Processing...'), step],
    })),
  setProcessingStep: () =>
    set((state) => ({
      searchSteps: [...state.searchSteps, { step: 'Processing...', duration: 0 }],
    })),
  setResults: (results) =>
    set({
      results,
      isSearching: false,
      searchProgress: 100,
    }),
  resetSearch: () =>
    set({
      query: '',
      isSearching: false,
      searchProgress: 0,
      searchSteps: [],
      results: [],
    }),

  pageState: 'home',
  setPageState: (state) => set({ pageState: state }),

  resetAll: () =>
    set({
      query: '',
      searchLocales: defaultLocales.filter((locale) =>
        defaultSelectedLocales.includes(locale.code),
      ),
      outputLocale: { code: '', name: '' },
      isSearching: false,
      searchProgress: 0,
      searchSteps: [],
      results: [],
      selectedItems: [],
      pageState: 'home',
    }),

  clearSearchSteps: () =>
    set({
      searchSteps: [],
      searchProgress: 0,
    }),
}));

export const useMultilingualSearchStoreShallow = <T>(selector: (state: SearchState) => T) => {
  return useMultilingualSearchStore(useShallow(selector));
};
