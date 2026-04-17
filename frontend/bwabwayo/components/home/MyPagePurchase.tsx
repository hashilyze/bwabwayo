import React from "react";

const purchases = [
  {
    image: "/sample-product.jpg", // 실제 이미지 경로로 교체 필요
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    status: "배송준비중",
    confirm: "구매확정",
    delivery: null,
    confirmDone: false,
  },
  {
    image: "/sample-product.jpg",
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    status: "배송중",
    delivery: {
      company: "우체국택배",
      number: "262526865323",
    },
    confirm: "구매확정",
    confirmDone: false,
  },
  {
    image: "/sample-product.jpg",
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    status: "직거래",
    confirm: "구매확정완료",
    delivery: null,
    confirmDone: true,
  },
];

export default function MyPagePurchase() {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* 사이드 메뉴 */}
      <aside className="w-56 bg-gray-200 rounded-xl m-8 p-6 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-4">마이페이지</h2>
        <div className="mb-6">
          <div className="text-xl font-bold mb-2">거래정보</div>
          <ul className="space-y-1">
            <li className="text-blue-600 font-semibold">구매 상품</li>
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
        <h1 className="text-3xl font-bold mb-8">구매 상품</h1>
        {/* 테이블 헤더 */}
        <div className="grid grid-cols-12 bg-gray-100 rounded-t-lg px-6 py-3 text-gray-500 text-base font-semibold mb-2">
          <div className="col-span-4">상품명</div>
          <div className="col-span-2">가격</div>
          <div className="col-span-2">배송상태</div>
          <div className="col-span-2">구매확정</div>
        </div>
        {/* 상품 리스트 */}
        <div className="divide-y divide-gray-200 bg-white rounded-b-lg shadow">
          {purchases.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 items-center px-6 py-6">
              {/* 상품명 및 이미지 */}
              <div className="col-span-4 flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {/* 실제 이미지는 public 폴더에 넣고 경로 지정 필요 */}
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="text-gray-700 whitespace-pre-line text-base">{item.name}</div>
              </div>
              {/* 가격 */}
              <div className="col-span-2 text-lg font-medium text-gray-900">{item.price}</div>
              {/* 배송상태 */}
              <div className="col-span-2">
                <div className="text-base font-medium text-gray-900">{item.status}</div>
                {item.delivery && (
                  <div className="text-xs text-gray-500 mt-1">
                    <div>{item.delivery.company}</div>
                    <div>{item.delivery.number}</div>
                  </div>
                )}
              </div>
              {/* 구매확정 */}
              <div className="col-span-2">
                {item.confirmDone ? (
                  <span className="inline-block px-4 py-1 rounded bg-gray-200 text-gray-600 text-base">{item.confirm}</span>
                ) : (
                  <button className="px-4 py-1 rounded border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors text-base">
                    {item.confirm}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
} 