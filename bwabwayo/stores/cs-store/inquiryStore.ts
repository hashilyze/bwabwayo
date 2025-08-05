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

// API에서 직접 받아오는 원시 문의 데이터 타입
interface RawInquiryFromServer {
    id: number;
    title: string;
    description: string;
    reply: string | null;
    createdAt: string;
    repliedAt: string | null;
    imageUrlList?: string[];
    name?: string;
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
    totalPages: number;
    totalElements: number;
    currentPage: number;
    loading: boolean;
    error: string | null;
    success: boolean;
    addInquiry: (inquiryData: InquiryData) => Promise<void>;
    getInquiries: (page?: number, size?: number) => Promise<void>;
    reset: () => void;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

const initialState = {
    inquiries: [],
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    loading: false,
    error: null,
    success: false,
}

export const useInquiryStore = create<InquiryStore>((set, get) => ({
    ...initialState,

    getInquiries: async (page = 0, size = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/inquery?page=${page}&size=${size}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            console.log("data", data.content)
            // API 응답의 imageUrlList (string[])를 FetchedImage[] 형태로 변환합니다.
            const transformedInquiries = (data.content || []).map((inquiry: RawInquiryFromServer) => ({
                ...inquiry,
                images: (inquiry.imageUrlList || []).map((url: string) => ({ imageUrl: url })),
            }));
            set({ 
                inquiries: transformedInquiries, 
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                currentPage: data.number,
                loading: false 
            });
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

            // --- 개선된 부분: 서버 응답이 JSON이 아닐 경우를 대비 ---
            // 서버가 성공 응답으로 JSON이 아닌 텍스트 메시지를 보낼 수 있습니다.
            // 이 경우 .json()을 호출하면 파싱 에러가 발생합니다.
            // 응답 본문을 텍스트로 읽어 간단히 로그만 남깁니다.
            const responseText = await response.text();
            console.log('문의 등록 성공 응답:', responseText);

            set({ loading: false, success: true });
            get().getInquiries(0, 10); // 새 문의 등록 후 목록의 첫 페이지를 다시 불러옵니다.
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