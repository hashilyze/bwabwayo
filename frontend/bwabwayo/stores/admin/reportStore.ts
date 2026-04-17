import { create } from 'zustand'

interface ReportStore {
  reports: []
  getReports: () => Promise<void>
}

const baseUrl = 'https://i13e202.p.ssafy.io/be'

export const useReportStore = create<ReportStore>((set) => ({
  reports: [],
  getReports: async () => {
    const response = await fetch(`${baseUrl}/api/report/list`)
    const data = await response.json()
    set({ reports: data.content })
  },

  addReportReply: async (reportId: number, reply: string, penalizable: boolean) => {
    const response = await fetch(`${baseUrl}/api/report/reply`, {
      method: 'PUT',
      body: JSON.stringify({ reportId, reply, penalizable }),
    })
  },
}))
