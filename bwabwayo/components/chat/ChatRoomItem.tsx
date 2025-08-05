import Image from "next/image";

interface ChatRoom {
  id: number;
  thumbnail?: string;
  productName?: string;
  partnerNickName?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
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
  chatRoom: ChatRoom;
  roomData?: RoomData;
  onSelect?: (chatRoom: ChatRoom) => void;
  isSelected?: boolean;
}

export default function ChatRoomItem({ chatRoom, roomData, onSelect, isSelected }: ChatRoomItemProps) {
  const handleClick = () => {
    console.log(`${chatRoom.id} 채팅방 선택됨`);
    onSelect?.(chatRoom);
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

  return (
    <div 
      className={`h-[92px] border-b border-gray-100 flex items-center px-5 cursor-pointer ${
        isSelected 
          ? 'bg-blue-50 border-r-4 border-r-blue-500' 
          : 'bg-white hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="w-[60px] h-[60px] bg-gray-200 rounded-full mr-[18px]">
        <Image 
          src='/image/sample.png'
          alt={`${roomData?.partnerNickName || roomData?.seller.nickname} 프로필`}
          className="w-full h-full rounded-full object-cover"
          width={60}
          height={60}
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="text-base font-bold text-black mr-2">
            {roomData?.partnerNickName || roomData?.seller.nickname || chatRoom.partnerNickName}
          </span>
          <div className="w-[2px] h-[2px] bg-gray-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-500">
            {formatTime(roomData?.lastChatmessageDto?.createdAt || roomData?.lastMessageTime || chatRoom.lastMessageTime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 truncate flex-1 mr-2">
            {roomData?.lastChatmessageDto?.content || roomData?.lastMessageContent || chatRoom.lastMessage || '메시지 없음'}
          </p>
          {(roomData?.unreadMessagesNum || chatRoom.unreadCount) && (roomData?.unreadMessagesNum || chatRoom.unreadCount || 0) > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {roomData?.unreadMessagesNum || chatRoom.unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          [{roomData?.productName || chatRoom.productName || '상품'}] 상품
        </p>
      </div>
      
      <div className="w-[40px] h-[40px] bg-gray-300 rounded ml-2">
        <Image 
          src={roomData?.product?.thumnail || chatRoom.thumbnail || '/image/no-image.jpg'}
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