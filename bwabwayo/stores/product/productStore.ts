import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'

interface Seller {
  id: string
  nickname: string
  profileImage?: string | null
  score: number
  rating: number
  bio?: string
  dealcount?: number
  otherProducts?: Product[]
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
  saleStatus?: number
  canVideoCall: boolean
  createdAt?: string
  canNegotiate: boolean
  description: string
  images: string[]
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

// 상품 수정을 위한 데이터 타입
export interface UpdateProductData {
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
  categories: any[]
  chatCount: number
  createdAt: string
  imageKeys: string[]
  imageUrls: string[]
  isLike: boolean
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
  loading: boolean
  error: string | null
  getProducts: (options?: { title?: string; category_id?: number; minPrice?: number; maxPrice?: number }) => Promise<void>
  addProduct: (product: ProductDetail | Product) => Promise<void>
  updateProduct: (productId: number, productData: UpdateProductData) => Promise<any>;
  getHotKewordProducts: (title: string) => Promise<void>
  getVideoCallProducts: () => Promise<void>
  getProductDetail: (id: number) => Promise<void>
  clearProducts: () => void
  getSimilarProducts: (title: number) => Promise<void>
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
  };
}


export const useProductStore = create<ProductStore>((set, get) => ({
  product: null,
  products: [],
  hotKeywordProducts: [],
  videoCallProducts: [],
  similarProducts: [],
  loading: false,
  error: null,

  getProducts: async (options = {}) => {
    set({ loading: true, error: null })
    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      
      if (options.title) {
        queryParams.append('keyword', options.title);
      }
      
      if (options.category_id) {
        queryParams.append('categoryId', options.category_id.toString());
      }
      
      // API URL 구성
      const url = queryParams.toString() 
        ? `${baseUrl}/products?${queryParams.toString()}`
        : `${baseUrl}/products`;
      
      const response = await useAuthStore.getState().authenticatedFetch(url)
      const data = await response.json()
      let filteredProducts = data.result;

      // 가격 필터링
      if (options.minPrice || options.maxPrice) {
        filteredProducts = filteredProducts.filter((item: any) => {
          const price = parseInt(item.product.price);
          const minPrice = options.minPrice || 0;
          const maxPrice = options.maxPrice || Infinity;
          return price >= minPrice && price <= maxPrice;
        });
      }
      set({ products: filteredProducts, loading: false })
    } catch (error) {
      console.error('상품 조회 실패:', error)
      set({ 
        products: [], 
        loading: false, 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' 
      })
    }
  },

  // 핫 키워드 상품 조회
  getHotKewordProducts: async (title: string) => {
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?keyword=${title}`)
      
      const data = await response.json()
      console.log('핫 키워드 상품 조회 성공:', data.result)
      set({ hotKeywordProducts: data.result, loading: false })
    } catch (error) {
      console.error(error)
      set({ hotKeywordProducts: [], loading: false, error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다' })
    }
  },

  // 화상통화 가능한 상품 조회
  getVideoCallProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?canVideoCall=true`)
      const data = await response.json()
      console.log(data.result)

      const filteredProducts = data.result.filter((item: any) => item.product.canVideoCall)
      set({ videoCallProducts: filteredProducts, loading: false })
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

  addProduct: async (product: ProductDetail | Product) => {
    const { authenticatedFetch } = useAuthStore.getState();
    set({ loading: true, error: null })
    try {
      const response = await authenticatedFetch(`${baseUrl}/products`, {
        method: 'POST',
        body: JSON.stringify(product)
      })
      
      const data = await response.json()
      console.log('상품 등록 성공:', data)
      set({ loading: false })
    } catch (error) {
      console.error(error)
    }
  },

  updateProduct: async (productId: number, productData: UpdateProductData) => {
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
  getSimilarProducts: async (title: number) => {
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products?keyword=${title}&sortBy=related`)
      const data = await response.json()
      // console.log('유사 상품 조회:', data.result)
      set({ similarProducts: data.result, loading: false })
    } catch (error) {
      console.error('유사 상품 조회 실패:', error)
    }
  },

  clearProducts: () => {
    set({ products: [], loading: false, error: null })
  }
})) 