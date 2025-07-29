import { create } from 'zustand'


interface ChatBotMessage {
    message: string
    name: string
    feature: string
    priceRange: string
    advantage: string
}

interface ChatBotStore {
    chatBot: ChatBotMessage[]
    loading: boolean
    error: string | null
    getChatBot: (message: string) => Promise<void>
}

export const useChatBotStore = create<ChatBotStore>((set) => ({
    chatBot: [],
    loading: false,
    error: null,

    getChatBot: async (message: string) => {
        set({ loading: true, error: null })
        try {
            const response = await fetch('http://i13e202.p.ssafy.io:8081/api/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message })
            })
            if (!response.ok) {
                throw new Error('챗봇 조회에 실패했습니다')
            }
            const data = await response.json()
            console.log(data)
            set({ chatBot: data, loading: false })
        } catch (error) {
            set({ 
                error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다',
                loading: false 
            })
        }
    }
}))