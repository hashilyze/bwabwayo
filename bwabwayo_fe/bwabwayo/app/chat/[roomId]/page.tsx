'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useModalStore } from '@/stores/modalStore'
import { useNotificationStore } from '@/stores/notificationStore'
import AllModals from '@/components/chat/modals/AllModals'
import VideoPortal from '@/components/openvidu/VideoPortal'
import ReservationModal from '@/components/chat/ReservationModal'
import { ReportModal } from '@/components/chat/modals/ReportModal'
import Link from 'next/link'

// 전역에서 사용할 채팅방 정보 가져오는 함수 (AllModals.tsx와 동일)
const useChatRoomInfo = () => {
  const { currentSelectedRoom } = useChatRoomStore();

  if (!currentSelectedRoom) return null;

  const { product, seller, buyer, userId } = currentSelectedRoom;
  const isCurrentUserBuyer = userId === buyer.id;
  const partner = isCurrentUserBuyer ? seller : buyer;

  return {
    product: {
      ...product,
      formattedPrice: product.price?.toLocaleString() + '원',
      formattedShippingFee: product.shippingFee?.toLocaleString() + '원',
      deliveryMethods: [
        product.canDirect && '직거래',
        product.canDelivery && '일반택배'
      ].filter(Boolean).join('/')
    },
    partner,
    currentUser: isCurrentUserBuyer ? buyer : seller,
    isCurrentUserBuyer,
    isCurrentUserSeller: userId === seller.id,
    roomId: currentSelectedRoom.roomId,
    userId: currentSelectedRoom.userId,
    unreadCount: currentSelectedRoom.unreadCount,
    lastMessage: currentSelectedRoom.lastMessage
  };
};

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const rid = Number(params.roomId);
  const roomId = Number(params.roomId);

  const {
    roomList,
    messages,
    getMessageHistory,
    connectStomp,
    currentSelectedRoom,
    sendMessage,
    getRoomList,
    setCurrentSelectedRoom,
    isConnected,
    stompClient,
    isConnecting,
    subscribeToRoom,
    unsubscribeFromRoom,
    videoRoomId,
    openVideoChat,
    closeVideoChat,
    isVideoChatOpen
  } = useChatRoomStore()
  const { closePaymentModal } = useModalStore()
  const { markChatAsRead } = useNotificationStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // 전역 채팅방 정보 가져오기
  const chatInfo = useChatRoomInfo();

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);


  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);
  const openHeaderModal = () => setIsHeaderModalOpen(true);
  const closeHeaderModal = () => setIsHeaderModalOpen(false);
  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  // 화상 채팅 버튼 클릭 시 openVideoChat 호출
  const handleVideoButtonClick = () => {
    // 현재 선택된 방 ID를 가져오거나 기본값 사용
    const roomId = videoRoomId || 17;
    openVideoChat(roomId);
  };

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      connectStomp();
    }
  }, [isConnected, isConnecting, connectStomp]);

  useEffect(() => { getRoomList(); }, [getRoomList]);

  useEffect(() => {
    if (!Number.isFinite(rid) || roomList.length === 0) return;
    const matched = roomList.find(r => r.roomId === rid);
    if (matched) {
      setCurrentSelectedRoom(matched);
    }
  }, [rid, roomList, setCurrentSelectedRoom]);


  useEffect(() => {
    if (!Number.isFinite(roomId)) return;
    if (isConnected) subscribeToRoom(roomId);
    return () => unsubscribeFromRoom(roomId);
  }, [roomId, isConnected, subscribeToRoom, unsubscribeFromRoom]);

  // 채팅방 목록 로드 및 currentSelectedRoom 설정
  useEffect(() => {
    const loadRoomList = async () => {
      try {
        // console.log('📋 채팅방 목록 로드 시작...');
        await getRoomList();
        console.log('✅ 채팅방 목록 로드 완료');
      } catch (error) {
        console.error('❌ 채팅방 목록 로드 실패:', error);
      }
    };

    loadRoomList();
  }, [getRoomList]);

  // console.log(roomList)

  // roomId가 변경될 때마다 메시지 초기화
  useEffect(() => {
    // console.log('🔄 채팅방 변경 감지:', roomId);
    const { clearMessages } = useChatRoomStore.getState();
    clearMessages();
    setIsInitialized(false);
  }, [roomId]);



  // currentSelectedRoom이 설정되면 해당 채팅방으로 초기화
  useEffect(() => {
    if (currentSelectedRoom && currentSelectedRoom.roomId === roomId && !isInitialized) {
      const initializeChat = async () => {
        try {
          // console.log('🚀 채팅 초기화 시작...', roomId);

          // 1. 메시지 히스토리 로드
          await getMessageHistory(roomId)

          // 2. STOMP 연결 (채팅방별 구독)
          connectStomp(roomId)

          // 3. 채팅방 관련 알림 자동 읽음 처리
          try {
            await markChatAsRead(roomId);
            // console.log('✅ 채팅방 알림 자동 읽음 처리 완료');
          } catch (error) {
            // console.error('❌ 채팅방 알림 읽음 처리 실패:', error);
          }

          setIsInitialized(true);
          // console.log('✅ 채팅 초기화 완료');
        } catch (error) {
          console.error('❌ 채팅 초기화 실패:', error)
        }
      }

      initializeChat()
    }
  }, [currentSelectedRoom, roomId, getMessageHistory, connectStomp, isInitialized])

  // STOMP 연결 상태 모니터링
  useEffect(() => {
    // console.log('🔌 STOMP 연결 상태:', isConnected);
    if (isConnected && stompClient) {
      console.log('✅ STOMP 클라이언트 연결됨');
    } else if (!isConnected && !isConnecting && roomId) {
      console.log('🔄 STOMP 연결이 끊어짐, 재연결 시도...');
      // 연결이 끊어졌을 때 자동 재연결
      setTimeout(() => {
        connectStomp(roomId);
      }, 1000);
    }
  }, [isConnected, stompClient, isConnecting, roomId, connectStomp]);




  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동 (개선된 버전)
  useEffect(() => {
    if (messages && messages.length > 0 && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const lastMessage = messages[messages.length - 1];
      const isLastMessageNotice = lastMessage && lastMessage.type !== "TEXT";
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      // 기타 공지글이거나 하단 근처에 있을 때 스크롤
      if (isLastMessageNotice || isNearBottom) {
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 10);
      }
    }
  }, [messages]);

  // 채팅방 진입 시 즉시 맨 아래로 스크롤
  useEffect(() => {
    if (isInitialized && chatContainerRef.current) {
      // 채팅방 진입 시 즉시 맨 아래로 스크롤
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isInitialized]);



  // 컴포넌트가 언마운트될 때 STOMP 연결을 해제합니다.
  useEffect(() => {
    return () => {
      const { disconnectStomp } = useChatRoomStore.getState()
      disconnectStomp()
    }
  }, [])

  // URL 파라미터에서 현재 사용자 ID 결정
  const getMyUserId = () => {
    return currentSelectedRoom?.userId.toString() || null;
  }

  const myUserId = getMyUserId()

  // partner가 seller인지 buyer인지 확인하는 함수
  const getPartnerInfo = () => {
    if (!chatInfo) return null;

    const partner = chatInfo.partner;
    const isPartnerSeller = 'avgRating' in partner; // seller인지 확인

    return {
      nickname: partner.nickname,
      profileImageUrl: partner.profileImageUrl,
      avgRating: isPartnerSeller ? (partner as any).avgRating : null,
      reviewCount: isPartnerSeller ? (partner as any).reviewCount : 0,
      dealCount: isPartnerSeller ? (partner as any).dealCount : 0,
      isPartnerSeller
    };
  };

  const partnerInfo = getPartnerInfo();

  // 로딩 상태 처리
  if (!chatInfo || !partnerInfo) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">채팅방 정보를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between relative overflow-hidden">
      {/* 채팅방 헤더 */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-2 flex flex-col px-5 py-4 gap-2">
        {/* 상품 정보 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl mb-1 font-semibold text-black">{partnerInfo.nickname}</h1>
          {/* 메뉴 버튼 */}
          <ul className="flex items-center h-5 gap-1 cursor-pointer" onClick={openHeaderModal}>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
          </ul>
        </div>

        <div className="flex gap-2">
          <div className="w-15 h-15 bg-gray-200 flex items-center justify-center overflow-hidden rounded border border-[#eee]">
            <img
              src={chatInfo.product.imageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`}
              alt="상품 이미지"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Link className="text-md text-gray-500" href={`/product/${chatInfo.product.id}`}>{chatInfo.product.title}</Link>
            <span className="text-md font-semibold text-black">{chatInfo.product.formattedPrice}</span>
          </div>
        </div>
      </div>

      {/* 채팅방 헤더 모달 */}
      {isHeaderModalOpen && (
        <div className="absolute inset-0 z-20">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50" onClick={closeHeaderModal}></div>

          {/* 모달 컨테이너 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg">
            <div className="h-[70px] flex items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => {
              console.log('신고하기');
              closeHeaderModal();
              openReportModal();
            }}>
              <span className="text-black font-medium">신고하기</span>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div ref={chatContainerRef} className="chat-container overflow-y-auto p-4 pt-[160px] flex-1">
        <div className="mb-10 flex flex-col gap-2 items-center">
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={partnerInfo.profileImageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`}
              alt="파트너 프로필"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-[18px] font-bold text-black">{partnerInfo.nickname}</h1>

          {/* 판매자인 경우에만 평점 정보 표시 */}
          {partnerInfo.isPartnerSeller && (
            <>
              <div className="flex items-center gap-1 mb-2">
                <p className="text-sm text-gray-500">
                  {partnerInfo.avgRating ? partnerInfo.avgRating.toFixed(1) : '신규'}
                </p>
                <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/star-on.svg`} className="pb-1" alt="별점" />
                <p className="text-sm text-gray-500">
                  ({partnerInfo.reviewCount || 0})
                </p>
              </div>
              <p className="text-sm text-gray-500">
                지금까지 {partnerInfo.dealCount || 0}개의 상품을 판매했어요
              </p>
            </>
          )}

          {/* 구매자인 경우 간단한 정보만 표시 */}
          {!partnerInfo.isPartnerSeller && (
            <p className="text-sm text-gray-500">
              함께 안전한 거래를 진행해요!
            </p>
          )}
        </div>

        {!messages || messages.length === 0 || !messages.every(msg => msg && typeof msg === 'object') ? (
          <div className="text-center text-gray-500 py-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-md mt-10">첫 번째 메시지를 보내보세요!</p>
          </div>
        ) : (
          <>
            {messages && messages
              .filter(message => message && typeof message === 'object')
              .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // 시간순 정렬
              .map((message, index) => {
                // IMAGE 타입 메시지 처리
                if (message.type === "IMAGE") {
                  // 내가 보낸 메시지인지 판단 (senderId와 내 사용자 ID 비교)
                  const isMine = String(message.senderId) === String(myUserId);

                  return (
                    <div
                      key={`${message.type}-${index}-${message.createdAt}`}
                      className={`mb-4 flex items-end gap-2 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${isMine ? 'order-2' : 'order-1'}`}>
                        <AllModals message={message} type={message.type} />
                      </div>
                      <div className={`text-sm text-[#666666] ${isMine ? 'order-1' : 'order-2'}`}>
                        {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </div>
                    </div>
                  );
                }

                // 기타 공지글인 경우 즉시 표시 (myUserId 확인 불필요)
                if (message.type != "TEXT") {
                  console.log("메세지 도착 : " + message.content +" "+message.type)
                  return (
                    <div
                      key={`${message.type}-${index}-${message.createdAt}`}
                      className="w-full flex justify-center my-6"  // ← 가운데 정렬, 위아래 마진
                    >
                      <AllModals message={message} type={message.type} />
                    </div>
                  );
                }

                // 일반 텍스트 메시지인 경우 myUserId 확인 후 표시
                if (!myUserId) {
                  return (
                    <div
                      key={`loading-${index}`}
                      className="mb-4 flex items-end gap-2 justify-start"
                    >
                      <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-full bg-gray-200 animate-pulse">
                        <div className="text-md text-transparent">메시지를 불러오는 중...</div>
                      </div>
                    </div>
                  );
                }

                // 내가 보낸 메시지인지 판단 (senderId와 내 사용자 ID 비교)
                const isMine = String(message.senderId) === String(myUserId)

                // 일반 메시지
                return (
                  <div
                    key={`${message.senderId}-${index}-${message.createdAt}`}
                    className={`mb-4 flex items-end gap-2 justify-start ${isMine ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-full ${isMine
                        ? 'bg-[#FFAE00] text-white py-4 px-5'
                        : 'bg-[#979CA4] text-white py-4 px-5'
                        }`}
                    >
                      <div className="text-md">{message.content}</div>
                    </div>
                    <div className={`text-sm text-[#666666]`}>
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

        {/* 스크롤을 위한 빈 div */}
        <div ref={messagesEndRef} />
      </div>

      {/* 예약 모달 조건부 렌더링 */}
      {isReservationModalOpen && <ReservationModal onClose={closeReservationModal} chatRoomId={roomId} />}

      {/* 신고 모달 조건부 렌더링 */}
      {isReportModalOpen && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          sellerNickname={partnerInfo.nickname}
          sellerId={chatInfo.partner.id.toString()}
        />
      )}

      {/* + 버튼 */}
      <ChatModal onOpenReservationModal={openReservationModal} myUserId={myUserId} />

      {/* 화상 채팅 포탈 - 채팅방 목록 위에 오버레이로 표시 */}
      {isVideoChatOpen && (
        <VideoPortal
          videoRoomId={videoRoomId || 17}
          onClose={closeVideoChat}
        />
      )}
    </div>
  )
}