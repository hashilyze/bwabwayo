import { create } from 'zustand'

interface AuthStore {
  token: string | null
  isAuthenticated: boolean
  
  // 토큰 관리
  setToken: (token: string | null) => void
  getToken: () => string | null
  clearToken: () => void
  
  // 자동 토큰 초기화
  initializeAuth: () => void
  
  // 인증된 fetch 요청 (가장 중요!)
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  isAuthenticated: false,

  // 토큰 설정
  setToken: (token: string | null) => {
    set({ 
      token,
      isAuthenticated: !!token 
    })
    
    // localStorage에도 저장
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token)
      } else {
        localStorage.removeItem('accessToken')
      }
    }
  },

  // 토큰 가져오기
  getToken: () => {
    const { token } = get()
    if (token) return token

    // localStorage에서 토큰 가져오기
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        // Store에 저장하고 반환
        set({ 
          token: accessToken,
          isAuthenticated: true 
        })
        return accessToken
      }
    }
    return null
  },

  // 토큰 삭제 (로그아웃)
  clearToken: () => {
    set({ 
      token: null,
      isAuthenticated: false 
    })
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
    }
  },

  // 앱 시작 시 토큰 초기화
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        set({ 
          token: accessToken,
          isAuthenticated: true 
        })
      }
    }
  },

  // ⭐ 핵심: 인증된 fetch 요청
  authenticatedFetch: async (url: string, options: RequestInit = {}) => {
    const currentToken = get().getToken()
    
    // 헤더에 토큰 자동 추가
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    // 토큰이 있으면 Authorization 헤더 추가
    if (currentToken) {
      (headers as any).Authorization = `Bearer ${currentToken}`
    }

    // fetch 요청 실행
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // 401 Unauthorized 처리 (토큰 만료)
    if (response.status === 401) {
      console.warn('토큰이 만료되었습니다. 로그아웃 처리합니다.')
      get().clearToken()
      // 필요시 로그인 페이지로 리다이렉트
      // window.location.href = '/login'
    }

    return response
  },
}))