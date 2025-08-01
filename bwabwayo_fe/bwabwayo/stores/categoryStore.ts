import { create } from 'zustand'

export interface SubCategory {
  categoryId: number
  categoryName: string
  subCategories: SubCategory[]
}

export interface Category {
  categoryId: number
  categoryName: string
  subCategories: SubCategory[]
}

// 카테고리 더미데이터
const CATEGORIES: Category[] = []

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
      const response = await fetch('https://i13e202.p.ssafy.io/be/api/products/categories')
      if (!response.ok) {
        throw new Error('카테고리 조회에 실패했습니다')
      }
      const data = await response.json()
      // console.log(data)
      const CATEGORIES = data.categories
      // console.log(CATEGORIES)
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