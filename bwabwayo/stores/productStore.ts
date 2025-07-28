import { create } from 'zustand'

interface Product {
  id: number
  seller_id: number
  title: string
  thumbnail: string
  price: number
  wish_count: number
  view_count: number
  is_like: boolean
  status: string
}

// 더미데이터
const dummyProducts: Product[] = [
  {
    id: 1,
    seller_id: 5524,
    title: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    thumbnail: "https://picsum.photos/200/300?random=1",
    price: 70000,
    wish_count: 5,
    view_count: 23,
    is_like: true,
    status: '판매중'
  },
  {
    id: 2,
    seller_id: 2,
    title: "상품2",
    thumbnail: "https://picsum.photos/200/300?random=2",
    price: 30000,
    wish_count: 5,
    view_count: 23,
    is_like: false,
    status: '판매완료'
  },
  {
    id: 3,
    seller_id: 3,
    title: "여성의류 - 상의",
    thumbnail: "https://picsum.photos/200/300?random=3",
    price: 45000,
    wish_count: 12,
    view_count: 45,
    is_like: true,
    status: '판매중'
  },
  {
    id: 4,
    seller_id: 4,
    title: "남성의류 - 하의",
    thumbnail: "https://picsum.photos/200/300?random=4",
    price: 55000,
    wish_count: 8,
    view_count: 32,
    is_like: false,
    status: '판매중'
  },
  {
    id: 5,
    seller_id: 5,
    title: "신발 - 스니커즈",
    thumbnail: "https://picsum.photos/200/300?random=5",
    price: 120000,
    wish_count: 25,
    view_count: 78,
    is_like: true,
    status: '판매중'
  },
  {
    id: 6,
    seller_id: 6,
    title: "가방 - 백팩",
    thumbnail: "https://picsum.photos/200/300?random=6",
    price: 89000,
    wish_count: 15,
    view_count: 56,
    is_like: false,
    status: '판매완료'
  }
]

interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  searchProducts: (query: string) => Promise<void>
  getProductsByCategory: (categoryId: number) => Promise<void>
  clearProducts: () => void
  getAllProducts: () => Promise<void>
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  searchProducts: async (query: string) => {
    set({ loading: true, error: null })
    try {
      // API 호출 주석처리
      // const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
      // if (!response.ok) {
      //   throw new Error('검색에 실패했습니다')
      // }
      // const data = await response.json()
      
      // 더미데이터로 검색 필터링
      const filteredProducts = dummyProducts.filter(product => 
        product.title.toLowerCase().includes(query.toLowerCase())
      )
      
      set({ products: filteredProducts, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        loading: false 
      })
    }
  },

  getProductsByCategory: async (categoryId: number) => {
    set({ loading: true, error: null })
    try {
      // API 호출 주석처리
      // const response = await fetch(`/api/products/category/${categoryId}`)
      // if (!response.ok) {
      //   throw new Error('카테고리 조회에 실패했습니다')
      // }
      // const data = await response.json()
      
      // 더미데이터로 카테고리 필터링 (간단한 예시)
      const categoryProducts = dummyProducts.filter(product => 
        product.id % categoryId === 0 || product.id === categoryId
      )
      
      set({ products: categoryProducts, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        loading: false 
      })
    }
  },

  getAllProducts: async () => {
    set({ loading: true, error: null })
    try {
      // API 호출 주석처리
      // const response = await fetch('/api/products')
      // if (!response.ok) {
      //   throw new Error('상품 조회에 실패했습니다')
      // }
      // const data = await response.json()
      
      // 더미데이터 반환
      set({ products: dummyProducts, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        loading: false 
      })
    }
  },

  clearProducts: () => {
    set({ products: [], loading: false, error: null })
  }
})) 