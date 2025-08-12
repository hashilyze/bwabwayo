'use client'; // 페이지 내 상호작용(클릭, 라우팅)을 위해 클라이언트 컴포넌트로 선언합니다.

import React, { Suspense, useEffect } from "react";
import { useMyActivityStore } from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.
import { ProductCardUIData } from "@/stores/product/productStore"; // UI 데이터 타입을 import 합니다.
import ProductCard from "@/components/product/ProductCard"; // 범용 ProductCard를 사용합니다.
import Pagination from "@/components/common/Pagination"; // 페이지네이션 컴포넌트를 import 합니다.
import { useRouter, useSearchParams } from "next/navigation"; // URL 관리를 위해 import 합니다.

function WishlistContent() {
  const {
    wishList,
    loading: purchaseListLoading,
    error: purchaseListError,
    fetchWishlist,
  } = useMyActivityStore();

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = 8; // 한 페이지에 8개의 상품을 표시합니다 (4x2 그리드).

  useEffect(() => {
      fetchWishlist();
    }, [fetchWishlist]);

  // 페이지네이션을 위한 로직
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = wishList ? wishList.slice(indexOfFirstItem, indexOfLastItem) : [];
  const totalPages = wishList ? Math.ceil(wishList.length / itemsPerPage) : 0;

  const handlePageChange = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(pageNumber));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="min-w-0">
          <h1 className="text-3xl font-bold mb-8">찜 상품</h1>
          
          {/* 상품 리스트 */}
          {/* 한 줄에 4개의 상품을 표시하는 grid 레이아웃을 사용합니다. */}
          {currentItems && currentItems.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentItems.map((item: ProductCardUIData) => (
                  <ProductCard key={item.id} item={item} height={240} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-64 bg-white border rounded-lg">
              <p className="text-gray-500">찜한 상품이 없습니다.</p>
            </div>
          )}
    </div>
  );
}

export default function MyPageWishlist() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">찜 목록을 불러오는 중...</div>}>
      <WishlistContent />
    </Suspense>
  );
}
