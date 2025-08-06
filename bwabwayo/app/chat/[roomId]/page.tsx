'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import ReservationModal from '@/components/chat/ReservationModal'
import Image from 'next/image'

export default function ChatRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = Number(params.roomId)
  const sellerId = searchParams.get('sellerId')
  const buyerId = searchParams.get('buyerId')
  const { messages, getMessageHistory, connectStomp } = useChatRoomStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);

  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);
  const openHeaderModal = () => setIsHeaderModalOpen(true);
  const closeHeaderModal = () => setIsHeaderModalOpen(false);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 1. 메시지 히스토리 로드
        await getMessageHistory(roomId)
        
        // 2. STOMP 연결
        connectStomp(roomId)
      } catch (error) {
        console.error('채팅 초기화 실패:', error)
      }
    }
    
    initializeChat()

    // 컴포넌트가 언마운트될 때 STOMP 연결을 해제합니다.
    return () => {
      const { disconnectStomp } = useChatRoomStore.getState()
      disconnectStomp()
    }
  }, [roomId, getMessageHistory, connectStomp])

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: 'end' })
    }
  }, [messages])

  // URL 파라미터에서 현재 사용자 ID 결정
  const getMyUserId = () => {
    if (typeof window === 'undefined') return null

    const token = localStorage.getItem('accessToken')
    if (!token) return null

    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub || payload.userId || payload.id
    } catch (error) {
      console.error('토큰 파싱 실패:', error)
      return null
    }
  }

  const myUserId = getMyUserId()

  return (
    <div className="h-full flex flex-col justify-between relative overflow-hidden">
      {/* 채팅방 헤더 */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-2 flex flex-col px-5 py-4 gap-2">
        {/* 상품 정보 */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">고윤정</h1>
          {/* 메뉴 버튼 */}
          <ul className="flex items-center h-5 gap-1 cursor-pointer" onClick={openHeaderModal}>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
          </ul>
        </div>

        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
            <Image src="/image/no-image.jpg" alt="상품 이미지" width={40} height={40} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">팝마트 라부부 코카콜라 시리즈 인형 키링</span>
            <span className="text-sm font-semibold text-black">70,000원</span>
          </div>
        </div>
      </div>

      {/* 채팅방 헤더 모달 */}
      {isHeaderModalOpen && (
        <div className="absolute inset-0 z-20">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50" onClick={closeHeaderModal}></div>
          
          {/* 모달 컨테이너 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg">
            <div className="h-[70px] flex items-center justify-center border-b border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => {
              console.log('채팅방 나가기');
              closeHeaderModal();
            }}>
              <span className="text-black font-medium">채팅방 나가기</span>
            </div>
            <div className="h-[70px] flex items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => {
              console.log('신고하기');
              closeHeaderModal();
            }}>
              <span className="text-black font-medium">신고하기</span>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div 
        className="chat-container flex-1 overflow-y-auto p-4 space-y-4 pt-[160px]"
      >
        <div className="mb-10 flex flex-col gap-2 items-center">
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <Image src="/image/no-image.jpg" alt="판매자 프로필" width={100} height={100} className="object-cover" />
          </div>
          <h1 className="text-[18px] font-bold text-black">고윤정</h1>
          <div className="flex items-center gap-1 mb-2">
            <p className="text-sm text-gray-500">4.8</p>
            <Image src="/icon/star-on.svg" className="pb-1" alt="별점" width={18} height={18} />
            <p className="text-sm text-gray-500">(100)</p>
          </div>
          <p className="text-sm text-gray-500">지금까지 174개의 상품을 판매했어요</p>
          {sellerId && buyerId && (
            <p className="text-sm text-gray-500">
              판매자: {sellerId} | 구매자: {buyerId}
            </p>
          )}
        </div>

        {!messages || !Array.isArray(messages) || messages.length === 0 || !messages.every(msg => msg && typeof msg === 'object') ? (
          <div className="text-center text-gray-500 py-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-10">첫 번째 메시지를 보내보세요!</p>
          </div>
                 ) : (
           <>
             {Array.isArray(messages) && messages.filter(message => message && typeof message === 'object').map((message, index) => {
              // 내가 보낸 메시지인지 판단 (senderId와 내 사용자 ID 비교)
              const isMine = myUserId ? String(message.senderId) === String(myUserId) : false
              
              // 공지글인지 판단 (이모지로 시작하는 메시지)
              const isNotice = message.content.startsWith('📅') || 
                              message.content.startsWith('❌') || 
                              message.content.startsWith('🔄') || 
                              message.content.startsWith('✅') || 
                              message.content.startsWith('💬') || 
                              message.content.startsWith('👋') || 
                              message.content.startsWith('🔧') || 
                              message.content.startsWith('🆕');
              
              // 공지글인 경우 특별한 디자인 적용
              if (isNotice) {
                return (
                  <div key={index} className="mb-4 flex justify-center">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg px-6 py-4 max-w-md shadow-sm">
                      <div className="flex items-center justify-center mb-2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                        <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">시스템 공지</span>
                        <div className="w-2 h-2 bg-blue-400 rounded-full ml-2"></div>
                      </div>
                      <div className="text-sm text-gray-700 text-center whitespace-pre-line leading-relaxed">
                        {message.content}
                      </div>
                      <div className="text-xs text-gray-400 text-center mt-2">
                        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  </div>
                )
              }
              
              // 일반 메시지
              return (
                <div
                  key={index}
                  className={`mb-4 flex items-end gap-2 justify-start ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-full ${
                      isMine
                        ? 'bg-[#0047A5] text-white py-4 px-5'
                        : 'bg-[#979CA4] text-white py-4 px-5'
                    }`}
                  >
                  <div className="text-sm">{message.content}</div>
                  </div>
                    <div className={`text-xs text-[#666666]`}>
                     {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                       hour: 'numeric',
                       minute: '2-digit',
                       hour12: true
                     })}

                    </div>
                 </div>
               )
             })}
          </>
        )}
        
        {/* 스크롤을 위한 빈 div */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* 예약 모달 조건부 렌더링 */}
      {isReservationModalOpen && <ReservationModal onClose={closeReservationModal} chatRoomId={roomId} />}

      {/* + 버튼 */}
      <ChatModal onOpenReservationModal={openReservationModal} />
    </div>
  )
} 