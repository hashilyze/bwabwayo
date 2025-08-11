// 파일 경로: app/shop/[id]/purchases/page.tsx
'use client'; // '구매확정' 버튼 등 상호작용이 있으므로 클라이언트 컴포넌트로 선언합니다.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.
import { useMyActivityStore, myPurchaseProduct } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트를 import 합니다.

export default function MyPagePurchase() {
  const {
    purchaseList,
    loading: purchaseListLoading,
    error: purchaseListError,
    fetchPurchases,
  } = useMyActivityStore();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 5개의 구매 내역을 표시합니다.

  useEffect(() => {
    // 전체 구매 목록을 가져옵니다.
    // 참고: 현재 fetchPurchases가 페이지별로 데이터를 가져온다면,
    // 모든 데이터를 한 번에 가져오는 새로운 함수가 스토어에 필요할 수 있습니다.
    // 여기서는 fetchPurchases(0)가 모든 데이터를 가져온다고 가정하고 진행합니다.
    fetchPurchases(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 시 한 번만 실행

  // 페이지네이션을 위한 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = purchaseList ? purchaseList.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = purchaseList ? Math.ceil(purchaseList.length / itemsPerPage) : 0;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-row gap-8">
        
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
            {currentItems.length === 0 && !purchaseListLoading && (
              <div className="text-center text-gray-500 py-20">
                구매 내역이 없습니다.
              </div>
            )}
            {purchaseListError && <div className="text-center text-red-500 py-20">에러: {purchaseListError}</div>}

            {currentItems.map((item: myPurchaseProduct) => (
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
                <div className="col-span-2 text-lg font-medium text-gray-900 text-center">
                  {item.price.toLocaleString('ko-KR')}원
                </div>
                
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

          {/* 페이지네이션 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
}
