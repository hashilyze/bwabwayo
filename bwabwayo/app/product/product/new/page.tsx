import React from "react";

export default function SellerShopInfo() {
  return (
    <div className="bg-gray-50 min-h-screen py-10">
      {/* 상점 프로필 */}
      <section className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 flex gap-8 items-start mb-12">
        <div className="w-24 h-24 rounded-full border-2 border-blue-200 bg-gray-100 bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/88')" }} />
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">고윤정님의 상점</h2>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-500 text-lg font-light">4.8</span>
            <span className="text-gray-500 text-lg font-light">(12)</span>
          </div>
          <div className="text-gray-500 mb-4">깨끗하고 사용감 적은 제품을 판매합니다.</div>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-red-500 font-medium">신뢰지수 236</span>
            <div className="w-32 h-2 bg-gray-200 rounded">
              <div className="h-2 bg-green-500 rounded" style={{ width: "40%" }} />
            </div>
            <span className="text-gray-500">1,000</span>
          </div>
          <div className="flex gap-8 mb-4">
            <div>
              <span className="text-gray-400 text-sm">판매상품</span>
              <span className="ml-2 text-lg font-semibold">4</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">거래후기</span>
              <span className="ml-2 text-lg font-semibold">5</span>
            </div>
            <div>
              <span className="text-gray-400 text-sm">화상거래</span>
              <span className="ml-2 text-lg font-semibold">1</span>
            </div>
          </div>
          <button className="bg-gray-500 text-white rounded-full px-6 py-2 text-sm font-medium mb-2">1:1 채팅</button>
          <div className="text-lg font-bold">‘고윤정’님과 채팅하기</div>
          <div className="text-sm text-gray-500">상품에 대한 정보를 자세히 알고싶다면?</div>
        </div>
      </section>

      {/* 판매 물품 */}
      <section className="max-w-4xl mx-auto mb-12">
        <h3 className="text-xl font-bold mb-6">판매 물품</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-4 flex flex-col">
              <div className="w-full h-60 bg-gray-200 rounded mb-4 bg-cover bg-center" style={{ backgroundImage: "url('https://via.placeholder.com/290')" }} />
              <div className="font-medium mb-1">팝마트 라부부 코카콜라 시리즈 인형 키링</div>
              <div className="text-lg font-bold mb-1">70,000원</div>
              <div className="text-xs text-gray-500 mb-2">찜 4 · 조회 23</div>
              <button className="bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg py-2 mt-auto">화상거래예약</button>
            </div>
          ))}
        </div>
      </section>

      {/* 상점 후기 */}
      <section className="max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-6">상점 후기</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span>구매확정이 빨라요.</span>
            <span className="font-bold">3</span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span>친절하고 배려가 넘쳐요.</span>
            <span className="font-bold">5</span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span>답장이 빨라요.</span>
            <span className="font-bold">3</span>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 flex justify-between items-center">
            <span>약속시간을 잘 지켜요.</span>
            <span className="font-bold">3</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-lg font-bold">
          <span>4.5</span>
          <span className="text-gray-500 text-base font-normal">총 후기</span>
          <span>5</span>
        </div>
      </section>
    </div>
  );
}
