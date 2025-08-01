import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  checkLoginStatus: () => void;
  login: (accessToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  // 페이지 로드 시 로그인 상태 확인
  checkLoginStatus: () => {
    const token = localStorage.getItem('accessToken');
    set({ isLoggedIn: !!token });
  },
  // 로그인 성공 시 호출
  login: (accessToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    set({ isLoggedIn: true });
  },
  // 로그아웃 시 호출
  logout: () => {
    localStorage.removeItem('accessToken');
    set({ isLoggedIn: false });
  },
}));