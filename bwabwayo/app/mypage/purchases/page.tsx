// 파일 경로: app/shop/[id]/purchases/page.tsx
'use client'; // '구매확정' 버튼 등 상호작용이 있으므로 클라이언트 컴포넌트로 선언합니다.

import React, { useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.
import { useMyActivityStore, myPurchaseProduct } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.

export default function MyPagePurchase() {
  const {
    purchaseList,
    purchasePage,
    purchaseHasMore,
    loading: purchaseListLoading,
    error: purchaseListError,
    fetchPurchases,
    resetPurchases,
  } = useMyActivityStore();

  useEffect(() => {
    // 첫 페이지 로드
    fetchPurchases(0);

    // 컴포넌트 언마운트 시 상태 초기화
    return () => {
      resetPurchases();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  const handleLoadMore = () => {
    if (!purchaseListLoading && purchaseHasMore) {
      fetchPurchases(purchasePage + 1);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용하고, userId prop을 전달합니다. */}
        <Sidebar/>

        {/* 메인 컨텐츠 */}
        <main className="flex-1 min-w-0 overflow-hidden">
          <h1 className="text-3xl font-bold mb-8">구매 상품</h1>
          
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 bg-gray-100 rounded-t-lg px-6 py-3 text-gray-500 text-base font-semibold mb-2">
            <div className="col-span-4">상품명</div>
            <div className="col-span-2 text-center">가격</div>
            <div className="col-span-3 text-center">배송상태</div>
            <div className="col-span-3 text-center">구매확정</div>
          </div>
          
          {/* 상품 리스트 */}
          <div className="divide-y divide-gray-200 bg-white rounded-b-lg shadow">
            {purchaseList.length === 0 && !purchaseListLoading && (
              <div className="text-center text-gray-500 py-20">
                구매 내역이 없습니다.
              </div>
            )}
            {purchaseListError && <div className="text-center text-red-500 py-20">에러: {purchaseListError}</div>}

            {purchaseList.map((item: myPurchaseProduct) => (
              <div key={item.id} className="grid grid-cols-12 items-center px-6 py-6">
                {/* 상품명 및 이미지 */}
                <div className="col-span-4">
                  <Link href={`/product/${item.id}`} className="flex items-center gap-4 group">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img src={item.thumbnail} alt={item.title} className="object-cover" />
                    </div>
                    <div className="text-gray-700 whitespace-pre-line text-base group-hover:underline group-hover:text-blue-600 transition-colors">{item.title}</div>
                  </Link>
                </div>
                
                {/* 가격 */}
                <div className="col-span-2 text-lg font-medium text-gray-900 text-center">{item.price}</div>
                
                {/* 배송상태 */}
                <div className="col-span-3 text-center">
                  <div className="text-base font-medium text-gray-900">{item.deliveryStatus || '직거래'}</div>
                  {item.deliveryStatus && (
                    <div className="text-xs text-gray-500 mt-1">
                      <div>{item.courierName}</div>
                      <div>{item.trackingNumber}</div>
                    </div>
                  )}
                </div>
                
                {/* 구매확정 */}
               <div className="col-span-3 text-center">
  {item.purchaseStatus === 0 && (
    <button
      className="px-4 py-1 rounded border border-gray-400 text-gray-400 bg-gray-100 cursor-not-allowed text-base"
      disabled
    >
      구매확정
    </button>
  )}

  {item.purchaseStatus === 1 && (
    <button
      className="px-4 py-1 rounded border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors text-base"
    >
      구매확정
    </button>
  )}

  {item.purchaseStatus === 2 && (
    <button
      className="px-4 py-1 rounded border border-gray-400 text-gray-400 bg-gray-100 cursor-not-allowed text-base"
      disabled
    >
      구매확정완료
    </button>
  )}
</div>
              </div>
            ))}
          </div>

          {/* 더보기 버튼 */}
          {purchaseHasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={purchaseListLoading}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {purchaseListLoading ? '불러오는 중...' : '더보기'}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
