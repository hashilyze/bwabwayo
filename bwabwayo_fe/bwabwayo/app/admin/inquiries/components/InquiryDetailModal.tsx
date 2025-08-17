'use client'

import { useState } from 'react'

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

interface InquiryDetailModalProps {
  inquiry: any
  isOpen: boolean
  onClose: () => void
  onReplySubmit: (inquiryId: number, reply: string) => void
}

export default function InquiryDetailModal({ 
  inquiry, 
  isOpen, 
  onClose, 
  onReplySubmit 
}: InquiryDetailModalProps) {
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 디버깅용 로그
  console.log('Modal inquiry data:', inquiry)

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return
    
    setSubmitting(true)
    try {
      await onReplySubmit(inquiry.id, replyText)
      setReplyText('')
    } catch (error) {
      console.error('댓글 작성 실패:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !inquiry) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">문의 상세보기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Inquiry Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold">{inquiry.title}</h3>
               <span className={`inline-block px-3 py-1 text-sm text-white rounded ${
                 inquiry.reply ? 'bg-green-500' : 'bg-gray-500'
               }`}>
                 {inquiry.reply ? '답변완료' : '답변대기'}
               </span>
             </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">작성자:</span> {inquiry.name || inquiry.userName}
              </div>
              <div>
                <span className="font-medium">작성일:</span> {formatDate(inquiry.createdAt || inquiry.date)}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">문의 내용</h4>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                <p className="text-md mb-2">{inquiry.description}</p>

                <div className="">
                {inquiry.imageUrlList && inquiry.imageUrlList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {inquiry.imageUrlList.map((image: string, index: number) => (
                        <img key={index} src={image} alt="문의 이미지" className="w-40 h-40 object-cover" />
                    ))}
                </div>
                )}
                </div>
              </div>
            </div>
          </div>

          {/* Replies */}
          {inquiry.replies && inquiry.replies.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">답변 내역</h4>
              {inquiry.replies.map((reply: any, index: number) => (
                <div key={index} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-600">관리자</span>
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.createdAt || reply.date)}
                    </span>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    {reply.content || reply.reply}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply Form */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">답변 작성</h4>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="답변을 입력해주세요..."
              className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                disabled={submitting}
              >
                취소
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim() || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? '답변 중...' : '답변 등록'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
