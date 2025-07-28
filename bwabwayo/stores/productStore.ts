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
  getProducts: (options?: { title?: string; category_id?: number; minPrice?: number; maxPrice?: number }) => Promise<void>
  clearProducts: () => void
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  getProducts: async (options = {}) => {
    set({ loading: true, error: null })
    try {
      // URL 파라미터 구성
      const params = new URLSearchParams()
      if (options.title) params.append('title', options.title)
      if (options.category_id) params.append('category_id', options.category_id.toString())
      if (options.minPrice) params.append('minPrice', options.minPrice.toString())

      const queryString = params.toString()
      const url = `/api/products${queryString ? `?${queryString}` : ''}`
      
      // API 호출 주석처리 (실제 사용 시 주석 해제)
      // const response = await fetch(url)
      // if (!response.ok) {
      //   throw new Error('상품 조회에 실패했습니다')
      // }
      // const data = await response.json()
      // set({ products: data, loading: false })
      
      // 더미데이터 필터링 (개발용)
      let filteredProducts = [...dummyProducts]
      
      // title로 필터링
      if (options.title) {
        filteredProducts = filteredProducts.filter(product => 
          product.title.toLowerCase().includes(options.title!.toLowerCase())
        )
      }
      
      // category_id로 필터링
      if (options.category_id) {
        filteredProducts = filteredProducts.filter(product => 
          product.id % options.category_id! === 0 || product.id === options.category_id
        )
      }
      
      // 가격 범위로 필터링
      if (options.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price >= options.minPrice!
        )
      }
      
      if (options.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => 
          product.price <= options.maxPrice!
        )
      }
      
      set({ products: filteredProducts, loading: false })
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