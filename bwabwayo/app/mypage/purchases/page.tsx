// 파일 경로: app/shop/[id]/purchases/page.tsx
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

  // URL 쿼리 파라미터에서 현재 페이지를 가져옵니다. 없으면 1로 설정.
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    // API는 페이지를 0부터 시작하므로, UI 페이지(1부터 시작)에서 1을 빼서 요청합니다.
    fetchPurchases(currentPage - 1);
  }, [currentPage, fetchPurchases]);

  const handlePageChange = (pageNumber: number) => {
    // 현재 경로를 유지하면서 page 쿼리 파라미터만 변경합니다.
    router.push(`?page=${pageNumber}`);
  };

  // 날짜 포맷팅 함수 (예시)
  const formatDate = (dateString: string) => {
    if (!dateString) return '날짜 정보 없음';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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
              {/* ✨ 수정: relative 클래스 추가 */}
              <div className="relative w-[118px] h-[118px] bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
  <img 
    src={item.thumbnail} 
    alt={item.title} 
    className="object-cover w-full h-full transition-all" 
  />
  {/* 테스트용 후에    {item.purchaseStatus=== 2로 반드시 변경 !!*/}
  {/* ✨ 이미지 위 반투명 어두운 오버레이 */}
  {item.purchaseStatus === 0 && (
    <div className="absolute inset-0 bg-black/35" />
  )}

  {/* ✨ 구매완료 텍스트 오버레이 */}
  {item.purchaseStatus === 0 && (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center bg-black/35">
        <span className="text-white text-lg font-bold">구매완료</span>
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

              {/* 배송 상태 */}
              <div className="text-black text-base font-normal leading-[20px] w-28 text-center">
                {item.deliveryStatus || '배송 정보 없음'}
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
