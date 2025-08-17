'use client'

import { useEffect, useState } from 'react'
import { useInquiriesStore } from '@/stores/admin/inquiriesStore'
import { useReportStore } from '@/stores/admin/reportStore'
import Link from 'next/link'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const { inquiries, getInquiries } = useInquiriesStore()
  const { reports, getReports } = useReportStore()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await Promise.all([getInquiries(), getReports()])
      setLoading(false)
    }
    fetchData()
  }, [getInquiries, getReports])

  // 문의 통계 계산
  const inquiryStats = {
    total: inquiries.length,
    completed: inquiries.filter((inquiry: any) => inquiry.reply).length,
    pending: inquiries.filter((inquiry: any) => !inquiry.reply).length
  }

  // 신고 통계 계산
  const reportStats = {
    total: reports.length,
    completed: reports.filter((report: any) => report.reply).length,
    pending: reports.filter((report: any) => !report.reply).length
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 pb-10">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        홈
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4">통계</h1>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* 문의내용 섹션 */}
        <div className="bg-white border-2 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">문의내용</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{inquiryStats.total}</div>
              <div className="text-sm text-gray-600">총 문의</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{inquiryStats.completed}</div>
              <div className="text-sm text-gray-600">답변완료</div>
            </div>
            <div className="text-center">
              <Link href="/admin/inquiries?filter=pending">
                <div className="text-2xl font-bold text-orange-600 cursor-pointer hover:text-orange-700 transition-colors">
                  {inquiryStats.pending}
                </div>
                <div className="text-sm text-gray-600">답변대기</div>
              </Link>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>답변률</span>
              <span>{inquiryStats.total > 0 ? Math.round((inquiryStats.completed / inquiryStats.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${inquiryStats.total > 0 ? (inquiryStats.completed / inquiryStats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* 신고내용 섹션 */}
        <div className="bg-white border-2 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">신고내용</h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{reportStats.total}</div>
              <div className="text-sm text-gray-600">총 신고</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportStats.completed}</div>
              <div className="text-sm text-gray-600">처리완료</div>
            </div>
            <div className="text-center">
              <Link href="/admin/reports?filter=pending">
                <div className="text-2xl font-bold text-orange-600 cursor-pointer hover:text-orange-700 transition-colors">
                  {reportStats.pending}
                </div>
                <div className="text-sm text-gray-600">처리대기</div>
              </Link>
            </div>
          </div>

          {/* 진행률 바 */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>처리률</span>
              <span>{reportStats.total > 0 ? Math.round((reportStats.completed / reportStats.total) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${reportStats.total > 0 ? (reportStats.completed / reportStats.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}