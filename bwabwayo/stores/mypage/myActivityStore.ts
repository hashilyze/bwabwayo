import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// 상품 요약 정보 타입 (판매, 구매, 찜 목록에서 공통으로 사용)
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

export interface myPurchaseProduct {
  id: number;
  thumbnail: string;
  title: string;
  price: number;
  deliveryStatus: string | null; // 배송 관련 상태 (예: 배송준비중, 직거래)
  courierName: string | null; // 택배사 이름
  trackingNumber: string | null; // 운송장 번호
  purchaseStatus: number; // 구매 진행 상태 (0, 거래중, 1 구매확정 클리가능, 2 구매확정 완료)
}
export interface mySaleProduct {
  id: number;
  thumbnail: string;
  title: string;
  price: number;
  delivery_status: string;
  saleStatus: number;
}

// 판매자 정보 타입
interface Seller {
  id: string;
  nickname: string;
}

// API에서 내려오는 상품 정보 타입 (상품 + 판매자)
export interface ActivityProduct {
  product: ProductSummary;
  seller: Seller;
}

// API에서 내려오는 구매 상품 정보 타입
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

// API 응답 타입
interface ActivityProductsResponse {
  size: number;
  result: ActivityProduct[];
}

// Zustand 스토어 상태 및 액션 타입
interface MyActivityStore {
  salesList: ActivityProduct[];
  purchaseList: myPurchaseProduct[];
  wishList: ActivityProduct[];
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  fetchPurchases: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api';

export const useMyActivityStore = create<MyActivityStore>((set) => ({
  salesList: [],
  purchaseList: [],
  wishList: [],
  loading: false,
  error: null,

  // 내 판매내역 불러오기
  fetchSales: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/products/my`; // 판매내역 API
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data: ActivityProductsResponse = await response.json();
      if (!response.ok) {
        const errorData  = await response.json();
        throw new Error(errorData.message || '판매 내역을 가져오는데 실패했습니다.'); 
      }
      set({ salesList: data.result, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({ error: errorMessage, loading: false, salesList: [] });
    }
  },

  // 내 구매내역 불러오기 (API 확인 필요)
  fetchPurchases: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/users/orders`; // 구매내역 API
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || '구매 내역을 가져오는데 실패했습니다.');
      }

      // API 응답 데이터를 myPurchaseProduct[] 타입으로 변환
      const formattedPurchases: myPurchaseProduct[] = data.map((item: RawPurchaseProduct) => ({
        id: item.productId, // productId를 id로 매핑
        thumbnail: item.thumbnail,
        title: item.title,
        price: item.price,
        deliveryStatus: item.deliveryStatus,
        courierName: item.courierName,
        trackingNumber: item.trackingNumber,
        purchaseStatus: item.purchaseConfirmStatus, // purchaseConfirmStatus를 purchaseStatus로 매핑
      }));

      set({ purchaseList: formattedPurchases, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({ error: errorMessage, loading: false, purchaseList: [] });
    }
  },

  // 내 찜목록 불러오기 (API 확인 필요)
  fetchWishlist: async () => {
    // ... 찜목록 API 호출 로직 ...
  },
}));

