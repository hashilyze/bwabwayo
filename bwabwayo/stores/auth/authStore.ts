import { create } from 'zustand'

interface FailedRequest {
  resolve: (value: Response) => void
  reject: (reason?: unknown) => void
  url: string
  options: RequestInit
}

interface AuthStore {
  token: string | null
  isLoggedIn: boolean
  globalToken: string | null  // 전역 토큰 변수 추가
  
  // 토큰 관리
  setToken: (token: string | null) => void
  getToken: () => string | null
  logout: () => void
  
  // 전역 토큰 관리
  setGlobalToken: (token: string | null) => void
  getGlobalToken: () => string | null
  
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
          headers,
          credentials: 'include',
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
  isLoggedIn: false,
  globalToken: null, // 전역 토큰 초기화

  // 토큰 설정
  setToken: (token: string | null) => {
    set({ 
      token,
      isLoggedIn: !!token 
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
          isLoggedIn: true 
        })
        return accessToken
      }
    }
    return null
  },

  // 로그아웃
  logout: () => {
    set({ 
      token: null, 
      isLoggedIn: false,
      globalToken: null  // 전역 토큰도 정리
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('globalToken')  // 전역 토큰도 정리
    }
  },

  // 전역 토큰 설정
  setGlobalToken: (token: string | null) => {
    set({ globalToken: token })
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('globalToken', token)
      } else {
        localStorage.removeItem('globalToken')
      }
    }
  },

  // 전역 토큰 가져오기
  getGlobalToken: () => {
    const { globalToken } = get()
    if (globalToken) return globalToken

    if (typeof window !== 'undefined') {
      const globalAccessToken = localStorage.getItem('globalToken')
      if (globalAccessToken) {
        set({ globalToken: globalAccessToken })
        return globalAccessToken
      }
    }
    return null
  },

  // 앱 시작 시 토큰 초기화
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        set({ 
          token: accessToken,
          isLoggedIn: true 
        })
      }
    }
  },

  // ⭐ 핵심: 고급 인증된 fetch 요청 (토큰 갱신, 재시도, 큐 처리 포함)
  authenticatedFetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const makeRequest = async (requestUrl: string, requestOptions: RequestInit, retry = false): Promise<Response> => {
      console.log('🧪 요청 시작:', requestUrl);
      // 전역 토큰을 우선적으로 사용
      let currentToken = get().getGlobalToken()
      console.log('🔍 전역 토큰 확인:', currentToken)
      
      // 전역 토큰이 없으면 기존 방식 사용
      if (!currentToken) {
        currentToken = get().getToken()
        console.log('🔍 기존 토큰 확인:', currentToken)
      }
      
      console.log('🔐 최종 사용 토큰:', currentToken)
      console.log('🔐 API URL:', requestUrl)
      
      // 토큰 내용 확인 (디버깅용)
      if (currentToken) {
        try {
          const payload = JSON.parse(atob(currentToken.split('.')[1]));
          console.log('📋 토큰 페이로드:', payload);
          console.log('📅 토큰 만료시간:', new Date(payload.exp * 1000));
          console.log('⏰ 현재시간:', new Date());
          console.log('⏰ 토큰 만료여부:', new Date() > new Date(payload.exp * 1000));
        } catch (error) {
          console.error('토큰 디코딩 실패:', error);
        }
      }
      
      // 99년짜리 임시 토큰(실제 사용 시 주석처리)
      // const currentToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1MTI2ODM0Iiwicm9sZSI6IlVTRVIiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTQzMjk4OTEsImV4cCI6MzMyNDY3OTM4OTF9.Ri8aEdsV2_37aZ9As4npi_kBvWv0ccQlUzyKweE4B-opos4h-4Ceb7OO4LQUFJp7'
      
      // 헤더에 토큰 자동 추가
      const headers = new Headers(requestOptions.headers)
      headers.set('Content-Type', 'application/json')
      
      if (currentToken) {
        headers.set('Authorization', `Bearer ${currentToken}`)
        console.log('🔐 Authorization 헤더 설정:', `Bearer ${currentToken.substring(0, 50)}...`)
      } else {
        console.log('⚠️ 토큰이 없어서 Authorization 헤더를 설정하지 않습니다.');
      }
      
      console.log('🔐 전체 헤더:', Object.fromEntries(headers.entries()))
      
      // fetch 요청 실행
      const response = await fetch(requestUrl, {
        ...requestOptions,
        headers,
      })

      // 401 Unauthorized 처리 (토큰 만료)
      if (response.status === 401 && !retry) {
        // 토큰 갱신이 이미 진행 중인 경우 큐에 대기
        console.log('🧪 응답 상태:', response.status);

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
            console.log('🔁 재시도 시 사용되는 토큰:', get().getToken());
          } else {
            // 토큰 갱신 실패
            throw new Error('토큰 갱신 실패')
          }
        } catch (refreshError) {
          // 갱신 실패 시 큐의 모든 요청 실패 처리
          processQueue(refreshError as Error, null)
          
          // 로그아웃 처리
          get().logout()
          
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
      console.log('🧪 응답 상태:', response.status);

    }

    return makeRequest(url, options)
  },
}))