'use client'

import ProductCard from "@/components/product/ProductCard";
import WebTest from "@/components/home/WebTest";
import React, { useEffect } from 'react';
import { useProductStore } from '../stores/productStore';

export default function Home() {
  const { products, loading, error, getProducts } = useProductStore();
  const hotKeyword = '라부부';

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return (
    <div>
      {/* 화상서비스 테스트 */}
      <WebTest />

      {/* 광고 */}
      <div className="w-full h-[250px] bg-gray-200 rounded-xl my-10"></div>


      <div className="mb-12">
        <h1 className="text-2xl font-bold mb-5">최근 판매상품</h1>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg">로딩 중...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-red-500">{error}</div>
          </div>
        ) : (
          <ProductCard products={products} />
        )}
      </div>

      <div className="mb-12">
        <h1 className="text-2xl font-bold mb-5">요즘 핫한 키워드 <span className="text-blue-500">{hotKeyword}</span></h1>
        <ProductCard products={products} />
      </div>
    </div>
  );
}