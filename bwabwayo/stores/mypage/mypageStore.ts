import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

/**
 * 마이페이지에서 사용하는 유저 정보 타입
 */
export interface UserData {
  id: string;
  role: "USER" | "ADMIN";
  nickname: string;
  email: string;
  phoneNumber: string;
  profileImage: string;
  bio: string;
  score: number;
  point: number;
  dealCount: number;
  penaltyCount: number;
  createdAt: string;
  lastLoginAt: string;
  active: boolean;
}

/**
 * 마이페이지 스토어 상태 및 액션
 */
interface MyPageStore {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  reset: () => void;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api';

const initialState = {
  userData: null,
  loading: false,
  error: null,
};

export const useMyPageStore = create<MyPageStore>((set) => ({
  ...initialState,

  fetchUserData: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/users`;
    console.log(`[마이페이지] 유저 정보 요청: GET ${requestUrl}`);

    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || '유저 정보 요청에 실패했습니다.');

      console.log('✅ [마이페이지] 유저 정보 응답 성공:', data);
      set({ userData: data, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '마이페이지 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.';
      console.error('🔥 [마이페이지] 유저 정보 요청 중 예외 발생:', error);
      set({ error: errorMessage, loading: false });
    }
  },

  reset: () => set(initialState),
}));
