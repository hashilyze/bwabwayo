import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://i13e202.p.ssafy.io/be/api';

export interface ReportFromServer {
    id: number;
    title: string;
    imageUrlList: string[];
    targetName: string;
    name: string;
    description: string;
    reply: string | null;
    createdAt: string;
    repliedAt: string | null;
}

export interface Report {
    id: number;
    title: string;
    images: { imageUrl: string }[];
    targetName: string;
    name: string;
    description: string;
    reply: string | null;
    createdAt: string;
    repliedAt: string | null;
}

interface ReportStore {
    reports: Report[];
    loading: boolean;
    error: string | null;
    totalPages: number;
    totalElements: number;
    currentPage: number;
    getReports: (page?: number, size?: number) => Promise<void>;
    addReport: (reportData: Partial<Report>) => Promise<void>;
    reset: () => void;
}

const initialState = {
    reports: [],
    loading: false,
    error: null,
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
};

export const useReportStore = create<ReportStore>((set, get) => ({
    ...initialState,

    getReports: async (page = 0, size = 10) => {
        set({ loading: true, error: null });
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/report/me?page=${page}&size=${size}&sort=createdAt,desc`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            console.log("신고 내역 데이터:", data.content);
            const transformedReports = (data.content || []).map((report: ReportFromServer) => ({
                ...report,
                images: (report.imageUrlList || []).map((url: string) => ({ imageUrl: url })),
            }));
            set({ 
                reports: transformedReports, 
                totalPages: data.totalPages,
                totalElements: data.totalElements,
                currentPage: data.number,
                loading: false 
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('신고 내역 조회 중 오류 발생:', errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },

    addReport: async (reportData: Partial<Report>) => {
        set({ loading: true, error: null });
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reportData),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            // 신고 추가 후 목록 새로고침
            await get().getReports(0, 10);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('신고 추가 중 오류 발생:', errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },

    reset: () => {
        set(initialState);
    },
}));