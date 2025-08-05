import Image from "next/image";

// 레이아웃에서 사용하는 ChatRoom 타입과 동일하게 정의
interface ChatRoom {
  buyer: {
    id: number;
    nickname: string;
    profileImageUrl: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    receiverId: number;
    roomId: number;
    senderId: number;
    type: string;
  };
  partnerNickName: string;
  product: {
    canDelivery: boolean;
    canDirect: boolean;
    canNegotiate: boolean;
    id: number;
    imageUrl: string;
    price: number;
    saleStatus: string;
    shippingFee: number;
    title: string;
  };
  roomId: number;
  seller: {
    avgRating: number;
    dealCount: number;
    id: number;
    nickname: string;
    profileImageUrl: string;
    reviewCount: number;
  };
  unreadCount: number;
  userId: number;
  userNickname: string;
}

interface RoomData {
  roomId: number;
  productName: string;
  partnerNickName: string;
  partnerId: string;
  lastChatmessageDto: {
    content: string;
    createdAt: string;
    type: string;
  };
  unreadMessagesNum: number;
  lastMessageContent: string;
  lastMessageTime: string;
  type: string;
  seller: {
    id: number;
    nickname: string;
  };
  product: {
    id: number;
    thumnail: string;
  };
}

interface ChatRoomItemProps {
  chatRoom?: ChatRoom;
  roomData?: RoomData | ChatRoom;
  onSelect?: (chatRoom: ChatRoom) => void | Promise<void>;
  isSelected?: boolean;
}

export default function ChatRoomItem({ chatRoom, roomData, onSelect, isSelected }: ChatRoomItemProps) {
  const handleClick = async () => {
    console.log(`${roomData?.roomId || chatRoom?.roomId} 채팅방 선택됨`);
    await onSelect?.(roomData as ChatRoom || chatRoom as ChatRoom);
  };

  // 시간 포맷팅 함수
  const formatTime = (timeString?: string) => {
    if (!timeString) return '';
    const date = new Date(timeString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } else {
      return date.toLocaleDateString('ko-KR', { 
        month: '2-digit', 
        day: '2-digit' 
      });
    }
  };

  // LayoutChatRoom인지 확인하는 함수
  const isLayoutChatRoom = (data: any): data is ChatRoom => {
    return data && 'buyer' in data && 'seller' in data && 'product' in data;
  };

  const layoutRoom = isLayoutChatRoom(roomData) ? roomData : null;
  const regularRoom = !isLayoutChatRoom(roomData) ? roomData : null;

  return (
    <div 
      className={`h-[92px] flex items-center px-5 cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 border-r-4 border-r-blue-500' 
          : 'bg-white hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="w-[60px] h-[60px] bg-gray-200 rounded-full mr-[18px]">
        <Image 
          src='/image/no-image.jpg'
          alt={`${layoutRoom?.partnerNickName || layoutRoom?.seller?.nickname || regularRoom?.partnerNickName || regularRoom?.seller?.nickname || chatRoom?.partnerNickName} 프로필`}
          className="w-full h-full rounded-full object-cover"
          width={60}
          height={60}
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="text-base font-bold text-black mr-2">
            {layoutRoom?.partnerNickName || layoutRoom?.seller?.nickname || regularRoom?.partnerNickName || regularRoom?.seller?.nickname || chatRoom?.partnerNickName}
          </span>
          <div className="w-[2px] h-[2px] bg-gray-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-500">
            {formatTime(layoutRoom?.lastMessage?.createdAt || regularRoom?.lastChatmessageDto?.createdAt || regularRoom?.lastMessageTime || chatRoom?.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate flex-1 mr-2">
            {layoutRoom?.lastMessage?.content || regularRoom?.lastChatmessageDto?.content || regularRoom?.lastMessageContent || chatRoom?.lastMessage?.content || '메시지 없음'}
          </p>
          {(layoutRoom?.unreadCount || regularRoom?.unreadMessagesNum || chatRoom?.unreadCount) && (layoutRoom?.unreadCount || regularRoom?.unreadMessagesNum || chatRoom?.unreadCount || 0) > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {layoutRoom?.unreadCount || regularRoom?.unreadMessagesNum || chatRoom?.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          [{layoutRoom?.product?.title || regularRoom?.productName || chatRoom?.product?.title || '상품'}] 상품
        </p>
      </div>
      
      <div className="w-[40px] h-[40px] bg-gray-300 rounded ml-2">
        <Image 
          src={layoutRoom?.product?.imageUrl || regularRoom?.product?.thumnail || chatRoom?.product?.imageUrl || '/image/no-image.jpg'}
          alt="상품 이미지" 
          className="w-full h-full rounded object-cover"
          width={40}
          height={40}
          unoptimized
        />
      </div>
    </div>
  );
}