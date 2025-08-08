'use client'

import ChatModal from '@/components/chat/ChatModal'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore'
import AllModals from '@/components/chat/modals/AllModals'
import VideoConference from '@/components/openvidu/VideoConference';
import ReservationModal from '@/components/chat/ReservationModal'
import InputPriceModal from '@/components/chat/modals/InputPriceModal'

export default function ChatRoomPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const roomId = Number(params.roomId)
  const { messages, getMessageHistory, connectStomp, currentSelectedRoom } = useChatRoomStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [isInputPriceModalOpen, setIsInputPriceModalOpen] = useState(false);
  const [isHeaderModalOpen, setIsHeaderModalOpen] = useState(false);

  const openReservationModal = () => setIsReservationModalOpen(true);
  const closeReservationModal = () => setIsReservationModalOpen(false);
  const openInputPriceModal = () => setIsInputPriceModalOpen(true);
  const closeInputPriceModal = () => setIsInputPriceModalOpen(false);
  const openHeaderModal = () => setIsHeaderModalOpen(true);
  const closeHeaderModal = () => setIsHeaderModalOpen(false);

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
        // 1. 메시지 히스토리 로드
        await getMessageHistory(roomId)
        
        // 2. STOMP 연결
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
  }, [roomId, getMessageHistory, connectStomp])

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ block: 'end' })
    }
  }, [messages])

  // InputPriceModal 열기 이벤트 감지
  useEffect(() => {
    const handleOpenInputPriceModal = () => {
      openInputPriceModal();
    };

    window.addEventListener('openInputPriceModal', handleOpenInputPriceModal);

    return () => {
      window.removeEventListener('openInputPriceModal', handleOpenInputPriceModal);
    };
  }, []);

  // URL 파라미터에서 현재 사용자 ID 결정
  const getMyUserId = () => {
    return currentSelectedRoom?.userId.toString() || null;
  }

  const myUserId = getMyUserId()
  // console.log('내 사용자 ID:', myUserId);

  return (
    <div className="h-full flex flex-col justify-between relative overflow-hidden">
      {/* 채팅방 헤더 */}
      <div className="absolute top-0 left-0 right-0 bg-white border-b border-gray-200 z-2 flex flex-col px-5 py-4 gap-2">
        {/* 상품 정보 */}
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-black">고윤정</h1>
          {/* 메뉴 버튼 */}
          <ul className="flex items-center h-5 gap-1 cursor-pointer" onClick={openHeaderModal}>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
            <li className="w-1 h-1 bg-gray-400 rounded-full"></li>
          </ul>
        </div>

        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 flex items-center justify-center">
            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} alt="상품 이미지" className="object-cover" />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500">팝마트 라부부 코카콜라 시리즈 인형 키링</span>
            <span className="text-sm font-semibold text-black">70,000원</span>
          </div>
        </div>
            <div>
      {/* 채팅 UI... */}

      {/* 화상 채팅 시작 버튼 */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        onClick={handleVideoButtonClick}
      >
        화상 채팅 시작
      </button>

      {/* 버튼 클릭하면 바로 VideoConference 컴포넌트 렌더 */}
      {isVideoChatOpen && (
        <VideoConference
          videoRoomId={videoRoomId || 17}
          onClose={closeVideoChat}
        />
      )}
    </div>
      </div>

      {/* 채팅방 헤더 모달 */}
      {isHeaderModalOpen && (
        <div className="absolute inset-0 z-20">
          {/* 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/50" onClick={closeHeaderModal}></div>
          
          {/* 모달 컨테이너 */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg">
            <div className="h-[70px] flex items-center justify-center border-b border-gray-100 cursor-pointer hover:bg-gray-50" onClick={() => {
              console.log('채팅방 나가기');
              closeHeaderModal();
            }}>
              <span className="text-black font-medium">채팅방 나가기</span>
            </div>
            <div className="h-[70px] flex items-center justify-center cursor-pointer hover:bg-gray-50" onClick={() => {
              console.log('신고하기');
              closeHeaderModal();
            }}>
              <span className="text-black font-medium">신고하기</span>
            </div>
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 영역 */}
      <div 
        className="chat-container overflow-y-auto p-4 pt-[160px]"
      >
        <div className="mb-10 flex flex-col gap-2 items-center">
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} alt="판매자 프로필" className="object-cover" />
          </div>
          <h1 className="text-[18px] font-bold text-black">고윤정</h1>
          <div className="flex items-center gap-1 mb-2">
            <p className="text-sm text-gray-500">4.8</p>
            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/star-on.svg`} className="pb-1" alt="별점" />
            <p className="text-sm text-gray-500">(100)</p>
          </div>
          <p className="text-sm text-gray-500">지금까지 174개의 상품을 판매했어요</p>
        </div>

        {!messages || messages.length === 0 || !messages.every(msg => msg && typeof msg === 'object') ? (
          <div className="text-center text-gray-500 py-8">
            <p>아직 메시지가 없습니다.</p>
            <p className="text-sm mt-10">첫 번째 메시지를 보내보세요!</p>
          </div>
                 ) : (
           <>
             {messages && messages.filter(message => message && typeof message === 'object').map((message, index) => {
               // 내가 보낸 메시지인지 판단 (senderId와 내 사용자 ID 비교)
               const isMine = myUserId ? String(message.senderId) === String(myUserId) : false

              // 공지글 타입 구분
              let noticeType = '';
              if (message.content.startsWith('화상채팅예약')) {
                noticeType = 'video'; // 화상 채팅 예약
              } else if (message.content.startsWith('거래시작')) {
                noticeType = 'start'; // 거래 시작
              } else if (message.content.startsWith('입금확인')) {
                noticeType = 'check'; // 입금 확인
              } else if (message.content.startsWith('배송지계좌')) {
                noticeType = 'lotation'; // 배송지계좌
              } else if (message.content.startsWith('배송조회')) {
                noticeType = 'delivery'; // 배송 조회
              }
              
              // 공지글인 경우 특별한 디자인 적용
              if (message.type != "TEXT") {
                //console.log(message.content);
                //console.log(message.type);
                return (
                  <div
                    key={index}
                    className="w-full flex justify-center my-6"  // ← 가운데 정렬, 위아래 마진
                  >
                    <AllModals message={message} type={message.type} />
                  </div>
                );
              }
              
              // 일반 메시지
              return (
                <div
                  key={index}
                  className={`mb-4 flex items-end gap-2 justify-start ${isMine ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-full ${
                      isMine
                        ? 'bg-[#0047A5] text-white py-4 px-5'
                        : 'bg-[#979CA4] text-white py-4 px-5'
                    }`}
                  >
                  <div className="text-sm">{message.content}</div>
                  </div>
                    <div className={`text-xs text-[#666666]`}>
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

      {/* 가격 입력 모달 조건부 렌더링 */}
      {isInputPriceModalOpen && <InputPriceModal onClose={closeInputPriceModal} roomId={roomId} />}

      {/* + 버튼 */}
      <ChatModal onOpenReservationModal={openReservationModal} myUserId={myUserId} />
    </div>
  )
}