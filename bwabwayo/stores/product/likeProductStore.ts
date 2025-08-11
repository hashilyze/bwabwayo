import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'
import { useProductStore } from '@/stores/product/productStore'

export interface LikeProduct {
  id: number
  seller_id: number
  title: string
  price: number
  thumbnail: string
  wishCount: number
  viewCount: number
  isLike: boolean
  status: "판매중" | "판매완료"
}

// 인터페이스를 더 명확하게 리팩토링합니다.
// 불필요한 액션을 제거하고, API 호출 후 상태 동기화를 명확히 합니다.
interface LikeProductStore {
  likeProducts: LikeProduct[]
  loading: boolean
  error: string | null
  
  // 좋아요 추가 후 상태 동기화
  addLike: (productId: number) => Promise<void>
  
  // 좋아요 제거 후 상태 동기화
  removeLike: (productId: number) => Promise<void>
  
  // 좋아요 목록 조회 (상태 동기화의 핵심)
  getLikeProducts: () => Promise<void>
  
  // 특정 상품의 좋아요 상태만 확인 (UI 초기 렌더링용)
  checkLikeStatus: (productId: number) => Promise<boolean>
  
  // 에러 상태 초기화
  clearError: () => void
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

export const useLikeProductStore = create<LikeProductStore>((set, get) => ({
  likeProducts: [],
  loading: false,
  error: null,

  // 좋아요 추가
  addLike: async (productId: number) => {
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes/${productId}`, {
        method: 'POST',
      })

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('좋아요 추가 API 에러 응답:', errorBody);
        throw new Error('좋아요 추가에 실패했습니다')
      }

      // 성공 시, 전체 좋아요 목록을 다시 불러와 상태를 완벽하게 동기화합니다.
      // [해결책] 다른 스토어의 상태를 직접 업데이트하여 UI 동기화
      useProductStore.setState(state => ({
        products: state.products.map(p => 
          p.product.id === productId ? { ...p, product: { ...p.product, isLike: true, wishCount: String(Number(p.product.wishCount) + 1) } } : p
        ),
        hotKeywordProducts: state.hotKeywordProducts.map(p => 
          p.product.id === productId ? { ...p, product: { ...p.product, isLike: true, wishCount: String(Number(p.product.wishCount) + 1) } } : p
        ),
        videoCallProducts: state.videoCallProducts.map(p => 
          p.product.id === productId ? { ...p, product: { ...p.product, isLike: true, wishCount: String(Number(p.product.wishCount) + 1) } } : p
        ),
      }));
      await get().getLikeProducts()

    } catch (error) {
      console.error('좋아요 추가 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '좋아요 추가 중 오류가 발생했습니다';
      set({ loading: false, error: errorMessage })
      throw error // 컴포넌트의 catch 블록에서 처리할 수 있도록 에러를 다시 던집니다.
    }
  },

  // 좋아요 제거
  removeLike: async (productId: number) => {
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('좋아요 제거 API 에러 응답:', errorBody);
        throw new Error('좋아요 제거에 실패했습니다')
      }

      // 성공 시, 전체 좋아요 목록을 다시 불러와 상태를 완벽하게 동기화합니다.
      // 이 방식은 'Unexpected end of JSON input' 에러를 원천적으로 방지합니다.
      // [해결책] 좋아요 제거 시에도 동일하게 상태 동기화
      useProductStore.setState(state => ({
        products: state.products.map(p => 
          p.product.id === productId ? { ...p, product: { ...p.product, isLike: false, wishCount: String(Number(p.product.wishCount) - 1) } } : p
        ),
        hotKeywordProducts: state.hotKeywordProducts.map(p => 
          p.product.id === productId ? { ...p, product: { ...p.product, isLike: false, wishCount: String(Number(p.product.wishCount) - 1) } } : p
        ),
        videoCallProducts: state.videoCallProducts.map(p => 
          p.product.id === productId ? { ...p, product: { ...p.product, isLike: false, wishCount: String(Number(p.product.wishCount) - 1) } } : p
        ),
      }));
      await get().getLikeProducts()

    } catch (error) {
      console.error('좋아요 제거 실패:', error)
      const errorMessage = error instanceof Error ? error.message : '좋아요 제거 중 오류가 발생했습니다';
      set({ loading: false, error: errorMessage })
      throw error
    }
  },

  // 좋아요 목록 조회
  getLikeProducts: async () => {
    // 이 액션은 스토어의 메인 데이터 소스 역할을 합니다.
    set({ loading: true, error: null })
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('좋아요 목록 조회에 실패했습니다')
      }

      const data = await response.json()
      
      set({ 
        likeProducts: data.result || [], 
        loading: false 
      })
    } catch (error) {
      console.error('좋아요 목록 조회 실패:', error)
      set({ 
        likeProducts: [], 
        loading: false, 
        error: error instanceof Error ? error.message : '좋아요 목록 조회 중 오류가 발생했습니다' 
      })
    }
  },

  // 좋아요 상태 확인
  checkLikeStatus: async (productId: number): Promise<boolean> => {
    // 이 함수는 스토어의 loading/error 상태에 영향을 주지 않고, 값만 반환합니다.
    // 컴포넌트의 초기 상태 확인 용도로 적합합니다.
    try {
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes/${productId}/status`, {
        method: 'GET',
      })

      if (!response.ok) {
        console.error(`좋아요 상태 확인 실패 (ID: ${productId}):`, response.status)
        return false
      }

      const data = await response.json()
      return data.result.isLiked || false
    } catch (error) {
      console.error('좋아요 상태 확인 중 예외 발생:', error)
      return false
    }
  },

  // 에러 상태 초기화
  clearError: () => {
    set({ error: null })
  },
}))
