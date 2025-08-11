'use client'

import { useEffect, useState, useRef } from 'react';
import { useChatRoomStore } from "@/stores/chatting/chatRoomStore"
import { OverlayPortal } from "@/components/chat/modals/OverlayPortal"
import TrackingNumberModal from '@/components/chat/modals/TrackingForm'
import FinalPriceModal from '@/components/chat/modals/FinalPriceForm'
import { PaymentCheckoutPage } from '@/components/chat/modals/tossPay/PaymentCheckout'

import AddressSelectModal, { AddressItem } from '@/components/chat/modals/DeliverySelectForm'

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

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('상품상세 보기');
    if (chatInfo?.product?.id) {
      console.log(`상품 ID: ${chatInfo.product.id}로 이동`);
    }
  }

  if (!chatInfo) {
    return (
      <article className="w-[400px] h-[242px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black flex items-center justify-center">
        <p className="text-gray-500">채팅방 정보를 불러오는 중...</p>
      </article>
    );
  }

  return (
    <article className="w-[400px] h-[242px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[193px] items-center justify-between relative top-7 left-[15px]">
        <header className="inline-flex items-start justify-center gap-3 relative flex-[0_0_auto]">
          <img
            className="relative w-[60px] h-[60px] object-cover rounded-[10px]"
            alt="product image"
            src={chatInfo.product.imageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/nintendo.jpg`}
          />
          <p className="relative w-[291px] mt-[-1.00px] font-medium text-black text-sm tracking-[0] leading-[18px]">
            {chatInfo.partner.nickname} 님과 {chatInfo.product.title}에 대한 이야기를 시작해보세요.
          </p>
        </header>
        <section className="relative self-stretch text-[#7c7c7c] text-xs tracking-[0] leading-[18px]">
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
        <button
          className={`relative w-[150px] h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
            }`}
          onClick={(e) => handleStart(e)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label="상품 상세 보기"
        >
          <span className="absolute h-[17px] top-2.5 left-9 font-bold text-center leading-[normal] text-black text-sm tracking-[0]">
            상품상세 보기
          </span>
        </button>
      </div>
    </article>
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

  return (
    <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[123px] items-center justify-between relative top-7 left-3.5">
        <div className="flex w-[301px] items-center justify-between relative flex-[0_0_auto]">
          <img
            className="relative w-[70px] h-[70px] aspect-[1] object-cover"
            alt="Calendar appointment icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/reservation-icon.png`}
          />

          <div className="flex w-[223px] items-start justify-center gap-3 relative">
            <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]">
              <p className="relative w-fit mt-[-1.00px] font-medium text-black text-sm tracking-[0] leading-[18px] whitespace-nowrap">
                {chatInfo?.partner.nickname || 'OOO'} 님이 화상 거래를 예약했어요!
              </p>

              <div className="inline-flex flex-col items-start relative flex-[0_0_auto]">
                <div className="relative w-fit mt-[-1.00px] [font-family:'SUITE-Medium',Helvetica] font-medium text-[#7c7c7c] text-xs tracking-[0] leading-[18px] whitespace-nowrap">
                  일정: 2025-08-06(수) 오전 10:00
                </div>

                <div className="relative w-fit [font-family:'SUITE-Medium',Helvetica] font-medium text-[#7c7c7c] text-xs tracking-[0] leading-[18px] whitespace-nowrap">
                  사용 포인트 : 1000 P
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-[337px] items-start justify-between relative flex-[0_0_auto]">
          <button
            className={`relative w-40 h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isListButtonHovered ? "transform scale-105 shadow-lg" : ""
              }`}
            onClick={(e) => handleReservationList(e)}
            onMouseEnter={() => setIsListButtonHovered(true)}
            onMouseLeave={() => setIsListButtonHovered(false)}
            aria-label="화상 거래 목록 보기"
          >
            <span className="absolute h-[17px] top-2.5 left-[26px] font-semibold text-black text-sm text-center tracking-[0] leading-[normal]">
              화상 거래 목록 보기
            </span>
          </button>

          <button
            className={`relative w-40 h-10 rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isCancelButtonHovered ? "transform scale-105 shadow-lg" : ""
              }`}
            onClick={(e) => handleCancel(e)}
            onMouseEnter={() => setIsCancelButtonHovered(true)}
            onMouseLeave={() => setIsCancelButtonHovered(false)}
            aria-label="예약 취소하기"
          >
            <span className="absolute h-[17px] top-2.5 left-[55px] [font-family:'SUITE-Bold',Helvetica] font-semibold text-black text-sm text-center tracking-[0] leading-[normal]">
              취소하기
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

//CANCEL_VIDEOCALL,         // 화상거래 예약 취소 후 전송
const CancelVideoCallModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  return (
    <div className="w-[400px] h-[114px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[81px] items-center justify-around gap-3 relative top-4 left-3">
        <div className="flex w-[317px] items-center gap-[10px] relative flex-[0_0_auto]">
          <img
            className="relative w-[65px] h-[58px] aspect-[1.12]"
            alt="Sad cat icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/sadCat-icon.png`}
          />

          <div className="flex w-[223px] items-start justify-center gap-3 relative">
            <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto] ml-[-6.50px] mr-[-6.50px]">
              <p className="mt-[-1.00px] font-medium text-black text-sm realative w-fit tracking-[0] leading-[18px] whitespace-nowrap">
                {chatInfo?.partner.nickname || 'OO'} 님과 화상 거래 예약이 취소되었어요!
              </p>

              <div className="text-[#7c7c7c] text-xs relative w-fit font-medium tracking-[0] leading-[18px] whitespace-nowrap">
                일정: 2025-08-06(수) 오전 10:00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      openVideoChat(currentSelectedRoom.roomId);
      console.log('화상채팅 시작 - 세션ID:', videoSessionId);
    } catch (error) {
      console.error('화상채팅 시작 실패:', error);
      alert('화상채팅을 시작할 수 없습니다.');
    }
  }

  return (
    <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[123px] items-center justify-between relative top-7 left-[15px]">
        <div className="flex w-[371px] items-center justify-center gap-3 relative flex-[0_0_auto]">
          <img
            className="relative w-[78px] h-[70px] aspect-[1.11] object-cover"
            alt="videoChatCat"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/videoChatCat-icon.png`}
          />

          <div className="inline-flex flex-col items-start gap-1.5 relative flex-[0_0_auto]">
            <p className="relative w-fit mt-[-1.00px] font-medium leading-[18px] text-black text-sm tracking-[0] leading-[18px] whitespace-nowrap">
              지금, {chatInfo?.partner.nickname || 'OOO'} 님과 화상 거래가 시작되었어요!
            </p>

            <div className="relative w-fit text-[#7c7c7c] text-xs font-medium tracking-[0] leading-[18px] whitespace-nowrap">
              일정: 2025-08-06(수) 오전 10:00
            </div>
          </div>
        </div>
        <button
          className={`relative w-[150px] h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
            }`}
          onClick={(e) => handleStart(e)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label="화상 거래 하러 하기"
        >
          <div className="absolute h-[17px] top-2.5 left-[21px] [font-family:'SUITE-Bold',Helvetica] font-bold text-center leading-[normal] text-black text-sm tracking-[0]">
            화상 거래 하러 하기
          </div>
        </button>
      </div>
    </div>
  );
};

// START_TRADE,           // 거래 시작 - 거래 시작 버튼 클릭 시 전송
const StartTradeModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo()
  const isSeller = !!chatInfo?.isCurrentUserSeller

  const [open, setOpen] = useState(false)
  const [isButtonHovered, setIsButtonHovered] = useState(false)

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (!isSeller) return
    setOpen(true)
  }

  const handleSubmitFinalPrice = ({ finalPrice }: { finalPrice: number }) => {
    console.log('최종 거래 가격:', finalPrice)
    // TODO: 서버 전송 / STOMP 공지 등 처리
    setOpen(false)
  }

  return (
    <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[123px] items-center justify-between relative top-7 left-2.5">
        <div className="flex w-[281px] items-center justify-between">
          <img
            className="w-[75px] h-[75px] object-cover"
            alt="Money"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/money-icon.png`}
          />
          <p className="w-[201px] text-sm leading-[18px] text-black font-medium">
            {chatInfo?.partner.nickname || 'OOO'} 님과 거래가 시작되었어요.
            <br />
            최종 거래 가격을 입력해주세요!
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpen}
          onMouseEnter={() => isSeller && setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          disabled={!isSeller}
          aria-disabled={!isSeller}
          className={[
            'relative w-40 h-10 rounded-[20px] border-2 border-black transition-all duration-200',
            isSeller
              ? `bg-[#fce94f] ${isButtonHovered ? 'scale-105 shadow-lg' : ''}`
              : 'bg-gray-300 cursor-not-allowed'
          ].join(' ')}
          aria-label="최종 거래 가격 설정하기"
        >
          <span className="absolute top-2.5 left-3.5 font-bold text-sm text-black">
            최종 거래 가격 설정하기
          </span>
        </button>
      </div>

      {/* 🔽 포탈로 finalPriceForm 띄우기 */}
      <OverlayPortal open={open} onClose={() => setOpen(false)}>
        <FinalPriceModal
          onClose={() => setOpen(false)}
          onSubmit={handleSubmitFinalPrice}
        />
      </OverlayPortal>
    </div>
  )
}


//REQUEST_DEPOSIT,        // 입금 요청 - 최종 가격 설정 후 전송
const RequestDepositeModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const chatInfo = useChatRoomInfo();

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('결제 요청');
    setIsPaymentModalOpen(true);
  }

  // message.content에서 금액 추출 (숫자만)
  const amount = message.content.replace(/[^\d]/g, '');
  const formattedAmount = amount ? Number(amount).toLocaleString() + '원' : '0원';
  const paymentAmount = amount ? Number(amount) : 0;

  return (
    <>
      <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black flex flex-col justify-center">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="flex items-center justify-between gap-3">
            <img
              className="relative w-[97px] h-[37px] aspect-[2.62]"
              alt="Toss icon"
              src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/toss-icon.png`}
            />
            <div className="flex flex-col leading-[18px] text-black text-sm">
              <p>최종 거래 가격이 설정되었어요</p>
              <p className="font-bold text-base my-1">{formattedAmount}</p>
              <p>결제를 진행해 주세요!</p>
            </div>
          </div>
          <button
            className={`relative w-[150px] h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
              }`}
            onClick={(e) => handleStart(e)}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            aria-label="결제하기"
          >
            <div className="absolute h-[17px] top-2.5 left-[50px] [font-family:'SUITE-Bold',Helvetica] font-bold text-center leading-[normal] text-black text-sm tracking-[0]">
              결제하기
            </div>
          </button>
        </div>
      </div>

      {/* PaymentCheckout 모달 */}
      <OverlayPortal open={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)}>
        <PaymentCheckoutPage
          onClose={() => setIsPaymentModalOpen(false)}
          amount={paymentAmount}
          orderName={chatInfo?.product?.title || "상품"}
        />
      </OverlayPortal>
    </>
  );
};



//INPUT_DELIVERY_ADDRESS,  // 배송지 입력 - 입금 완료 후 전송
const InputDeliveryAddressModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [open, setOpen] = useState(false)

  const addresses: AddressItem[] = [
    {
      id: 1,
      address: '부산광역시 연제구 중앙대로 1134번길',
      detail: '105동 405호',
    },
    {
      id: 2,
      address: '삼성전기 부산 사업장',
      detail: '삼성 청년 SW 아카데미 교육장',
    },
  ]

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('배송지 입력 요청');
  }

  return (
    <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[123px] items-center justify-between relative top-7 left-3.5">
        <div className="flex w-[323px] items-center justify-center gap-[18px] relative flex-[0_0_auto]">
          <img
            className="relative w-[85px] h-[66px] aspect-[1.29]"
            alt="Money cat icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/moneyCat-icon.png`}
          />
          <div className="relative w-[158px] font-medium leading-[18px] text-black text-sm tracking-[0]">
            입금이 완료되었어요.
            <br />
            배송지를 입력해 주세요!
          </div>

        </div>
        <button
          className={`relative w-[150px] h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
            }`}
          onClick={() => setOpen(true)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label="배송지 입력"
        >
          <div className="absolute h-[17px] top-2.5 left-8 font-bold text-center leading-[normal] text-black text-sm tracking-[0]">
            배송지 입력하기
          </div>
        </button>

        <OverlayPortal open={open} onClose={() => setOpen(false)}>
          <AddressSelectModal
            items={addresses}
            initialSelectedId="home"
            onConfirm={(sel) => { console.log('선택됨:', sel); setOpen(false) }}
            onClose={() => setOpen(false)}
            onAddAddress={() => alert('배송지 추가 모달 열기')}
          />
        </OverlayPortal>

      </div>
    </div>
  );
};


//INPUT_TRACKING_NUMBER,    // 송장번호 입력 - 배송지 입력 완료 후 전송
const InputTrackingAddressModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [openTracking, setOpenTracking] = useState(false)


  return (
    <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[123px] items-center justify-between relative top-7 left-3.5">
        <div className="flex w-[281px] items-center justify-center gap-[18px] relative flex-[0_0_auto]">
          <img
            className="relative w-[75px] h-[75px] ml-[-14.00px] aspect-[1] object-cover"
            alt="Box icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/box-icon.png`}
          />
          <p className="relative w-fit mr-[-14.00px] font-medium leading-[18px] text-black text-sm tracking-[0]">
            배송지가 입력 되었어요.
            <br />
            택배 발송 후, 송장번호를 입력해 주세요!
          </p>

        </div>
        <button
          className={`relative w-[150px] h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
            }`}
          onClick={(e) => setOpenTracking(true)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label="송장번호 입력하기"
        >
          <div className="absolute h-[17px] top-2.5 left-6.5 [font-family:'SUITE-Bold',Helvetica] font-bold text-center leading-[normal] text-black text-sm tracking-[0]">
            송장번호 입력하기
          </div>
        </button>
      </div>
      <OverlayPortal open={openTracking} onClose={() => setOpenTracking(false)}>
        <TrackingNumberModal
          onClose={() => setOpenTracking(false)}
          onSubmit={(v) => {
            console.log('송장 등록 값:', v)
            setOpenTracking(false)
          }}
        />
      </OverlayPortal>
    </div>
  );
};

//START_DELIVERY,     // 배송 시작 - 송장번호 입력 후 전송
const StartDeliveryModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  return (
    <div className="w-[400px] h-[107px] top-0 left-0 bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[356px] h-[76px] items-center justify-around gap-3 relative top-4 left-3">
        <div className="w-[317px] items-center gap-[19px] relative flex-[0_0_auto] flex">
          <img
            className="relative w-[55px] h-[70px] aspect-[0.79]"
            alt="Delivery cat icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/deliveryCat-icon.png`}
          />
          <div className="inline-flex flex-col items-start jusify-center relative flex-[0_0_auto]">
            <p className="mt-[-1.00px] font-medium text-black text-sm realative w-[232px] tracking-[0] leading-[18px]">
              {chatInfo?.product.title || '팝마트 라부부 코카콜라 키링'}의
            </p>
            <div className="relative font-medium text-black text-sm w-[232px] tracking-[0] leading-[18px]">
              배송이 시작되었어요!
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}

//CONFIRM_PURCHASE, // 구매 확정 요청 - 송장번호 입력 후 전송
const ConfirmPurchaseModal = ({ message }: { message: ChatMessage }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('구매 확정');
  }

  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  return (
    <div className="w-[400px] h-[169px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[123px] items-center justify-between relative top-7 left-[15px]">
        <div className="flex w-[325px] items-center justify-between relative flex-[0_0_auto]">
          <img
            className="relative w-[750x] h-16 aspect-[1.09]"
            alt="Box cat icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/boxCat-icon.png`}
          />

          <div className="flex flex-col w-[231px] items-start relative">
            <p className="self-strech mt-[-1.00px] font-medium text-black text-sm realative w-[232px] tracking-[0] leading-[18px]">
              {chatInfo?.product.title || '팝마트 라부부 코카콜라 키링'}을(를) 받아 보셨나요?
            </p>
            <p className="relative w-[239px] mr-[-9.00px] font-medium leading-[18px] text-black text-sm tracking-[0]">
              구매 확정을 해주세요!
            </p>
          </div>
        </div>
        <button
          className={`relative w-[150px] h-10 bg-[#fce94f] rounded-[20px] border-2 border-solid border-black cursor-pointer transition-all duration-200 ${isButtonHovered ? "transform scale-105 shadow-lg" : ""
            }`}
          onClick={(e) => handleStart(e)}
          onMouseEnter={() => setIsButtonHovered(true)}
          onMouseLeave={() => setIsButtonHovered(false)}
          aria-label="구매 확정하기"
        >
          <div className="absolute h-[17px] top-2.5 left-9 [font-family:'SUITE-Bold',Helvetica] font-bold text-center leading-[normal] text-black text-sm tracking-[0]">
            구매 확정하기
          </div>
        </button>
      </div>
    </div>
  );
};


//END_TRADE // 구매확정 거래 종료 - 구매 확정 후 전송
const EndTradeModal = ({ message }: { message: ChatMessage }) => {
  const chatInfo = useChatRoomInfo(); // 전역 정보 사용

  return (
    <div className="w-[400px] h-[107px] bg-white rounded-[30px] overflow-hidden border-2 border-solid border-black">
      <div className="flex flex-col w-[371px] h-[76px] items-center justify-around gap-3 relative top-3.5 left-3">
        <div className="flex w-[317px] items-center gap-[19px] relative flex-[0_0_auto]">
          <img
            className="relative w-[67px] h-[67px] aspect-[1] object-cover"
            alt="point icon"
            src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/point-icon.png`}
          />
          <div className="inline-flex flex-col items-start jusify-center relative flex-[0_0_auto]">
            <p className="self-strech mt-[-1.00px] font-medium text-black text-sm realative w-[232px] tracking-[0] leading-[18px]">
              {chatInfo?.product.title || '팝마트 라부부 코카콜라 키링'}의 구매가 확정 되었어요!
            </p>
          </div>


        </div>
      </div>

    </div>
  )
}


export default function AllModals({ message, type }: { message: ChatMessage, type: string }) {
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