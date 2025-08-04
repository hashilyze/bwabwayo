import { create } from 'zustand'
import { useAuthStore } from '../auth/authStore'

const baseUrl = 'https://i13e202.p.ssafy.io/be/api'

interface UserInfo {
    id: string
    name: string
    email: string
}

interface UserInfoStore {
    userInfo: UserInfo | null
    getUserInfo: () => Promise<void>
}

export const useUserInfoStore = create<UserInfoStore>((set) => ({
    userInfo: null,

    getUserInfo: async () => {
        const { authenticatedFetch } = useAuthStore.getState();
        const response = await authenticatedFetch(`${baseUrl}/users/me`, {
            credentials: 'include',
        })

        const data = await response.json()
        set({ userInfo: data })
    }
}))