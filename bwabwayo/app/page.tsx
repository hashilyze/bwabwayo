'use client'

import ProductCard from "@/components/product/ProductCard";
import Chatbot from '@/components/chat/Chatbot';
import WebTest from "@/components/home/WebTest";
import React, { useEffect } from 'react';
import { useProductStore } from '../stores/productStore';

export default function Home() {
  const { products, loading, error, getAllProducts } = useProductStore();

  useEffect(() => {
    getAllProducts();
  }, [getAllProducts]);

  return (
    <div>
      {/* 화상서비스 테스트 */}
      <WebTest />

      {/* 광고 */}
      <div className="w-full h-[250px] bg-gray-200 rounded-xl my-10"></div>

      <Chatbot className="display-none" />

      <div>
        <h1 className="text-2xl font-bold mb-5">판매상품</h1>
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
    </div>
  );
}