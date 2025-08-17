import { create } from 'zustand'

interface ReportStore {
  reports: []
  getReports: () => Promise<void>
  addReportReply: (id: number, reply: string, penalizable: boolean) => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be'

export const useReportStore = create<ReportStore>((set) => ({
  reports: [],
  getReports: async () => {
    const response = await fetch(`${baseUrl}/api/support/report`)
    const data = await response.json()
    set({ reports: data.content })
  },

  addReportReply: async (id: number, reply: string, penalizable: boolean) => {
    const response = await fetch(`${baseUrl}/api/support/report/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, reply, penalizable }),
    })
    
    if (response.ok) {
      // 답변 추가 후 목록 새로고침
      const data = await fetch(`${baseUrl}/api/support/report`)
      const newData = await data.json()
      set({ reports: newData.content })
    }
  },
}))
