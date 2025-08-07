import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// --- 타입 정의 ---

// 상품 요약 정보 타입
interface ProductSummary {
  id: number;
  categoryId: number;
  thumbnail: string;
  title: string;
  price: number;
  viewCount: number;
  wishCount: number;
  chatCount: number;
  isLike: boolean;
  canVideoCall: boolean;
  saleStatusCode: number;
  saleStatus: string;
  createdAt: string;
}

// 구매 상품 타입
export interface myPurchaseProduct {
  id: number;
  thumbnail: string;
  title: string;
  price: number;
  deliveryStatus: string | null;
  courierName: string | null;
  trackingNumber: string | null;
  purchaseStatus: number;
}

// 판매자 정보 타입
interface Seller {
  id: string;
  nickname: string;
}

// 활동 내역(판매/찜) 상품 타입
export interface ActivityProduct {
  product: ProductSummary;
  seller: Seller;
}

// API에서 오는 구매 상품 원본 타입
interface RawPurchaseProduct {
  saleId: number;
  productId: number;
  thumbnail: string;
  title: string;
  price: number;
  deliveryStatus: string | null;
  courierName: string | null;
  trackingNumber: string | null;
  purchaseConfirmStatus: number;
}

// --- 추가된 부분: 찜 목록 API 응답 타입 ---
interface WishlistApiResponse {
    result: ActivityProduct[];
    // 페이지네이션 관련 다른 필드들...
}


// 스토어 인터페이스
interface MyActivityStore {
  salesList: ActivityProduct[];
  purchaseList: myPurchaseProduct[];
  purchasePage: number;
  purchaseHasMore: boolean;
  wishList: ActivityProduct[];
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  fetchPurchases: (page?: number) => Promise<void>;
  fetchWishlist: () => Promise<void>; // 찜 목록 조회 함수
  resetPurchases: () => void;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api';

export const useMyActivityStore = create<MyActivityStore>((set, get) => ({
  salesList: [],
  purchaseList: [],
  purchasePage: 0,
  purchaseHasMore: true,
  wishList: [],
  loading: false,
  error: null,

  // 내 판매내역 불러오기
  fetchSales: async () => {
    // ... (기존 코드와 동일)
  },

  // 내 구매내역 불러오기
  fetchPurchases: async (page = 0) => {
    // ... (기존 코드와 동일)
  },

  resetPurchases: () => set({
    purchaseList: [],
    purchasePage: 0,
    purchaseHasMore: true,
    error: null,
  }),

  // --- 추가된 부분: 내 찜목록 불러오기 ---
  fetchWishlist: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/products/wishes`;
    try {
        const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || '찜 목록을 가져오는데 실패했습니다.');
        }
        const data: WishlistApiResponse = await response.json();
        set({
            wishList: data.result || [],
            loading: false,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
        set({ error: errorMessage, loading: false, wishList: [] });
    }
  },
}));
