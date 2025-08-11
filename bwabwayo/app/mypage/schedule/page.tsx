// 파일 경로: app/shop/[id]/schedule/page.tsx
'use client'; // 버튼 등 상호작용이 있으므로 클라이언트 컴포넌트로 선언합니다.

import React from "react";

// --- 타입 정의 (Type Definition) ---
type Trade = {
  id: number;
  status: "화상 거래 예정" | "화상 거래 완료";
  title: string;
  product: string;
  date: string;
  point: string;
  actions: string[];
};

// --- 가상 데이터 (Mock Data) ---
const trades: Trade[] = [
  {
    id: 1,
    status: "화상 거래 예정",
    title: "라부부킹님과 화상통화 일정",
    product: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    date: "2025. 7. 17(목) 오전 11:00",
    point: "500",
    actions: ["1:1 채팅방 입장하기", "취소하기"],
  },
  {
    id: 2,
    status: "화상 거래 완료",
    title: "라부부킹님과 화상통화 일정",
    product: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    date: "2025. 7. 17(목) 오전 11:00",
    point: "500",
    actions: ["1:1 채팅방 입장하기", "다시보기"],
  },
];

// --- 페이지 컴포넌트 (Page Component) ---
export default function MyPageVideoTrade() {
  return (
    <div className="min-w-0">
      <h1 className="text-3xl font-bold mb-8">화상 거래 내역</h1>
      <ul className="grid grid-cols-2 gap-4">
                 {trades.map((trade) => (
           <li
             key={trade.id}
             className="bg-white rounded-[25px] border border-[#eeeeee] p-6"
           >
             <div className="flex flex-col gap-4">
               {/* 상태 버튼 */}
               <div className="flex justify-start">
                 <div
                   className={`inline-block px-3 py-2 -ml-1 rounded-[20px] text-md font-semibold ${
                     trade.status === "화상 거래 예정"
                       ? "bg-[#fce94f] text-black border border-black"
                       : "bg-gray-200 text-gray-600"
                   }`}
                 >
                   {trade.status}
                 </div>
               </div>

               {/* 상품 정보 */}
               <div className="flex flex-col gap-2">
                 {/* 제목 */}
                 <div className="text-black text-xl font-bold leading-[24px] mt-2">
                   {trade.title}
                 </div>
                 
                 {/* 상품명 */}
                 <div className="text-[#7c7c7c] text-md font-normal mb-2">
                   {trade.product}
                 </div>
                 
                 {/* 구분선 */}
                 <div className="w-full h-px bg-[#d9d9d9] my-2"></div>
                 
                 {/* 일정과 포인트 */}
                 <div className="flex flex-col gap-2">
                   <div className="flex items-center gap-6">
                     <span className="text-[#7c7c7c] text-base font-normal w-13">일정</span>
                     <span className="text-black text-md font-normal">{trade.date}</span>
                   </div>
                   <div className="flex items-center gap-6">
                     <span className="text-[#7c7c7c] text-base font-normal w-13">포인트</span>
                     <span className="text-black text-md font-normal">{trade.point} P</span>
                   </div>
                 </div>
               </div>

               {/* 액션 버튼 */}
               <div className="flex gap-4">
                 {trade.actions.map((action, i) => (
                   <button
                     key={i}
                     className={`flex-1 py-2 px-4 rounded-[20px] text-md font-normal border border-[#eeeeee] ${
                       action === "취소하기" || action === "다시보기"
                         ? "bg-white text-black hover:bg-gray-50"
                         : "bg-white text-black hover:bg-gray-50"
                     }`}
                   >
                     {action}
                   </button>
                 ))}
               </div>
             </div>
           </li>
         ))}
      </ul>
    </div>
  );
}
