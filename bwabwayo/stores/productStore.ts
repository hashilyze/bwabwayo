import { create } from 'zustand'

interface Seller {
  id: number
  nickname: string
}

interface Product {
  id: number
  category_id: number
  thumbnail: string
  title: string
  price: string
  view_count: string
  wish_count: string
  is_like: boolean
  sale_status: number
  created_at: string
}

interface ProductWithSeller {
  product: Product
  seller: Seller
}

// 더미데이터
const dummyProducts = {
  "message": "판매글 조회 성공",
  "result": [
    {
      "product": {
        "id": 1,
        "category_id": 8001,
        "thumbnail": "/image/sample.png",
        "title": "아이폰 15 Pro 팝니다",
        "price": "1200000",
        "view_count": "25",
        "wish_count": "3",
        "is_like": true,
        "sale_status": 1,
        "created_at": "2025-07-30T10:30:00"
      },
      "seller": {
        "id": 42,
        "nickname": "애플매니아"
      }
    },
    {
      "product": {
        "id": 2,
        "category_id": 8005,
        "thumbnail": "/image/sample.png",
        "title": "맥북 프로 16인치 M3 맥스",
        "price": "3500000",
        "view_count": "18",
        "wish_count": "7",
        "is_like": false,
        "sale_status": 1,
        "created_at": "2025-01-14T15:20:00"
      },
      "seller": {
        "id": 15,
        "nickname": "맥북러버"
      }
    },
    {
      "product": {
        "id": 3,
        "category_id": 3001,
        "thumbnail": "/image/sample.png",
        "title": "나이키 에어포스1 화이트 280",
        "price": "120000",
        "view_count": "42",
        "wish_count": "12",
        "is_like": true,
        "sale_status": 1,
        "created_at": "2025-01-14T09:15:00"
      },
      "seller": {
        "id": 23,
        "nickname": "신발콜렉터"
      }
    },
    {
      "product": {
        "id": 4,
        "category_id": 4001,
        "thumbnail": "/image/sample.png",
        "title": "루이비통 네버풀 MM 정품",
        "price": "850000",
        "view_count": "31",
        "wish_count": "8",
        "is_like": false,
        "sale_status": 1,
        "created_at": "2025-01-13T14:45:00"
      },
      "seller": {
        "id": 67,
        "nickname": "럭셔리샵"
      }
    },
    {
      "product": {
        "id": 5,
        "category_id": 5001,
        "thumbnail": "/image/sample.png",
        "title": "롤렉스 서브마리너 블랙",
        "price": "12000000",
        "view_count": "89",
        "wish_count": "25",
        "is_like": true,
        "sale_status": 2,
        "created_at": "2025-01-12T11:30:00"
      },
      "seller": {
        "id": 89,
        "nickname": "시계전문가"
      }
    },
    {
      "product": {
        "id": 6,
        "category_id": 8006,
        "thumbnail": "/image/sample.png",
        "title": "플레이스테이션 5 콘솔",
        "price": "600000",
        "view_count": "78",
        "wish_count": "20",
        "is_like": false,
        "sale_status": 1,
        "created_at": "2025-01-11T08:45:00"
      },
      "seller": {
        "id": 12,
        "nickname": "게이머"
      }
    },
    {
      "product": {
        "id": 7,
        "category_id": 8007,
        "thumbnail": "/image/sample.png",
        "title": "소니 A7R5 미러리스 카메라",
        "price": "3200000",
        "view_count": "67",
        "wish_count": "15",
        "is_like": true,
        "sale_status": 1,
        "created_at": "2025-01-11T13:10:00"
      },
      "seller": {
        "id": 56,
        "nickname": "사진작가"
      }
    },
    {
      "product": {
        "id": 8,
        "category_id": 8002,
        "thumbnail": "/image/sample.png",
        "title": "아이패드 프로 12.9 5세대",
        "price": "980000",
        "view_count": "34",
        "wish_count": "9",
        "is_like": false,
        "sale_status": 1,
        "created_at": "2025-01-10T12:15:00"
      },
      "seller": {
        "id": 45,
        "nickname": "디지털노마드"
      }
    }
  ]
}

interface ProductStore {
  products: ProductWithSeller[]
  loading: boolean
  error: string | null
  getProducts: (options?: { title?: string; category_id?: number; minPrice?: number; maxPrice?: number }) => Promise<void>
  addProduct: (product: Product) => Promise<void>
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
      if (options.minPrice) params.append('minPrice', options.minPrice.toString())
      if (options.maxPrice) params.append('maxPrice', options.maxPrice.toString())

      // API 호출 주석처리 (실제 사용 시 주석 해제)
      const queryString = params.toString()
      // const response = await fetch(`http://i13e202.p.ssafy.io:8081/api/products${queryString ? `?${queryString}` : ''}`)
      // if (!response.ok) {
      //   throw new Error('상품 조회에 실패했습니다')
      // }
      // const data = await response.json()
      // set({ products: data.result, loading: false })
      
      // 더미데이터 필터링 (개발용)
      let filteredProducts = [...dummyProducts.result]
      
      // title로 필터링
      if (options.title) {
        filteredProducts = filteredProducts.filter(item => 
          item.product.title.toLowerCase().includes(options.title!.toLowerCase())
        )
      }
      
      // 가격 범위로 필터링
      if (options.minPrice !== undefined) {
        filteredProducts = filteredProducts.filter(item => 
          parseInt(item.product.price) >= options.minPrice!
        )
      }
      if (options.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(item => 
          parseInt(item.product.price) <= options.maxPrice!
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

  getProductDetail: async (productId: number) => {
    // const response = await fetch(`http://i13e202.p.ssafy.io:8081/api/products/${productId}`)
    // const data = await response.json()
    

    // set({ products: data, loading: false })
  },

  addProduct: async (product: Product) => {
    console.log(product)
    // set({ loading: true, error: null })
    // try {
    //   const response = await fetch(`http://i13e202.p.ssafy.io:8081/api/products`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify(product)
    //   })
      
    //   if (!response.ok) {
    //     throw new Error('상품 등록에 실패했습니다')
    //   }
      
    //   const data = await response.json()
    //   console.log('상품 등록 성공:', data)
    //   set({ loading: false })
      
    // } catch (error) {
    //   set({ 
    //     error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
    //     loading: false 
    //   })
    //   throw error // 호출하는 쪽에서 에러 핸들링할 수 있도록
    // }
  },

  clearProducts: () => {
    set({ products: [], loading: false, error: null })
  }
})) 