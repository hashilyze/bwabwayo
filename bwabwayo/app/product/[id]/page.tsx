'use client'

import SellerTitle, { type Seller } from "@/components/shop/SellerTitle";
import { useProductStore } from "@/stores/product/productStore";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useChatRoomStore } from "@/stores/chatting/chatRoomStore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth/authStore";
import { useModalStore } from "@/stores/modalStore";
import { useLikeProductStore } from "@/stores/product/likeProductStore";

export default function ProductDetailPage() {
  const { product, loading, error, getProductDetail } = useProductStore();
  const { roomInfo, addChatRoom } = useChatRoomStore();
  const { isLoggedIn } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const { addLike, removeLike } = useLikeProductStore();
  const router = useRouter();

  const params = useParams();
  const productId = Number(params.id);

  const seller: Seller = {
    id: product?.seller.id ? String(product.seller.id) : undefined,
    nickname: product?.seller.nickname || '',
    profileImage: product?.seller.profileImage || null,
    rating: product?.seller.rating || 0,
    score: product?.seller.score || 0,
    bio: (product?.seller as { bio?: string })?.bio || '',
    dealCount: product?.seller.dealcount || 0,
  }

  // --- 찜하기 기능 로직 통합 ---
  const [isWished, setIsWished] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  // 상품 정보가 로드되면 초기 찜 상태를 설정합니다.
  useEffect(() => {
    if (product) {
      setIsWished(product.isLike);
    }
  }, [product]);

  // 로그인 확인과 찜하기 로직을 합친 통합 핸들러
  const handleToggleLike = useCallback(async () => {
    if (isLikeLoading) return; // 중복 클릭 방지

    // 1. 로그인 상태 확인
    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!product) return;
    
    setIsLikeLoading(true);
    const previousIsWished = isWished;
    setIsWished(!previousIsWished); // 2. UI 즉시 변경 (낙관적 업데이트)

    try {
      // 3. API 호출
      if (previousIsWished) {
        await removeLike(productId);
      } else {
        await addLike(productId);
      }
    } catch (e) {
      console.error("찜하기 토글 실패:", e);
      setIsWished(previousIsWished); // 4. 실패 시 UI 롤백
      alert("요청 처리에 실패했습니다.");
    } finally {
      setIsLikeLoading(false);
    }
  }, [isLikeLoading, isLoggedIn, product, isWished, addLike, removeLike, productId, openLoginModal]);

  useEffect(() => {
    getProductDetail(productId);
  }, [getProductDetail, productId]);

  // 상대적 시간 계산 함수
  const getRelativeTime = (dateString: string) => {
    if (!dateString) return '';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}일 전`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}주 전`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}개월 전`;
  };

  const makeChatRoom = async () => {
    try {
      const result = await addChatRoom({
        sellerId: product?.seller.id || '',
        productId: productId || 0
      })
      router.push(`/chat/${result?.roomId}?productId=${result?.productId}&sellerId=${result?.sellerId}&buyerId=${result?.buyerId}`)
    } catch (error) {
      console.error('채팅방 생성 중 오류:', error);
    }
  }
  
  return (
    <div className="relative min-h-screen py-10 container-default m-auto">
      {product ? (
        <>
          <div className="flex flex-row gap-12 relative">
            {/* Product Images */}
            <div className="flex-2 w-full max-w-md">
              <div className="sticky top-60 z-8">
                <div className="flex flex-col gap-4">
                  <div className="rounded-2xl overflow-hidden border border-gray-200 relative aspect-square">
                      <img
                        src={product?.imageUrls?.[0] || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`}
                        alt="상품 대표 이미지" 
                        className="object-cover"
                      />
                  </div>
                    <ul className="grid grid-cols-4 gap-4">
                     {product?.imageUrls?.slice(1, 5).map((imageUrl, index) => (
                       <li key={index} className="relative aspect-square">
                          <img 
                            src={imageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} 
                            alt={`상품 썸네일${index + 1}`} 
                            className="rounded-xl border border-[#eeeeee] object-cover"
                          />
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-3 min-h-screen">
              <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                             <p className="text-gray-500 text-sm mb-2">
                   홈 &gt; {product?.categories?.[0]?.name || '대분류'} &gt; {product?.categories?.[1]?.name || '소분류'}
                 </p>
                  <div className="flex flex-col mt-6 mb-2">
                   <h1 className="text-2xl font-bold">{product?.title || '상품명'}</h1>
                   <p className="text-[32px] font-black text-gray-800">
                     {(product?.price || 0).toLocaleString()}원
                   </p>
                 </div>
                  <div className="text-gray-400 text-sm mb-[30px]">
                    {getRelativeTime(product?.createdAt || '')} · 찜 {product?.wishCount || 0} · 조회 {product?.viewCount || 0}
                  </div>
                
                <ul className="flex items-center mb-4 border border-gray-200 rounded-lg p-6 relative">
                  <li className="flex flex-1 flex-col gap-1 items-center">
                    <div className="text-xs text-black/50">가격제안</div>
                    <div className="text-base font-semibold">{product?.canNegotiate ? '가능' : '불가능'}</div>
                  </li>
                  <li className="flex-0.5 flex items-center justify-center">
                    <div className="block w-[1px] h-7 bg-gray-200"></div>
                  </li>
                  <li className="flex flex-1 flex-col gap-1 items-center">
                    <p className="text-xs text-black/50">화상거래</p>
                    <p className="text-base font-semibold">{product?.canVideoCall ? '가능' : '불가능'}</p>
                  </li>
                  <li className="flex-0.5 flex items-center justify-center">
                    <div className="block w-[1px] h-7 bg-gray-200"></div>
                  </li>
                  <li className="flex flex-1 flex-col gap-1 items-center">
                    <p className="text-xs text-black/50">거래방식</p>
                    <p className="text-base font-semibold">
                      {product?.canDirect ? '직거래' : ''} {product?.canDirect && product?.canDelivery ? ', ' : ''} {product?.canDelivery ? '택배' : ''}
                    </p>
                  </li>
                  <li className="flex-0.5 flex items-center justify-center">
                    <div className="block w-[1px] h-7 bg-gray-200"></div>
                  </li>
                  <li className="flex flex-1 flex-col gap-1 items-center">
                    <div className="text-xs text-black/50">배송비</div>
                    <div className="text-base font-semibold">{product?.shippingFee || 0}원</div>
                  </li>
                </ul>

                <div className="flex gap-4">
                  {/* 하나의 버튼으로 통합된 찜하기 기능 */}
                  <button
                    onClick={handleToggleLike}
                    disabled={isLikeLoading}
                    className="flex-1 py-4 flex items-center justify-center gap-2 border border-[#eee] text-[#777] rounded-lg cursor-pointer hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                  >
                    <img
                      src={isWished ? `${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-on.svg` : `${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`}
                      alt="찜하기"
                      className="w-6 h-6"
                    />
                    찜하기
                  </button>

                  <div
                    onClick={() => {
                      if (isLoggedIn) {
                        makeChatRoom()
                      } else {
                        openLoginModal()
                      }
                    }}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-lg py-3 font-bold cursor-pointer bg-blue-600 text-white hover:bg-blue-700`}
                  >
                    1:1 채팅하기
                  </div>
                </div>
              </div>
              
            {/* 판매자 정보 */}
            <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-start gap-4">
              {/* 판매자 평판 */}
              <SellerTitle seller={seller} />

              {/* 판매물품 */}
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">{product?.seller?.nickname || '판매자'}님의 다른 상품</h3>
                <ul className="flex flex-col gap-4">
                  {product?.seller?.otherProducts?.map((otherProduct : any) => (
                    <li key={otherProduct.id} className="flex flex-row items-center gap-4">
                       <div className="relative w-24 h-24">
                         <img
                           src={otherProduct?.thumbnail || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} 
                           alt="" 
                           className="border border-[#eee] rounded-lg object-cover"
                         />
                       </div>
                       <div className="flex flex-col">
                         <p className="text-sm">{otherProduct?.title || '상품명'}</p>
                         <p className="text-lg font-semibold mb-1">{otherProduct?.price || 0}원</p>
                         <p className="text-xs font-light text-gray-400">찜 {otherProduct?.wishCount || 0} · 조회 {otherProduct?.viewCount || 0}</p>
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
               <h3 className="text-xl font-semibold">상세 정보</h3>
                           <p className="text-gray-700">
                {product?.description || '상품 설명이 없습니다.'}
                </p>
             </div>
            <ul className="bg-[#EFF6FF] flex justify-center py-12 mt-4 rounded-2xl">
              <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">네고가능 여부</p><p className="text-gray-600">가능해요</p></li>
              <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">거래방법</p><p className="text-gray-600">택배 / 직거래</p></li>
              <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">화상거래가능 여부</p><p className="text-gray-600">가능해요</p></li>
            </ul>
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center min-h-screen">
          상품을 찾을 수 없습니다.
        </div>
      )}
    </div>
  );
};