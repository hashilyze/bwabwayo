import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// 1. axios 인스턴스 생성
const api = axios.create({
  baseURL: 'https://i13e202.p.ssafy.io', // .env.local 파일에 API 기본 URL을 설정하세요.
  withCredentials: true, // 쿠키 전송을 위해 필요한 설정입니다.
});

// 2. 요청 인터셉터: 모든 요청 헤더에 Access Token을 추가합니다.
api.interceptors.request.use((config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// 3. 응답 인터셉터: 401 에러 발생 시 토큰 갱신을 시도합니다.

// originalRequest에 _retry 프로퍼티를 추가하기 위해 타입 확장
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface FailedRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            return api(originalRequest); // 타입 단언된 config로 재요청
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 자체 API 라우트(/be/api/auth/refresh)를 호출하여 토큰 갱신
        const { data } = await axios.post<{ accessToken: string }>('/be/api/auth/refresh');
        const newAccessToken = data.accessToken;

        localStorage.setItem('accessToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        }
        
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        // refreshError도 AxiosError일 가능성이 높습니다.
        processQueue(refreshError as AxiosError, null);
        
        // 리프레시 실패 시, 저장된 토큰을 지우고 홈페이지로 리디렉션합니다.
        localStorage.removeItem('accessToken');
        // 필요하다면 로그아웃 관련 상태(e.g., Zustand store)도 여기서 초기화합니다.
        const basePath = process.env.NODE_ENV === 'production' ? '/fe' : '';
        window.location.href = `${basePath}/?auth=required`;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;