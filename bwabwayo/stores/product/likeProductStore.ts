import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'

interface LikeProduct {
  id: number
  title: string
  price: number
  thumbnail?: string
  isLiked: boolean
}

interface LikeProductStore {
  likeProducts: LikeProduct[]
  loading: boolean
  error: string | null
  
  // 좋아요 추가
  addLike: (productId: number) => Promise<void>
  
  // 좋아요 제거
  removeLike: (productId: number) => Promise<void>
  
  // 좋아요 상태 토글
  toggleLike: (productId: number) => Promise<void>
  
  // 좋아요 목록 조회
  getLikeProducts: () => Promise<void>
  
  // 좋아요 상태 확인
  checkLikeStatus: (productId: number) => Promise<boolean>
  
  // 로컬 상태 관리
  addLikeProduct: (product: LikeProduct) => void
  removeLikeProduct: (productId: number) => void
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
      console.log(`좋아요 추가 시도: 상품 ID ${productId}`)
      
      // 강화된 AuthStore의 authenticatedFetch 사용
      // 자동 토큰 관리, 갱신, 재시도, 큐 처리 모든 기능 포함! 🚀
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('좋아요 추가에 실패했습니다')
      }

      const data = await response.json()
      console.log('좋아요 추가 성공:', data)
      
      set({ loading: false })
    } catch (error) {
      console.error('좋아요 추가 실패:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '좋아요 추가 중 오류가 발생했습니다' 
      })
      throw error
    }
  },

  // 좋아요 제거
  removeLike: async (productId: number) => {
    set({ loading: true, error: null })
    try {
      console.log(`좋아요 제거 시도: 상품 ID ${productId}`)
      
      // 강화된 AuthStore의 authenticatedFetch 사용
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('좋아요 제거에 실패했습니다')
      }

      const data = await response.json()
      console.log('좋아요 제거 성공:', data)
      
      set({ loading: false })
    } catch (error) {
      console.error('좋아요 제거 실패:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '좋아요 제거 중 오류가 발생했습니다' 
      })
      throw error
    }
  },

  // 좋아요 상태 토글
  toggleLike: async (productId: number) => {
    set({ loading: true, error: null })
    try {
      console.log(`좋아요 토글 시도: 상품 ID ${productId}`)
      
      // 현재 좋아요 상태 확인
      const isLiked = get().likeProducts.some(product => product.id === productId)
      
      if (isLiked) {
        // 이미 좋아요가 되어 있으면 제거
        await get().removeLike(productId)
        get().removeLikeProduct(productId)
      } else {
        // 좋아요가 되어 있지 않으면 추가
        await get().addLike(productId)
        // 상품 정보를 가져와서 로컬 상태에 추가
        // 실제로는 상품 정보를 매개변수로 받거나 별도로 조회해야 함
      }
      
      set({ loading: false })
    } catch (error) {
      console.error('좋아요 토글 실패:', error)
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : '좋아요 토글 중 오류가 발생했습니다' 
      })
      throw error
    }
  },

  // 좋아요 목록 조회
  getLikeProducts: async () => {
    set({ loading: true, error: null })
    try {
      console.log('좋아요 목록 조회 시도')
      
      // 강화된 AuthStore의 authenticatedFetch 사용
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('좋아요 목록 조회에 실패했습니다')
      }

      const data = await response.json()
      console.log('좋아요 목록 조회 성공:', data)
      
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
    try {
      console.log(`좋아요 상태 확인: 상품 ID ${productId}`)
      
      // 강화된 AuthStore의 authenticatedFetch 사용
      const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/products/wishes/${productId}/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('좋아요 상태 확인에 실패했습니다')
      }

      const data = await response.json()
      console.log('좋아요 상태 확인 성공:', data)
      
      return data.isLiked || false
    } catch (error) {
      console.error('좋아요 상태 확인 실패:', error)
      return false
    }
  },

  // 로컬 상태 관리
  addLikeProduct: (product: LikeProduct) => {
    set((state) => ({ 
      likeProducts: [...state.likeProducts, product] 
    }))
  },

  removeLikeProduct: (productId: number) => {
    set((state) => ({ 
      likeProducts: state.likeProducts.filter(product => product.id !== productId) 
    }))
  },

  clearError: () => {
    set({ error: null })
  }
}))
