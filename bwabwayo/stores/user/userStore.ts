import { create } from 'zustand'
import { useAuthStore } from '../auth/authStore'

interface User {
    id: string
    name: string
}

interface UserStore {
    user: User | null
    getUser: ( userId: string ) => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

export const useUserStore = create<UserStore>((set) => ({
    user: null,

    getUser: async ( userId: string ) => {
        try {
            const response = await useAuthStore.getState().authenticatedFetch(`${baseUrl}/users/${userId}`)
            const data = await response.json()
            set({ user: data })
        } catch (error) {
            console.error('사용자 정보 조회 실패:', error)
        }
    },
}))