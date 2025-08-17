'use client'

import SellerTitle, { type Seller } from "@/components/shop/SellerTitle";
import { useProductStore } from "@/stores/product/productStore";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useChatRoomStore } from "@/stores/chatting/chatRoomStore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth/authStore";
import { useModalStore } from "@/stores/modalStore";
import { useLikeProductStore } from "@/stores/product/likeProductStore";
import Link from "next/link";
import type { ProductWithSeller } from "@/stores/product/productStore";
import { OverlayPortal } from "@/components/chat/modals/OverlayPortal";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// 판매자의 다른 상품을 위한 타입 정의
interface OtherProduct {
  id: number;
  thumbnail?: string;
  title?: string;
  price?: number;
  wishCount?: number;
  viewCount?: number;
}

export default function ProductDetailPage() {
  const { product, loading, error, getProductDetail, similarProducts, getSimilarProducts, setSimilarProducts } = useProductStore();
  const { addChatRoom } = useChatRoomStore();
  const { isLoggedIn } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const { addLike, removeLike } = useLikeProductStore();
  const router = useRouter();

  const params = useParams();
  const productId = Number(params.id);

  // 톱니바퀴 드롭다운 상태
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 삭제 확인 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const seller: Seller = {
    id: product?.seller.id ? String(product.seller.id) : undefined,
    nickname: product?.seller.nickname || '',
    profileImage: product?.seller.profileImage || null,
    rating: product?.seller.rating || 0,
    score: product?.seller.score || 0,
    bio: (product?.seller as { bio?: string })?.bio || '',
    dealCount: product?.seller.dealCount || 0,
    reviewCount: product?.seller.reviewCount ?? 0
  }

  // --- 찜하기 기능 로직 통합 ---
  const [isWished, setIsWished] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  // --- 이미지 선택 기능 ---
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // --- 돋보기 기능 ---
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // 제품 삭제 함수
  const handleDeleteProduct = async () => {
    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const response = await authenticatedFetch(`/be/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('상품이 삭제되었습니다.');
        router.push('/'); // 홈으로 이동
      } else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error('상품 삭제 중 오류:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  // 삭제 확인 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
    setIsDropdownOpen(false); // 드롭다운 닫기
  };

  // 기존 상세/유사상품 useEffect를 병렬 호출로 통합
  useEffect(() => {
    setSimilarProducts([]); // 유사상품 초기화로 이전 데이터 깜빡임 방지
    // 병렬 호출
    Promise.all([
      getProductDetail(productId),
      getSimilarProducts(productId)
    ]);
  }, [getProductDetail, getSimilarProducts, setSimilarProducts, productId]);

  // 상품이 변경되면 선택된 이미지 인덱스를 0으로 리셋
  useEffect(() => {
    setSelectedImageIndex(0);
    setIsZoomed(false); // 돋보기 상태도 리셋
  }, [product]);

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
  
  // 상세정보와 유사상품 모두 로딩 상태 관리
  const isAllLoading = loading || !product || !similarProducts || similarProducts.length === 0;

  return (
    <div className="relative min-h-screen pt-20 pb-40 container-default m-auto">
      {isAllLoading ? (
        <div className="flex flex-col justify-start items-center min-h-screen pt-40">
          <LoadingSpinner text="로딩중입니다..." />
        </div>
      ) : (
        <>
        <div>
          <div className="flex flex-row gap-12 relative">
            {/* Product Images */}
            <div className="flex-2 w-full max-w-md">
              <div className="sticky top-60 z-8">
                <div className="flex flex-col gap-4">
                  <div 
                    className="rounded-2xl overflow-hidden border-2 border-black relative aspect-square cursor-zoom-in"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - rect.left) / rect.width) * 100;
                      const y = ((e.clientY - rect.top) / rect.height) * 100;
                      setMousePosition({ x, y });
                    }}
                  >
                  <img
                    src={product?.imageUrls?.[selectedImageIndex] || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`}
                    alt="상품 대표 이미지" 
                    className={`object-cover w-full h-full transition-transform duration-200 ${
                      isZoomed ? 'scale-150' : 'scale-100'
                    }`}
                    style={{
                      transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                    }}
                  />
                  </div>
                    <ul className="grid grid-cols-4 gap-4">
                     {product?.imageUrls?.map((imageUrl, index) => (
                       <li 
                         key={index} 
                         className={`relative w-25 h-25 aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${
                           selectedImageIndex === index 
                             ? 'border-black border-2' 
                             : 'border-[#eeeeee]'
                         }`}
                         onClick={() => setSelectedImageIndex(index)}
                       >
                          <img 
                            src={imageUrl || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} 
                            alt={`상품 썸네일${index + 1}`} 
                            className="object-cover w-full h-full"
                          />
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </div>

            {/* 상품 타이틀 */}
            <div className="flex-3 flex flex-col gap-10">
              {/* Product Info */}
              <div className="">
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6 border-2 border-black relative">
                  <p className="text-black text-md mb-2">
                    홈 &gt; {product?.categories?.[0]?.name || '대분류'} &gt; {product?.categories?.[1]?.name || '소분류'}
                  </p>

                                     {/* 톱니바퀴 버튼 - isMine이 true일 때 표시, saleStatus에 따라 메뉴 다름 */}
                   {product.isMine && (
                     <div className="absolute top-10 right-10" ref={dropdownRef}>
                       <button
                         onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                         className="w-12 h-12 text-black rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                       >
                         <svg 
                           className={`w-6 h-6 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`}
                           fill="none" 
                           stroke="currentColor" 
                           viewBox="0 0 24 24"
                         >
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                           />
                           <path 
                             strokeLinecap="round" 
                             strokeLinejoin="round" 
                             strokeWidth={2} 
                             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                           />
                         </svg>
                       </button>
                       
                        {/* 드롭다운 메뉴 */}
                        {isDropdownOpen && (
                          <div className="absolute right-0 -mt-1 w-36 bg-white border-2 border-black rounded-lg shadow-lg z-50">
                            <Link
                              href={`/product/${productId}/edit`}
                              className={`block px-5 py-3 text-base text-gray-700 hover:bg-gray-100 rounded-t-lg ${
                                product.saleStatus === 0 ? 'border-b border-black' : 'rounded-b-lg'
                              }`}
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              수정
                            </Link>
                            {/* saleStatus가 0일 때만 삭제 버튼 표시 */}
                            {product.saleStatus === 0 && (
                              <button
                                onClick={openDeleteModal}
                                className="block w-full text-left px-5 py-3 text-base text-red-600 hover:bg-gray-100 rounded-b-lg"
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        )}
                     </div>
                   )}
                  
                  <div className="flex flex-col mt-6 mb-4 gap-2">
                    <h1 className="text-2xl">{product?.title || '상품명'}</h1>
                    <p className="text-4xl text-black font-bold">
                      {(product?.price || 0).toLocaleString()}원
                    </p>
                  </div>
                    <div className="text-gray-400 text-md mb-[30px]">
                      {getRelativeTime(product?.createdAt || '')} · 찜 {product?.wishCount || 0} · 조회 {product?.viewCount || 0}
                    </div>
                  
                  {/* 상품 옵션 */}
                  <ul className="flex items-center mb-4 bg-[#F9F9F9] rounded-lg p-6 relative">
                    <li className="flex flex-1 flex-col gap-1 items-center">
                      <div className="text-md text-black/50">가격제안</div>
                      <div className="text-lg font-semibold">{product?.canNegotiate ? '가능' : '불가능'}</div>
                    </li>
                    <li className="flex-0.5 flex items-center justify-center">
                      <div className="block w-[1px] h-7 bg-gray-200"></div>
                    </li>
                    <li className="flex flex-1 flex-col gap-1 items-center">
                      <p className="text-md text-black/50">화상거래</p>
                      <p className="text-lg font-semibold">{product?.canVideoCall ? '가능' : '불가능'}</p>
                    </li>
                    <li className="flex-0.5 flex items-center justify-center">
                      <div className="block w-[1px] h-7 bg-gray-200"></div>
                    </li>
                    <li className="flex flex-1 flex-col gap-1 items-center">
                      <div className="text-md text-black/50">거래방식</div>
                      <div className="text-lg font-semibold"> 
                        {product?.canDirect ? '직거래' : ''} {product?.canDirect && product?.canDelivery ? ', ' : ''} {product?.canDelivery ? '택배' : ''}
                      </div>
                    </li>
                    <li className="flex-0.5 flex items-center justify-center">
                      <div className="block w-[1px] h-7 bg-gray-200"></div>
                    </li>
                    <li className="flex flex-1 flex-col gap-1 items-center">
                      <div className="text-md text-black/50">배송비</div>
                      <div className="text-lg font-semibold">{product?.shippingFee || 0}원</div>
                    </li>
                  </ul>
                    
                  {/* button-wrap */}
                  <div className="flex gap-4">
                    {/* 하나의 버튼으로 통합된 찜하기 기능 */}
                    <button
                      onClick={handleToggleLike}
                      disabled={isLikeLoading}
                      className="flex-1 py-4 flex items-center justify-center gap-2 text-lg border-2 border-block rounded-lg cursor-pointer hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
                    >
                      <img
                        src={isWished ? `${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-on.svg` : `${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`}
                        alt="찜하기"
                        className="w-6 h-6"
                      />
                      찜하기
                    </button>

                    {/* 1:1 채팅 버튼 - isMine이 true이면 비활성화, saleStatus에 따른 조건부 비활성화 */}
                    <button
                      onClick={() => {
                        if (product.isMine) {
                          alert('자신의 상품에는 채팅할 수 없습니다.');
                          return;
                        }
                        if (product.saleStatus === 1) {
                          alert('거래중인 상품입니다.');
                          return;
                        }
                        if (product.saleStatus === 2) {
                          alert('판매완료된 상품입니다.');
                          return;
                        }
                        if (isLoggedIn) {
                          makeChatRoom()
                        } else {
                          openLoginModal()
                        }
                      }}
                      disabled={product.isMine || product.saleStatus === 1 || product.saleStatus === 2}
                      className={`flex-1 border-2 border-black py-4 flex items-center justify-center gap-2 rounded-lg py-3 font-bold cursor-not-allowed text-xl ${
                        product.isMine || product.saleStatus === 1 || product.saleStatus === 2
                          ? 'bg-gray-300 text-gray-500' 
                          : 'bg-[#FFAE00] hover:bg-[#FF9500] transition-colors cursor-pointer'
                      }`}
                    >
                      {product.isMine 
                        ? '내 상품입니다' 
                        : product.saleStatus === 1 
                          ? '거래중입니다' 
                          : product.saleStatus === 2 
                            ? '판매완료된 상품입니다' 
                            : '1:1 채팅하기'
                      }
                    </button>
                  </div>
                </div>
              </div>

              {/* 추천 상품 */}
              <div>
                <h1 className="text-2xl font-bold mb-4">이 상품과 비슷해요!!</h1>
                {loading || !similarProducts || similarProducts.length === 0 ? (
                  <LoadingSpinner />
                ) : (
                  <ul className="grid grid-cols-4 gap-4">
                    {similarProducts
                      ?.filter((similarProduct: ProductWithSeller) => Number(similarProduct.product.id) !== Number(productId)) // 현재 제품 제외
                      ?.slice(0, 4)
                      ?.map((similarProduct: ProductWithSeller) => (
                        <li key={similarProduct.product.id} className="">
                          <Link href={`/product/${similarProduct.product.id}`} className="flex flex-col gap-2"  >
                            <div className="relative">
                              <img
                                src={similarProduct.product?.thumbnail || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} 
                                alt="" 
                                className="border border-[#eee] rounded-lg object-cover aspect-square"
                              />
                            </div>
                            <div className="flex flex-col">
                              <p className="text-lg h-14 line-clamp-2">{similarProduct.product?.title || '상품명'}</p>
                              <p className="text-xl font-bold mb-2">{(similarProduct.product?.price || 0).toLocaleString()}원</p>
                            </div>
                          </Link>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>


          <div className="flex flex-row gap-8 mt-20">
            {/* Product Description */}
            <div className="flex-2 rounded-2xl p-8 border border-[#eee]">
              <h2 className="text-2xl font-bold mb-6">상품 설명</h2>

              <div className="text-gray-700 whitespace-pre-wrap">
                {product?.description || '상품 설명이 없습니다.'}
              </div>
            </div>

              {/* 판매자 정보 */}
              <div className="flex-1 rounded-2xl border border-[#eee] p-8 flex flex-col items-start gap-4">
                {/* 판매자 평판 */}
                <SellerTitle seller={seller} />
  
                {/* 판매물품 */}
                <div className="mt-10">
                    <h3 className="text-2xl font-bold mb-4">&#39;{product?.seller?.nickname || '판매자'}&#39;님의 다른 상품</h3>                  <ul className="flex flex-col gap-4">
                    {(product?.seller?.otherProducts as OtherProduct[])?.map((otherProduct: OtherProduct) => (
                      <li key={otherProduct.id}>
                        <Link href={`/product/${otherProduct.id}`} className="flex flex-row items-center gap-5">
                          <div className="relative flex-1">
                            <img
                              src={otherProduct?.thumbnail || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`} 
                              alt="" 
                              className="border border-[#eee] rounded-lg object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex flex-col flex-2">
                            <p className="text-lg">{otherProduct?.title && otherProduct.title.length > 25 ? `${otherProduct.title.slice(0, 25)}...` : otherProduct?.title || '상품명'}</p>
                            <p className="text-xl font-bold mb-2">{(otherProduct?.price || 0).toLocaleString()}원</p>
                            <p className="text-md font-light text-gray-400">찜 {otherProduct?.wishCount || 0} · 조회 {otherProduct?.viewCount || 0}</p>
                          </div>
                         </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
        </>
      )}

      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <OverlayPortal open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 border-2 border-black shadow-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">상품 삭제</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-700 mb-8 text-center">
              정말로 이 상품을 삭제하시겠습니까?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                취소
              </button>
              <button
                onClick={() => {
                  handleDeleteProduct();
                  setIsDeleteModalOpen(false);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                삭제
              </button>
            </div>
          </div>
        </OverlayPortal>
      )}
    </div>
  );
};