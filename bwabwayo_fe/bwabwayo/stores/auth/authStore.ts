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
  isAdmin: boolean  // 관리자 권한 상태 추가
  isSignupRequired: boolean // 회원가입 미완료 상태 추가
  
  // 토큰 관리
  setToken: (token: string | null, signupRequired?: boolean) => void
  getToken: () => string | null
  logout: () => void
  
  // 전역 토큰 관리
  setGlobalToken: (token: string | null) => void
  getGlobalToken: () => string | null
  
  // 관리자 권한 관리
  setAdminStatus: (isAdmin: boolean) => void
  
  // 자동 토큰 초기화
  initializeAuth: () => void
  
  // 고급 인증된 fetch 요청 (토큰 갱신, 재시도, 큐 처리 포함)
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>
  setSignupRequired: (required: boolean) => void // 회원가입 미완료 상태 설정
}

// 토큰 갱신 관련 전역 상태
let isRefreshing = false
let failedQueue: FailedRequest[] = []
let refreshCallbacks: (() => void)[] = [] // 토큰 갱신 성공 시 실행할 콜백들

const processQueue = (error: Error | null, token: string | null) => {
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
  
  // 토큰 갱신 성공 시 등록된 콜백들 실행
  if (token && refreshCallbacks.length > 0) {
    console.log('🔄 토큰 갱신 성공, 등록된 콜백들 실행:', refreshCallbacks.length);
    refreshCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('토큰 갱신 콜백 실행 중 오류:', error);
      }
    });
    refreshCallbacks = []; // 콜백 실행 후 초기화
  }
}

// 토큰 갱신 성공 시 실행할 콜백 등록 함수
export const registerRefreshCallback = (callback: () => void) => {
  refreshCallbacks.push(callback);
};

// 토큰 갱신 콜백 제거 함수
export const unregisterRefreshCallback = (callback: () => void) => {
  const index = refreshCallbacks.indexOf(callback);
  if (index > -1) {
    refreshCallbacks.splice(index, 1);
  }
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  token: null,
  isLoggedIn: false,
  globalToken: null, // 전역 토큰 초기화
  isAdmin: false, // 관리자 권한 초기화
  isSignupRequired: false, // 회원가입 미완료 초기화

  // 토큰 설정
  setToken: (token: string | null, signupRequired: boolean = false) => {
    set({ 
      token,
      isLoggedIn: !!token,
      isSignupRequired: signupRequired // 인자로 받은 값으로 설정
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
    // return "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1MTI2ODM0Iiwicm9sZSI6IlVTRVIiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTQzMjk4OTEsImV4cCI6MzMyNDY3OTM4OTF9.Ri8aEdsV2_37aZ9As4npi_kBvWv0ccQlUzyKweE4B-opos4h-4Ceb7OO4LQUFJp7";
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
      globalToken: null,  // 전역 토큰도 정리
      isAdmin: false,  // 관리자 권한도 정리
      isSignupRequired: false // 로그아웃 시 회원가입 미완료도 초기화
    })
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('globalToken')  // 전역 토큰도 정리
      localStorage.removeItem('isAdmin')  // 관리자 권한도 정리
    }
  },

  // 관리자 권한 설정
  setAdminStatus: (isAdmin: boolean) => {
    set({ isAdmin })
    if (typeof window !== 'undefined') {
      if (isAdmin) {
        localStorage.setItem('isAdmin', 'true')
      } else {
        localStorage.removeItem('isAdmin')
      }
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
      const isAdmin = localStorage.getItem('isAdmin') === 'true'
      if (accessToken) {
        set({ 
          token: accessToken,
          isLoggedIn: true,
          isAdmin
        })
      }
    }
  },

  // ⭐ 핵심: 고급 인증된 fetch 요청 (토큰 갱신, 재시도, 큐 처리 포함)
  authenticatedFetch: async (url: string, options: RequestInit = {}): Promise<Response> => {
    const makeRequest = async (requestUrl: string, requestOptions: RequestInit, retry = false): Promise<Response> => {
      // console.log('🧪 요청 시작:', requestUrl);
      
      // 전역 토큰을 우선적으로 사용
      let currentToken = get().getGlobalToken()
      
      // // 전역 토큰이 없으면 기존 방식 사용
      if (!currentToken) {
        currentToken = get().getToken()
      }
      
      // 99년짜리 임시 토큰(실제 사용 시 주석처리)
      // const currentToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1MTI2ODM0Iiwicm9sZSI6IlVTRVIiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTQzMjk4OTEsImV4cCI6MzMyNDY3OTM4OTF9.Ri8aEdsV2_37aZ9As4npi_kBvWv0ccQlUzyKweE4B-opos4h-4Ceb7OO4LQUFJp7'
      //const currentToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1NDYxNTI2Iiwicm9sZSI6IlVTRVIiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTQ1NTY1OTYsImV4cCI6MzMyNzk3MzczOTZ9.LK3Z3kzpCDmbjyGO9-thdDbwl293_Y3G5ePAtDn6xZ6n6Xy2aYKJgGhTBk-Z9LFM'
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

      // console.log('📡 API 응답 상태:', response.status, response.statusText)
      // console.log('📡 API 응답 URL:', response.url)

      // 500 에러 처리
      if (response.status === 500) {
        console.error('❌ 서버 내부 오류 (500)');
        // 응답 본문을 한 번만 읽기 위해 복사
        const responseClone = response.clone();
        try {
          const errorText = await responseClone.text();
          console.error('❌ 서버 에러 내용:', errorText);
        } catch (error) {
          console.error('❌ 에러 내용 읽기 실패:', error);
        }
        // 원본 응답을 그대로 반환
        return response;
      }

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
            console.log('🔄 토큰 갱신 응답:', refreshData);

            // 새 토큰 저장
            get().setToken(newAccessToken);
            // 만약 전역 토큰이 사용되고 있었다면, 그것이 만료되었을 가능성이 높으므로 함께 갱신합니다.
            if (get().getGlobalToken()) {
              get().setGlobalToken(newAccessToken);
            }
            
            // 큐에 대기 중인 요청들 처리
            processQueue(null, newAccessToken)
            
            // 원래 요청 재시도
            console.log('🔁 재시도 시 사용되는 토큰:', get().getToken());
            return makeRequest(requestUrl, requestOptions, true)
          } else {
            // 토큰 갱신 실패
            throw new Error('토큰 갱신 실패')
          }
        } catch (refreshError) {
          
          
          // 갱신 실패 시 큐의 모든 요청 실패 처리
          processQueue(refreshError as Error, null)
          
          // 로그아웃 처리
          get().logout()
          
          // 필요시 홈페이지로 리다이렉트하고 로그인 모달을 띄우도록 함
          if (typeof window !== 'undefined') {
            console.warn('토큰 갱신에 실패했습니다. 다시 로그인해주세요.')
            const basePath = process.env.NODE_ENV === 'production' ? '/fe' : '';
            window.location.href = `${basePath}/?auth=required`
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
  setSignupRequired: (required: boolean) => set({ isSignupRequired: required }),
}))