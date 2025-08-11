'use client'

import React, { useEffect } from "react"
import { useReservationStore } from "@/stores/chatting/reservationStore";

type Trade = {
  roomId: number;
  partnerNickname: string;
  title: string;
  startAt: string;
  replayUrl: string | null;
  end: boolean;
};

// 더미 데이터
const trades: Trade[] = [
    {
      roomId: 11,
      partnerNickname: "라부부킹",
      title: "팝마트 라부부 코카콜라 시리즈 인형 키링",
      startAt: "2025-07-17T11:00:00.000000",
      replayUrl: "https://example.com/replay1",
      end: true
  },
  {
      roomId: 12,
      partnerNickname: "윤서",
      title: "이번엔 진짜 라부부",
      startAt: "2025-08-13T09:44:25.878128",
      replayUrl: null,
      end: false
  },
  {
      roomId: 13,
      partnerNickname: "재워니!",
      title: "ABC 초콜릿",
      startAt: "2025-08-17T09:44:25.878128",
      replayUrl: null,
      end: false
  },
];

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  
  const ampm = hours < 12 ? '오전' : '오후';
  const displayHours = hours < 12 ? hours : hours - 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  
  return `${year}. ${month}. ${day}(${weekday}) ${ampm} ${displayHours}:${displayMinutes}`;
}



export default function MyPageVideoTrade() {
  const { getSchedule, videoSchedule } = useReservationStore();

  useEffect(() => {
    getSchedule();
  }, [getSchedule]);

  console.log(videoSchedule); 

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">화상 거래 내역</h1>
             <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {trades
           .sort((a, b) => {
             // 예정 상태(end: false)를 먼저, 완료 상태(end: true)를 나중에
             if (a.end === b.end) return 0;
             return a.end ? 1 : -1;
           })
           .map((trade) => (
          <li
            key={trade.roomId}
            className={`rounded-[25px] border border-[#eeeeee] p-6 ${
              trade.end ? 'bg-[#fafafa]' : 'bg-white'
            }`}
          >
            <div className="flex flex-col gap-4">
              {/* 상태 버튼 */}
              <div className="flex justify-start -ml-1">
                <div
                  className={`inline-block px-3 py-2 rounded-[20px] text-[15px] font-semibold ${
                    trade.end
                      ? "bg-white text-[#7c7c7c] border border-[#7c7c7c]"
                      : "bg-[#fce94f] text-black border border-black"
                  }`}
                >
                  {trade.end ? "화상 거래 완료" : "화상 거래 예정"}
                </div>
              </div>

              {/* 상품 정보 */}
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-2 my-2">
                  {/* 제목 */}
                  <div className="text-black text-xl font-bold leading-[24px]">
                    {trade.partnerNickname}님과 화상통화 일정
                  </div>
                  
                  {/* 상품명 */}
                  <div className="text-[#7c7c7c] text-[14px] font-normal">
                    {trade.title}
                  </div>
                </div>
                
                {/* 구분선 */}
                <div className="w-full h-px bg-[#d9d9d9] my-2"></div>
                
                {/* 일정과 포인트 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-6">
                    <span className="text-[#7c7c7c] text-base font-normal w-[41px]">일정</span>
                    <span className="text-black text-[14px] font-normal">
                      {formatDate(trade.startAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[#7c7c7c] text-base font-normal w-[41px]">포인트</span>
                    <span className="text-black text-[14px] font-normal">500P</span>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex gap-4">
                {trade.end ? (
                  // 화상거래 완료 상태: 1:1 채팅방 입장하기, 다시보기
                  <>
                    <button className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-white text-black hover:bg-gray-50">
                      1:1 채팅방 입장하기
                    </button>
                    <button className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-[#eeeeee] text-black hover:bg-gray-200">
                      다시보기
                    </button>
                  </>
                ) : (
                  // 화상거래 예정 상태: 1:1 채팅방 입장하기, 취소하기
                  <>
                    <button className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-white text-black hover:bg-gray-50">
                      1:1 채팅방 입장하기
                    </button>
                    <button className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-white text-black hover:bg-gray-50">
                      취소하기
                    </button>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
