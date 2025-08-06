'use client'

interface ChatMessage {
    content: string;
    createdAt: string;
}

// 화상 채팅 예약 모달
const VideoModal = ({ message }: { message: ChatMessage }) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg w-[300px]">
            <form>
                <div>
                    <h1 className="text-md font-bold mb-1">{message.content}</h1>
                    <p className="text-sm text-gray-500">OO님이 화상 예약을 등록했어요</p>
                </div>
                <div className="w-full h-[1px] bg-gray-200 my-4"></div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between gap-1 text-sm text-gray-500">
                        <p>일정</p>
                        <p>2025-08-06(수) 오전 10:00</p>
                    </div>
                    <div className="flex justify-between gap-1 text-sm text-gray-500">
                        <p>사용 포인트</p>
                        <p>1000 P</p>
                    </div>
                </div>
                <button className="bg-[#EDF1F9] text-[#0048A5] py-[10px] text-[14px] rounded-md mt-6 w-full font-bold cursor-pointer">화상 예약 목록</button>
                <button className="text-[#666] py-[10px] text-[14px] rounded-md mt-2 w-full border border-gray-200 cursor-pointer">취소</button>
            </form>
        </div>
    )
}

// 거래 시작 모달
const StartModal = ({ message }: { message: ChatMessage }) => {
    const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        console.log('거래 시작');
    }

    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <form>
                <div>
                    <h1 className="text-md font-bold mb-1">{message.content}</h1>
                    <p className="text-sm text-gray-500">네고된 경우 변경된 금액을 입력해주세요</p>
                </div>
                <button onClick={(e) => handleStart(e)} className="bg-[#EDF1F9] text-[14px] text-[#0048A5] py-3 rounded-md mt-6 w-full font-bold cursor-pointer">최종 금액 입력</button>
            </form>
        </div>
    )
}

// 입금 확인 모달
const CheckModal = ({ message }: { message: ChatMessage }) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <form>
                <div>
                    <h1 className="text-md font-bold mb-1">{message.content}</h1>
                    <p className="text-sm text-gray-500">빠른 시일 내 송장번호를 입력해주세요.</p>
                </div>
                <button className="bg-[#EDF1F9] text-[#0048A5] text-[14px] py-[10px] rounded-md mt-6 w-full font-bold cursor-pointer">송장번호 입력</button>
            </form>
        </div>
    )
}

// 배송지계좌 모달
const LotationModal = ({ message }: { message: ChatMessage }) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg w-[250px]">
            <form>
                <div>
                    <h1 className="text-md font-bold mb-1">{message.content}</h1>
                    <p className="text-sm text-gray-500">배송지와 계좌를 입력해주세요.</p>
                </div>
                <div className="flex flex-col text-sm text-gray-500 mt-4">
                    <p>· 계좌명 : (주)봐봐요</p>
                    <p>· 계좌번호 : 123-12-1234567890</p>
                    <p>· 은행 : 국민은행</p>
                    <p>· 금액 : 70,000원</p>
                </div>
                <button className="bg-[#EDF1F9] text-[#0048A5] text-[14px] py-[10px] rounded-md mt-4 w-full font-bold cursor-pointer">배송지 등록</button>
            </form>
        </div>
    )
}

// 배송 조회 모달
const DeliveryModal = ({ message }: { message: ChatMessage }) => {
    return (
        <div className="p-4 border border-gray-200 rounded-lg w-[250px]">
            <form>
                <ul>
                    <li></li>
                    <li></li>
                    <li></li>
                </ul>
                <div className="w-full h-[1px] bg-gray-200 my-4"></div>
                <div>
                    <h1 className="text-sm">
                        판매자가 송장번호를 등록했어요.<br/>
                        송장번호를 통해 현재 배송상황을 확인하세요.
                    </h1>
                </div>
                <div className="flex flex-col text-sm text-gray-500 mt-4">
                    <p>· 배송사 : 우체국택배배</p>
                    <p>· 송장번호 : 1234567890</p>
                </div>
            </form>
        </div>
    )
}


export default function AllModals({ message, type }: { message: ChatMessage, type: string }) {
    return (
        <div>
            {type === 'video' && <VideoModal message={message} />}
            {type === 'start' && <StartModal message={message} />}
            {type === 'check' && <CheckModal message={message} />}
            {type === 'lotation' && <LotationModal message={message} />}
            {type === 'delivery' && <DeliveryModal message={message} />}
        </div>
    )
}