import React from "react";

const trades = [
  {
    status: "화상 거래 예정",
    title: "라부부킹님과 화상통화 일정",
    product: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    date: "2025. 7. 17(목) 오전 11:00",
    point: "500P",
    actions: ["1:1 채팅방 입장하기", "취소하기"],
  },
  {
    status: "화상 거래 완료",
    title: "라부부킹님과 화상통화 일정",
    product: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    date: "2025. 7. 17(목) 오전 11:00",
    point: "500P",
    actions: ["1:1 채팅방 입장하기", "다시보기"],
  },
];

export default function MyPageVideoTrade() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* 사이드 메뉴 */}
      <aside className="w-56 bg-gray-200 rounded-xl m-8 p-6 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-4">마이페이지</h2>
        <div className="mb-6">
          <div className="text-xl font-bold mb-2">거래정보</div>
          <ul className="space-y-1">
            <li className="text-gray-400">구매 상품</li>
            <li className="text-gray-400">판매 상품</li>
            <li className="text-gray-400">찜 상품</li>
          </ul>
        </div>
        <div className="mb-6">
          <div className="text-xl font-bold mb-2">화상채팅</div>
          <ul className="space-y-1">
            <li className="text-gray-400">화상 채팅 일정</li>
          </ul>
        </div>
        <div className="mb-6">
          <div className="text-xl font-bold mb-2">내 정보</div>
          <ul className="space-y-1">
            <li className="text-gray-400">내 정보 수정</li>
            <li className="text-gray-400">회원탈퇴</li>
          </ul>
        </div>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">화상 거래 내역</h1>
        <div className="grid grid-cols-2 gap-8">
          {trades.map((trade, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow p-8 flex flex-col gap-2 border border-gray-200"
            >
              <div
                className={`inline-block px-4 py-1 rounded-lg text-sm font-medium mb-2 ${
                  trade.status === "화상 거래 예정"
                    ? "bg-gradient-to-r from-blue-400 to-blue-700 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {trade.status}
              </div>
              <div className="text-lg font-bold mb-1">{trade.title}</div>
              <div className="text-gray-500 text-sm mb-1">{trade.product}</div>
              <div className="flex items-center gap-4 mb-1">
                <span className="text-gray-700 text-sm">일정</span>
                <span className="text-gray-900 text-sm font-medium">{trade.date}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-gray-700 text-sm">포인트</span>
                <span className="text-gray-900 text-sm font-medium">{trade.point}</span>
              </div>
              <div className="flex gap-4 mt-auto">
                {trade.actions.map((action, i) => (
                  <button
                    key={i}
                    className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors duration-150 ${
                      action === "취소하기"
                        ? "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                        : action === "다시보기"
                        ? "border-gray-200 bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "border-blue-200 bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 