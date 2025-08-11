// 파일 경로: app/shop/[id]/sales/page.tsx
'use client'; // 페이지 내 상호작용을 위해 클라이언트 컴포넌트로 선언합니다.

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useMyActivityStore, ActivityProduct } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트를 import 합니다.


export default function MyPageSales() {
  const {salesList, loading: salesLoading, error: salesError, fetchSales } = useMyActivityStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 한 페이지에 5개의 판매 내역을 표시합니다.

  // 페이지네이션을 위한 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = salesList ? salesList.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = salesList ? Math.ceil(salesList.length / itemsPerPage) : 0;

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="">
      <h1 className="text-3xl font-bold mb-8">판매 상품</h1>
      
      {/* 테이블 헤더 */}
      <div className="bg-gray-100 rounded-lg px-6 py-3 mb-4">
        <div className="flex gap-6 text-gray-500 text-base font-semibold">
          <div className="w-[118px]"></div>
          <div className="flex-1 text-center">제품명</div>
          <div className="w-40 text-center">가격</div>
          <div className="w-28 text-center">배송상태</div>
          <div className="w-32 text-center">판매상태</div>
        </div>
      </div>
      
      {/* 상품 리스트 */}
      <div className="space-y-4">
        {currentItems.length === 0 && !salesLoading && (
          <div className="text-center text-gray-500 py-20">
            판매 내역이 없습니다.
          </div>
        )}
        {salesError && <div className="text-center text-red-500 py-20">에러: {salesError}</div>}

        {currentItems.map((item) => (
          <div key={item.product.id} className="bg-white rounded-[30px] border border-[#d9d9d9] p-6">
            <div className="flex items-center gap-6">
              {/* 상품 이미지 */}
              <div className="w-[118px] h-[118px] bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.product.thumbnail} alt={item.product.title} className="object-cover w-full h-full" />
              </div>

              {/* 제품명 */}
              <div className="flex flex-col gap-2 flex-1">
                {/* 날짜 */}
                <div className="text-[#7c7c7c] text-sm font-normal">
                  등록일자 : 2025.08.06 14:00
                </div>
                
                {/* 상품명 */}
                <Link href={`/product/${item.product.id}`} className="group">
                  <div className="text-black text-xl font-semibold leading-[25px]">
                    {item.product.title.length > 50 ? `${item.product.title.substring(0, 50)}...` : item.product.title}
                  </div>
                </Link>
              </div>

              {/* 가격 */}
              <div className="text-black text-lg font-medium leading-[22px] w-40 text-center">
                {item.product.price.toLocaleString('ko-KR')}원
              </div>

              {/* 배송 상태 */}
              <div className="text-black text-base font-normal leading-[20px] w-28 text-center">
                {item.product.saleStatus === '판매중' && '배송 대기'}
                {item.product.saleStatus === '거래중' && '송장번호를 입력해주세요.'}
                {item.product.saleStatus === '판매완료' && '배송완료'}
              </div>

              {/* 판매상태 */}
              <div className="w-32 text-center">
                {item.product.saleStatus === '판매중' && (
                  <button className="px-6 py-2 rounded-[20px] border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed text-base font-medium" disabled>
                    판매중
                  </button>
                )}
                {item.product.saleStatus === '거래중' && (
                  <button className="px-6 py-2 rounded-[20px] border border-black bg-[#ffae00] text-white text-base font-extrabold">
                    거래중
                  </button>
                )}
                {item.product.saleStatus === '판매완료' && (
                  <button className="px-6 py-2 rounded-[20px] border border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed text-base font-medium" disabled>
                    판매완료
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
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
