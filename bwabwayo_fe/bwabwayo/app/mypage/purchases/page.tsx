
'use client';

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useMyActivityStore, myPurchaseProduct } from "@/stores/mypage/myActivityStore";
import Pagination from "@/components/common/Pagination";
import { useSearchParams, useRouter } from "next/navigation";

// Suspense 내부에서 실제 로직을 처리할 컴포넌트
function PurchaseContent() {
  const {
    purchaseList,
    purchaseTotalPages,
    loading: purchaseListLoading,
    error: purchaseListError,
    fetchPurchases,
  } = useMyActivityStore();
  
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchPurchases(currentPage - 1);
  }, [currentPage, fetchPurchases]);

  const handlePageChange = (pageNumber: number) => {
    router.push(`?page=${pageNumber}`);
  };

  // ✨ 추가: 배송 상태 텍스트를 변환하는 헬퍼 함수
  const getDeliveryStatusText = (deliveryStatus: string | null, purchaseStatus: number): string => {
    // 1. 구매 상태가 '구매완료'이면 항상 '배송 완료'를 반환합니다.
    if (purchaseStatus === 2) {
      return "배송 완료";
    }

    // 2. 그 외의 경우, deliveryStatus에 따라 텍스트를 반환합니다.
    switch (deliveryStatus) {
      case 'DIRECT':
        return '직거래';
      case 'PREPARING':
        return '배송준비중';
      case 'COLLECTED':
        return '집화완료';
      case 'IN_TRANSIT':
        return '배송중';
      case 'ARRIVED_AT_BRANCH':
        return '지점 도착';
      case 'OUT_FOR_DELIVERY':
        return '배송출발';
      case 'DELIVERED':
        return '배송 완료';
      default:
        return '정보 없음'; // 예외 처리
    }
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">구매 상품</h1>
      
      {/* 테이블 헤더 */}
      <div className="bg-gray-100 rounded-lg px-6 py-3 mb-4">
        <div className="flex gap-6 text-gray-500 text-base font-semibold">
          <div className="w-[118px]"></div>
          <div className="flex-1 text-center">제품명</div>
          <div className="w-40 text-center">가격</div>
          <div className="w-28 text-center">배송상태</div>
          <div className="w-32 text-center">구매상태</div>
        </div>
      </div>
      
      {/* 상품 리스트 */}
      <div className="space-y-4">
        {purchaseList.length === 0 && !purchaseListLoading && (
          <div className="text-center text-gray-500 py-20">
            구매 내역이 없습니다.
          </div>
        )}
        {purchaseListError && <div className="text-center text-red-500 py-20">에러: {purchaseListError}</div>}

        {purchaseList.map((item: myPurchaseProduct) => (
          <div key={item.id} className="bg-white rounded-[30px] border border-[#d9d9d9] p-6">
            <div className="flex items-center gap-6">
              {/* 상품 이미지 */}
              <div className="relative w-[118px] h-[118px] bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className={`object-cover w-full h-full transition-all ${item.purchaseStatus === 2 ? 'brightness-75' : ''}`} 
                />
                {item.purchaseStatus === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center bg-black bg-opacity-25">
                      <span className="text-white text-lg font-bold">판매완료</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 제품명 */}
              <div className="flex flex-col gap-2 flex-1">
                <div className="text-[#7c7c7c] text-sm font-normal">
                  {/* 등록일자 등 추가 정보 */}
                </div>
                
                <Link href={`/product/${item.id}`} className="group">
                  <div className="text-black text-xl font-semibold leading-[25px]">
                    {item.title.length > 50 ? `${item.title.substring(0, 50)}...` : item.title}
                  </div>
                </Link>
              </div>

              {/* 가격 */}
              <div className="text-black text-lg font-medium leading-[22px] w-40 text-center">
                {item.price.toLocaleString('ko-KR')}원
              </div>

              {/* ✨ 수정: 배송 상태 표시 부분을 헬퍼 함수 호출로 변경 */}
              <div className="text-black text-base font-normal leading-[20px] w-28 text-center">
                {getDeliveryStatusText(item.deliveryStatus, item.purchaseStatus)}
              </div>

              {/* 구매상태 (구매확정 버튼) */}
              <div className="w-32 text-center">
                {item.purchaseStatus === 0 && (
                  <button
                    className="w-full truncate px-4 py-2 rounded-[20px] border border-black bg-[#ffae00] text-white text-base font-extrabold"
                  >
                    구매중
                  </button>
                )}
                {item.purchaseStatus === 1 && (
                  <button
                    className="w-full truncate px-4 py-2 rounded-[20px] border border-black bg-[#ffae00] text-white text-base font-extrabold"
                    // onClick={() => handleConfirmPurchase(item.id)}
                  >
                    구매확정대기
                  </button>
                )}
                {item.purchaseStatus === 2 && (
                  <button
                    className="w-full truncate px-4 py-2 rounded-[20px] border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed text-base font-medium"
                    disabled
                  >
                    구매완료
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      <Pagination
        currentPage={currentPage}
        totalPages={purchaseTotalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// 최종적으로 내보내는 페이지 컴포넌트
export default function MyPagePurchases() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">페이지를 불러오는 중...</div>}>
      <PurchaseContent />
    </Suspense>
  );
}
