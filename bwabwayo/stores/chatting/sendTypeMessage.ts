import { create } from 'zustand'
import { useAuthStore } from '@/stores/auth/authStore'

interface SendTypeMessageStore {
    negotiation: (roomId: number) => Promise<void>
    price: (roomId: number, price: number) => Promise<void>
    invoice: (roomId: number, courier_code: string, tracking_number: string) => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be'

const useSendTypeMessageStore = create<SendTypeMessageStore>((set) => ({
    // 거래 시작
    negotiation: async (roomId: number) => {
        try{
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/api/chatrooms/${roomId}/negotiation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            console.log(response)
        } catch (error) {
            console.error('Failed to send negotiation message', error)
        }
    },

    // 최종 가격 설정
    price: async (roomId: number, price: number) => {
        try{
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/api/chatrooms/${roomId}/price`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ price })
            })
            console.log(response)
        } catch (error) {
            console.error('Failed to send price message', error)
        }
    },

    // 송장번호 입력
    invoice: async (roomId: number, courier_code: string, tracking_number: string) => {
        try{
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/api/chatrooms/${roomId}/invoice`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courier_code, tracking_number })
            })
            console.log(response)
        } catch (error) {
            console.error('Failed to send invoice message', error)
        }
    },


}))

export default useSendTypeMessageStore