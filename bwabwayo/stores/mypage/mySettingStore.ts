import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// API 응답에 따른 유저 설정 정보 타입
export interface UserSettingsData {
  nickname: string;
  profileImage: string | null;
  bio: string;
  accountNumber: string | null;
  bankName: string | null;
  accountHolder: string | null;
}
// 타입 정의 추가
export interface ProfileData {
  nickname: string;
  // bio?: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  profileImage?: string | null;
}



interface MyPageSettingStore {
  userData: UserSettingsData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  updateUserProfile: (profileData: ProfileData) => Promise<void>;}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api';

const initialState = {
  userData: null,
  loading: false,
  error: null,
};

export const useMyPageSettingStore = create<MyPageSettingStore>((set) => ({
  ...initialState,

  fetchUserData: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/users/detail`;
    console.log(`[설정] 회원 상세 정보 요청: GET ${requestUrl}`);

    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '회원 상세 정보 요청에 실패했습니다.');
      }

      // 서버에서 받아온 데이터를 콘솔에 출력합니다.
      console.log('✅ [설정] 서버에서 받아온 회원 상세 정보:', data);

      set({ userData: data, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '회원 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.';
      console.error('🔥 [설정] 회원 상세 정보 요청 중 예외 발생:', error);
      set({ error: errorMessage, loading: false });
    }
  },

  updateUserProfile: async (profileData: {
  nickname: string;
  // bio?: string;
  bankName?: string | null;
  accountNumber?: string | null;
  accountHolder?: string | null;
  profileImage?: string | null;
}) => {
  set({ loading: true, error: null });
  const requestUrl = `${baseUrl}/users/detail`;
  console.log(`[설정] 프로필 업데이트 요청: POST ${requestUrl}`);

  try {
    const response = await useAuthStore.getState().authenticatedFetch(requestUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData), // ✅ JSON으로 직렬화
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '프로필 업데이트에 실패했습니다.');
    }

    set({ loading: false, error: null });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '프로필 업데이트 중 알 수 없는 오류가 발생했습니다.';
    console.error('🔥 [설정] 프로필 업데이트 중 예외 발생:', error);
    set({ error: errorMessage, loading: false });
    throw error;
  }
},
}));
