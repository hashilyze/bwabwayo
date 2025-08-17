'use client'

import { useState, useEffect, Suspense } from 'react'
import { useReportStore } from '@/stores/admin/reportStore'
import ReportDetailModal from './components/ReportDetailModal'
import { useSearchParams } from 'next/navigation'

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

function ReportsContent() {
  const { reports, getReports, addReportReply } = useReportStore()
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    전체: false,
    답변대기: false,
    처리완료: false
  })
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await getReports()
      setLoading(false)
    }

    fetchData()
  }, [getReports])

  // URL 파라미터에서 필터 상태 초기화
  useEffect(() => {
    const filter = searchParams.get('filter')
    if (filter === 'pending') {
      setFilterOptions({
        전체: false,
        답변대기: true,
        처리완료: false
      })
    } else if (filter === 'completed') {
      setFilterOptions({
        전체: false,
        답변대기: false,
        처리완료: true
      })
    } else {
      setFilterOptions({
        전체: false,
        답변대기: false,
        처리완료: false
      })
    }
  }, [searchParams])

  console.log(reports)

  const handleOpenModal = (report: any) => {
    setSelectedReport(report)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReport(null)
  }

  const handleReplySubmit = async (reportId: number, reply: string, penalizable: boolean) => {
    await addReportReply(reportId, reply, penalizable)
    handleCloseModal()
  }
  
     // 필터링 및 정렬된 신고 목록
   const filteredAndSortedReports = reports
     .filter((report: any) => {
       const hasReply = report.reply
       
       // 아무것도 선택되지 않았으면 전체 표시
       if (!filterOptions.전체 && !filterOptions.답변대기 && !filterOptions.처리완료) return true
       
       // 전체가 선택되어 있으면 모든 항목 표시
       if (filterOptions.전체) return true
       
       // 개별 옵션에 따라 필터링
       if (!hasReply && filterOptions.답변대기) return true
       if (hasReply && filterOptions.처리완료) return true
       
       return false
     })
    .sort((a: any, b: any) => {
      // 처리대기를 우선으로 정렬 (처리대기가 위로)
      const aHasReply = a.reply
      const bHasReply = b.reply
      
      if (!aHasReply && bHasReply) return -1 // a가 처리대기, b가 처리완료
      if (aHasReply && !bHasReply) return 1  // a가 처리완료, b가 처리대기
      
      // 둘 다 같은 상태면 ID 역순으로 정렬 (최신순)
      return b.id - a.id
    })

     const handleFilterChange = (option: string) => {
     setFilterOptions(prev => {
       const newOptions = { ...prev }
       
       if (option === '전체') {
         // 전체를 클릭하면 모든 옵션 토글
         const allChecked = newOptions.전체
         newOptions.전체 = !allChecked
         newOptions.답변대기 = !allChecked
         newOptions.처리완료 = !allChecked
       } else {
         // 개별 옵션 토글
         newOptions[option as keyof typeof newOptions] = !newOptions[option as keyof typeof newOptions]
         
         // 모든 개별 옵션이 선택되어 있으면 전체도 선택
         if (newOptions.답변대기 && newOptions.처리완료) {
           newOptions.전체 = true
         } else {
           newOptions.전체 = false
         }
       }
       
       return newOptions
     })
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
        홈 &gt; 고객지원 &gt; 신고내용
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">신고내용</h1>

             {/* Search Section */}
       <div className="flex gap-4 text-md justify-start mb-4 ml-1">
         <label className="flex items-center space-x-2 cursor-pointer">
           <input 
             type="checkbox" 
             className="rounded"
             checked={filterOptions.전체}
             onChange={() => handleFilterChange('전체')}
           />
           <span>전체</span>
         </label>
         <label className="flex items-center space-x-2 cursor-pointer">
           <input 
             type="checkbox" 
             className="rounded"
             checked={filterOptions.답변대기}
             onChange={() => handleFilterChange('답변대기')}
           />
           <span>답변대기</span>
         </label>
         <label className="flex items-center space-x-2 cursor-pointer">
           <input 
             type="checkbox" 
             className="rounded"
             checked={filterOptions.처리완료}
             onChange={() => handleFilterChange('처리완료')}
           />
           <span>처리완료</span>
         </label>
       </div>

      {/* Data Table */}
      <div className="bg-white border-2 rounded-lg">
        <div className="p-4 border-b-2">
          <div className="text-sm">전체 {filteredAndSortedReports.length}건</div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-center text-sm text-black">신고자</th>
                <th className="px-4 py-3 text-center text-sm text-black">제목</th>
                <th className="px-4 py-3 text-center text-sm text-black">상태</th>
                <th className="px-4 py-3 text-center text-sm text-black">답변하기</th>
                <th className="px-4 py-3 text-center text-sm text-black">신고일</th>
                <th className="px-4 py-3 text-center text-sm text-black">번호</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                             {filteredAndSortedReports.map((row: any) => {
                 const hasReply = row.reply
                 const statusColor = hasReply ? 'bg-green-500' : 'bg-gray-500'
                 const statusText = hasReply ? '처리완료' : '답변대기'
                
                return (
                  <tr key={row.id} className={`${hasReply ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                    <td className={`px-4 py-3 text-md text-center ${hasReply ? 'text-gray-500' : 'text-gray-900'}`}>
                      {row.reporterName || row.userName || row.name}
                    </td>
                    <td className={`px-4 py-3 text-md text-center ${hasReply ? 'text-gray-500' : 'text-gray-900'}`}>
                      {row.title || row.content}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 text-sm text-white rounded ${statusColor}`}>
                        {statusText}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                     <button 
                       onClick={() => !hasReply && handleOpenModal(row)}
                       disabled={hasReply}
                       className={`px-3 py-1 text-sm rounded border-2 border-black ${
                         hasReply 
                           ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                           : 'bg-[#FCE94F] hover:bg-[#FCE94F] cursor-pointer'
                       }`}
                     >
                       <span>{hasReply ? '처리완료' : '답변하기'}</span>
                     </button>
                   </td>
                    <td className={`px-4 py-3 text-sm text-center ${hasReply ? 'text-gray-500' : 'text-gray-900'}`}>
                      {formatDate(row.createdAt || row.date)}
                    </td>
                    <td className={`px-4 py-3 text-md text-center ${hasReply ? 'text-gray-500' : 'text-gray-900'}`}>
                      {row.id}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
                   
      {/* Report Detail Modal */}
      <ReportDetailModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReplySubmit={handleReplySubmit}
      />
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    }>
      <ReportsContent />
    </Suspense>
  )
}
