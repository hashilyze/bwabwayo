export interface Seller {
  id?: string;
  nickname: string;
  profileImage: string | null;
  rating: number;
  score: number;
  bio: string;
  dealcount: number;
  reviewCount?: number | string; // 선택적 속성, 필요에 따라 추가
}

interface SellerTitleProps {
  seller?: Seller;
}

export default function SellerTitle({ seller }: SellerTitleProps) {
    const trustScore = seller?.score || 0;
    const trustPercentage = (trustScore / 1000) * 100;
    const sellerName = seller?.nickname || "판매자";
    const sellerRating = seller?.rating || 0;
    const sellerImage = seller?.profileImage; // 기본 프로필 이미지 경로
    const bio = seller?.bio || "상점에 대한 설명이 없습니다.";
    const dealcount = seller?.dealcount || 0;
    const reviewCount = seller?.reviewCount || 0;
    return (
        <div className="w-full">
            {/* 상점 프로필 */}
            <div className="flex items-center gap-4">
                <div>
                    <img src={sellerImage ?? "/default-profile.png"} alt={`${sellerName} 프로필 이미지`} className="rounded-full border-1 border-[#eee] w-20 h-20 object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start">
                        <h3 className="text-lg font-bold">{sellerName}님의 상점</h3>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-base font-light">{sellerRating}</span>
                            <img src="/fe/icon/star-on.svg" alt="별점" className="w-4 h-4" />
                            <span className="text-gray-400 text-base font-light">{dealcount}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 신뢰지수 */}
            <div className="w-full flex flex-col gap-1 mt-4 mb-6">
                <div className="flex items-center justify-between">
                    <p className="font-medium text-[#1BA54E]">신뢰지수 <span className="text-lg font-bold">{trustScore}</span></p>
                    <p className="text-gray-400 text-md font-light">1000</p>
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
            {/* 상점 설명 */}
            <p className="text-gray-500 text-base">{bio}</p>
        </div>
  );
}