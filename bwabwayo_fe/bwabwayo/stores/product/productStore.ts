import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'

interface Seller {
  id: string
  nickname: string
  profileImage?: string | null
  score: number
  rating: number
  bio?: string
  dealCount?: number
  otherProducts?: Product[]
  reviewCount?: number | string // 추가
}

interface Product {
  id?: number
  categoryId: number
  thumbnail?: string
  title: string
  price: number
  viewCount?: string
  wishCount?: string
  isLike?: boolean
  canDirect: boolean
  canDelivery: boolean
  shippingFee: number
  saleStatus?: string
  canVideoCall: boolean
  createdAt?: string
  canNegotiate: boolean
  description: string
  images: string[]
  saleStatusCode?: number
  isMine?: boolean
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
  saleStatusCode?: number // 판매상태
  isMine?: boolean; // 내가 등록한 상품인지 여부
  // ... 카드 표시에 필요한 다른 필드가 있다면 추가
}

// 상품 생성/수정을 위한 데이터 타입 (이전 UpdateProductData)
export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  shippingFee: number;
  canNegotiate: boolean;
  canDirect: boolean;
  canDelivery: boolean;
  canVideoCall: boolean;
  categoryId: number;
  images: string[];
}



interface ProductDetail {
  id: number;
  title: string
  description: string
  price: number
  saleStatus: number
  shippingFee: number | null
  canDelivery: boolean
  canDirect: boolean
  canNegotiate: boolean
  canVideoCall: boolean
  categories: { id: number; name: string }[]
  chatCount: number
  createdAt: string
  imageKeys: string[]
  imageUrls: string[]
  isLike: boolean
  isMine: boolean
  seller: Seller
  viewCount: number
  wishCount: number
}

export interface ProductWithSeller {
  product: Product
  seller: Seller
}

interface ProductStore {
  product: ProductDetail | null
  products: ProductWithSeller[]
  hotKeywordProducts: ProductWithSeller[]
  videoCallProducts: ProductWithSeller[]
  similarProducts: ProductWithSeller[]
  totalElements: number;
  totalPages: number;
  newProducts: ProductWithSeller[]
  loading: boolean
  error: string | null
  getProducts: (options?: { 
    keyword?: string; 
    categoryId?: number; 
    minPrice?: number; 
    maxPrice?: number;
    page?: number;
    size?: number;
  }) => Promise<void>
  getNewProducts: (limit?: number, onlySale?: boolean | null) => Promise<void>
  addProduct: (product: ProductFormData) => Promise<number>
  updateProduct: (productId: number, productData: ProductFormData) => Promise<{ success: boolean; message?: string }>;
  getHotKewordProducts: (title: string, onlySale?: boolean | null) => Promise<void>
  getVideoCallProducts: (onlySale?: boolean | null) => Promise<void>
  getProductDetail: (id: number) => Promise<void>
  clearProducts: () => void
  getSimilarProducts: (productId: number) => Promise<void>
  setSimilarProducts: (products: ProductWithSeller[]) => void;
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

// ProductWithSeller -> ProductCardUIData 변환 함수
function adaptProductWithSeller(apiData: ProductWithSeller): ProductCardUIData {
  const { product } = apiData;
  return {
    id: product.id ?? 0, // id 통일
    thumbnail: product.thumbnail ?? '', // thumbnail이 optional이므로 기본값 제공
    title: product.title,
    price: product.price,
    wishCount: Number(product.wishCount ?? 0), // string일 수 있으므로 숫자로 변환
    viewCount: Number(product.viewCount ?? 0),
    isLike: product.isLike ?? false,
    saleStatusCode: product.saleStatusCode,
    isMine: product.isMine ?? false
  };
}


export const useProductStore = create<ProductStore>((set, get) => ({
  product: null,
  products: [],
  hotKeywordProducts: [],
  videoCallProducts: [],
  similarProducts: [],
  totalElements: 0,
  totalPages: 0,
  newProducts: [],
  loading: false,
  error: null,

  getProducts: async (options = {}) => {
    set({ loading: true, error: null })
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      
      // 모든 옵션을 동적으로 처리
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });

      // 정렬 옵션 추가
      queryParams.append('sortBy', 'latest_and_related');
      
      // API URL 구성
      const url = `${baseUrl}/products?${queryParams.toString()}`;
      
      const response = await useAuthStore.getState().authenticatedFetch(url)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '상품 조회에 실패했습니다.');
      }
      
      // 20개만 제한
      // const limitedProducts = data.result.slice(0, 20);
      set({ products: data.result, totalElements: data.totalItems, totalPages: data.totalPages, loading: false })
    } catch (error) {
      console.error('상품 조회 실패:', error)
      set({ 
        products: [], 
        loading: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' 
      })
    }
  },

  // 최신 상품 조회
  getNewProducts: async (limit = 20, onlySale: boolean | null = null) => {
    set({ loading: true, error: null })
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append('sortBy', 'latest');
      
      // onlySale이 null이 아닌 경우에만 쿼리 파라미터에 추가
      if (onlySale !== null) {
        queryParams.append('onlySale', String(onlySale));
      }
      
      // 최신순으로 정렬하여 상품 조회
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?${queryParams.toString()}`)
      const data = await response.json()
      
      if (data.result && Array.isArray(data.result)) {
        // limit 개수만큼 제한
        const limitedProducts = data.result.slice(0, limit);
        set({ newProducts: limitedProducts, loading: false })
        console.log('최신 상품 조회 성공:', limitedProducts.length, '개')
      } else {
        set({ newProducts: [], loading: false })
        console.log('최신 상품 데이터가 없습니다.')
      }
    } catch (error) {
      console.error('최신 상품 조회 실패:', error)
      set({ 
        newProducts: [], 
        loading: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' 
      })
    }
  },

  // 핫 키워드 상품 조회
  getHotKewordProducts: async (title: string, onlySale: boolean | null = null) => {
    set({ loading: true, error: null })
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append('keyword', title);
      
      // onlySale이 null이 아닌 경우에만 쿼리 파라미터에 추가
      if (onlySale !== null) {
        queryParams.append('onlySale', String(onlySale));
      }
      
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?${queryParams.toString()}`)
      
      const data = await response.json()
      console.log('핫 키워드 상품 조회 성공:', data.result)
      
      // 20개만 제한
      const limitedProducts = data.result.slice(0, 20);
      set({ hotKeywordProducts: limitedProducts, loading: false })
    } catch (error) {
      console.error(error)
      set({ hotKeywordProducts: [], loading: false, error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' })
    }
  },

  // 화상통화 가능한 상품 조회
  getVideoCallProducts: async (onlySale: boolean | null = null) => {
    set({ loading: true, error: null })
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append('canVideoCall', 'true');
      
      // onlySale이 null이 아닌 경우에만 쿼리 파라미터에 추가
      if (onlySale !== null) {
        queryParams.append('onlySale', String(onlySale));
      }
      
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?${queryParams.toString()}`)
      const data = await response.json()
      console.log(data.result)

      const filteredProducts = data.result.filter((item: ProductWithSeller) => item.product.canVideoCall)
      
      // 20개만 제한
      const limitedProducts = filteredProducts.slice(0, 20);
      set({ videoCallProducts: limitedProducts, loading: false })
    } catch (error) {
      console.error('화상통화 상품 조회 실패:', error)
      set({ 
        videoCallProducts: [], 
        loading: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' 
      })
    }
  },

  getProductDetail: async (id: number) => {
    set({ loading: true, error: null })
    
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/${id}`)
      const data = await response.json()
      console.log('상품 상세 조회:', data)
      if (data.status === 500) {
        set({ error: data.message, loading: false, product: null })
        return
      }
      // API 응답에 id가 없는 경우, 파라미터로 받은 id를 주입해줍니다.
      // 이렇게 하면 productDetail.id === productId 비교가 정상적으로 동작합니다.
      if (data && typeof data.id === 'undefined') {
        data.id = id;
      }

      set({ product: data, loading: false })
    } catch (error) {
      console.error('상품 상세 조회 실패:', error)
    }
  },

  addProduct: async (product: ProductFormData): Promise<number> => {
    const { authenticatedFetch } = useAuthStore.getState();
    set({ loading: true, error: null })
    try {
      const response = await authenticatedFetch(`${baseUrl}/products`, {
        method: 'POST',
        body: JSON.stringify(product),
      })
      
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '상품 등록에 실패했습니다.');
      }

      console.log('상품 등록 성공:', data)
      set({ loading: false })

      // 백엔드 응답에서 productId를 반환한다고 가정합니다.
      // 실제 필드명 (data.result.id, data.id 등)에 따라 수정해야 합니다.
      const newProductId = data.result?.id ?? data.productId ?? data.id;
      if (newProductId === undefined) {
        throw new Error('API 응답에서 새로 생성된 상품의 ID를 찾을 수 없습니다.');
      }
      return newProductId;
    } catch (error) {
      console.error('상품 등록 실패:', error);
      set({ loading: false, error: error instanceof Error ? error.message : '알 수 없는 오류' });
      throw error;
    }
  },

  updateProduct: async (productId: number, productData: ProductFormData) => {
    set({ loading: true, error: null });
    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const response = await authenticatedFetch(`${baseUrl}/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: '상품 수정에 실패했습니다.' }));
        throw new Error(errorBody.message || '상품 수정에 실패했습니다.');
      }

      const data = await response.json();
      console.log('상품 수정 성공:', data);

      // 수정 성공 후, 현재 보고 있는 상품 상세 정보를 업데이트
      const currentProductDetail = get().product;

      if (currentProductDetail && currentProductDetail.id === productId) {
        get().getProductDetail(productId);
      }

      set({ loading: false });
      return data;
    } catch (error) {
      console.error('상품 수정 실패:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      set({ loading: false, error: errorMessage });
      throw error;
    }
  },

  // 유사 상품 조회
  getSimilarProducts: async (productId: number) => {
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?productId=${productId}&sortBy=related&size=5`)
      const data = await response.json()
      set({ similarProducts: data.result, loading: false })
    } catch (error) {
      console.error('유사 상품 조회 실패:', error)
    }
  },

  setSimilarProducts: (products) => set({ similarProducts: products }),

  clearProducts: () => {
    set({ products: [], loading: false, error: null })
  }
})) 