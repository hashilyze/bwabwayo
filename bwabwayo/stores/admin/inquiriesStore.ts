import { create } from 'zustand'

interface InquiriesStore {
    inquiries: []
    getInquiries: () => void
}

const baseUrl = 'https://i13e202.p.ssafy.io/be'

export const useInquiriesStore = create<InquiriesStore>((set) => ({
    inquiries: [],
    getInquiries: async () => {
        const res = await fetch(`${baseUrl}/api/support/inquery`, {
            method: 'GET',
        })
        const data = await res.json()
        console.log(data.content)
        set({ inquiries: data.content })
    },
}))

