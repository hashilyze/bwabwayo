'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import { useModalStore } from '@/stores/modalStore'
import AllModals from '@/components/chat/modals/AllModals'
import VideoPortal from '@/components/openvidu/VideoPortal'
import ReservationModal from '@/components/chat/ReservationModal'
import { ReportModal } from '@/components/chat/modals/ReportModal'

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
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const roomId = Number(params.roomId)
  const { messages, getMessageHistory, connectStomp, currentSelectedRoom, sendMessage, getRoomList } = useChatRoomStore()
  const { closePaymentModal } = useModalStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 전역 채팅방 정보 가져오기
  const chatInfo = useChatRoomInfo();

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);
  const openHeaderModal = () => setIsHeaderModalOpen(true);
  const closeHeaderModal = () => setIsHeaderModalOpen(false);
  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  const {
    videoRoomId,
    openVideoChat,
    closeVideoChat,
    isVideoChatOpen,
  } = useChatRoomStore();

  // 화상 채팅 버튼 클릭 시 openVideoChat 호출
  const handleVideoButtonClick = () => {
    // 현재 선택된 방 ID를 가져오거나 기본값 사용
    const roomId = videoRoomId || 17;
    openVideoChat(roomId);
  };

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // 1. 채팅방 목록 로드 (currentSelectedRoom 설정을 위해)
        await getRoomList()
        
        // 2. 메시지 히스토리 로드
        await getMessageHistory(roomId)

        // 3. STOMP 연결 (채팅방별 구독)
        connectStomp(roomId)
      } catch (error) {
        console.error('채팅 초기화 실패:', error)
      }
    }

    initializeChat()

    // 컴포넌트가 언마운트될 때 STOMP 연결을 해제합니다.
    return () => {
      const { disconnectStomp } = useChatRoomStore.getState()
      disconnectStomp()
    }
  }, [roomId, getMessageHistory, connectStomp, getRoomList])

  // 메시지 실시간 업데이트 감지
  useEffect(() => {
    console.log('📝 메시지 업데이트 감지:', messages?.length, '개');
  }, [messages]);

  // 결제 성공 처리
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;
    
    const handlePaymentSuccess = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')
      const productId = searchParams.get('productId')

      console.log('🔍 결제 파라미터 확인:', { paymentKey, orderId, amount, roomId, productId })

      if (paymentKey && orderId && amount) {
        try {
          console.log('📡 결제 확인 API 호출 시작...')
          
                     // URL 파라미터에서 productId 가져오기 (우선순위)
           const productIdFromUrl = searchParams.get('productId')
           console.log('🔍 URL에서 가져온 productId:', productIdFromUrl)
           
           // 서버에 결제 확인 요청
             const response = await fetch('https://i13e202.p.ssafy.io/be/api/payments/confirm', {
               method: 'POST',
               headers: {
                 'Content-Type': 'application/json',
                 'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
               },
               body: JSON.stringify({
                 paymentKey,
                 orderId,
                 amount: parseInt(amount),
                 productId: productIdFromUrl || productId
               }),
             })

          console.log('📡 API 응답 상태:', response.status)

          if (!response.ok) {
            throw new Error('결제 확인에 실패했습니다.')
          }

          const result = await response.json()
          console.log('📡 API 응답 결과:', result)

          if (result.status === 'DONE') {
            console.log('✅ 결제 성공! 메시지 전송 시작...')
            
            // 결제 모달 닫기 (먼저 닫기)
            closePaymentModal()
            
            // STOMP 연결 상태 확인 및 재연결 시도
            let retryCount = 0;
            const maxRetries = 3;
            
            while (retryCount < maxRetries) {
              const { stompClient, isConnected, connectStomp } = useChatRoomStore.getState()
              
              if (isConnected && stompClient) {
                console.log('✅ STOMP 연결 상태 정상')
                break;
              }
              
              console.log(`🔄 STOMP 연결 시도 ${retryCount + 1}/${maxRetries}...`)
              try {
                await connectStomp(roomId)
                // 연결 대기
                await new Promise(resolve => setTimeout(resolve, 2000))
                
                // 연결 상태 재확인
                const { stompClient: newStompClient, isConnected: newIsConnected } = useChatRoomStore.getState()
                if (newIsConnected && newStompClient) {
                  console.log('✅ STOMP 재연결 성공')
                  break;
                }
              } catch (error) {
                console.error(`❌ STOMP 재연결 실패 (시도 ${retryCount + 1}):`, error)
              }
              
              retryCount++;
              if (retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000))
              }
            }
            
            if (retryCount >= maxRetries) {
              console.error('❌ STOMP 연결 실패 - 최대 재시도 횟수 초과')
            }
            
            // 메시지 전송 전 추가 대기
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 결제 성공 시 채팅방에 INPUT_DELIVERY_ADDRESS 메시지 전송
            console.log('📤 sendMessage 호출:', { roomId, message: '입금이 완료되었습니다. 배송지를 입력해 주세요!', type: 'INPUT_DELIVERY_ADDRESS' })
            
            try {
              await sendMessage(roomId, '입금이 완료되었습니다. 배송지를 입력해 주세요!', 'INPUT_DELIVERY_ADDRESS')
              console.log('✅ 메시지 전송 완료!')
            } catch (error) {
              console.error('❌ 메시지 전송 실패:', error)
              // 메시지 전송 실패 시에도 계속 진행
            }
            
            console.log('✅ URL 정리 중...')
            
            // URL에서 결제 파라미터 제거 (약간의 지연 후)
            setTimeout(() => {
              try {
                router.replace(`/chat/${roomId}`)
                console.log('✅ URL 정리 완료')
              } catch (error) {
                console.error('❌ URL 정리 실패:', error)
              }
            }, 2000)
          } else {
            console.log('❌ 결제 상태가 DONE이 아님:', result.status)
          }
        } catch (error) {
          console.error('❌ 결제 처리 중 오류:', error)
          // 오류 발생 시에도 URL 정리
          router.replace(`/chat/${roomId}`)
        }
      } else {
        console.log('🔍 결제 파라미터가 없음 - 일반 채팅방 접속')
      }
    }

    handlePaymentSuccess()
  }, [searchParams, roomId, router, closePaymentModal])

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      // 약간의 지연을 두어 DOM 업데이트 완료 후 스크롤
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end' 
        })
      }, 100)
    }
  }, [messages])


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
            <span className="text-md text-gray-500">{chatInfo.product.title}</span>
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
      <div className="chat-container overflow-y-auto p-4 pt-[160px]">
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
            {messages && messages.filter(message => message && typeof message === 'object').map((message, index) => {
              // 공지글인 경우 즉시 표시 (myUserId 확인 불필요)
              if (message.type != "TEXT") {
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
                  key={index}
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