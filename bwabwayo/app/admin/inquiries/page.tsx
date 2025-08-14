'use client'

import { useState, useEffect } from 'react'

export default function InquiriesPage() {
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData = [
        { 
          id: 1,
          title: '서비스 이용 관련 문의드립니다', 
          status: '답변대기', 
          statusColor: 'bg-yellow-400', 
          date: '2024.01.15', 
          user: '김문의', 
          email: 'kim@example.com',
          content: '서비스 이용 중 문제가 발생했습니다...'
        },
        { 
          id: 2,
          title: '결제 관련 문의', 
          status: '답변완료', 
          statusColor: 'bg-blue-400', 
          date: '2024.01.13', 
          user: '박문의', 
          email: 'park@example.com',
          content: '결제가 정상적으로 처리되지 않았습니다...'
        },
        { 
          id: 3,
          title: '기능 개선 제안', 
          status: '검토중', 
          statusColor: 'bg-purple-400', 
          date: '2024.01.11', 
          user: '정문의', 
          email: 'jung@example.com',
          content: '새로운 기능을 제안드립니다...'
        },
      ]
      
      setTableData(mockData)
      setTotalCount(3)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Breadcrumbs */}
      <div className="text-sm text-gray-500 mb-4">
        ▲ &gt; 고객지원 &gt; 문의내용
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">문의내용</h1>

      {/* Search Section */}
      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Search Options */}
          <div>
            <div className="font-medium mb-3">상태별 필터</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
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

          {/* Search Input */}
          <div>
            <div className="font-medium mb-3">검색</div>
            <div className="flex space-x-2">
              <select className="px-3 py-2 border rounded text-sm">
                <option>전체</option>
                <option>제목</option>
                <option>작성자</option>
                <option>내용</option>
              </select>
              <input 
                type="text" 
                placeholder="검색어를 입력해주세요." 
                className="flex-1 px-3 py-2 border rounded text-sm"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">검색</button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border rounded-lg">
        <div className="p-4 border-b">
          <div className="text-sm text-gray-600">전체 {totalCount}건</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">번호</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">제목</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성자</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">이메일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">작성일</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">상세보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tableData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{row.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.title}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs text-white rounded ${row.statusColor}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.user}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                  <td className="px-4 py-3">
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded flex items-center space-x-1">
                      <span>🔍</span>
                      <span>상세보기</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t">
          <button className="text-blue-600 text-sm flex items-center space-x-1">
            <span>✓</span>
            <span>더 보기 (1/1)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
