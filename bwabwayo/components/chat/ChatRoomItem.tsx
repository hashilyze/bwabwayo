interface ChatRoom {
  id: number;
}

interface RoomData {
  roomId: number;
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
        <img 
          src='/image/sample.png'
          alt={`${roomData?.seller.nickname} 프로필`} 
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center mb-1">
          <span className="text-base font-bold text-black mr-2">{roomData?.seller.nickname}</span>
          <div className="w-[2px] h-[2px] bg-gray-500 rounded-full mr-2"></div>
          <span className="text-xs text-gray-500">{roomData?.lastMessageTime}</span>
        </div>
        <p className="text-xs text-gray-500 truncate">{roomData?.lastMessageContent}</p>
      </div>
      
      <div className="w-[40px] h-[40px] bg-gray-300 rounded">
        <img 
          src={roomData?.product.thumnail}
          alt="상품 이미지" 
          className="w-full h-full rounded object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/image/no-image.jpg';
          }}
        />
      </div>
    </div>
  );
}