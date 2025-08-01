import { create } from 'zustand'
import { useAuthStore } from '../auth/authStore'

interface addRoom{
    message: string
    sellerId: string
    productId: string
}

interface ChatRoomStore{
    addChatRoom: (addRoom: addRoom) => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

export const useChatRoomStore = create<ChatRoomStore>((set, get) => ({
    addChatRoom: async (addRoom: addRoom) => {
        try{
            // 강화된 AuthStore의 authenticatedFetch 사용
            // 자동 토큰 관리, 갱신, 재시도, 큐 처리 모든 기능 포함! 🚀
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/chatrooms`, {
                method: 'POST',
                body: JSON.stringify(addRoom),
            })
            
            if (response.ok) {
                console.log('채팅방 생성 성공')
            } else {
                console.error('채팅방 생성 실패:', response.status)
            }
        }
        catch (error) {
            console.error('Error adding chat room:', error)
        }
    }
}))