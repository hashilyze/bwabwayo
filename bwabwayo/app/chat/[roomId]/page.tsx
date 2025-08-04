'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

interface ChatMessage {
  roomId: number
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: Date
  type: string
}

export default function ChatRoomPage() {
  const params = useParams()
  const roomId = Number(params.roomId)
  const { messages, stompClient, isConnected, connectStomp, disconnectStomp, appendMessage, roomInfo } = useChatRoomStore()
  const chatBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(`🚀 채팅방 ${roomId} 페이지 로드 시작`)
    
    // STOMP 연결 및 구독
    connectStomp(roomId)
    
    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      disconnectStomp()
    }
  }, [roomId, connectStomp, disconnectStomp])

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isConnected) return

    console.log('🚀 메시지 전송 시작:', content)
    console.log('📊 연결 상태:', isConnected)
    console.log('📋 현재 roomInfo:', roomInfo)

    // roomInfo가 없으면 기본값 사용
    const senderId = roomInfo?.[0]?.buyerId || ''
    const receiverId = roomInfo?.[0]?.sellerId || ''

    const message: ChatMessage = {
      roomId: roomId,
      senderId: receiverId,
      receiverId: senderId,
      content: content,
      isRead: false,
      createdAt: new Date(),
      type: "TEXT"
    }

    console.log('📝 생성된 메시지 객체:', message)

    try {
      // STOMP로 메시지 전송
      if (stompClient && stompClient.connected) {
        console.log('📡 STOMP로 메시지 전송 시도')
        stompClient.publish({
          destination: '/pub/chat/message',
          body: JSON.stringify(message)
        })
        console.log('✅ STOMP 메시지 전송 완료')
      } else {
        console.warn('⚠️ STOMP 연결되지 않음')
      }
      
      // 내가 보낸 메시지를 UI에 즉시 추가
      console.log('📨 UI에 메시지 추가 시도')
      appendMessage(message, true)
      
      console.log('✅ 메시지 전송 프로세스 완료')
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error)
    }
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {/* 메인 콘텐츠 영역 */}
      <div 
        ref={chatBodyRef}
        className="chat-container flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-bold text-black mb-4">채팅방 {roomId}</h1>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-10">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          <>
            {console.log('📋 렌더링할 메시지 개수:', messages.length)}
            {console.log('📋 모든 메시지:', messages)}
            {messages.map((message, index) => {
              const isMine = message.senderId === roomInfo?.[0]?.buyerId
              console.log(`📨 메시지 ${index + 1}:`, message, '발신자:', isMine ? '나' : '상대')
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
      </div>

      <ChatModal onSendMessage={handleSendMessage} isConnected={isConnected} />
    </div>
  )
} 