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

  // 현재 사용자와 상대방을 구분하는 함수
  const getPartnerName = () => {
    const layoutRoom = isLayoutChatRoom(roomData) ? roomData : null;
    const regularRoom = !isLayoutChatRoom(roomData) ? roomData : null;
    
    if (layoutRoom) {
      // 현재 사용자가 판매자인 경우 구매자 이름을, 구매자인 경우 판매자 이름을 반환
      const currentUserId = layoutRoom.userId;
      const sellerId = layoutRoom.seller.id;
      const buyerId = layoutRoom.buyer.id;
      
      if (currentUserId === sellerId) {
        return layoutRoom.buyer.nickname; // 구매자 이름
      } else if (currentUserId === buyerId) {
        return layoutRoom.seller.nickname; // 판매자 이름
      } else {
        return layoutRoom.partnerNickName; // fallback
      }
    }
    
    if (regularRoom) {
      return regularRoom.partnerNickName;
    }
    
    if (chatRoom) {
      return chatRoom.partnerNickName;
    }
    
    return '알 수 없음';
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
      className={`h-[120px] flex items-center px-5 cursor-pointer ${
        isSelected 
          ? 'bg-[#fffde2] border-r-4 border-r-[#FFAE00]' 
          : 'bg-white hover:bg-gray-50'
      }`}
      onClick={handleClick}
    >
      <div className="w-[80px] h-[80px] bg-gray-200 rounded-full mr-[18px]">
         <img 
           src={(() => {
             if (layoutRoom) {
               // 현재 사용자가 판매자인 경우 구매자 프로필을, 구매자인 경우 판매자 프로필을 반환
               const currentUserId = layoutRoom.userId;
               const sellerId = layoutRoom.seller.id;
               const buyerId = layoutRoom.buyer.id;
               
               if (currentUserId === sellerId) {
                 return layoutRoom.buyer.profileImageUrl; // 구매자 프로필
               } else if (currentUserId === buyerId) {
                 return layoutRoom.seller.profileImageUrl; // 판매자 프로필
               } else {
                 return layoutRoom.seller.profileImageUrl; // fallback
               }
             }
             return chatRoom?.seller?.profileImageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`;
           })()}
           alt={`${getPartnerName()} 프로필`}
           className="w-full h-full rounded-full object-cover"
         />
       </div>
       
       <div className="flex flex-col flex-1">
         <div className="flex items-center">
           <span className="text-lg font-bold text-black mr-2">
             {getPartnerName()}
           </span>
          <div className="w-[2px] h-[2px] bg-gray-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-500">
            {formatTime(layoutRoom?.lastMessage?.createdAt || regularRoom?.lastChatmessageDto?.createdAt || regularRoom?.lastMessageTime || chatRoom?.lastMessage?.createdAt)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-md text-gray-500 truncate flex-1 mr-2">
            {(() => {
              const message = layoutRoom?.lastMessage?.content || regularRoom?.lastChatmessageDto?.content || regularRoom?.lastMessageContent || chatRoom?.lastMessage?.content || '메시지 없음';
              const messageType = layoutRoom?.lastMessage?.type || regularRoom?.lastChatmessageDto?.type || chatRoom?.lastMessage?.type;

              // IMAGE 타입인 경우 "이미지를 보냈습니다." 표시
              if (messageType === 'IMAGE') {
                return '이미지를 보냈어요';
              }
              else if (messageType === 'CREATE_ROOM'){
                return '[시스템] 새로운 채팅방이 생성되었어요';
              }
              else if (messageType === 'RESERVE_VIDEOCALL'){
                return '[시스템] 화상 거래가 예약되었어요';
              }
              else if (messageType === 'CANCEL_VIDEOCALL'){
                return '[시스템] 화상 거래가 취소되었어요';
              }
              else if (messageType === 'START_VIDEOCALL'){
                return '[시스템] 화상 거래가 시작되었어요';
              }
              else if (messageType === 'START_TRADE'){
                return '[시스템] 거래가 시작되었어요';
              }
              else if (messageType === 'REQUEST_DEPOSIT'){
                return '[시스템] 결제를 해주세요';
              }
              else if (messageType === 'INPUT_DELIVERY_ADDRESS'){
                return '[시스템] 배송지를 입력해주세요';
              } 
              else if (messageType === 'INPUT_TRACKING_NUMBER'){
                return '[시스템] 송장번호를 입력해주세요';
              }
              else if (messageType === 'START_DELIVERY'){
                return '[시스템] 배송이 시작되었어요';
              }
              else if (messageType === 'CONFIRM_PURCHASE'){
                return '[시스템] 구매 확정을 해주세요';
              }
              else if (messageType === 'END_TRADE'){
                return '[시스템] 거래가 종료되었어요';
              }

              
              
              return message.length > 25 ? message.substring(0, 25) + '...' : message;
            })()}
          </p>
          
        </div>
        <p className="text-md text-gray-400">
          [{layoutRoom?.product?.title || regularRoom?.productName || chatRoom?.product?.title || '상품'}] 상품
        </p>
      </div>
      
      <div className="w-[60px] h-[60px] bg-gray-300 rounded ml-2">
        <img 
          src={layoutRoom?.product?.imageUrl || regularRoom?.product?.thumnail || chatRoom?.product?.imageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`}
          alt="상품 이미지" 
          className="w-full h-full rounded object-cover"
        />
      </div>
    </div>
  );
}