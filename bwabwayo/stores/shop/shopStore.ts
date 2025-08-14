import { create } from 'zustand';
import {useAuthStore} from '@/stores/auth/authStore'

export interface Product {
  id: number; // 응답에 존재
  title: string; // 응답에 존재
  price: number; // 응답에 존재
  viewCount: number; // 응답에 존재
  wishCount: number; // 응답에 존재
  chatCount: number; // 응답에 존재
  isLike: boolean; // 응답에 존재
  canVideoCall: boolean; // 응답에 존재
  saleStatus: string; // 응답에 존재 ('판매중'), 타입이 number가 아닌 string
  createdAt: string; // 응답에 존재
  seller: Seller; // 응답의 seller 객체와 매칭
  thumbnail: string; // 응답에 존재, 인터페이스에 추가
  saleStatusCode?: number; // 응답에 존재, 인터페이스에 추가

  // 아래 필드들은 현재 API 리스트 응답에 없으므로 optional로 처리하는 것이 안전합니다.
  description?: string;
  shippingFee?: number | null;
  canDelivery?: boolean;
  canDirect?: boolean;
  canNegotiate?: boolean;
  categories?: any[];
  imageKeys?: string[];
  imageUrls?: string[];
  isMine?: boolean;
}

interface Seller {
  id: string;
  nickname: string;
}

// API 응답의 `result` 배열 내 각 아이템의 타입을 정확히 정의합니다.
interface ApiProductItem {
  product: {
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
  };
  seller: Seller;
}

interface ShopApiResponse { // API 전체 응답 타입
  result: ApiProductItem[];
  totalItems: number;
  totalPages: number;
}

// API 요청 시 사용할 파라미터 타입을 API 명세에 맞게 정의합니다.
interface FetchProductsParams {
  page: number;
  size: number;
  keyword?: string;
  categoryId?: number;
  sortBy?: 'latest' | 'views' | 'wishes' | 'related';
  sellerId?: string;
  canVideoCall?: boolean;
  canNegotiate?: boolean;
  canDirect?: boolean;
  canDelivery?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

interface ShopState {
  products: Product[];
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  // 보다 범용적인 필터링을 위해 함수 이름과 파라미터를 수정합니다.
  fetchProducts: (params: FetchProductsParams) => Promise<void>;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'


export const useShopStore = create<ShopState>((set) => ({
  products: [],
  totalElements: 0,
  totalPages: 0,
  loading: false,
  error: null,
  fetchProducts: async (params: FetchProductsParams) => {
    console.log('[shopStore] fetchProducts 호출됨, 파라미터:', params);
    set({ loading: true, error: null });
    try {
      // API 요청에 사용할 파라미터를 그대로 사용합니다.
      const apiParams = params;

      // 1. URLSearchParams가 undefined 값을 "undefined" 문자열로 변환하는 문제를 피하기 위해
      // 쿼리 문자열을 수동으로 생성합니다.
      const queryString = Object.entries(apiParams)
        .filter(([_, value]) => value !== undefined && value !== null && String(value).length > 0)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      const url = `${baseUrl}/products?${queryString}`;
      console.log('[shopStore] API 요청 URL:', url);

      // 2. authenticatedFetch에는 URL만 전달하거나, 필요 시 RequestInit 옵션을 전달합니다.
      const response = await useAuthStore.getState().authenticatedFetch(url);

      // fetch API는 4xx, 5xx 에러를 throw하지 않으므로, 직접 응답 상태를 확인해야 합니다.
      if (!response.ok) {
        // 서버에서 보낸 에러 메시지를 파싱하려고 시도합니다.
        let errorBody = 'An unknown error occurred';
        try {
          const errorJson = await response.json();
          errorBody = errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
          // 에러 응답이 JSON 형식이 아닐 경우 status text를 사용합니다.
          errorBody = response.statusText;
        }
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const data: ShopApiResponse = await response.json();
      console.log('[shopStore] API 응답 데이터:', data);

      // 응답의 result 배열에서 product와 seller 정보를 조합하여 상태에 맞는 Product 객체로 변환합니다.
      const products: Product[] = data.result.map((item) => ({
        ...item.product, // product 객체의 모든 속성을 복사
        seller: item.seller, // seller 정보를 추가
      }));
      console.log('[shopStore] 상태에 저장될 최종 상품 목록:', products);

      set({ products, totalElements: data.totalItems, totalPages: data.totalPages, loading: false });
    } catch (error: any) {
      console.error('Failed to fetch seller products:', error);
      // API에서 받은 구체적인 에러 메시지를 상태에 저장합니다.
      set({ loading: false, error: error.message || '판매자 상품을 불러오는 데 실패했습니다.' });
    }
  },
}));
