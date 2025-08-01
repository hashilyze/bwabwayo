import { create } from 'zustand'


interface ChatBotMessage {
    message: string
    name: string
    feature: string
    priceRange: string
    advantage: string
}

// 서버에서 오는 실제 응답 전체의 타입 ({ "products": [...] })
interface ChatBotResponse {
    products: ChatBotMessage[];
}

interface ChatBotStore {
    chatBot: ChatBotResponse | null
    loading: boolean
    error: string | null
    getChatBot: (message: string) => Promise<void>
    // clearChatBot 함수를 설계도에 추가합니다.
    clearChatBot: () => void
}

export const useChatBotStore = create<ChatBotStore>((set) => ({
    chatBot: null,
    loading: false,
    error: null,

    getChatBot: async (message: string) => {
        set({ loading: true, error: null })
        try {
            const response = await fetch('https://i13e202.p.ssafy.io/be/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            })
            if (!response.ok) {
                throw new Error('챗봇 조회에 실패했습니다')
            }
            const data: ChatBotResponse = await response.json()
            console.log(data)
            set({ chatBot: data, loading: false })
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
                loading: false 
            })
        }
    },
        // --- 추가된 부분: clearChatBot 함수 구현 ---
    // 이 함수는 chatBot 상태를 다시 초기값(null)으로 되돌립니다.
    clearChatBot: () => {
        set({ chatBot: null, loading: false, error: null  });
    }
}))