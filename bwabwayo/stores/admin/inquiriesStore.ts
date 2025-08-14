import { create } from 'zustand'

interface InquiriesStore {
    inquiries: any[]
    getInquiries: () => void
    addInquiryReply: (inquiryId: number, reply: string) => void
}

const baseUrl = 'https://i13e202.p.ssafy.io/be'

export const useInquiriesStore = create<InquiriesStore>((set, get) => ({
    inquiries: [],
    getInquiries: async () => {
        const res = await fetch(`${baseUrl}/api/support/inquery`, {
            method: 'GET',
        })
        const data = await res.json()
        console.log(data.content)
        set({ inquiries: data.content })
    },

    addInquiryReply: async (inquiryId: number, reply: string) => {
        try {
            const res = await fetch(`${baseUrl}/api/support/inquery/reply`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: inquiryId, reply: reply }),
            })
            console.log('Reply added:', res)
            
            // 답변 추가 후 목록 다시 불러오기
            get().getInquiries()
        } catch (error) {
            console.error('Error adding reply:', error)
        }
    },
}))

