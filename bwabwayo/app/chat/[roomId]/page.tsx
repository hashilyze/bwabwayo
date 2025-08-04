'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useUserInfoStore } from '@/stores/user/getUserInfoStore'
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

export default function ChatRoomPage({
  searchParams,
}: {
  searchParams: { buyerId?: string, sellerId?: string }
}) {
  const params = useParams()
  const roomId = Number(params.roomId)
  const { messages, stompClient, isConnected, connectStomp, disconnectStomp, appendMessage, roomInfo, loadChatHistory, clearMessages } = useChatRoomStore()
  const { userInfo } = useUserInfoStore()
  const chatBodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    console.log(`🚀 채팅방 ${roomId} 입장 - 메시지 히스토리 로드 시작`);
    
    const initializeChatRoom = async () => {
      try {
        // 1. 기존 메시지 초기화
        clearMessages();
        
        // 2. 채팅방 메시지 히스토리 로드
        console.log(`📚 1단계: 채팅방 ${roomId} 메시지 히스토리 로드`);
        await loadChatHistory(roomId);
        
        // 3. STOMP 연결 및 실시간 메시지 구독
        console.log(`📡 2단계: 채팅방 ${roomId} STOMP 연결 및 구독`);
        connectStomp(roomId);
        
      } catch (error) {
        console.error(`❌ 채팅방 ${roomId} 초기화 실패:`, error);
      }
    };
    
    initializeChatRoom();
    
    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      console.log(`👋 채팅방 ${roomId} 퇴장 - 연결 해제`);
      disconnectStomp();
    }
  }, [roomId, connectStomp, disconnectStomp, loadChatHistory, clearMessages])

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      const { getUserInfo } = useUserInfoStore.getState()
      await getUserInfo()
    }
    loadUserInfo()
  }, [])

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !isConnected) return

    // 토큰에서 사용자 ID 추출
    const token = localStorage.getItem('accessToken')
    let myUserId = null
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        myUserId = payload.sub || payload.userId || payload.id
        console.log('🔍 토큰에서 추출한 사용자 ID:', myUserId)
      } catch (error) {
        console.error('토큰 파싱 실패:', error)
        return
      }
    }

    if (!myUserId) {
      console.error('❌ 로그인한 사용자 정보가 없습니다')
      return
    }

    // URL 파라미터에서 상대방 ID 가져오기
    const buyerId = searchParams.buyerId || ''
    const sellerId = searchParams.sellerId || ''

    // 현재 사용자가 누구인지 판단하여 receiverId 결정
    let receiverId = ''
    if (myUserId === buyerId) {
      // 현재 사용자가 구매자인 경우, 판매자에게 메시지 전송
      receiverId = sellerId
    } else if (myUserId === sellerId) {
      // 현재 사용자가 판매자인 경우, 구매자에게 메시지 전송
      receiverId = buyerId
    } else {
      console.error('❌ 현재 사용자가 채팅방의 참여자가 아닙니다')
      return
    }

    const message: ChatMessage = {
      roomId: roomId,
      senderId: myUserId,
      receiverId: receiverId,
      content: content,
      isRead: false,
      createdAt: new Date(),
      type: "TEXT"
    }

    try {
      // STOMP로 메시지 전송
      if (stompClient && stompClient.connected) {
        stompClient.publish({
          destination: '/pub/chat/message',
          body: JSON.stringify(message)
        })
        console.log('📤 메시지 전송 완료:', message)
      } else {
        console.warn('⚠️ STOMP 연결되지 않음')
      }
      
      // 내가 보낸 메시지를 UI에 즉시 추가
      appendMessage(message, true)
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
            {messages.map((message, index) => {
              // 토큰에서 사용자 ID 추출하여 내 메시지인지 판단
              const token = localStorage.getItem('accessToken')
              let myUserId = null
              
              if (token) {
                try {
                  const payload = JSON.parse(atob(token.split('.')[1]))
                  myUserId = payload.sub || payload.userId || payload.id
                } catch (error) {
                  console.error('토큰 파싱 실패:', error)
                }
              }
              
              const isMine = myUserId && message.senderId === myUserId
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