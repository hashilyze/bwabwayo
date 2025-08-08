'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChatRoomItem from '@/components/chat/ChatRoomItem'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';
import VideoConference from '@/components/openvidu/VideoConference';

interface Buyer{
  id: number
  nickname: string
  profileImageUrl: string
}

interface LastMessage{
  content: string
  createdAt: string
  isRead: boolean
  receiverId: number
  roomId: number
  senderId: number
  type: string
}

interface Seller{
  avgRating: number
  dealCount: number
  id: number
  nickname: string
  profileImageUrl: string
  reviewCount: number
}

interface Product{
  canDelivery: boolean
  canDirect: boolean
  canNegotiate: boolean
  id: number
  imageUrl: string
  price: number
  saleStatus: string
  shippingFee: number
  title: string
}

interface ChatRoom {
  buyer: Buyer
  lastMessage: LastMessage
  partnerNickName: string
  product: Product
  roomId: number
  seller: Seller
  unreadCount: number
  userId: number
  userNickname: string
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const { roomList, getRoomList, addChatRoom, setCurrentSelectedRoom, isVideoChatOpen, videoRoomId, closeVideoChat } = useChatRoomStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // URL에서 현재 선택된 roomId 가져오기 
  const currentRoomId = params?.roomId ? Number(params.roomId) : null;
  
  // 현재 선택된 채팅방 정보를 store에 설정
  useEffect(() => {
    if (currentRoomId && roomList.length > 0) {
      const selectedRoom = roomList.find(room => room.roomId === currentRoomId);
      if (selectedRoom) {
        setCurrentSelectedRoom(selectedRoom);
      }
    }
  }, [currentRoomId, roomList, setCurrentSelectedRoom]);

  // 채팅방 목록 업데이트 로깅
  useEffect(() => {
    const loadRoomList = async () => {
      try {
        setIsLoading(true)
        await getRoomList()
      } catch (error) {
        console.error("채팅방 목록 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRoomList()
  }, [getRoomList]);

  // 페이지 포커스 시에만 채팅방 목록 업데이트 (서버 부하 최소화)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const handleFocus = () => {
      // 페이지에 포커스가 있을 때만 업데이트
      interval = setInterval(async () => {
        try {
          await getRoomList()
        } catch (error) {
          console.log("채팅방 목록 업데이트 실패:", error)
        }
      }, 15000)
    };

    const handleBlur = () => {
      // 페이지에서 포커스가 벗어나면 업데이트 중지
      if (interval) {
        clearInterval(interval)
        interval = null
        // console.log("📱 페이지 포커스 해제 - 업데이트 중지")
      }
    };

    // 초기 포커스 설정
    handleFocus();

    // 이벤트 리스너 등록
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      if (interval) {
        clearInterval(interval)
      }
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    }
  }, [getRoomList])

  // console.log("layout", roomList)
  
  // 채팅방 선택 시
  const handleChatRoomSelect = async (chatRoom: ChatRoom) => {
    try {
      // 선택된 채팅방 정보를 store에 저장
      setCurrentSelectedRoom(chatRoom);
      
      // 기존 채팅방이므로 바로 해당 방으로 이동
      router.push(`/chat/${chatRoom.roomId}?productId=${chatRoom.product.id}`)
    } catch (error) {
      console.error('채팅방 입장 중 오류:', error);
    }
  }

  // openvidu 임시 세션 ID (기본값)
  const defaultVideoRoomId = 17;
  
  return (
    <div className="flex h-[600px] bg-white">
      {/* 좌측 채팅 목록 */}
      <div className="w-[640px] border-r border-gray-200 relative">
        {/* 채팅 목록 컨테이너 */}
        <div className="h-full overflow-y-auto">
          {/* 헤더 */}
          <div className="h-[84px] bg-white flex items-center px-5 sticky top-0 z-10">
            <h1 className="text-xl font-bold text-black">전체 대화</h1>
          </div>
          
          {/* 채팅 목록 */}
          <div className="flex-1">
            {isLoading || !roomList ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">채팅방 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : !Array.isArray(roomList) || roomList.length === 0 ? (
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
                  roomData={room}
                  onSelect={handleChatRoomSelect}
                  isSelected={currentRoomId === room.roomId}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 우측 채팅 화면 */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
} 