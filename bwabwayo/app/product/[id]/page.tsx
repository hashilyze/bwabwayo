export default function ProductDetailPage() {
  const trustScore = 334;
  const maxTrustScore = 1000;
  const trustPercentage = (trustScore / maxTrustScore) * 100;

  return (
    <div className="relative min-h-screen">
      <div className="flex flex-row gap-12 relative">
        {/* Product Images */}
        <div className="flex-2 w-full max-w-md">
          <div className="sticky top-18 z-10">
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <img src="https://picsum.photos/200/300?${params.id}" alt="상품 대표 이미지" className="w-full h-auto aspect-square object-cover" />
              </div>
              <ul className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(num => (
                  <li key={num}>
                    <img src="/image/sample.png" alt={`상품 썸네일${num}`} className="rounded-xl border border-[#eeeeee] object-cover aspect-square" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-3 min-h-screen">
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-500 text-sm mb-2">홈 &gt; 디지털</p>
            <div className="flex flex-col mt-6 mb-2">
              <h1 className="text-2xl font-bold">갤럭시북4 프로 16인치 (A급, 풀박스)</h1>
              <p className="text-[32px] font-black text-gray-800">1,650,000원</p>
            </div>
            <div className="text-gray-400 text-sm mb-[30px]">7시간 전 · 찜 10 · 조회 53</div>
            
            <ul className="flex items-center mb-4 border border-gray-200 rounded-lg p-6 relative">
              <li className="flex flex-1 flex-col gap-1 items-center">
                <div className="text-xs text-black/50">가격제안</div>
                <div className="text-base font-semibold">가능</div>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">화상거래</p>
                <p className="text-base font-semibold">가능</p>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">거래방식</p>
                <p className="text-base font-semibold">직거래, 택배</p>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">배송비</p>
                <p className="text-base font-semibold">3,500원</p>
              </li>
            </ul>

            <div className="flex gap-4">
              <div className="flex-1 py-4 flex items-center justify-center gap-2 border-1 border-[#eee] text-[#777] rounded-lg cursor-pointer">
                <img src="/icon/heart-off.svg" alt="찜하기" className="w-4 h-4" />
                찜하기
              </div>
              <div className="flex-1 py-4 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 font-bold cursor-pointer">
                채팅하기
              </div>
            </div>
          </div>
          
        {/* Seller Info */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-start gap-4">
          <div className="flex items-center gap-4">
            <div>
              <img src="/image/sample.png" alt="판매자 프로필 이미지" className="rounded-full border-1 border-[#eee] w-20 h-20 object-cover" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-start gap-2">
                <h3 className="text-lg font-bold">고윤정님의 상점</h3>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400 text-base font-light">4.8</span>
                  <img src="/icon/star-on.svg" alt="별점" className="w-4 h-4" />
                  <span className="text-gray-400 text-base font-light">(12)</span>
                </div>
              </div>
            </div>
          </div>

          {/* 신뢰지수 */}
          <div className="w-full flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <p className="font-medium text-[#1BA54E]">신뢰지수 <span className="text-lg font-bold">{trustScore}</span></p>
              <p className="text-gray-400 text-sm font-light">{maxTrustScore}</p>
            </div>
            <div className="w-full">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-[#1BA54E] rounded-full transition-all duration-500"
                  style={{ width: `${trustPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* 판매물품 */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">판매자의 다른 상품</h3>
            <ul className="flex flex-col gap-4">
              {[1,2,3,4].map(num => (
                <li key={num} className="flex flex-row items-center gap-4">
                  <div><img src="/image/sample.png" alt="" className="border border-[#eee] rounded-lg w-24 h-24 object-cover" /></div>
                  <div className="flex flex-col">
                    <p className="text-sm">갤럭시북4 프로 16인치 (A급, 풀박스)</p>
                    <p className="text-lg font-semibold mb-1">1,650,000원</p>
                    <p className="text-xs font-light text-gray-400">찜 4 · 조회 24</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-2xl py-[60px] px-[40px] mt-[40px] shadow-sm">
        <h2 className="text-2xl font-bold mb-6">상품 설명</h2>

        <div className="bg-[#F6F8F9] rounded-2xl py-8 px-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold">제품 상세</h3>
          <p className="text-gray-700">
            올해 초에 구매하여 실사용 기간 3개월 미만인 A급 제품입니다.<br/>
            주로 문서 작업용으로만 사용하여 외관 상태 매우 깨끗하며, 모든 기능 정상 작동합니다.<br/>
            풀박스 구성으로, 기본 충전기와 파우치 함께 드립니다. 직거래는 부산 센텀시티역 근처에서 가능합니다.
          </p>
        </div>
        <ul className="bg-[#EFF6FF] flex justify-center py-12 mt-4 rounded-2xl">
          <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">네고가능 여부</p><p className="text-gray-600">가능해요</p></li>
          <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">거래방법</p><p className="text-gray-600">택배 / 직거래</p></li>
          <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">화상거래가능 여부</p><p className="text-gray-600">가능해요</p></li>
        </ul>
      </div>
    </div>
  );
};
