import { create } from 'zustand'

interface addRoom{
    message: string
    sellerId: string
    productId: string
}

interface ChatRoomStore{
    token: string | null
    setToken: (token: string | null) => void
    getToken: () => string | null
    addChatRoom: (addRoom: addRoom) => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'
export const useChatRoomStore = create<ChatRoomStore>((set, get) => ({
    token: null,
    
    // 토큰 설정
    setToken: (token: string | null) => {
        set({ token })
    },
    
    // 토큰 가져오기 (localStorage에서 자동으로 가져옴)
    getToken: () => {
        const { token } = get()
        if (token) return token
        
        // 토큰이 없으면 localStorage에서 가져오기
        if (typeof window !== 'undefined') {
            const accessToken = localStorage.getItem('accessToken')
            if (accessToken) {
                // 토큰을 store에 저장
                set({ token: accessToken })
                return accessToken
            }
        }
        return null
    },
    
    addChatRoom: async (addRoom: addRoom) => {
        try{
            const currentToken = get().getToken() // Store에서 토큰 가져오기
            
            if (!currentToken) {
                console.error('토큰이 없습니다.')
                return
            }
            
            const response = await fetch(`${baseUrl}/chatrooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentToken}`,
                },
                body: JSON.stringify(addRoom),
            })
            console.log(response)
        }
        catch (error) {
            console.error('Error adding chat room:', error)
        }
    }
}))