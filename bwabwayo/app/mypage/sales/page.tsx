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
  
  // 판매 상태에 따라 다른 스타일을 반환하는 함수
  const getStatusChip = (status: string) => {
    switch (status) {
      case "판매중":
        return <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">{status}</span>;
      case "거래중":
        return <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">{status}</span>;
      case "판매완료":
        return <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm font-medium">{status}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-w-0">
          <h1 className="text-3xl font-bold mb-8">판매 상품</h1>
          
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 bg-gray-100 rounded-t-lg px-6 py-3 text-gray-500 text-base font-semibold mb-2">
            <div className="col-span-4">상품명</div>
            <div className="col-span-2 text-center">가격</div>
            <div className="col-span-3 text-center">배송상태</div>
            <div className="col-span-3 text-center">판매상태</div>
          </div>
          
          {/* 상품 리스트 */}
          <div className="divide-y divide-gray-200 bg-white rounded-b-lg shadow">
            {currentItems.length === 0 && !salesLoading && (
              <div className="text-center text-gray-500 py-20">
                판매 내역이 없습니다.
              </div>
            )}
            {salesError && <div className="text-center text-red-500 py-20">에러: {salesError}</div>}

            {currentItems.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 items-center px-6 py-6 transition-colors hover:bg-gray-50">
                {/* 상품명 및 이미지 */}
                <div className="col-span-4">
                  <Link href={`/product/${item.product.id}`} className="flex items-center gap-4 group">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img src={item.product.thumbnail} alt={item.product.title} className="object-cover" />
                    </div>
                    <div className="text-gray-700 whitespace-pre-line text-base group-hover:underline group-hover:text-blue-600 transition-colors">{item.product.title}</div>
                  </Link>
                </div>
                
                {/* 가격 */}
                <div className="col-span-2 text-lg font-medium text-gray-900 text-center">
                  {item.product.price.toLocaleString('ko-KR')}원
                </div>
                
                {/* 배송상태 */}
                <div className="col-span-3 text-center">
                  <a href="#" className="text-base font-medium text-blue-600 hover:underline">
                    {item.product.saleStatus === '판매중' && '배송 대기'}
                    {item.product.saleStatus === '거래중' && '송장번호를 입력해주세요.'}
                    {item.product.saleStatus === '판매완료' && '배송완료'}
                  </a>
                </div>

                
                {/* 판매상태 */}
                <div className="col-span-3 text-center">
                  {getStatusChip(item.product.saleStatus)}
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
