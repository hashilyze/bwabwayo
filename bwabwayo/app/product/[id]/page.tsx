'use client'

import SellerTitle, { type Seller } from "@/components/shop/SellerTitle";
import { useProductStore } from "@/stores/product/productStore";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useChatRoomStore } from "@/stores/chatting/chatRoomStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/stores/auth/authStore";
import { useModalStore } from "@/stores/modalStore";

export default function ProductDetailPage() {
  const { product, loading, error, getProductDetail } = useProductStore();
  const { roomInfo, addChatRoom } = useChatRoomStore();
  const { isLoggedIn } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const router = useRouter();

  const params = useParams();
  const productId = Number(params.id);
  // SellerTitle에 전달할 판매자 정보를 가공합니다.
  // product.seller의 타입에 bio가 없다는 오류를 해결하기 위해 any로 캐스팅합니다.
  // 실제로는 Seller 타입에 bio가 정의되어 있어야 합니다.
  const seller: Seller = {
    id: product?.seller.id ? String(product.seller.id) : undefined,
    nickname: product?.seller.nickname || '',
    profileImage: product?.seller.profileImage || null,
    rating: product?.seller.rating || 0,
    score: product?.seller.score || 0,
    bio: (product?.seller as { bio?: string })?.bio || '',
  }

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
    // if (!isLoggedIn) {
    //   openLoginModal();
    //   return;
    // }
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
    <div className="relative min-h-screen py-10">
      <div className="flex flex-row gap-12 relative">
        {/* Product Images */}
        <div className="flex-2 w-full max-w-md">
          <div className="sticky top-40 z-8">
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl overflow-hidden border border-gray-200 relative aspect-square">
                  <Image
                    src={product?.imageUrls?.[0] || '/image/no-image.jpg'}
                    width={400}
                    height={400} 
                    alt="상품 대표 이미지" 
                    className="object-cover w-full h-full"
                    unoptimized
                  />
              </div>
                <ul className="grid grid-cols-4 gap-4">
                 {product?.imageUrls?.slice(1, 5).map((imageUrl, index) => (
                   <li key={index} className="relative aspect-square">
                      <Image 
                        src={imageUrl || `/image/no-image.jpg`} 
                        alt={`상품 썸네일${index + 1}`} 
                        className="rounded-xl border border-[#eeeeee] object-cover w-full h-full"
                        width={100}
                        height={100}
                        unoptimized
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
                <p className="text-base font-semibold">{product?.canDirect ? '직거래' : ''} {product?.canDelivery ? ', 택배' : ''}</p>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">배송비</p>
                <p className="text-base font-semibold">{product?.shippingFee || 0}원</p>
              </li>
            </ul>

            <div className="flex gap-4">
                <div className="flex-1 py-4 flex items-center justify-center gap-2 border-1 border-[#eee] text-[#777] rounded-lg cursor-pointer">
                 <img 
                   src={product?.isWish ? "/icon/heart-on.svg" : "/icon/heart-off.svg"} 
                   alt="찜하기" 
                   className="w-4 h-4" 
                 />
                 찜하기
               </div>
                <div
                  onClick={makeChatRoom}
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
              {[1,2,3,4].map(num => (
                                 <li key={num} className="flex flex-row items-center gap-4">
                   <div>
                     <img 
                       src={product?.imageUrls?.[0] || "/image/sample.png"} 
                       alt="" 
                       className="border border-[#eee] rounded-lg w-24 h-24 object-cover"
                       onError={(e) => {
                         const target = e.target as HTMLImageElement;
                         target.src = '/image/no-image.jpg';
                       }}
                     />
                   </div>
                   <div className="flex flex-col">
                     <p className="text-sm">{product?.title || '상품명'}</p>
                     <p className="text-lg font-semibold mb-1">{product?.price || 0}원</p>
                     <p className="text-xs font-light text-gray-400">찜 {product?.wishCount || 0} · 조회 {product?.viewCount || 0}</p>
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
    </div>
  );
};
