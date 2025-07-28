import { create } from 'zustand'

interface SubCategory {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
  sub: SubCategory[]
}

// 카테고리 더미데이터
const CATEGORIES: Category[] = [
  {
    id: 1,
    name: '여성의류',
    sub: [
      {id: 11, name: '상의'},
      {id: 12, name: '하의'},
      {id: 13, name: '아우터'},
      {id: 14, name: '스웨터'},
    ]
  },
  { 
    id: 2,
    name: '남성의류', 
    sub: [
      {id: 21, name: '상의'},
      {id: 22, name: '하의'},
      {id: 23, name: '아우터'},
    ] 
  },
  { 
    id: 3,
    name: '신발', 
    sub: [
      {id: 31, name: '스니커즈'},
      {id: 32, name: '남성화'},
      {id: 33, name: '여성화'},
      {id: 34, name: '스포츠화'},
    ] 
  },
  { 
    id: 4,
    name: '가방/지갑', 
    sub: [
      {id: 41, name: '가방'},
      {id: 42, name: '지갑'},
    ] 
  },
  { 
    id: 5,
    name: '시계', 
    sub: [] 
  },
  { 
    id: 6,
    name: '쥬얼리', 
    sub: [] 
  },
  { 
    id: 7,
    name: '패션 액세서리', 
    sub: [] 
  },
  { 
    id: 8,
    name: '디지털', 
    sub: [
      {id: 81, name: '모바일'},
      {id: 82, name: 'PC/노트북'},
      {id: 83, name: '카메라'},
    ] 
  },
  { 
    id: 9,
    name: '가전제품', 
    sub: [] 
  },
  { 
    id: 10,
    name: '스포츠/레저', 
    sub: [
      {id: 101, name: '스포츠'},
    ] 
  },
  { 
    id: 11,
    name: '스타굿즈', 
    sub: [] 
  },
  { 
    id: 12,
    name: '키덜트', 
    sub: [] 
  },
  { 
    id: 13,
    name: '예술/희귀/수집품', 
    sub: [] 
  },
  { 
    id: 14,
    name: '음반/악기', 
    sub: [] 
  },
  { 
    id: 15,
    name: '도서/티켓/문구', 
    sub: [] 
  },
  { 
    id: 16,
    name: '뷰티/미용', 
    sub: [] 
  },
  { 
    id: 17,
    name: '생활/주방용품', 
    sub: [] 
  },
  { 
    id: 18,
    name: '식품', 
    sub: [] 
  },
  { 
    id: 19,
    name: '유아/출산', 
    sub: [] 
  },
  { 
    id: 20,
    name: '반려동물용품', 
    sub: [] 
  },
  { 
    id: 21,
    name: '기타', 
    sub: [] 
  },
]

interface CategoryStore {
  categories: Category[]
  loading: boolean
  error: string | null
  getCategories: () => Promise<void>
}

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  getCategories: async () => {
    set({ loading: true, error: null })
    try {
      // API 호출 주석처리
      // const response = await fetch('/api/categories')
      // if (!response.ok) {
      //   throw new Error('카테고리 조회에 실패했습니다')
      // }
      // const data = await response.json()
      
      // 더미데이터 반환
      set({ categories: CATEGORIES, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
        loading: false 
      })
    }
  }
})) 