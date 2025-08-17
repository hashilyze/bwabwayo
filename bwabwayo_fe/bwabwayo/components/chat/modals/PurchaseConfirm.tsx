'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useAuthStore } from '@/stores/auth/authStore'

interface PurchaseConfirmProps {
  roomId: number
  onConfirm: () => void
  onCancel: () => void
}

export default function PurchaseConfirm({ roomId, onConfirm, onCancel }: PurchaseConfirmProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { authenticatedFetch } = useAuthStore() 

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      // API 호출 - productId를 전달하여 구매 확정 처리
      const response = await authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/users/confirmation/${roomId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        console.log('구매 확정 완료:', roomId)
        onConfirm()
      } else {
        console.error('구매 확정 실패')
        alert('구매 확정에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('구매 확정 API 호출 실패:', error)
      alert('구매 확정 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white w-[400px] p-6 relative rounded-2xl border-2 border-black shadow">
      {/* 닫기 버튼 */}
      <button
        onClick={onCancel}
        aria-label="닫기"
        className="absolute !w-6 !h-6 !top-4 !right-4 inline-flex items-center justify-center"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 헤더 */}
      <header className="">
        <h1 className="font-bold text-black text-2xl">
          구매 확정
        </h1>
      </header>

      {/* 내용 */}
      <div className="flex flex-col my-3">
        <p className="text-gray-700 text-md">
          정말로 구매를 확정하시겠습니까?
        </p>
        <p className="text-gray-500 text-md">
          구매 확정 후에는 취소할 수 없습니다.
        </p>
      </div>

      {/* 버튼들 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-3 px-4 rounded-[20px] border-2 border-black bg-white text-black font-semibold transition-all hover:bg-gray-100"
          disabled={isLoading}
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className="flex-1 py-3 px-4 rounded-[20px] border-2 border-black bg-[#ffae00] text-black font-semibold transition-all hover:scale-105 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? '처리중...' : '확인'}
        </button>
      </div>
    </div>
  )
}