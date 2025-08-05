'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'

export default function ChatRoomPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = Number(params.roomId)
  const sellerId = searchParams.get('sellerId')
  const buyerId = searchParams.get('buyerId')
  const { messages, getMessageHistory, connectStomp, sendMessage, isConnected } = useChatRoomStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
  }, [roomId, getMessageHistory, connectStomp])

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // 컴포넌트 언마운트 시 소켓 연결 해제
  useEffect(() => {
    return () => {
      const { disconnectStomp } = useChatRoomStore.getState()
      disconnectStomp()
    }
  }, [])

  // URL 파라미터에서 현재 사용자 ID 결정
  const getMyUserId = () => {
    return sellerId // 임시로 sellerId를 현재 사용자로 설정
  }

  const myUserId = getMyUserId()

  return (
    <div className="h-full flex flex-col justify-between">
      {/* 메인 콘텐츠 영역 */}
      <div 
        className="chat-container flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold text-black mb-4">채팅방 {roomId}</h1>
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

      <ChatModal />
    </div>
  )
} 