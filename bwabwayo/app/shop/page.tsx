'use client';

import Sidebar from "@/components/shop/Sidebar";
import React, { useEffect, useState, MouseEvent } from 'react';
import ProductCard from '@/components/product/ProductCard';

type Product = {
  id: number;
  seller_id: number;
  title: string;
  thumbnail: string;
  price: number;
  wish_count: number;
  view_count: number;
  is_like: boolean;
  status: boolean;
};

// --- 메인 페이지 컴포넌트 (Main Page Component) ---
export default function SellerShopInfo() {
  const [sellingProducts, setSellingProducts] = useState<Product[]>([]);
  
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용합니다. */}
        <Sidebar />

        <main className="flex-1">
          {/* 상점 프로필 */}
          <section className="bg-white rounded-xl shadow p-8 flex flex-col md:flex-row gap-8 items-start mb-12">
            <div
              className="w-24 h-24 rounded-full border-2 border-blue-200 bg-gray-100 bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: "url('https://placehold.co/88')" }}
            />
            <div className="flex-1 flex flex-col sm:flex-row justify-between w-full">
              <div>
                <h2 className="text-2xl font-bold mb-2">고윤정님의 상점</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-500 text-lg font-light">4.8</span>
                  <span className="text-gray-500 text-lg font-light">(12)</span>
                </div>
                <div className="text-gray-500 mb-4">
                  깨끗하고 사용감 적은 제품을 판매합니다.
                </div>
                {/* 신뢰지수 막대 동적 처리 */}
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-red-500 font-medium">신뢰지수 234</span>
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="text-gray-500">1000</span>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end mt-4 sm:mt-0">
                <div className="flex gap-8 mb-4">
                  <div><span className="text-gray-400 text-sm">판매상품</span><span className="ml-2 text-lg font-semibold">4</span></div>
                  <div><span className="  ext-sm">거래후기</span><span className="ml-2 text-lg font-semibold">5</span></div>
                  <div><span className="text-gray-400 text-sm">화상거래</span><span className="ml-2 text-lg font-semibold">1</span></div>
                </div>
                <button className="bg-blue-600 text-white rounded-lg px-6 py-2 text-sm font-medium hover:bg-blue-700 transition">
                  1:1 채팅하기
                </button>
              </div>
            </div>
          </section>

          {/* 상품 등록 섹션 */}
          <section className="bg-white rounded-xl shadow p-6 flex justify-between items-center mb-12">
            <div>
                <h3 className="font-bold text-lg">상품 설명이 자동!</h3>
                <p className="text-gray-500 text-sm">카테고리를 입력하면 상품 설명을 자동으로 생성해줘요.</p>
            </div>
            <button className="bg-gray-800 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-900 transition">
                상품 등록
            </button>
          </section>

          {/* 판매 물품 */}
          <div className="mb-12">
            <h3 className="text-xl font-bold mb-6">판매 물품</h3>
            <ProductCard products={sellingProducts} />
          </div>

          {/* 상점 후기 */}
          <section>
            <h3 className="text-xl font-bold mb-4">상점 후기</h3>
            <div className="flex items-center gap-2 text-lg font-bold mb-6">
              <span>4.5</span>
              <span className="text-gray-500 text-base font-normal">총 후기</span>
              <span>5</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center"><span className="text-gray-600">구매확정이 빨라요.</span><span className="font-bold text-blue-600">3</span></div>
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center"><span className="text-gray-600">친절하고 배려가 넘쳐요.</span><span className="font-bold text-blue-600">5</span></div>
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center"><span className="text-gray-600">답장이 빨라요.</span><span className="font-bold text-blue-600">3</span></div>
              <div className="bg-white rounded-lg shadow p-4 flex justify-between items-center"><span className="text-gray-600">약속시간을 잘 지켜요.</span><span className="font-bold text-blue-600">3</span></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}