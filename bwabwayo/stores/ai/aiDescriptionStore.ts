import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// 스토어의 상태와 액션을 정의하는 인터페이스
interface AiDescriptionStore {
    description: string;
    loading: boolean;
    error: string | null;
    fetchDescription: (categoryId: number | string) => Promise<void>;
    setDescription: (description: string) => void;
    reset: () => void;
}

// API 기본 URL
const baseUrl = 'https://i13e202.p.ssafy.io/be/api';

// 스토어의 초기 상태
const initialState = {
    description: '',
    loading: false,
    error: null,
};

// Zustand 스토어 생성
export const useAiDescriptionStore = create<AiDescriptionStore>((set) => ({
    ...initialState,

    /**
     * AI 상품 설명을 생성하기 위해 API를 호출하는 비동기 액션입니다.
     * @param categoryId - 설명을 생성할 상품의 카테고리 ID
     */
    fetchDescription: async (categoryId: number | string) => {
        set({ loading: true, error: null });
        const requestUrl = `${baseUrl}/ai/categories/${categoryId}`;
        console.log(`🤖 AI 템플릿 요청 시작: GET ${requestUrl}`);

        try {
            if (!categoryId) {
                throw new Error('AI 템플릿을 생성하려면 카테고리 ID가 필요합니다.');
            }

            const response = await useAuthStore.getState().authenticatedFetch(requestUrl);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: '서버 응답을 파싱할 수 없습니다.' }));
                console.error('❌ AI 템플릿 응답 실패:', { status: response.status, body: errorData });
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            // API 응답이 { "categoryTemplate": "..." } 형태의 JSON으로 확인되었습니다.
            // 해당 템플릿을 description 상태에 저장합니다.
            const data = await response.json();
            console.log('✅ AI 템플릿 응답 성공:', data);
            set({ description: data.categoryTemplate || '', loading: false });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'AI 템플릿을 불러오는 중 알 수 없는 오류가 발생했습니다.';
            console.error('🔥 AI 설명 생성 중 예외 발생:', error);
            set({ error: errorMessage, loading: false });
        }
    },

    // 사용자가 직접 설명을 수정할 때 호출되는 액션
    setDescription: (description: string) => set({ description }),

    // 스토어 상태를 초기화하는 액션
    reset: () => set(initialState),
}));