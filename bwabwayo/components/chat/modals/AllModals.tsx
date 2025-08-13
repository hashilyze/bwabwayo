'use client'

import { useEffect, useState, useRef } from 'react';
import { useChatRoomStore } from "@/stores/chatting/chatRoomStore"
import { useMyAddressStore } from "@/stores/mypage/myAddressStore"
import useSendTypeMessageStore from '@/stores/chatting/sendTypeMessage'
import { OverlayPortal } from "@/components/chat/modals/OverlayPortal"
import TrackingNumberModal from '@/components/chat/modals/TrackingForm'
import FinalPriceModal from '@/components/chat/modals/FinalPriceForm'
import { PaymentCheckoutPage } from '@/components/chat/modals/tossPay/PaymentCheckout'
import PurchaseConfirm from '@/components/chat/modals/PurchaseConfirm'

import AddressSelectModal, { AddressItem } from '@/components/chat/modals/DeliverySelectForm'
import Link from 'next/link';

interface ChatMessage {
  content: string;
  createdAt: string;
}

// 전역 채팅방 정보 컴포넌트
const ChatRoomProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};

// 전역에서 사용할 채팅방 정보 가져오는 함수
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
    userId: currentSelectedRoom.userId
  };
};

// CREATE_ROOM,        // 방 생성 시 전송
const CreateRoomModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  // 로딩 상태일 때도 기본적인 메시지 표시
  if (!chatInfo) {
    return (
      <article className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-between">
          <header className="flex items-center gap-3 mb-2">
            <div className="w-[60px] h-[60px] bg-gray-200 rounded-[10px] animate-pulse"></div>
            <p className="text-md text-gray-500">채팅방이 생성되었습니다.</p>
          </header>
          <div className="text-[#7c7c7c] text-md w-full mb-2">
            <p>채팅방 정보를 불러오는 중...</p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <>
      <article className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-between">
          <header className="flex items-center gap-3 mb-2">
            <img
              className="relative w-[60px] h-[60px] object-cover rounded-[10px]"
              alt="product image"
              src={chatInfo.product.imageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/nintendo.jpg`}
            />
            <p className="text-md">
              '{chatInfo.partner.nickname}' 님과 {chatInfo.product.title}에 대한 이야기를 시작해보세요.
            </p>
          </header>
          <section className="flex flex-col gap-1 text-[#7c7c7c] text-md w-full mb-2">
            <p>
              · 상품 금액 : {chatInfo.product.formattedPrice}
              <br />· 거래 방법 : {chatInfo.product.deliveryMethods}
              <br />· 배송비 : {chatInfo.product.formattedShippingFee}
              {chatInfo.product.canNegotiate && (
                <>
                  <br />· 가격 협상 가능
                </>
              )}
            </p>
          </section>
          <Link
            href={`/product/${chatInfo.product.id}`}
            className="py-2 px-6 font-bold text-center text-md bg-[#fce94f] rounded-[20px] border-2 border-black cursor-pointer transition-all duration-200 hover:scale-105"
          >
            상품상세 보기
          </Link>
        </div>
      </article>
      {/* 시간 표시 */}
      <div className="my-3 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  );
};

// RESERVE_VIDEOCALL,       // 화상거래 예약 후 전송
const ReserveVideoCallModal = ({ message }: { message: ChatMessage }) => {
  const [isListButtonHovered, setIsListButtonHovered] = useState(false);
  const [isCancelButtonHovered, setIsCancelButtonHovered] = useState(false);
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  const handleReservationList = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('화상예약목록보기');
  }

  const handleCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('취소하기');
  }

  // 로딩 상태일 때도 기본적인 메시지 표시
  if (!chatInfo) {
    return (
      <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-between">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="w-[70px] h-[70px] bg-gray-200 rounded animate-pulse"></div>
            <div className="flex flex-col items-start gap-1.5">
              <p className="text-md text-gray-500">화상 거래가 예약되었습니다.</p>
              <div className="text-[#7c7c7c] text-md">예약 정보를 불러오는 중...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-between">
          <div className="flex items-center justify-between gap-3 mb-3">
            <img
              className="w-[70px] h-[70px] aspect-[1] object-cover"
              alt="Calendar appointment icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/reservation-icon.png`}
            />

            <div className="flex items-start justify-center gap-3">
              <div className="flex flex-col items-start gap-1.5">
                <p className="text-md">
                  '{chatInfo?.partner.nickname || 'OOO'}' 님이 화상 거래를 예약했어요!
                </p>

                <div className="flex flex-col items-start gap-1">
                  <div className="text-[#7c7c7c] text-md">
                    일정: 2025-08-06(수) 오전 10:00
                  </div>

                  <div className="text-[#7c7c7c] text-md">
                    사용 포인트 : 1,000 P
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between gap-2">
            <button
              className={`py-2 px-6 bg-[#fce94f] rounded-[20px] border-2 border-black cursor-pointer transition-all duration-200 ${isListButtonHovered ? "transform scale-105 shadow-lg" : ""
                }`}
              onClick={(e) => handleReservationList(e)}
              onMouseEnter={() => setIsListButtonHovered(true)}
              onMouseLeave={() => setIsListButtonHovered(false)}
              aria-label="화상 거래 목록 보기"
            >
              <span className="font-semibold text-black text-md text-center">
                화상 거래 목록 보기
              </span>
            </button>

            <button
              className={`py-2 px-6 rounded-[20px] border-2 border-black cursor-pointer transition-all duration-200 ${isCancelButtonHovered ? "transform scale-105 shadow-lg" : ""
                }`}
              onClick={(e) => handleCancel(e)}
              onMouseEnter={() => setIsCancelButtonHovered(true)}
              onMouseLeave={() => setIsCancelButtonHovered(false)}
              aria-label="예약 취소하기"
            >
              <span className="font-semibold text-black text-md text-center">
                취소하기
              </span>
            </button>
          </div>
        </div>
      </div>
      {/* 시간 표시 */}
      <div className="my-4 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  );
};

//CANCEL_VIDEOCALL,         // 화상거래 예약 취소 후 전송
const CancelVideoCallModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  return (
    <>
      <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-around gap-3">
          <div className="flex items-center gap-[10px]">
            <img
              className="w-[65px] h-[58px] aspect-[1.12]"
              alt="Sad cat icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/sadCat-icon.png`}
            />

            <div className="flex items-start justify-center gap-3">
              <div className="flex flex-col items-start gap-1.5">
                <p className="text-md">
                  {chatInfo?.partner.nickname || 'OO'} 님과 화상 거래 예약이 취소되었어요!
                </p>

                <div className="text-[#7c7c7c] text-md">
                  일정: 2025-08-06(수) 오전 10:00
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* 시간 표시 */}
      <div className="my-4 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  )
}

//START_VIDEOCALL,           // 화상거래 시작 후 전송
const StartVideoCallModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const openVideoChat = useChatRoomStore(state => state.openVideoChat);
  const currentSelectedRoom = useChatRoomStore(state => state.currentSelectedRoom);
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용
  const videoSessionId = message.content;

  const handleStart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('화상채팅 시작');
  

    if (!currentSelectedRoom) {
      console.error('현재 선택된 채팅방 정보가 없습니다.');
      alert('채팅방 정보를 찾을 수 없습니다.');
      return;
    }

    if (!videoSessionId) {
      console.error('화상채팅 세션ID가 없습니다.');
      alert('화상채팅 예약이 필요합니다.');
      return;
    }

    try {
      openVideoChat(Number(videoSessionId));
      console.log('화상채팅 시작 - 세션ID:', videoSessionId);
    } catch (error) {
      console.error('화상채팅 시작 실패:', error);
      alert('화상채팅을 시작할 수 없습니다.');
    }
  }

  return (
    <>
    <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
      <div className="flex flex-col items-center justify-between">
        <div className="flex items-center justify-center gap-3">
          <img
            className="w-[78px] h-[70px] aspect-[1.11] object-cover"
            alt="videoChatCat"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/videoChatCat-icon.png`}
          />

          <div className="flex flex-col items-start gap-1.5">
            <p className="text-md">
              지금, {chatInfo?.partner.nickname || 'OOO'} 님과 화상 거래가 시작되었어요!
            </p>

            <div className="text-[#7c7c7c] text-md">
              일정: 2025-08-06(수) 오전 10:00
            </div>
          </div>
        </div>
        <button
          className={`mt-3 py-2 px-6 bg-[#fce94f] rounded-[20px] border-2 border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
            }`}
          onClick={(e) => handleStart(e)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label="화상 거래 하러 하기"
        >
          <div className="font-bold text-center text-md">
            화상 거래 하러 하기
          </div>
        </button>
      </div>
    </div>
      {/* 시간 표시 */}
      <div className="my-4 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  );
};

// START_TRADE,           // 거래 시작 - 거래 시작 버튼 클릭 시 전송
const StartTradeModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo()
  const isSeller = !!chatInfo?.isCurrentUserSeller
  const { setFinalPrice } = useChatRoomStore()
  const { price } = useSendTypeMessageStore()

  const [open, setOpen] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)
  const [finalPrice, setFinalPriceLocal] = useState('')

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!isSeller) return
    setOpen(true)
  }

  const handleRequest = () => {
    if (!finalPrice || Number(finalPrice) <= 0) {
      alert('유효한 금액을 입력해주세요.')
      return
    }
    const priceNumber = Number(finalPrice)
    console.log('StartTradeModal - setting finalPrice:', priceNumber)
    console.log('StartTradeModal - roomId:', chatInfo?.roomId)
    
    // 스토어에 finalPrice 설정 (즉시 설정)
    setFinalPrice(priceNumber)
    
    // 설정 후 즉시 확인
    const currentFinalPrice = useChatRoomStore.getState().finalPrice
    console.log('StartTradeModal - finalPrice immediately after setting:', currentFinalPrice)
    
    // 메시지 전송 (백엔드 API + 채팅 메시지)
    price(chatInfo?.roomId || 0, priceNumber)
    
    // 추가 확인을 위한 지연 로그
    setTimeout(() => {
      const delayedFinalPrice = useChatRoomStore.getState().finalPrice
      console.log('StartTradeModal - finalPrice after 100ms:', delayedFinalPrice)
    }, 100)
    
    setOpen(false)
  }

  // chatInfo가 로드되지 않았거나 seller가 아니면 모달을 보이지 않음
  if (!chatInfo || !isSeller) {
    return null;
  }

  return (
    <>
    <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
      <div className="flex flex-col items-center justify-between">
        <div className="flex items-center justify-between gap-3">
          <img
            className="w-[75px] h-[75px] object-cover"
            alt="Money"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/money-icon.png`}
          />
          <p className="text-md text-black">
            '{chatInfo?.partner.nickname || ''}' 님과 거래가 시작되었어요.
            <br />
            최종 거래 가격을 입력해주세요!
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className={`py-2 px-6 bg-[#fce94f] rounded-[20px] border-2 border-black transition-all duration-200 ${isButtonHovered ? 'scale-105 shadow-lg' : ''}`}
          aria-label="최종 거래 가격 설정하기"
        >
          <span className="font-bold text-md text-black">
            최종 거래 가격 설정하기
          </span>
        </button>
      </div>

      {/* 🔽 포탈로 finalPriceForm 띄우기 */}
      <OverlayPortal open={open} onClose={() => setOpen(false)}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-[20px] border-2 border-black w-[400px]">
            <div className="flex flex-col items-center gap-4">
              <h3 className="text-lg font-bold text-black">최종 거래 가격 설정</h3>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  거래 가격 (원)
                </label>
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPriceLocal(e.target.value)}
                  placeholder="가격을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setOpen(false)}
                  className="flex-1 py-2 px-4 bg-gray-300 text-black rounded-lg hover:bg-gray-400 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleRequest}
                  className="flex-1 py-2 px-4 bg-[#fce94f] text-black rounded-lg hover:bg-yellow-400 transition-colors font-bold"
                >
                  요청하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </OverlayPortal>


    </div>
      {/* 시간 표시 */}
      <div className="my-3 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>

  )
}


//REQUEST_DEPOSIT,        // 입금 요청 - 최종 가격 설정 후 전송
const RequestDepositeModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const chatInfo = useChatRoomInfo();
  const { finalPrice } = useChatRoomStore();

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('결제 요청');
    
    // 결제 금액이 유효한지 확인
    if (!paymentAmount || paymentAmount <= 0) {
      alert('유효한 결제 금액이 설정되지 않았습니다. 판매자에게 문의해주세요.');
      return;
    }
    
    setIsPaymentModalOpen(true);
  }

  // store의 finalPrice를 우선 사용하고, 없으면 message.content에서 추출
  // message.content에서 숫자만 추출하는 정규식 개선
  const extractAmountFromMessage = (content: string) => {
    if (!content || content.trim() === '') {
      console.log('extractAmountFromMessage - content is empty');
      return '';
    }
    
    console.log('extractAmountFromMessage - extracting from:', content);
    
    // 여러 패턴으로 가격 추출 시도
    const patterns = [
      /최종\s*거래\s*가격[:\s]*(\d{1,3}(,\d{3})*|\d+)\s*원/, // "최종 거래 가격: 100,000원" 형태
      /(\d{1,3}(,\d{3})*|\d+)\s*원/, // "100,000원" 형태
      /가격[:\s]*(\d{1,3}(,\d{3})*|\d+)/, // "가격: 100,000" 형태
      /(\d{1,3}(,\d{3})*|\d+)/, // 일반적인 숫자
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        const extracted = match[1] ? match[1].replace(/,/g, '') : match[0].replace(/,/g, '');
        console.log('extractAmountFromMessage - extracted:', extracted, 'from pattern:', pattern);
        return extracted;
      }
    }
    console.log('extractAmountFromMessage - no amount found');
    return '';
  };

  // 금액 결정 로직 개선
  let amount = '';
  
  // 1. 스토어에서 finalPrice 확인 (가장 우선순위)
  const storeFinalPrice = useChatRoomStore.getState().finalPrice;
  console.log('RequestDepositeModal - storeFinalPrice (direct):', storeFinalPrice);
  
  if (finalPrice && finalPrice > 0) {
    amount = finalPrice.toString();
    console.log('RequestDepositeModal - using finalPrice from props:', finalPrice);
  } else if (storeFinalPrice && storeFinalPrice > 0) {
    amount = storeFinalPrice.toString();
    console.log('RequestDepositeModal - using storeFinalPrice:', storeFinalPrice);
  } else if (message.content && message.content.trim() !== '') {
    // 2. message.content에서 추출 시도
    amount = extractAmountFromMessage(message.content);
    console.log('RequestDepositeModal - using extracted amount from message:', amount);
  } else {
    // 3. 모든 방법이 실패한 경우
    console.log('RequestDepositeModal - no amount found from any source');
    amount = '';
  }
  
  const formattedAmount = amount ? Number(amount).toLocaleString() + '원' : '0원';
  const paymentAmount = amount ? Number(amount) : 0;

  console.log('RequestDepositeModal - finalPrice from store:', finalPrice);
  console.log('RequestDepositeModal - message.content:', message.content);
  console.log('RequestDepositeModal - message.content length:', message.content?.length);
  console.log('RequestDepositeModal - message.content type:', typeof message.content);
  console.log('RequestDepositeModal - extracted amount:', amount);
  console.log('RequestDepositeModal - paymentAmount:', paymentAmount);
  console.log('RequestDepositeModal - chatInfo roomId:', chatInfo?.roomId);

  // buyer인지 확인
  const isBuyer = chatInfo?.isCurrentUserBuyer;

  // chatInfo가 로드되지 않았거나 buyer가 아니면 모달을 보이지 않음
  if (!chatInfo || !isBuyer) {
    return null;
  }

  return (
    <>
      <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-between gap-3">
            <img
              className="relative w-[97px] h-[37px] aspect-[2.62]"
              alt="Toss icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/toss-icon.png`}
            />
            <div className="flex flex-col text-md">
              <p>최종 거래 가격이 설정되었어요</p>
              <p className="font-bold my-1">{formattedAmount}</p>
              <p>결제를 진행해 주세요!</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStart}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={`py-2 px-6 bg-[#fce94f] rounded-[20px] border-2 border-black transition-all duration-200 ${isButtonHovered ? 'scale-105 shadow-lg' : ''}`}
            aria-label="결제하기"
          >
            <span className="font-bold text-md text-black">
              결제하기
            </span>
          </button>
        </div>
      </div>
      {/* 시간 표시 */}
      <div className="my-4 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>

      {/* PaymentCheckout 모달 */}
      <OverlayPortal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <PaymentCheckoutPage
          onClose={() => setIsPaymentModalOpen(false)}
          amount={paymentAmount}
          orderName={chatInfo?.product?.title || "상품"}
          roomId={chatInfo?.roomId || 0}
          productId={chatInfo?.product?.id || 0}
        />
      </OverlayPortal>
    </>
  );
};



//INPUT_DELIVERY_ADDRESS,  // 배송지 입력 - 입금 완료 후 전송
const InputDeliveryAddressModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [open, setOpen] = useState(false)
  const { addresses, loading, error, fetchAddresses } = useMyAddressStore();
  const { sendMessage, currentSelectedRoom } = useChatRoomStore();
  const chatInfo = useChatRoomInfo();
  const isBuyer = chatInfo?.isCurrentUserBuyer;

  // 컴포넌트 마운트 시 주소 목록 가져오기
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // Address 타입을 AddressItem 타입으로 변환
  const addressItems: AddressItem[] = addresses.map((addr: any) => ({
    id: addr.id,
    address: `${addr.address} ${addr.addressDetail}`,
    detail: `${addr.recipientName} (${addr.recipientPhoneNumber})`,
  }));

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('배송지 입력 요청');
    
    // 로딩 중이거나 에러가 있으면 처리하지 않음
    if (loading) {
      console.log('주소 목록을 불러오는 중입니다...');
      return;
    }
    
    if (error) {
      console.error('주소 목록 로딩 실패:', error);
      alert('주소 목록을 불러오는데 실패했습니다. 다시 시도해주세요.');
      return;
    }
    
    setOpen(true);
  }

  // chatInfo가 로드되지 않았거나 buyer가 아니면 모달을 보이지 않음
  if (!chatInfo || !isBuyer) {
    return null;
  }

  return (
    <>
    <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
      <div className="flex flex-col items-center justify-between">
        <div className="flex items-center justify-between gap-3">
            <img
              className="relative w-[85px] h-[66px] aspect-[1.29]"
              alt="Money cat icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/moneyCat-icon.png`}
            />
            <div className="text-md text-black">
              입금이 완료되었어요.
              <br />
              배송지를 입력해 주세요!
            </div>

          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            className={`py-2 px-6 mt-3 bg-[#fce94f] rounded-[20px] border-2 border-black transition-all duration-200 ${isButtonHovered ? 'scale-105 shadow-lg' : ''}`}
            aria-label="배송지 입력"
          >
            <span className="font-bold text-md text-black">
              배송지 입력하기
            </span>
          </button>

          <OverlayPortal open={open} onClose={() => setOpen(false)}>
            <AddressSelectModal
              items={addressItems}
              initialSelectedId="home"
              onConfirm={(selectedAddress) => { 
                setOpen(false);
                
                // selectedAddress는 이미 AddressItem 객체이므로 바로 사용
                if (selectedAddress) {
                  const messageContent = `배송지가 입력 되었어요.${JSON.stringify(selectedAddress)}`; 
                  console.log('📝 생성된 메시지 내용:', messageContent);
                  
                  if (currentSelectedRoom) {                  
                    // 구매자에게 INPUT_TRACKING_NUMBER 메시지 전송
                    try {
                      sendMessage(currentSelectedRoom.roomId, messageContent, "INPUT_TRACKING_NUMBER");
                    } catch (error: any) {
                    }
                  }
                }
              }}
              onClose={() => setOpen(false)}
              onAddAddress={() => alert('배송지 추가 모달 열기')}
            />
          </OverlayPortal>

        </div>
      </div>
      {/* 시간 표시 */}
      <div className="my-4 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  );
};


//INPUT_TRACKING_NUMBER,    // 송장번호 입력 - 배송지 입력 완료 후 전송
const InputTrackingAddressModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [openTracking, setOpenTracking] = useState(false)
  const chatInfo = useChatRoomInfo();
  const isSeller = chatInfo?.isCurrentUserSeller;
  
  // 메시지에서 배송지 정보 파싱
  const parseDeliveryInfo = () => {
    try {
      if (message.content.startsWith('배송지가 입력 되었어요.')) {
        const addressData = message.content.replace('배송지가 입력 되었어요.', '');
        if (addressData.trim()) {
          const parsedData = JSON.parse(addressData);
          return parsedData;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };
  
  const deliveryInfo = parseDeliveryInfo();

  // chatInfo가 로드되지 않았거나 seller가 아니면 모달을 보이지 않음
  if (!chatInfo || !isSeller) {
    return null;
  }

  return (
    <>
    <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
      <div className="flex flex-col items-center justify-between">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="text-md flex items-center gap-2">
            <img
              className="relative w-[75px] h-[75px] ml-[-14.00px] aspect-[1] object-cover"
              alt="Box icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/box-icon.png`}
            />
            <p>배송지가 입력 되었어요.<br/>
            택배 발송 후, 송장번호를 입력해 주세요!</p>
          </div>

          {deliveryInfo && (
            <div className="text-md text-gray-600 mb-4">
              <p><strong>배송지:</strong> {deliveryInfo.address}</p>
              <p><strong>수령인:</strong> {deliveryInfo.detail}</p>
            </div>
          )}
        </div>

        <button
           type="button"
           onClick={() => setOpenTracking(true)}
           onMouseEnter={() => setIsButtonHovered(true)}
           onMouseLeave={() => setIsButtonHovered(false)}
           className={`py-2 px-6 bg-[#fce94f] rounded-[20px] border-2 border-black transition-all duration-200 ${isButtonHovered ? 'scale-105 shadow-lg' : ''}`}
           aria-label="송장번호 입력하기"
         >
           <span className="font-bold text-md text-black">
             송장번호 입력하기
           </span>
         </button>
       </div>
       <OverlayPortal open={openTracking} onClose={() => setOpenTracking(false)}>
         <TrackingNumberModal
           onClose={() => setOpenTracking(false)}
           onSubmit={(v) => {
             console.log('송장 등록 값:', v)
             
             // invoice 함수 호출
             const { currentSelectedRoom } = useChatRoomStore.getState();
             const { invoice } = useSendTypeMessageStore.getState();
             if (currentSelectedRoom) {
               // invoice 함수 호출 (택배사명과 송장번호 전달)
               invoice(currentSelectedRoom.roomId, v.carrier, v.trackingNumber);
             }
             
             setOpenTracking(false)
           }}
         />
       </OverlayPortal>
     </div>
       {/* 시간 표시 */}
       <div className="my-3 text-md text-[#666666] text-center">
         <span className="">
           {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
             hour: 'numeric',
             minute: '2-digit',
             hour12: true
           })}
         </span>
       </div>
     </>
   );
 };

//START_DELIVERY,     // 배송 시작 - 송장번호 입력 후 전송
const StartDeliveryModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  // 메시지에서 택배사와 송장번호 정보 파싱
  const parseDeliveryInfo = () => {
    try {
      const deliveryData = JSON.parse(message.content);
      return {
        carrier: deliveryData.carrier,
        trackingNumber: deliveryData.trackingNumber
      };
    } catch (error) {
      console.error('배송 정보 파싱 실패:', error);
      return null;
    }
  };

  const deliveryInfo = parseDeliveryInfo();

  return (
    <>
      <div className="w-[400px] py-6 px-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-around gap-3">
          <div className="flex gap-4 items-center">
            <img
              className="relative w-[55px] h-[70px] aspect-[0.79]"
              alt="Delivery cat icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/deliveryCat-icon.png`}
            />
            <div className="">
              <p className="text-md">
                '{chatInfo?.product.title || ''}'의 배송이 시작되었어요!
              </p>
              
              {/* 택배사와 송장번호 정보 표시 */}
              {deliveryInfo && (
                <div className="mt-2 text-md text-gray-600">
                  <p><strong>택배사:</strong> {deliveryInfo.carrier}</p>
                  <p><strong>송장번호:</strong> {deliveryInfo.trackingNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* 시간 표시 */}
      <div className="my-3 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  )
}


//CONFIRM_PURCHASE, // 구매 확정 요청 - 송장번호 입력 후 전송
const ConfirmPurchaseModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [showPurchaseConfirm, setShowPurchaseConfirm] = useState(false);
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용
  const isBuyer = chatInfo?.isCurrentUserBuyer;

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('구매 확정 모달 열기');
    setShowPurchaseConfirm(true);
  }

  const handlePurchaseConfirm = () => {
    console.log('구매 확정 완료');
    setShowPurchaseConfirm(false);
    
    // END_TRADE 타입의 메시지 전송
    const { sendMessage, currentSelectedRoom } = useChatRoomStore.getState();
    if (currentSelectedRoom) {
      sendMessage(currentSelectedRoom.roomId, '구매가 확정되었습니다.', 'END_TRADE');
    }
  }

  const handlePurchaseCancel = () => {
    console.log('구매 확정 취소');
    setShowPurchaseConfirm(false);
  }

  // chatInfo가 로드되지 않았거나 buyer가 아니면 모달을 보이지 않음
  if (!chatInfo || !isBuyer) {
    return null;
  }

  return (
    <>
    <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
      <div className="flex flex-col items-center justify-between">
        <div className="flex items-center justify-between gap-3">
          <img
            className="relative h-16 aspect-[1.09]"
            alt="Box cat icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/boxCat-icon.png`}
          />

          <div className="flex flex-col items-start">
            <p className="text-md">
              '{chatInfo?.product.title || ''}'을(를) 받아 보셨나요?<br/>
              구매 확정을 해주세요!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleStart}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          className={`mt-4 py-2 px-6 bg-[#fce94f] rounded-[20px] border-2 border-black transition-all duration-200 ${isButtonHovered ? 'scale-105 shadow-lg' : ''}`}
          aria-label="구매 확정하기"
        >
          <span className="font-bold text-md text-black">
            구매 확정하기
          </span>
        </button>
      </div>
          </div>

      {/* PurchaseConfirm 모달 */}
      <OverlayPortal open={showPurchaseConfirm} onClose={() => setShowPurchaseConfirm(false)}>
        <PurchaseConfirm 
          roomId={chatInfo?.roomId || 0}
          onConfirm={handlePurchaseConfirm}
          onCancel={handlePurchaseCancel}
        />
      </OverlayPortal>

      {/* 시간 표시 */}
      <div className="my-3 text-md text-[#666666] text-center">
        <span className="text-md text-[#666666]">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  );
};


//END_TRADE // 구매확정 거래 종료 - 구매 확정 후 전송
const EndTradeModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  return (
    <>
      <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-between">
          <div className="flex items-center justify-between gap-3">
            <img
              className="relative w-[67px] h-[67px] aspect-[1] object-cover"
              alt="point icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/point-icon.png`}
            />
            <div className="text-md">
              '{chatInfo?.product.title || ''}'의 구매가 확정 되었어요!
            </div>
          </div>
        </div>
      </div>
      {/* 시간 표시 */}
      <div className="my-4 text-md text-[#666666] text-center">
        <span className="">
          {new Date(message.createdAt).toLocaleTimeString('ko-KR', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    </>
  )
}


export default function AllModals({ message, type }: { message: ChatMessage, type: string }) {
  const chatInfo = useChatRoomInfo();
  
  // chatInfo가 로드되지 않았을 때는 로딩 상태 표시
  if (!chatInfo) {
    return (
      <div className="w-[400px] p-6 rounded-[30px] border-2 border-black">
        <div className="flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse mb-4"></div>
          <p className="text-md text-gray-500">메시지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {type === 'CREATE_ROOM' && <CreateRoomModal message={message} />}
      {type === 'RESERVE_VIDEOCALL' && <ReserveVideoCallModal message={message} />}
      {type === 'START_TRADE' && <StartTradeModal message={message} />}
      {type === 'CANCEL_VIDEOCALL' && <CancelVideoCallModal message={message} />}
      {type === 'START_VIDEOCALL' && <StartVideoCallModal message={message} />}
      {type === 'INPUT_TRACKING_NUMBER' && <InputTrackingAddressModal message={message} />}
      {type === 'INPUT_DELIVERY_ADDRESS' && <InputDeliveryAddressModal message={message} />}
      {type === 'REQUEST_DEPOSIT' && <RequestDepositeModal message={message} />}
      {type === 'START_DELIVERY' && <StartDeliveryModal message={message} />}
      {type === 'CONFIRM_PURCHASE' && <ConfirmPurchaseModal message={message} />}
      {type === 'END_TRADE' && <EndTradeModal message={message} />}
    </div>
  )
}