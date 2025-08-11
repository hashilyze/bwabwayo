import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

// 상품 요약 정보 타입 
interface ProductSummary {
  id: number;
  productId: number;
  categoryId: number;
  categoryName?: string;
  thumbnail: string;
  title: string;
  price: number;
  viewCount: number;
  wishCount: number;
  chatCount: number;
  isLike?: boolean;
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

// UI를 위한 상품 카드 데이터 타입
export interface ProductCardUIData {
  id: number;
  thumbnail: string;
  title: string;
  price: number;
  wishCount: number;
  viewCount: number;
  isLike: boolean;
  canVideoCall?: boolean; // 화상통화 가능 여부
  createdAt?: string; // 생성일
  // ... 카드 표시에 필요한 다른 필드가 있다면 추가
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

// API 응답 타입 (구매내역 - 페이지네이션)
interface PurchaseProductsResponse {
  content: RawPurchaseProduct[];
  pageable: object;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: object;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

// 찜 목록 받을 데이터
export interface WishlistApiResponse {
  size: number;
  result: ProductSummary[]; // result는 ProductSummary 객체들의 배열입니다.
  currentPage: number;
  startPage: number;
  lastPage: number;
  totalPages: number;
  totalItems: number;
  hasPrev: boolean;
  hasNext: boolean;
}

// API 에러 응답 타입
interface ErrorResponse {
  message: string;
  // code?: string; 와 같이 다른 에러 관련 필드가 있다면 추가할 수 있습니다.
}

// API 응답 타입
interface ActivityProductsResponse {
  size: number;
  result: ActivityProduct[];
}

// Zustand 스토어 상태 및 액션 타입
interface MyActivityStore {
  salesList: ActivityProduct[];
  salesTotalElements: number;
  purchaseList: myPurchaseProduct[];
  purchasePage: number;
  purchaseTotalPages: number;
  purchaseHasMore: boolean;
  wishList: ProductCardUIData[] | null;
  loading: boolean;
  error: string | null;
  fetchSales: () => Promise<void>;
  fetchPurchases: (page?: number) => Promise<void>;
  fetchWishlist: () => Promise<void>;
  resetPurchases: () => void;
}

// ActivityProduct -> ProductCardUIData 변환 함수
function adaptSummaryToCardData(summary: ProductSummary): ProductCardUIData {
  return {
    id: summary.productId, // 상품의 고유 ID를 사용
    thumbnail: summary.thumbnail,
    title: summary.title,
    price: summary.price,
    wishCount: summary.wishCount,
    viewCount: summary.viewCount,
    isLike: true, // 찜 목록이므로 항상 true로 설정
    createdAt: summary.createdAt, // 생성일 추가
  };
}


const baseUrl = 'https://i13e202.p.ssafy.io/be/api';

export const useMyActivityStore = create<MyActivityStore>((set, get) => ({
  salesList: [],
  salesTotalElements: 0,
  purchaseList: [],
  purchasePage: 0,
  purchaseTotalPages: 1,
  purchaseHasMore: true,
  wishList: null,
  loading: false,
  error: null,

  // 내 판매내역 불러오기
  fetchSales: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/products/my`; // 판매내역 API
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data: ActivityProductsResponse | ErrorResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as ErrorResponse).message || '판매 내역을 가져오는데 실패했습니다.');
      }
      const responseData = data as ActivityProductsResponse;
      set({
        salesList: responseData.result,
        salesTotalElements: responseData.size,
        loading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({ error: errorMessage, loading: false, salesList: [], salesTotalElements: 0 });
    }
  },

  // 내 구매내역 불러오기
  fetchPurchases: async (page = 0) => {
    // 이미 로딩 중이거나 더 이상 페이지가 없으면 요청하지 않음
    if (get().loading || (page > 0 && !get().purchaseHasMore)) return;

    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/users/orders?page=${page}&size=10`; // 페이지와 사이즈 파라미터 추가
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      const data: PurchaseProductsResponse | ErrorResponse = await response.json();
      if (!response.ok) {
        throw new Error((data as ErrorResponse).message || '구매 내역을 가져오는데 실패했습니다.');
      }
      const responseData = data as PurchaseProductsResponse;

      // API 응답 데이터를 myPurchaseProduct[] 타입으로 변환
      const formattedPurchases: myPurchaseProduct[] = responseData.content.map((item: RawPurchaseProduct) => ({
        id: item.productId, // productId를 id로 매핑
        thumbnail: item.thumbnail,
        title: item.title,
        price: item.price,
        deliveryStatus: item.deliveryStatus,
        courierName: item.courierName,
        trackingNumber: item.trackingNumber,
        purchaseStatus: item.purchaseConfirmStatus, // purchaseConfirmStatus를 purchaseStatus로 매핑
      }));

      set(state => ({
        purchaseList: page === 0 ? formattedPurchases : [...state.purchaseList, ...formattedPurchases],
        purchasePage: responseData.number,
        purchaseTotalPages: responseData.totalPages,
        purchaseHasMore: !responseData.last,
        loading: false,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({ error: errorMessage, loading: false, purchaseList: [] });
    }
  },

  resetPurchases: () => set({
    purchaseList: [],
    purchasePage: 0,
    purchaseTotalPages: 1,
    purchaseHasMore: true,
    error: null,
  }),

  // 내 찜목록 불러오기 (API 확인 필요)
  fetchWishlist: async () => {
    set({ loading: true, error: null });
    const requestUrl = `${baseUrl}/products/wishes`;
    try {
      const response = await useAuthStore.getState().authenticatedFetch(requestUrl);
      
      if (!response.ok) {
        const errorData: ErrorResponse = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '찜 목록을 가져오는데 실패했습니다.');
      }
      const data: WishlistApiResponse = await response.json();

      console.log('📦 API 응답 데이터:', data);

      const uiReadyWishlist: ProductCardUIData[] = data.result.map(adaptSummaryToCardData);
      console.log('📦 API 응답 원본:', data.result);
      console.log('🧩 UI용으로 변환된 최종 데이터:', uiReadyWishlist);

     set({ wishList: uiReadyWishlist, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
      set({ error: errorMessage, loading: false, wishList: [] }); // 실패 시 빈 배열로 초기화
    }
  },
}));
