import { create } from 'zustand'

interface Seller {
  id: number
  nickname: string
}

interface Product {
  id: number
  categoryId: number
  thumbnail: string
  title: string
  price: string
  viewCount: string
  wishCount: string
  isLike: boolean
  saleStatus: number
  canVideoCall: boolean
  createdAt: string
}

export interface ProductWithSeller {
  product: Product
  seller: Seller
}

// 더미데이터
// const dummyProducts = {
//   "message": "판매글 조회 성공",
//   "result": [
//     {
//       "product": {
//         "id": 1,
//         "categoryId": 8001,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "아이폰 15 Pro 팝니다",
//         "price": 1200000,
//         "viewCount": 25,
//         "wishCount": 3,
//         "isLike": true,
//         "saleStatus": "판매중",
//         "saleStatusCode": 1,
//         "canVideoCall": true,
//         "createdAt": "2025-07-30T10:30:00",
//         "chatCount": 0
//       },
//       "seller": {
//         "id": 42,
//         "nickname": "애플매니아"
//       }
//     },
//     {
//       "product": {
//         "id": 2,
//         "category_id": 8005,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "맥북 프로 16인치 M3 맥스",
//         "price": "3500000",
//         "view_count": "18",
//         "wish_count": "7",
//         "is_like": false,
//         "sale_status": 1,
//         "can_video_call": false,
//         "created_at": "2025-01-14T15:20:00"
//       },
//       "seller": {
//         "id": 15,
//         "nickname": "맥북러버"
//       }
//     },
//     {
//       "product": {
//         "id": 3,
//         "category_id": 3001,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "나이키 에어포스1 화이트 280",
//         "price": "120000",
//         "view_count": "42",
//         "wish_count": "12",
//         "is_like": true,
//         "sale_status": 1,
//         "can_video_call": false,
//         "created_at": "2025-01-14T09:15:00"
//       },  
//       "seller": {
//         "id": 23,
//         "nickname": "신발콜렉터"
//       }
//     },
//     {
//       "product": {
//         "id": 4,
//         "category_id": 4001,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "루이비통 네버풀 MM 정품",
//         "price": "850000",
//         "view_count": "31",
//         "wish_count": "8",
//         "is_like": false,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-13T14:45:00"
//       },
//       "seller": {
//         "id": 67,
//         "nickname": "럭셔리샵"
//       }
//     },
//     {
//       "product": {
//         "id": 5,
//         "category_id": 5001,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "롤렉스 서브마리너 블랙",
//         "price": "12000000",
//         "view_count": "89",
//         "wish_count": "25",
//         "is_like": true,
//         "sale_status": 2,
//         "can_video_call": false,
//         "created_at": "2025-01-12T11:30:00"
//       },
//       "seller": {
//         "id": 89,
//         "nickname": "시계전문가"
//       }
//     },
//     {
//       "product": {
//         "id": 6,
//         "category_id": 8006,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "플레이스테이션 5 콘솔",
//         "price": "600000",
//         "view_count": "78",
//         "wish_count": "20",
//         "is_like": false,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-11T08:45:00"
//       },
//       "seller": {
//         "id": 12,
//         "nickname": "게이머"
//       }
//     },
//     {
//       "product": {
//         "id": 7,
//         "category_id": 8007,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "소니 A7R5 미러리스 카메라",
//         "price": "3200000",
//         "view_count": "67",
//         "wish_count": "15",
//         "is_like": true,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-11T13:10:00"
//       },
//       "seller": {
//         "id": 56,
//         "nickname": "사진작가"
//       }
//     },
//     {
//       "product": {
//         "id": 8,
//         "category_id": 8002,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "아이패드 프로 12.9 5세대",
//         "price": "980000",
//         "view_count": "34",
//         "wish_count": "9",
//         "is_like": false,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-10T12:15:00"
//       },
//       "seller": {
//         "id": 45,
//         "nickname": "디지털노마드"
//       }
//     },
//     {
//       "product": {
//         "id": 9,
//         "category_id": 8003,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "갤럭시 S24 울트라 256GB",
//         "price": "1500000",
//         "view_count": "55",
//         "wish_count": "18",
//         "is_like": true,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-09T16:30:00"
//       },
//       "seller": {
//         "id": 78,
//         "nickname": "삼성러버"
//       }
//     },
//     {
//       "product": {
//         "id": 10,
//         "category_id": 3002,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "아디다스 울트라부스트 22",
//         "price": "180000",
//         "view_count": "92",
//         "wish_count": "31",
//         "is_like": false,
//         "sale_status": 1,
//         "can_video_call": false,
//         "created_at": "2025-01-08T11:20:00"
//       },
//       "seller": {
//         "id": 34,
//         "nickname": "운동러버"
//       }
//     },
//     {
//       "product": {
//         "id": 11,
//         "category_id": 4002,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "샤넬 클래식 플랩 백",
//         "price": "8500000",
//         "view_count": "45",
//         "wish_count": "12",
//         "is_like": true,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-07T14:15:00"
//       },
//       "seller": {
//         "id": 91,
//         "nickname": "럭셔리러버"
//       }
//     },
//     {
//       "product": {
//         "id": 12,
//         "category_id": 8008,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "닌텐도 스위치 OLED",
//         "price": "350000",
//         "view_count": "67",
//         "wish_count": "22",
//         "is_like": false,
//         "sale_status": 1,
//         "can_video_call": true,
//         "created_at": "2025-01-06T09:45:00"
//       },
//       "seller": {
//         "id": 28,
//         "nickname": "게임러버"
//       }
//     },
//     {
//       "product": {
//         "id": 13,
//         "category_id": 5002,
//         "thumbnail": "/fe/image/sample.png",
//         "title": "오메가 스피드마스터",
//         "price": "8500000",
//         "view_count": "38",
//         "wish_count": "15",
//         "is_like": true,
//         "sale_status": 1,
//         "can_video_call": false,
//         "created_at": "2025-01-05T13:20:00"
//       },
//       "seller": {
//         "id": 73,
//         "nickname": "시계수집가"
//       }
//     }
//   ]
// }
const productDetail = {
  "product": {
    "id": 1,
    "categoryId": 8001,
    "thumbnail": "/fe/image/sample.png",
    "title": "아이폰 15 Pro 팝니다",
    "price": "1200000",
    "viewCount": "25",
    "wishCount": "3",
    "isLike": true,
    "saleStatus": 1,
    "canVideoCall": true,
    "createdAt": "2025-07-30T10:30:00"
  },
  "seller": {
    "id": 42,
    "nickname": "애플매니아"
  }
}


interface ProductStore {
  product: ProductWithSeller | null
  products: ProductWithSeller[]
  hotKeywordProducts: ProductWithSeller[]
  videoCallProducts: ProductWithSeller[]
  loading: boolean
  error: string | null
  getProducts: (options?: { title?: string; category_id?: number; minPrice?: number; maxPrice?: number }) => Promise<void>
  addProduct: (product: Product) => Promise<void>
  getHotKewordProducts: (title: string) => Promise<void>
  getVideoCallProducts: () => Promise<void>
  getProductDetail: (id: number) => Promise<void>
  clearProducts: () => void
}

export const useProductStore = create<ProductStore>((set) => ({
  product: null,
  products: [],
  hotKeywordProducts: [],
  videoCallProducts: [],
  loading: false,
  error: null,

  getProducts: async (options = {}) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch('https://i13e202.p.ssafy.io/be/api/products')
      if (!response.ok) {
        throw new Error('상품 조회에 실패했습니다')
      }
      const data = await response.json()
      console.log(data.result)
      set({ products:data.result, loading: false })
    } catch (error) {
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      set({ products: [], loading: false })
    }
  },

  // 핫 키워드 상품 조회
  getHotKewordProducts: async (title: string) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`https://i13e202.p.ssafy.io/be/api/products?title=${title}`)
      const data = await response.json()
      const filteredProducts = data.result.filter((item: any) => 
        item.product.title === title
     )
      // console.log(data)

      set({ hotKeywordProducts: filteredProducts, loading: false })
    } catch (error) {
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      set({ hotKeywordProducts: [], loading: false })
    }
  },

  // 화상통화 가능한 상품 조회
  getVideoCallProducts: async () => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`https://i13e202.p.ssafy.io/be/api/products`)
      const data = await response.json()
      const filteredProducts = data.result.filter((item: any) => 
         item.product.canVideoCall === true
      )
      // console.log(filteredProducts)

      set({ videoCallProducts: filteredProducts, loading: false })
    } catch (error) {
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
      set({ videoCallProducts: [], loading: false })
    }
  },

  getProductDetail: async (id: number) => {
    set({ loading: true, error: null })
    
    // 이미 만들어둔 productDetail 더미데이터 사용
    const data = productDetail;
    set({ product: data, loading: false })
    
    // 실제 API 호출 (주석 처리)
    // try {
    //   const response = await fetch(`http://i13e202.p.ssafy.io/be/api/products/${id}`)
    //   const data = await response.json()
    //   set({ product: data, loading: false })
    // } catch(error) {
    //   set({ 
    //     error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
    //     loading: false 
    //   })
    // }
  },

  addProduct: async (product: Product) => {
    set({ loading: true, error: null })
    try {
      const response = await fetch(`https://i13e202.p.ssafy.io/be/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
      })
      
      const data = await response.json()
      console.log('상품 등록 성공:', data)
      set({ loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        loading: false 
      })
      throw error // 호출하는 쪽에서 에러 핸들링할 수 있도록
    }
  },

  clearProducts: () => {
    set({ products: [], loading: false, error: null })
  }
})) 