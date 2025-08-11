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
    point: "500P",
    actions: ["1:1 채팅방 입장하기", "취소하기"],
  },
  {
    id: 2,
    status: "화상 거래 완료",
    title: "라부부킹님과 화상통화 일정",
    product: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    date: "2025. 7. 17(목) 오전 11:00",
    point: "500P",
    actions: ["1:1 채팅방 입장하기", "다시보기"],
  },
];

// --- 페이지 컴포넌트 (Page Component) ---
export default function MyPageVideoTrade() {
  return (
    <div className="min-w-0">
          <h1 className="text-3xl font-bold mb-8">화상 거래 내역</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {trades.map((trade) => (
              <div
                key={trade.id}
                className="bg-white rounded-xl shadow p-8 flex flex-col gap-2 border border-gray-200"
              >
                <div
                  className={`self-start inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                    trade.status === "화상 거래 예정"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {trade.status}
                </div>
                <div className="text-lg font-bold mb-1">{trade.title}</div>
                <div className="text-gray-500 text-sm mb-1">{trade.product}</div>
                <div className="flex items-center gap-4 mb-1">
                  <span className="text-gray-700 text-sm w-12">일정</span>
                  <span className="text-gray-900 text-sm font-medium">{trade.date}</span>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-700 text-sm w-12">포인트</span>
                  <span className="text-gray-900 text-sm font-medium">{trade.point}</span>
                </div>
                <div className="flex gap-4 mt-auto pt-4 border-t">
                  {trade.actions.map((action, i) => (
                    <button
                      key={i}
                      className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors duration-150 ${
                        action === "취소하기"
                          ? "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                          : action === "다시보기"
                          ? "border-gray-300 bg-white text-gray-600 hover:bg-gray-100"
                          : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
    </div>
  );
}
