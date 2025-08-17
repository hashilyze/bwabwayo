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

interface ReportDetailModalProps {
  report: any
  isOpen: boolean
  onClose: () => void
  onReplySubmit: (reportId: number, reply: string, penalizable: boolean) => void
}

export default function ReportDetailModal({ 
  report, 
  isOpen, 
  onClose, 
  onReplySubmit 
}: ReportDetailModalProps) {
  const [replyText, setReplyText] = useState('')
  const [penalizable, setPenalizable] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 디버깅용 로그
  console.log('Modal report data:', report)

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return
    
    setSubmitting(true)
    try {
      await onReplySubmit(report.id, replyText, penalizable)
      setReplyText('')
      setPenalizable(false)
    } catch (error) {
      console.error('답변 작성 실패:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen || !report) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border-2 border-black">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">신고 상세보기</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Report Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold">{report.title || report.content}</h3>
               <span className={`inline-block px-3 py-1 text-sm text-white rounded ${
                 report.reply ? 'bg-green-500' : 'bg-gray-500'
               }`}>
                 {report.reply ? '처리완료' : '처리대기'}
               </span>
             </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <span className="font-medium">신고자:</span> {report.reporterName || report.userName || report.name}
              </div>
              <div>
                <span className="font-medium">신고일:</span> {formatDate(report.createdAt || report.date)}
              </div>
              <div>
                <span className="font-medium">신고 유형:</span> {report.reportType || '일반 신고'}
              </div>
              <div>
                <span className="font-medium">신고 대상:</span> {report.targetType || '사용자'}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-2">신고 내용</h4>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                <p className="text-md mb-2">{report.content || report.description}</p>

                {report.imageUrlList && report.imageUrlList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {report.imageUrlList.map((image: string, index: number) => (
                        <img key={index} src={image} alt="신고 이미지" className="w-40 h-40 object-cover" />
                    ))}
                </div>
                )}
              </div>
            </div>
          </div>

          {/* Replies */}
          {report.replies && report.replies.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">처리 내역</h4>
              {report.replies.map((reply: any, index: number) => (
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
            <h4 className="font-medium text-gray-700 mb-3">처리 답변 작성</h4>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="처리 답변을 입력해주세요..."
              className="w-full h-24 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitting}
            />
            
            {/* Penalty Checkbox */}
            <div className="mt-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={penalizable}
                  onChange={(e) => setPenalizable(e.target.checked)}
                  className="rounded"
                  disabled={submitting}
                />
                <span className="text-sm text-red-600 font-medium">패널티 부여</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                체크 시 신고 대상에게 패널티가 부여됩니다.
              </p>
            </div>

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
                {submitting ? '처리 중...' : '처리 완료'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
