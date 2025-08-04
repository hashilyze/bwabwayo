import {create} from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// 신고 등록 시 포함될 이미지 데이터 인터페이스
export interface ReportImage {
    imageUrl: string;
    order: number;
}

// 신고 등록을 위한 데이터 인터페이스
export interface ReportData {
    title: string;
    description: string;
    images: ReportImage[];
}

// 서버에서 조회해온 신고 내역에 포함된 이미지 데이터 인터페이스
export interface FetchedReportImage {
    imageUrl: string;
}

// 서버에서 조회해온 신고 내역 데이터 인터페이스
export interface Report {
    id: number;
    title: string;  
    description: string;
    reply: string | null;
    createdAt: string;
    repliedAt: string | null;
    images: FetchedReportImage[];
}

// 신고 스토어 인터페이스
export interface ReportStore {
    reports: Report[];
    loading: boolean;
    error: string | null;
    addReport: (reportData: ReportData) => Promise<void>;
    getReports: () => Promise<void>;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

export const useReportStore = create<ReportStore>((set, get) => ({
    reports: [],
    loading: false,
    error: null,

    addReport: async (reportData: ReportData) => {
        try{
            // 강화된 AuthStore의 authenticatedFetch 사용
            // 자동 토큰 관리, 갱신, 재시도, 큐 처리 모든 기능 포함! 🚀
            // get이라 수정가능
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/report/save`, {
                method: 'POST',
                body: JSON.stringify(reportData),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('신고가 성공적으로 등록되었습니다:', responseData);
        }
        catch (error) {
            console.error('신고 등록 중 오류 발생:', error);
        }
    },

    getReports: async () => {
        set({ loading: true, error: null });
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/support/report`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // API 응답에서 'reports' 키로 데이터가 온다고 가정합니다.
            const data = await response.json();
            set({ reports: data.reports || [], loading: false });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
            console.error('신고 내역 조회 중 오류 발생:', errorMessage);
            set({ error: errorMessage, loading: false });
        }
    },
}))