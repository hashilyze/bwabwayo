'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import ChatRoomItem from '@/components/chat/ChatRoomItem'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';
import { useAuthStore } from '@/stores/auth/authStore'
import { useNotificationStore } from '@/stores/notificationStore'         

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
  const { 
    roomList, 
    getRoomList, 
    setCurrentSelectedRoom, 
    connectStomp,
    disconnectStomp,
    isConnected,
    isConnecting,    
  } = useChatRoomStore();
  const { markChatAsRead } = useNotificationStore();
  const [isLoading, setIsLoading] = useState(true);
  
  // URL에서 현재 선택된 roomId 가져오기 
  const currentRoomId = params?.roomId ? Number(params.roomId) : null;
  
  // STOMP 연결 관리 - 레이아웃 마운트 시 연결
  useEffect(() => {
    if (!isConnected && !isConnecting) {
      console.log('🔗 ChatLayout: STOMP 연결 시작');
      connectStomp(); // roomId 없이 연결 (채팅방 목록만 구독)
    }
  }, []); // 빈 배열로 한 번만 실행
  

  useEffect(() => {
    return () => {
      console.log('🔗 ChatLayout: STOMP 연결 해제');
      disconnectStomp();
    };
  }, [disconnectStomp]);


  // 현재 선택된 채팅방 정보를 store에 설정
  useEffect(() => {
    if (currentRoomId && roomList.length > 0) {
      const selectedRoom = roomList.find(room => room.roomId === currentRoomId);
      if (selectedRoom) {
        setCurrentSelectedRoom(selectedRoom);
      }
    }
  }, [currentRoomId, roomList, setCurrentSelectedRoom]);

  // 초기 채팅방 목록 로드 (한 번만)
  useEffect(() => {
    const loadInitialRoomList = async () => {
      try {
        setIsLoading(true)
        await getRoomList()
        // console.log('📋 초기 채팅방 목록 로드 완료');
      } catch (error) {
        // console.error("📋 초기 채팅방 목록 로드 실패:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInitialRoomList()
  }, [getRoomList])

  // 탭 활성화 상태 감지 및 알림 자동 읽음 처리
  useEffect(() => {
    if (!currentRoomId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 탭이 활성화되었을 때 현재 채팅방의 알림을 자동으로 읽음 처리
        markChatAsRead(currentRoomId);
      }
    };

    // 페이지 로드 시 즉시 실행 (현재 탭이 활성화된 상태)
    if (document.visibilityState === 'visible') {
      markChatAsRead(currentRoomId);
    }

    // 탭 활성화 상태 변경 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentRoomId, markChatAsRead]);

  // 채팅방 선택 시
  const handleChatRoomSelect = async (chatRoom: ChatRoom) => {
    try {
      // 선택된 채팅방 정보를 store에 저장
      setCurrentSelectedRoom(chatRoom);

      try {
          await markChatAsRead(chatRoom.roomId);
          // console.log('✅ 채팅방 알림 자동 읽음 처리 완료');
        } catch (error) {
          console.error('❌ 채팅방 알림 읽음 처리 실패:', error);
        }
      
      // 기존 채팅방이므로 바로 해당 방으로 이동
      router.push(`/chat/${chatRoom.roomId}?productId=${chatRoom.product.id}`)
    } catch (error) {
      console.error('채팅방 입장 중 오류:', error);
    }
  }

  // roomList 변경 감지 로깅
  useEffect(() => {
    // console.log('📋 ChatLayout: roomList 변경 감지:', roomList.length);
  }, [roomList]);

  return (
    <div className="flex h-[820px] bg-white container-default m-auto border border-[#eee]">
      {/* 좌측 채팅 목록 */}
      <div className="w-[640px] border-r border-gray-200 relative">
        {/* 연결 상태 표시 (개발용) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-2 right-2 z-20">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                 title={isConnected ? 'STOMP 연결됨' : 'STOMP 연결 안됨'} />
          </div>
        )}
        
        {/* 채팅 목록 컨테이너 */}
        <div className="h-full overflow-y-auto flex flex-col [&::-webkit-scrollbar]:w-[10px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent [&::-webkit-scrollbar-thumb]:bg-clip-padding [&::-webkit-scrollbar-button]:hidden">
          {/* 헤더 */}
          <div className="min-h-[100px] bg-white flex items-center px-5 sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-black">전체 대화</h1>
          </div>
          
          {/* 채팅 목록 */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">채팅방 목록을 불러오는 중...</p>
                </div>
              </div>
            ) : !Array.isArray(roomList) || roomList.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <p className="text-lg text-gray-500 mb-2">아직 채팅방이 없습니다</p>
                  <p className="text-md text-gray-400">상품을 구매하거나 판매하면 채팅방이 생성됩니다</p>
                </div>
              </div>
            ) : (
              roomList
                .sort((a, b) => {
                  // lastMessage가 없는 경우 맨 아래로
                  if (!a.lastMessage && !b.lastMessage) return 0;
                  if (!a.lastMessage) return 1;
                  if (!b.lastMessage) return -1;
                  
                  // lastMessage.createdAt 기준으로 최신순 정렬 (내림차순)
                  return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
                })
                .map((room) => (
                  <ChatRoomItem 
                    key={`room-${room.roomId}-${room.lastMessage?.createdAt || 'no-msg'}`} // 키에 lastMessage 시간 포함으로 리렌더링 보장
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