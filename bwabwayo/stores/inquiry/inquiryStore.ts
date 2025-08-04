// import { create } from 'zustand'
// import { useAuthStore } from '../auth/authStore'

// // 문의글 등록 시 서버로 보낼 데이터 타입
// interface InquiryData {
//   title: string
//   description: string
//   imageUrl: string
//   order: number
// }

// // 문의글 스토어의 상태 및 액션 타입
// interface InquiryState {
//   loading: boolean
//   error: string | null
//   success: boolean
//   saveInquiry: (data: InquiryData) => Promise<void>
//   reset: () => void
// }

// // 스토어의 초기 상태
// const initialState = {
//   loading: false,
//   error: null,
//   success: false,
// }

// export const useInquiryStore = create<InquiryState>((set) => ({
//   ...initialState,

//   /**
//    * 문의글을 서버에 저장하는 함수
//    * @param data - 문의글 데이터 (title, description, imageUrl, order)
//    */
//   saveInquiry: async (data: InquiryData) => {
//     set({ loading: true, error: null, success: false })
//     try {
//       // authStore에서 인증된 fetch 함수를 가져옵니다.
//       const authenticatedFetch = useAuthStore.getState().authenticatedFetch
//       const response = await authenticatedFetch(
//         'https://i13e202.p.ssafy.io/be/api/support/inquiries/save',
//         {
//           method: 'POST',
//           body: JSON.stringify(data),
//         },
//       )

//       if (!response.ok) {
//         // 서버에서 에러 메시지를 포함한 JSON 응답을 보낼 경우를 대비합니다.
//         const errorData = await response.json().catch(() => ({}))
//         throw new Error(errorData.message || '문의글 저장 중 오류가 발생했습니다.')
//       }

//       set({ loading: false, success: true })
//     } catch (error) {
//       set({
//         loading: false,
//         error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
//         success: false,
//       })
//     }
//   },

//   // 스토어 상태를 초기화하는 함수
//   reset: () => {
//     set(initialState)
//   },
// }))

