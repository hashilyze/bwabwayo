'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useUserInfoStore } from '@/stores/user/getUserInfoStore';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

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
  const searchParams = useSearchParams()
  const roomId = Number(params.roomId)
  const productId = searchParams.get('productId')
  const sellerId = searchParams.get('sellerId')
  
  const { userInfo, getUserInfo } = useUserInfoStore()
  const { messages, getChatMessages, sendMessage, stompClient, isConnected, connectStomp, disconnectStomp } = useChatRoomStore()
  const chatBodyRef = useRef<HTMLDivElement>(null)
  
  // 현재 사용자 ID (임시로 하드코딩, 실제로는 인증 정보에서 가져와야 함)
  const currentUserId = '4375126834' // 구매자 ID
  const receiverId = sellerId || '4375461526' // 판매자 ID

  useEffect(() => {
    // 판매자 정보 불러오기(api미완)
    // getUserInfo()
    
    // 채팅 메시지 로드
    const loadChatMessages = async () => {
      try {
        await getChatMessages(roomId)
      } catch (error) {
        console.error('채팅 메시지 로드 실패:', error)
      }
    }
    
    loadChatMessages()
    
    // STOMP 연결
    connectStomp()
    
    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      disconnectStomp()
    }
  }, [roomId])

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

     const handleSendMessage = async (content: string) => {
     if (!content.trim() || !isConnected) return

    const message: ChatMessage = {
      roomId: roomId,
      senderId: currentUserId,
      receiverId: receiverId,
      content: content,
      isRead: false,
      createdAt: new Date(),
      type: "TEXT"
    }

    try {
            // STOMP로 메시지 전송 (연결된 경우에만)
            if (stompClient && stompClient.connected) {
              stompClient.publish({
                destination: '/pub/chat/message',
                body: JSON.stringify(message)
              })
              console.log('STOMP로 메시지 전송됨')
            } else {
              console.log('STOMP 연결 없음, API로만 전송')
            }
            
            // API로 메시지 전송 (항상 실행)
            await sendMessage(message)
            console.log('메시지 전송 완료')
          } catch (error) {
            console.error('메시지 전송 실패:', error)
          }
  }

  

  return (
    <div className="h-full flex flex-col justify-between">
      {/* 메인 콘텐츠 영역 */}
      <div 
        ref={chatBodyRef}
        className="chat-container flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="text-center mb-4">
          <h1 className="text-[28px] font-bold text-black mb-4">채팅방 {roomId}</h1>
          <p className="text-lg font-semibold text-black">고윤정님과의 대화</p>
          <p className={`text-sm ${isConnected ? 'text-green-500' : 'text-red-500'} mt-2`}>
            {isConnected ? '🟢 실시간 연결됨' : '🔴 연결 안됨'}
          </p>
          <a 
            href="/chat/test" 
            className="inline-block mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            🧪 채팅 테스트 페이지
          </a>
        </div>

        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-2">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isMine = message.senderId === currentUserId
            return (
              <div
                key={index}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isMine
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {isMine ? '나' : '상대'}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${
                    isMine ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <ChatModal onSendMessage={handleSendMessage} isConnected={isConnected} />
    </div>
  )
} 