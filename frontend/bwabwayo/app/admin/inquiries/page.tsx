'use client'

import { useState, useEffect } from 'react'
import { useInquiriesStore } from '@/stores/admin/inquiriesStore'
import InquiryDetailModal from './components/InquiryDetailModal'

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
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    전체: false,
    답변대기: false,
    답변완료: false
  })
  const { inquiries, getInquiries, addInquiryReply } = useInquiriesStore()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      await getInquiries()
      setLoading(false)
    }
    fetchData()
  }, [getInquiries])

  console.log(inquiries)

  const handleOpenModal = (inquiry: any) => {
    setSelectedInquiry(inquiry)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedInquiry(null)
  }

  const handleReplySubmit = async (inquiryId: number, reply: string) => {
    await addInquiryReply(inquiryId, reply)
    handleCloseModal()
  }

  // 필터링 및 정렬된 문의 목록
  const filteredAndSortedInquiries = inquiries
    .filter((inquiry: any) => {
      const hasReply = inquiry.reply
      
      // 아무것도 선택되지 않았으면 전체 표시
      if (!filterOptions.전체 && !filterOptions.답변대기 && !filterOptions.답변완료) return true
      
      // 전체가 선택되어 있으면 모든 항목 표시
      if (filterOptions.전체) return true
      
      // 개별 옵션에 따라 필터링
      if (!hasReply && filterOptions.답변대기) return true
      if (hasReply && filterOptions.답변완료) return true
      
      return false
    })
    .sort((a: any, b: any) => {
      // 답변대기를 우선으로 정렬 (답변대기가 위로)
      const aHasReply = a.reply
      const bHasReply = b.reply
      
      if (!aHasReply && bHasReply) return -1 // a가 답변대기, b가 답변완료
      if (aHasReply && !bHasReply) return 1  // a가 답변완료, b가 답변대기
      
      // 둘 다 같은 상태면 ID 역순으로 정렬 (최신순)
      return b.id - a.id
    })

  const handleFilterChange = (option: string) => {
    setFilterOptions(prev => {
      const newOptions = { ...prev }
      
      if (option === '전체') {
        // 전체를 클릭하면 답변대기와 답변완료 모두 토글
        const allChecked = newOptions.전체
        newOptions.전체 = !allChecked
        newOptions.답변대기 = !allChecked
        newOptions.답변완료 = !allChecked
      } else {
        // 개별 옵션 토글
        newOptions[option as keyof typeof newOptions] = !newOptions[option as keyof typeof newOptions]
        
        // 답변대기와 답변완료가 모두 선택되어 있으면 전체도 선택
        if (newOptions.답변대기 && newOptions.답변완료) {
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
        홈 &gt; 고객지원 &gt; 문의내용
      </div>

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6">문의내용</h1>

             {/* Search Section */}
       <div className="bg-gray-50 p-6 rounded-lg mb-6">
           {/* Search Options */}
             <div className="grid grid-cols-3 gap-4 text-md">
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
                   checked={filterOptions.답변완료}
                   onChange={() => handleFilterChange('답변완료')}
                 />
                 <span>답변완료</span>
               </label>
         </div>
       </div>

      {/* Data Table */}
       <div className="bg-white border rounded-lg">
         <div className="p-4 border-b">
           <div className="text-sm text-gray-600">전체 {filteredAndSortedInquiries.length}건</div>
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
               { filteredAndSortedInquiries.map((row: any) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-md text-gray-900">{row.id}</td>
                  <td className="px-4 py-3 text-md text-gray-900">{row.title}</td>
                                     <td className="px-4 py-3">
                     <span className={`inline-block px-2 py-1 text-sm text-white rounded ${
                       row.reply ? 'bg-green-500' : 'bg-gray-500'
                     }`}>
                       {row.reply ? '답변완료' : '답변대기'}
                     </span>
                   </td>
                  <td className="px-4 py-3 text-md text-gray-900">{row.name || row.userName}</td>
                  <td className="px-4 py-3 text-md text-gray-900">{formatDate(row.date || row.createdAt)}</td>
                  <td className="px-4 py-3">
                     <button 
                       onClick={() => handleOpenModal(row)}
                       className="px-3 py-1 bg-[#FFAE00] text-sm rounded border-2 border-black hover:bg-[#FF9500] cursor-pointer"
                     >
                       <span>상세보기</span>
                     </button>
                   </td>
                </tr>

              ))}
            </tbody>
          </table>
        </div>
      </div>
                   
      {/* Inquiry Detail Modal */}
      <InquiryDetailModal
        inquiry={selectedInquiry}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onReplySubmit={handleReplySubmit}
      />
    </div>
  )
}
