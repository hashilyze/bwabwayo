import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

/**
 * 평가 항목 타입adsadsadsadsasd
 */
export interface Evaluation {
  description: string; // description 추가
  item_id: number;
  number: number;
}

/**
 * 마이페이지에서 사용하는 유저 정보 타입
 */
export interface UserData {
  userId?: string;
  role?: "USER" | "ADMIN";
  nickname: string;
  email?: string;
  phoneNumber?: string;
  profileImage: string | null;
  bio: string;
  score: number;
  point: number;
  dealCount?: number;
  penaltyCount?: number;
  createdAt: string;
  lastLoginAt?: string;
  active?: boolean;
  rating: number;
  evaluation: Evaluation[];
  reviewCount?: number; // 선택적 속성, 필요에 따라 추가
}

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

export const useMyStore = create<MyPageStore>((set) => ({
  ...initialState,

fetchUserData: async () => {
  set({ loading: true, error: null });
  const requestUrl = `${baseUrl}/users`;
  console.log(`[마이페이지] 유저 정보 요청: GET ${requestUrl}`);

  try {
    const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
    const data = await response.json();
    console.log('📦 [마이페이지] 응답 데이터:', data);

    if (!response.ok) throw new Error(data.message || '유저 정보 요청에 실패했습니다.');

    // 응답에 맞춰 매핑
    const userData: UserData = {
      nickname: data.nickname,
      profileImage: data.profileImage,
      score: data.score,
      point: data.point,
      bio: data.bio,
      createdAt: data.created_at,
      rating: data.rating,
      reviewCount: data.reviewCount, // 선택적 속성, 필요에 따라 추가
      evaluation: data.evaluation,
      // userId: data.user_id,
      // dealCount: data.deal_count,
      // penaltyCount: undefined,
      // lastLoginAt: undefined,
      // active: undefined,
    };

      set({ userData, loading: false });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '마이페이지 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.';
    console.error('🔥 [마이페이지] 유저 정보 요청 중 예외 발생:', error);
    set({ error: errorMessage, loading: false });
  }
},

  reset: () => set(initialState),
}));
