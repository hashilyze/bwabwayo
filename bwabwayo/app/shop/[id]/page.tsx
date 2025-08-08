'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import Sidebar from "@/components/shop/Sidebar";
import ProductCard from "@/components/product/ProductCard";
import SellerTitle from '@/components/shop/SellerTitle';
import { useProductStore, ProductWithSeller } from '@/stores/product/productStore';

export default function SellerShopInfo({ params }: { params: { id: string } }) {
  const { products, loading, error, getProducts, clearProducts } = useProductStore();
  
  useEffect(() => {
    // 특정 판매자의 상품만 조회 (실제로는 seller_id로 필터링)
    getProducts();
  }, [getProducts]);

  return (
    <div className="container-default m-auto">
      <div className="flex gap-10">
        <Sidebar />

        <main>
          <div className="grid grid-cols-2 gap-6">
            <SellerTitle />

            <div className="flex-1 max-w-[544px]">
              {/* 상품 등록 섹션 */}
              <div className="bg-white rounded-xl p-6 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-1">상품 설명이 자동!</h3>
                    <p className="text-gray-500 text-sm">카테고리를 선택하면 자동으로 상품 설명을 채워줘요</p>
                  </div>
                  <Link href="" className="bg-gray-600 text-white rounded-full px-4 py-2 text-sm font-normal hover:bg-gray-700 transition">
                    상품 등록
                  </Link>
                </div>
              </div>

              {/* 통계 섹션 */}
              <ul className="grid grid-cols-4 border border-gray-200 rounded-xl overflow-hidden">
                 {/* 판매상품 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">판매상품</div>
                   <div className="text-black text-xl font-normal">4</div>
                 </li>
                 
                 {/* 거래후기 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">거래후기</div>
                   <div className="text-black text-xl font-normal">5</div>
                 </li>
                 
                 {/* 화상거래 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">화상거래</div>
                   <div className="text-black text-xl font-normal">1</div>
                 </li>
                 
                 {/* 포인트 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">포인트</div>
                   <div className="text-black text-xl font-normal">1,600 P</div>
                 </li>
              </ul>
            </div>
          </div>

          {/* 판매 물품 섹션 */}
          <section className="mt-12">
            <h3 className="text-xl font-bold mb-6">판매 물품</h3>
            <ul className="grid grid-cols-4 gap-6 gap-y-12">
              {products.map((item: ProductWithSeller) => (
            <li key={item.product.id}>
              <ProductCard item={item} />
            </li>
          ))}
        </ul>
          </section>

          {/* 상점 후기 섹션 */}
          <section className="mt-12">
            <h3 className="text-xl font-bold mb-4">상점 후기</h3>
            <div className="flex items-center gap-2 text-lg font-bold mb-6">
              <span>4.5</span>
              <span className="text-gray-500 text-base font-normal">총 후기</span>
              <span>5</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <span className="text-gray-600">구매확정이 빨라요.</span>
                <span className="font-bold text-blue-600">3</span>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <span className="text-gray-600">친절하고 배려가 넘쳐요.</span>
                <span className="font-bold text-blue-600">5</span>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <span className="text-gray-600">답장이 빨라요.</span>
                <span className="font-bold text-blue-600">3</span>
              </div>
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <span className="text-gray-600">약속시간을 잘 지켜요.</span>
                <span className="font-bold text-blue-600">3</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
