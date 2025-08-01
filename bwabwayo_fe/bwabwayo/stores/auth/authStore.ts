import { create } from 'zustand'

interface FailedRequest {
  resolve: (value: Response) => void
  reject: (reason?: unknown) => void
  url: string
  options: RequestInit
}

interface AuthStore {
  token: string | null
  isAuthenticated: boolean
  
  // 토큰 관리
  setToken: (token: string | null) => void
  getToken: () => string | null
  clearToken: () => void
  
  // 자동 토큰 초기화
  initializeAuth: () => void
  
  // 고급 인증된 fetch 요청 (토큰 갱신, 재시도, 큐 처리 포함)
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
}

// 토큰 갱신 관련 전역 상태
let isRefreshing = false
let failedQueue: FailedRequest[] = []

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(async (request) => {
    if (error) {
      request.reject(error)
    } else {
      try {
        // 새 토큰으로 요청 재시도
        const headers = new Headers(request.options.headers)
        if (token) {
          headers.set('Authorization', `Bearer ${token}`)
        }
        const response = await fetch(request.url, {
          ...request.options,
          headers
        })
        request.resolve(response)
      } catch (retryError) {
        request.reject(retryError)
      }
    }
  })
  failedQueue = []
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

  // ⭐ 핵심: 고급 인증된 fetch 요청 (토큰 갱신, 재시도, 큐 처리 포함)
  authenticatedFetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const makeRequest = async (requestUrl: string, requestOptions: RequestInit, retry = false): Promise<Response> => {

      // const currentToken = get().getToken()
      // 99년짜리 임시 토큰(실제 사용 시 주석처리)
      const currentToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1MTI2ODM0Iiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NTM5NTEzMjgsImV4cCI6MzMyODk5MTUzMjh9.x6QKDSIth4WZtJOqeW5-8ux1z5W2VML-PV119T42p5reHCV9WzALknLjrmD2WFga'
      
      // 헤더에 토큰 자동 추가
      const headers = new Headers(requestOptions.headers)
      headers.set('Content-Type', 'application/json')
      
      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`)
      }

      // fetch 요청 실행
      const response = await fetch(requestUrl, {
        ...requestOptions,
        headers,
      })

      // 401 Unauthorized 처리 (토큰 만료)
      if (response.status === 401 && !retry) {
        // 토큰 갱신이 이미 진행 중인 경우 큐에 대기
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, url: requestUrl, options: requestOptions })
          }) as Promise<Response>
        }

        // 토큰 갱신 시작
        isRefreshing = true

        try {
          // 토큰 갱신 API 호출
          const refreshResponse = await fetch('https://i13e202.p.ssafy.io/be/api/auth/refresh', {
            method: 'POST',
            credentials: 'include', // 쿠키 포함
          })

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json()
            const newAccessToken = refreshData.accessToken

            // 새 토큰 저장
            get().setToken(newAccessToken)
            
            // 큐에 대기 중인 요청들 처리
            processQueue(null, newAccessToken)
            
            // 원래 요청 재시도
            return makeRequest(requestUrl, requestOptions, true)
          } else {
            // 토큰 갱신 실패
            throw new Error('토큰 갱신 실패')
          }
        } catch (refreshError) {
          // 갱신 실패 시 큐의 모든 요청 실패 처리
          processQueue(refreshError as Error, null)
          
          // 로그아웃 처리
          get().clearToken()
          
          // 필요시 로그인 페이지로 리다이렉트
          if (typeof window !== 'undefined') {
            console.warn('토큰 갱신에 실패했습니다. 다시 로그인해주세요.')
            // window.location.href = '/login'
          }
          
          throw refreshError
        } finally {
          isRefreshing = false
        }
      }

      return response
    }

    return makeRequest(url, options)
  },
}))