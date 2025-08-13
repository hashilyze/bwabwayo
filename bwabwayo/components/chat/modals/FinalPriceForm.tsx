'use client'
import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useParams } from 'next/navigation'
import useSendTypeMessageStore from '@/stores/chatting/sendTypeMessage'

export default function FinalPriceModal({
  onClose,
}: {
  onClose: () => void
}) {
  const [finalPrice, setFinalPrice] = useState<number | ''>('') 
  const [error, setError] = useState('')
  const boxRef = useRef<HTMLDivElement>(null)
  const params = useParams()
  const roomId = Number(params.roomId)
  const { price } = useSendTypeMessageStore()

  const handleSubmit = () => {
    if (finalPrice === '' || isNaN(Number(finalPrice)) || Number(finalPrice) <= 0) {
      return setError('최종 가격을 올바르게 입력해 주세요.')
    }
    setError('')
    console.log('최종 거래 가격:', Number(finalPrice))
    
    price(roomId, Number(finalPrice))
    onClose()
  }

  return (
    <div
      ref={boxRef}
      className="bg-white w-[476px] h-[209px] relative rounded-2xl border-2 border-black shadow"
    >
      {/* 닫기 버튼 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute !w-6 !h-6 !top-[18px] !left-[428px] inline-flex items-center justify-center"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 헤더 */}
      <header className="absolute top-[37px] left-[35px]">
        <h1 className="font-bold text-black text-xl tracking-[0] leading-normal">
          최종가격 설정하기
        </h1>
      </header>

      {/* 입력 버튼 */}
      <button
        type="button"
        onClick={handleSubmit}
        className="absolute w-[121px] h-[41px] top-[150px] left-[336px] bg-[#ffae00] rounded-[30px] border-2 border-solid border-black transition-transform hover:scale-105"
        aria-label="최종 가격 입력하기"
      >
        <span className="absolute top-2 left-8 font-semibold text-black text-base">
          입력하기
        </span>
      </button>

      {/* 가격 입력 */}
      <div className="absolute w-[402px] h-[43px] top-[89px] left-[35px] rounded-[20px] border border-solid border-[#dddddd]">
        <input
          type="number"
          min={0}
          value={finalPrice === '' ? '' : String(finalPrice)}      
          onChange={(e) => {
            const v = e.target.value
            setFinalPrice(v === '' ? '' : Number(v))                
          }}
          placeholder="₩ 판매가격"
          className="w-full h-full px-[18px] text-black text-sm rounded-[20px] border-0 outline-none placeholder:text-[#7c7c7c]"
          aria-label="최종 가격 입력"
        />
      </div>

      {error && (
        <p className="absolute left-[35px] top-[140px] text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}
