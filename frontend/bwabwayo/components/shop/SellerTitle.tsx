import Link from "next/link";

export interface Seller {
  id?: string;
  nickname: string;
  profileImage: string | null;
  rating: number;
  score: number;
  bio: string | null;
  dealCount: number | null;
  reviewCount?: number | string; // 선택적 속성, 필요에 따라 추가
}

interface SellerTitleProps {
  seller: Seller;
  disableLink?: boolean;
}

export default function SellerTitle({ seller, disableLink = false }: SellerTitleProps) {
    const trustScore = seller.score || 0;
    const trustPercentage = (trustScore / 1000) * 100;
    const sellerName = seller.nickname || "판매자";
    const sellerRating = seller.rating || 0;
    const sellerImage = seller.profileImage; // 기본 프로필 이미지 경로
    const bio = seller.bio || "상점에 대한 설명이 없습니다.";
    const dealCount = seller.dealCount || 0;
    const reviewCount = seller.reviewCount || 0;
    // console.log(trustPercentage, trustScore, sellerName, sellerRating, sellerImage, bio, dealCount, reviewCount);

    const titleElement = <h3 className="text-xl font-bold">{sellerName}님의 상점</h3>;

    return (
        <div className="w-full flex-4">
            {/* 상점 프로필 */}
            <div className="flex items-center gap-4">
                <div>
                    <img src={sellerImage ?? `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} alt={`${sellerName} 프로필 이미지`} className="rounded-full border-1 border-[#eee] w-20 h-20 object-cover" />
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-col items-start">
                        {disableLink || !seller.id ? (
                            titleElement
                        ) : (
                            <Link href={`/shop/${seller.id}`}>{titleElement}</Link>
                        )}
                        <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-base font-light">{sellerRating.toFixed(1)}</span>
                            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/star-on.svg`} alt="별점" className="w-4 h-4" />
                            <span className="text-gray-400 text-base font-light">({reviewCount})</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 신뢰지수 */}
            <div className="w-full flex flex-col gap-1 mt-4 mb-6">
                <div className="flex items-center justify-between">
                    <p className="font-medium text-[#1BA54E]">신뢰지수 <span className="text-lg font-bold">{trustScore}</span></p>
                    <p className="text-gray-400 text-md font-light">1,000</p>
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