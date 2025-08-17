'use client'

import { useState, useEffect } from 'react'
import { X, Star } from 'lucide-react'
import { useAuthStore } from '@/stores/auth/authStore'

interface ReviewTag {
  id: number
  description: string
}

interface ReviewModalProps {
  saleId: number
  buyerId: number
  sellerId: number
  productId: number
  onConfirm: () => void
  onCancel: () => void
}

export default function ReviewModal({ saleId, buyerId, sellerId, productId, onConfirm, onCancel }: ReviewModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(0)
  const [reviewTags, setReviewTags] = useState<ReviewTag[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [isLoadingTags, setIsLoadingTags] = useState(true)
  const { authenticatedFetch } = useAuthStore()

  // 리뷰 태그 데이터 가져오기
  useEffect(() => {
    const fetchReviewTags = async () => {
      try {
        const response = await authenticatedFetch('https://i13e202.p.ssafy.io/be/api/users/reviews', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          setReviewTags(data)
        } else {
          console.error('리뷰 태그 로딩 실패')
        }
      } catch (error) {
        console.error('리뷰 태그 API 호출 실패:', error)
      } finally {
        setIsLoadingTags(false)
      }
    }

    fetchReviewTags()
  }, [authenticatedFetch])

  const handleRatingClick = (selectedRating: number) => {
    setRating(selectedRating)
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요.')
      return
    }

    if (selectedTags.length === 0) {
      alert('리뷰 태그를 하나 이상 선택해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const response = await authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/users/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          saleId,
          buyerId,
          sellerId,
          productId,
          rating: rating,
          evaluationItemsId: selectedTags,
        }),
      })

      if (response.ok) {
        console.log('리뷰 등록 완료:', saleId)
        onConfirm()
      } else {
        console.error('리뷰 등록 실패')
        alert('리뷰 등록에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('리뷰 등록 API 호출 실패:', error)
      alert('리뷰 등록 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white w-[450px] p-6 relative rounded-2xl border-2 border-black shadow">
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
          거래 후기
        </h1>
      </header>

      {/* 별점 선택 */}
      <div className="flex flex-col my-4">
        <p className="text-gray-700 text-md mb-3">
          이번 거래는 어떠셨나요?
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              className="transition-all hover:scale-110"
              disabled={isLoading}
            >
              <Star
                className={`w-8 h-8 ${
                  star <= rating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        {/* {rating > 0 && (
          <p className="text-center text-sm text-gray-600 mt-2">
            {rating}점을 선택하셨습니다
          </p>
        )} */}
      </div>

      {/* 리뷰 태그 선택 */}
      <div className="flex flex-col mb-4">
        <label className="text-gray-700 text-md mb-2">
          거래 후기 태그 (중복 선택 가능)
        </label>
        {isLoadingTags ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {reviewTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagToggle(tag.id)}
                disabled={isLoading}
                className={`flex items-center justify-between p-3 border border-gray-300 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedTags.includes(tag.id)
                    ? 'bg-[#ffae00] border-[#ffae00] text-black'
                    : 'bg-white hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-sm font-medium">{tag.description}</span>
                {selectedTags.includes(tag.id) && (
                  <svg
                    className="w-5 h-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
        {/* {selectedTags.length > 0 && (
          <div className="text-right text-sm text-gray-500 mt-1">
            {selectedTags.length}개 선택됨
          </div>
        )} */}
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
          onClick={handleSubmit}
          className="flex-1 py-3 px-4 rounded-[20px] border-2 border-black bg-[#ffae00] text-black font-semibold transition-all hover:scale-105 disabled:opacity-50"
          disabled={isLoading || isLoadingTags}
        >
          {isLoading ? '등록중...' : '등록하기'}
        </button>
      </div>
    </div>
  )
}
