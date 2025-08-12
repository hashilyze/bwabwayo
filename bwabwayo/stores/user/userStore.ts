import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'

export interface Evaluation {
    description: string;
    item_id: number;
    number: number;
}

interface User {
    nickname: string;
    profileImage: string | null;
    score: number;
    point: number;
    createdAt: string;
    bio: string | null;
    rating: number;
    reviewCount: number;
    evaluation: Evaluation[];
}

interface UserStore {
    user: User | null
    loading: boolean
    error: string | null
    getUser: ( userId: string ) => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    loading: false,
    error: null,

    getUser: async ( userId: string ) => {
        set({ loading: true, error: null });
        try {
            const requestUrl = `${baseUrl}/users/${userId}`
            console.log(`[유저] 다른 유저 정보 요청: GET ${requestUrl}`);
            const response = await useAuthStore.getState().authenticatedFetch(requestUrl)
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || '사용자 정보 조회에 실패했습니다.');
            }

            console.log('📦 [유저] 응답 데이터:', data);
            set({ user: data, loading: false })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '사용자 정보를 불러오는 중 알 수 없는 오류가 발생했습니다.';
            console.error('🔥 [유저] 사용자 정보 조회 실패:', error)
            set({ error: errorMessage, loading: false });
        }
    },
}))

