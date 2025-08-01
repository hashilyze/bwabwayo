'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import ChatRoomItem from '@/components/chat/ChatRoomItem'
import { useRoomListStore } from '@/stores/chatroom/roomListStore'

interface ChatRoom {
  id: number;
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { roomList, setRoomList } = useRoomListStore();
  
  // URL에서 현재 선택된 roomId 가져오기 
  const currentRoomId = params?.roomId ? Number(params.roomId) : null;
  
  // 컴포넌트 마운트 시 채팅방 목록 로드
  useEffect(() => {
    setRoomList();
  }, [setRoomList]);
  
  const handleChatRoomSelect = (chatRoom: ChatRoom) => {
    console.log(`채팅방 ${chatRoom.id} 선택됨`);
    router.push(`/chat/${chatRoom.id}`);
  }

  return (
    <div className="flex h-[600px] bg-white">
      {/* 좌측 채팅 목록 */}
      <div className="w-[640px] border-r border-gray-200">
        {/* 헤더 */}
        <div className="h-[84px] bg-white border-b border-gray-200 flex items-center px-5">
          <h1 className="text-xl font-bold text-black">전체 대화</h1>
        </div>
        
        {/* 채팅 목록 */}
        <div className="flex-1 overflow-y-auto">
          {roomList.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              chatRoom={{ id: room.roomId }}
              roomData={room}
              onSelect={handleChatRoomSelect}
              isSelected={currentRoomId === room.roomId}
            />
          ))}
        </div>
      </div>

      {/* 우측 채팅 화면 */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 