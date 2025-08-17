'use client'

import React, { useEffect, useState } from "react"
import { useReservationStore } from "@/stores/chatting/reservationStore";
import Link from "next/link";

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
  const { getSchedule, videoSchedules, deleteSchedule } = useReservationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  useEffect(() => {
    getSchedule();
  }, [getSchedule]);

  const handleReplayClick = (replayUrl: string | null) => {
    if (replayUrl) {
      setSelectedVideoUrl(replayUrl);
      setIsModalOpen(true);
    } else {
      alert('재생할 영상이 없습니다.');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideoUrl(null);
  };

  console.log("여기", videoSchedules); 

    return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">화상 거래 내역</h1>

      {/* 다시보기 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">화상 거래 다시보기</h2>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <video 
              src={selectedVideoUrl || ''} 
              controls 
              className="w-full h-auto max-h-[70vh]"
              autoPlay
            >
              브라우저가 비디오를 지원하지 않습니다.
            </video>
          </div>
        </div>
      )}

      {!videoSchedules || videoSchedules.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          화상 거래 내역이 없습니다.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-6">
          {videoSchedules
            .sort((a, b) => {
              // 예정 상태(end: false)를 먼저
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
                      className={`inline-block px-5 py-2 rounded-[20px] text-[15px] font-semibold ${
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
                        <span className="text-black text-[14px] font-normal">1.000P</span>
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-4">
                                         {trade.end ? (
                       // 화상거래 완료 상태: 1:1 채팅방 입장하기, 다시보기
                       <>
                         <Link 
                           href={`/chat/${trade.roomId}`}
                           className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-white text-black hover:bg-gray-50 text-center"
                         >
                           1:1 채팅방 입장하기
                         </Link>
                         <button 
                           onClick={() => handleReplayClick(trade.replayUrl)}
                           className="cursor-pointer flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-[#eeeeee] text-black hover:bg-gray-200"
                         >
                           다시보기
                         </button>
                       </>
                     ) : (
                       // 화상거래 예정 상태: 1:1 채팅방 입장하기, 취소하기
                       <>
                         <Link 
                           href={`/chat/${trade.roomId}`}
                           className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-white text-black cursor-pointer hover:bg-gray-50 text-center"
                         >
                           1:1 채팅방 입장하기
                         </Link>
                         <button
                            onClick={() => {
                              if (window.confirm('정말 취소하시겠습니까?')) {
                                deleteSchedule(trade.roomId, trade.scheduleId);
                              }
                            }}
                            className="flex-1 py-2 px-4 rounded-[20px] text-[14px] font-normal border border-[#eeeeee] bg-white text-black cursor-pointer hover:bg-gray-50">
                           취소하기
                         </button>
                       </>
                     )}
                    </div>
                </div>
              </li>
            ))}
         </ul>
       )}
     </div>
   );
 }
