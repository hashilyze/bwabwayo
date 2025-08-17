import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  setLoading: (loading: boolean, text?: string) => void;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  loadingText: '로딩 중...',
  setLoading: (loading: boolean, text = '로딩 중...') => 
    set({ isLoading: loading, loadingText: text }),
  showLoading: (text = '로딩 중...') => 
    set({ isLoading: true, loadingText: text }),
  hideLoading: () => 
    set({ isLoading: false }),
}));
