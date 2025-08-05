'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ChatRoomItem from '@/components/chat/ChatRoomItem'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';

interface ChatRoom {
  id: number;
  thumbnail?: string;
  productName?: string;
  partnerNickName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { roomList, getRoomList } = useChatRoomStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // URL에서 현재 선택된 roomId 가져오기 
  const currentRoomId = params?.roomId ? Number(params.roomId) : null;
  
  // 채팅방 목록 업데이트 로깅
  useEffect(() => {
    const loadRoomList = async () => {
      try {
        setIsLoading(true)
        await getRoomList()
        console.log("채팅방 목록 로드 완료:", roomList)
      } catch (error) {
        console.error("채팅방 목록 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRoomList()
  }, [getRoomList]);

  console.log("layout", roomList)
  
  // 채팅방 선택 시
  const handleChatRoomSelect = (chatRoom: ChatRoom) => {
    try {
      router.push(`/chat/${chatRoom.id}`);
    } catch (error) {
      console.error(`❌ 채팅방 ${chatRoom.id} 선택 중 오류:`, error);
      // 오류가 발생해도 페이지 이동은 진행
      router.push(`/chat/${chatRoom.id}`);
    }
  }

  return (
    <div className="flex h-[600px] bg-white">
      {/* 좌측 채팅 목록 */}
      <div className="w-[640px] border-r border-gray-200 overflow-y-auto">
        {/* 헤더 */}
        <div className="h-[84px] bg-white border-b border-gray-200 flex items-center px-5">
          <h1 className="text-xl font-bold text-black">전체 대화</h1>
        </div>
        
        {/* 채팅 목록 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">채팅방 목록을 불러오는 중...</p>
              </div>
            </div>
          ) : roomList.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-2">아직 채팅방이 없습니다</p>
                <p className="text-xs text-gray-400">상품을 구매하거나 판매하면 채팅방이 생성됩니다</p>
              </div>
            </div>
          ) : (
            roomList.map((room) => (
              <ChatRoomItem 
                key={room.roomId} 
                chatRoom={{ 
                  id: room.roomId,
                  thumbnail: room.product?.thumnail || '',
                  productName: room.productName || '',
                  lastMessage: room.lastChatmessageDto?.content || room.lastMessageContent || '',
                  lastMessageTime: room.lastChatmessageDto?.createdAt || room.lastMessageTime || '',
                  unreadCount: room.unreadMessagesNum || 0
                }}
                roomData={room}
                onSelect={handleChatRoomSelect}
                isSelected={currentRoomId === room.roomId}
              />
            ))
          )}
        </div>
      </div>

      {/* 우측 채팅 화면 */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 