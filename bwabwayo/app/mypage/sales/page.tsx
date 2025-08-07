// 파일 경로: app/shop/[id]/sales/page.tsx
'use client'; // 페이지 내 상호작용을 위해 클라이언트 컴포넌트로 선언합니다.

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.
import { useMyActivityStore, ActivityProduct } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.


export default function MyPageSales() {
  const {salesList, loading: salesLoading, error: salesError, fetchSales } = useMyActivityStore();

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // 판매 상품 목록
  const sales = salesList;

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
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용하고, userId prop을 전달합니다. */}
        <Sidebar  />

        {/* 메인 컨텐츠 */}
        <main className="flex-1">
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
            {sales.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 items-center px-6 py-6">
                {/* 상품명 및 이미지 */}
                <div className="col-span-4">
                  <Link href={`/product/${item.product.id}`} className="flex items-center gap-4 group">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <Image src={item.product.thumbnail} alt={item.product.title} fill className="object-cover" />
                    </div>
                    <div className="text-gray-700 whitespace-pre-line text-base group-hover:underline group-hover:text-blue-600 transition-colors">{item.product.title}</div>
                  </Link>
                </div>
                
                {/* 가격 */}
                <div className="col-span-2 text-lg font-medium text-gray-900 text-center">{item.product.price}</div>
                
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
        </main>
      </div>
    </div>
  );
}
