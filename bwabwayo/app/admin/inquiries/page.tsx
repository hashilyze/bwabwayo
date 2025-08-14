'use client'

import { useState, useEffect } from 'react'
import { useInquiriesStore } from '@/stores/admin/inquiriesStore'

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}.${month}.${day} ${hours}:${minutes}`
}

export default function InquiriesPage() {
  const [loading, setLoading] = useState(true)
  const { inquiries, getInquiries } = useInquiriesStore()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await getInquiries()
      setLoading(false)
    }
    fetchData()
  }, [getInquiries])

  console.log(inquiries)

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
        홈 &gt; 고객지원 &gt; 문의내용
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">문의내용</h1>

      {/* Search Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
          {/* Search Options */}
            <div className="grid grid-cols-4 gap-2 text-md">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>전체</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>답변대기</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span>답변완료</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span>검토중</span>
              </label>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <div className="text-sm text-gray-600">전체 {inquiries.length}건</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">번호</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">제목</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              { inquiries && inquiries.map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-md text-gray-900">{row.id}</td>
                  <td className="px-4 py-3 text-md text-gray-900">{row.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-sm text-white rounded ${row.statusColor || 'bg-gray-400'}`}>
                      {row.status || '답변대기'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-md text-gray-900">{row.name || row.userName}</td>
                  <td className="px-4 py-3 text-md text-gray-900">{formatDate(row.date || row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-[#FFAE00] text-sm rounded border-2 border-black">
                      <span>상세보기</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
