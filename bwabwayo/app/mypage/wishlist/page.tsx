'use client'; // 페이지 내 상호작용(클릭, 라우팅)을 위해 클라이언트 컴포넌트로 선언합니다.

import React, { MouseEvent, use, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.
import { useMyActivityStore} from "@/stores/mypage/myActivityStore"; // Zustand 스토어를 import 합니다.
import ProductCard  from "@/components/product/ProductCard"; // 찜 목록 상품 카드 컴포넌트를 import 합니다.
import { ProductCardUIData } from "@/stores/product/productStore"; // UI 데이터 타입을 import 합니다.



export default function MyPageWishlist() {
  const {
    wishList,
    loading: purchaseListLoading,
    error: purchaseListError,
    fetchWishlist,
  } = useMyActivityStore();

  useEffect(() => {
      fetchWishlist();
    }, [fetchWishlist]);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용하고, userId prop을 전달합니다. */}
        <Sidebar />

        {/* 메인 컨텐츠 */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">찜 상품</h1>
          
          {/* 상품 리스트 */}
          {/* 한 줄에 4개의 상품을 표시하는 grid 레이아웃을 사용합니다. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {wishList?.map((item: ProductCardUIData) => (
    <ul key={item.id}>
      <li>
        <ProductCard item={item} />
      </li>
    </ul>
  ))}
</div>
        </main>
      </div>
    </div>
  );
}


