'use client'

import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useEffect, useRef, useState } from 'react'
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
  const { messages, stompClient, isConnected, connectStomp, disconnectStomp, appendMessage, roomInfo } = useChatRoomStore()
  const chatBodyRef = useRef<HTMLDivElement>(null)
  const [messageInput, setMessageInput] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('연결 중...')

  useEffect(() => {
    console.log('🚀 채팅방 페이지 마운트 - Room ID:', roomId)
    
    // STOMP 연결 및 구독
    connectStomp(roomId)
    
    // 연결 상태 모니터링
    const checkConnection = setInterval(() => {
      if (isConnected) {
        setConnectionStatus('연결됨')
      } else {
        setConnectionStatus('연결 중...')
      }
    }, 1000)
    
    return () => {
      // 컴포넌트 언마운트 시 연결 해제
      disconnectStomp()
      clearInterval(checkConnection)
    }
  }, [roomId, connectStomp, disconnectStomp, isConnected])

  useEffect(() => {
    // 메시지가 추가될 때마다 스크롤을 맨 아래로
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !isConnected) return

    // localStorage에서 토큰 가져오기
    const token = localStorage.getItem('accessToken')
    if (!token) {
      console.error('❌ 토큰이 없습니다')
      return
    }

    // URL 파라미터에서 상대방 ID 가져오기
    const buyerId = searchParams.buyerId || ''
    const sellerId = searchParams.sellerId || ''

    // 현재 사용자가 누구인지 판단하여 receiverId 결정
    let receiverId = ''
    if (token === buyerId) {
      // 현재 사용자가 구매자인 경우, 판매자에게 메시지 전송
      receiverId = sellerId
    } else if (token === sellerId) {
      // 현재 사용자가 판매자인 경우, 구매자에게 메시지 전송
      receiverId = buyerId
    } else {
      console.error('❌ 현재 사용자가 채팅방의 참여자가 아닙니다')
      return
    }

    const message: ChatMessage = {
      roomId: roomId,
      senderId: token,
      receiverId: receiverId,
      content: messageInput.trim(),
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
        console.log('📤 메시지 전송:', message.content)
      } else {
        console.warn('⚠️ STOMP 연결되지 않음')
      }
      
      // 내가 보낸 메시지를 UI에 즉시 추가
      appendMessage(message, true)
      
      // 입력창 초기화
      setMessageInput('')
    } catch (error) {
      console.error('❌ 메시지 전송 실패:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* 채팅 헤더 */}
      <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-bold">💬 채팅방 #{roomId}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{connectionStatus}</span>
        </div>
      </div>

      {/* 채팅 정보 */}
      <div className="bg-gray-100 p-3 text-sm text-gray-600 border-b">
        <div className="flex items-center gap-4">
          <span>Room ID: {roomId}</span>
          <span>Sender: {localStorage.getItem('accessToken') || 'Unknown'}</span>
          <span>Receiver: {searchParams.buyerId || searchParams.sellerId || 'Unknown'}</span>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div 
        ref={chatBodyRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">아직 메시지가 없습니다</p>
            <p className="text-sm">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const token = localStorage.getItem('accessToken')
              const isMine = message.senderId === token
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMine && (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold">
                      👤
                    </div>
                  )}
                  
                  <div className="max-w-xs lg:max-w-md">
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        isMine
                          ? 'bg-blue-500 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm border border-gray-200'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                    </div>
                    <div className={`text-xs text-gray-500 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                      {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                  
                  {isMine && (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      나
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* 채팅 입력 영역 */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            전송
          </button>
        </div>
        
        {!isConnected && (
          <div className="text-center text-red-500 text-sm mt-2">
            ⚠️ 연결 중입니다. 잠시만 기다려주세요...
          </div>
        )}
      </div>
    </div>
  )
} 