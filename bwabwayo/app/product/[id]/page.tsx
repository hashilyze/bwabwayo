import React from "react";

// --- 페이지 컴포넌트 (Page Component) ---
export default function ProductDetailPage() {
  return (
    <div className="bg-[#fafdff] min-h-screen">
      <main className="max-w-7xl mx-auto py-12 px-4 flex flex-col lg:flex-row gap-12">
        {/* Product Images */}
        <section className="flex flex-col gap-4 w-full lg:w-1/2">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <img src="https://picsum.photos/200/300?${params.id}" alt="상품 대표 이미지" className="w-full h-auto aspect-square object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <img src="https://placehold.co/138x138" alt="상품 썸네일 1" className="rounded-xl border object-cover w-full aspect-square" />
            <img src="https://placehold.co/138x138" alt="상품 썸네일 2" className="rounded-xl border object-cover w-full aspect-square" />
            <img src="https://placehold.co/138x138" alt="상품 썸네일 3" className="rounded-xl border object-cover w-full aspect-square" />
            <img src="https://placehold.co/138x138" alt="상품 썸네일 4" className="rounded-xl border object-cover w-full aspect-square" />
          </div>
        </section>

        {/* Product Info */}
        <section className="flex-1">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="text-gray-500 text-sm mb-2">홈 &gt; 디지털</div>
            <h1 className="text-3xl font-bold mb-2">갤럭시북4 프로 16인치 (A급, 풀박스)</h1>
            <div className="text-4xl font-black mb-2 text-gray-800">1,650,000원</div>
            <div className="text-gray-400 text-sm mb-6">7시간 전 · 찜 10 · 조회 53</div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 rounded-lg p-4 text-center"><div className="text-xs text-gray-500">가격제안</div><div className="text-base font-semibold">가능</div></div>
              <div className="bg-gray-50 rounded-lg p-4 text-center"><div className="text-xs text-gray-500">거래방식</div><div className="text-base font-semibold">직거래, 택배</div></div>
              <div className="bg-gray-50 rounded-lg p-4 text-center"><div className="text-xs text-gray-500">배송비</div><div className="text-base font-semibold">3,500원</div></div>
              <div className="bg-gray-50 rounded-lg p-4 text-center"><div className="text-xs text-gray-500">화상거래</div><div className="text-base font-semibold">가능</div></div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 border-2 border-blue-500 text-blue-500 rounded-lg py-3 font-bold hover:bg-blue-50 transition-colors">
                찜하기
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 font-bold hover:bg-blue-700 transition-colors">
                채팅하기
              </button>
            </div>
          </div>
          
          {/* Seller Info */}
          <div className="bg-white rounded-2xl shadow-lg p-8 flex items-center gap-6">
            <img src="https://placehold.co/80x80" alt="판매자 프로필 이미지" className="rounded-full border-2 border-blue-200 w-20 h-20 object-cover" />
            <div>
              <div className="text-lg font-bold">고윤정님의 상점 <span className="text-gray-400 text-base font-light ml-2">4.8 (12)</span></div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-red-500 font-medium">신뢰지수 236</span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: "30%" }}></div>
                </div>
                <span className="text-gray-500 text-sm ml-2">1,000</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Product Description */}
      <section className="max-w-5xl mx-auto bg-white rounded-2xl p-8 mb-12 shadow-lg">
        <h2 className="text-2xl font-bold mb-6 border-b pb-4">상품 설명</h2>
        <h3 className="text-xl font-semibold mb-2">제품 상세</h3>
        <p className="text-gray-700 whitespace-pre-line mb-8">
          올해 초에 구매하여 실사용 기간 3개월 미만인 A급 제품입니다. 
          주로 문서 작업용으로만 사용하여 외관 상태 매우 깨끗하며, 모든 기능 정상 작동합니다. 
          풀박스 구성으로, 기본 충전기와 파우치 함께 드립니다. 직거래는 부산 센텀시티역 근처에서 가능합니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t">
          <div><div className="text-lg font-semibold">네고가능 여부</div><div className="text-gray-600">가능해요</div></div>
          <div><div className="text-lg font-semibold">거래방법</div><div className="text-gray-600">택배 / 직거래</div></div>
          <div><div className="text-lg font-semibold">화상거래가능 여부</div><div className="text-gray-600">가능해요</div></div>
        </div>
      </section>
    </div>
  );
};