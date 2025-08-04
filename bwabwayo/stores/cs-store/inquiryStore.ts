import {create} from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// 문의 내역에 포함된 이미지 데이터 인터페이스
export interface FetchedImage {
    imageUrl: string;
}

// 서버에서 조회해온 문의 내역 데이터 인터페이스
export interface Inquiry {
    id: number;
    title: string;
    description: string;
    reply: string | null;
    createdAt: string;
    repliedAt: string | null;
    images: FetchedImage[];
}

// 문의에 포함될 이미지 데이터 인터페이스
export interface InquiryImage {
    imageUrl: string;
    order: number;
}

// 문의사항 저장을 위한 데이터 인터페이스
export interface InquiryData {
    title: string;
    description: string;
    images: InquiryImage[];
}

// 문의사항 스토어 인터페이스
interface InquiryStore {
    inquiries: Inquiry[];
    loading: boolean;
    error: string | null;
    success: boolean;
    addInquiry: (inquiryData: InquiryData) => Promise<void>;
    getInquiries: () => Promise<void>;
    reset: () => void;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

const initialState = {
    inquiries: [],
    loading: false,
    error: null,
    success: false,
}

export const useInquiryStore = create<InquiryStore>((set, get) => ({
    ...initialState,

    getInquiries: async () => {
        set({ loading: true, error: null });
        try {
            // get이라 수정가능
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/inquery`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            // API 응답에서 'inquiries' 키로 데이터가 온다고 가정합니다.
            const data = await response.json();
            set({ inquiries: data.inquiries || [], loading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('문의 내역 조회 중 오류 발생:', errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },

    addInquiry: async (inquiryData: InquiryData) => {
        set({ loading: true, error: null, success: false });
        try{
            // 강화된 AuthStore의 authenticatedFetch 사용
            // 자동 토큰 관리, 갱신, 재시도, 큐 처리 모든 기능 포함! 🚀
            const serverPayload = {
                title: inquiryData.title,
                description: inquiryData.description,
                imageUrlList: inquiryData.images.map(img => img.imageUrl),
            };

            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/inquery/save`, {
                method: 'POST',
                body: JSON.stringify(serverPayload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('문의가 성공적으로 등록되었습니다:', responseData);
            set({ loading: false, success: true });
            get().getInquiries(); // 새 문의 등록 후 목록을 다시 불러옵니다.
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('문의 등록 중 오류 발생:', errorMessage);
            set({ error: errorMessage, loading: false, success: false });
        }
    },

    reset: () => {
        set(initialState);
    },
}))