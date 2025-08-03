'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useAuthStore } from '@/stores/auth/authStore'

// URL 파라미터를 읽는 컴포넌트
function SearchParamsReader({ onParamsRead }: { onParamsRead: (productId: string | null, sellerId: string | null) => void }) {
    const searchParams = useSearchParams()
    
    useEffect(() => {
        const productId = searchParams.get('productId')
        const sellerId = searchParams.get('sellerId')
        onParamsRead(productId, sellerId)
    }, [searchParams, onParamsRead])
    
    return null
}

export default function TempPage() {
    const router = useRouter()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [productId, setProductId] = useState<string | null>(null)
    const [sellerId, setSellerId] = useState<string | null>(null)
    const { addChatRoom } = useChatRoomStore()
    const { initializeAuth } = useAuthStore()

    const handleParamsRead = useCallback((productId: string | null, sellerId: string | null) => {
        setProductId(productId)
        setSellerId(sellerId)
    }, [])

    // 컴포넌트 마운트 시 인증 초기화
    useEffect(() => {
        initializeAuth()
    }, [initializeAuth])

    const toggleMenu = () => {
      setIsMenuOpen(!isMenuOpen);
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      
      await addChatRoom({
        // message: message,
        sellerId: sellerId || '',
        productId: Number(productId) || 0
      })
      
      // 전송 후 메시지 입력창 초기화
      setMessage('')
    }

    return (
        <div className="h-full flex flex-col justify-between">
          {/* URL 파라미터 읽기 */}
          <Suspense fallback={null}>
            <SearchParamsReader onParamsRead={handleParamsRead} />
          </Suspense>
          
          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center">
              <h1 className="text-[28px] font-bold text-black mb-4">채팅방</h1>
              <p className="text-lg font-semibold text-black">고윤정님과의 대화</p>
              <p className="text-sm text-gray-500 mt-2">여기에 실제 채팅 메시지들이 표시됩니다</p>
            </div>
          </div>
    
          <div className="">
            {/* 하단 입력창 */}
            <div className="h-[77px] bg-white border-t border-gray-200 flex items-center px-8">
              {/* 첨부 버튼 */}
              <div 
                className="w-[26px] h-[26px] border border-gray-500 rounded-full flex items-center justify-center mr-4 cursor-pointer transition-transform duration-200 hover:rotate-90" 
                onClick={toggleMenu}
              >
                <div className="flex items-center justify-center">
                  <div className="w-[2px] h-[12px] bg-gray-500 rounded"></div>
                  <div className="w-[12px] h-[2px] bg-gray-500 rounded absolute"></div>
                </div>
              </div>
              {/* 입력창 */}
              <form onSubmit={handleSubmit} className="flex-1 h-[45px] bg-gray-50 rounded-[38px] flex items-center px-5">
                <input
                  type="text"
                  placeholder="메세지를 입력하세요."
                  className="flex-1 bg-transparent text-xs text-gray-500 outline-none placeholder-gray-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </form>
            </div>

            {/* 하단 +버튼 확장 메뉴 */}
            {isMenuOpen && (
              <div className="grid grid-cols-3 gap-4 border-t border-[#eee] py-6 px-8 animate-in slide-in-from-bottom-2 duration-300">
                {/* 거래시작 */}
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
                    <img src="/icon/start-trade.svg" alt="거래시작" className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-black">거래시작</span>
                </div>
                
                {/* 화상채팅예약 */}
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
                    <img src="/icon/video.svg" alt="화상채팅예약" className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-black">화상채팅예약</span>
                </div>
                
                {/* 이미지 첨부 */}
                <div className="flex flex-col items-center cursor-pointer">
                  <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
                    <img src="/icon/image.svg" alt="이미지 첨부" className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-black">이미지 첨부</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )
}