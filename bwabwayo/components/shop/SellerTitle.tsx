export default function SellerTitle() {
    const trustScore = 234;
    const trustPercentage = (trustScore / 1000) * 100;

    return (
        <div>
            {/* 상점 프로필 */}
            <div className="flex items-center gap-5 mb-6">
                {/* 프로필 이미지 */}
                <div className="w-20 h-20 rounded-full border-1 border-[#eee] bg-gray-100 overflow-hidden">
                    <img src="https://picsum.photos/200/300?random=1" alt="프로필 이미지" />
                </div>
            
                {/* 상점 정보 */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-xl font-bold text-black">고윤정님의 상점</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-500 text-base font-light">4.8</span>
                        <span className="text-gray-500 text-base font-light">(12)</span>
                    </div>
                </div>
            </div>
            {/* 신뢰지수 */}
            <div className="mb-6">
                <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="">신뢰지수 {trustScore}</span>
                    <span className="text-gray-500 text-base">1,000</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                    <div 
                    className="h-2 bg-green-500 rounded transition-all duration-500"
                    style={{ width: `${trustPercentage}%` }}
                    />
                </div>
            </div>
            {/* 상점 설명 */}
            <p className="text-gray-500 text-base mb-6">깨끗하고 사용감 적은 제품을 판매합니다.</p>
        </div>
  );
}