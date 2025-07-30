'use client'

import ProductCard from "@/components/product/ProductCard";
import WebTest from "@/components/home/WebTest";
import React, { useEffect } from 'react';
import { useProductStore } from '@/stores/productStore';

export default function Home() {
  const { products, hotKeywordProducts, videoCallProducts, loading, error, getProducts, getHotKewordProducts, getVideoCallProducts } = useProductStore();
  const hotKeyword = '라부부';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 세 API를 병렬로 실행 (더 빠름)
        await Promise.all([
          getProducts(),
          getHotKewordProducts(hotKeyword),
          getVideoCallProducts()
        ]);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };
    
    fetchData();
  }, [getProducts, getHotKewordProducts, getVideoCallProducts]);

  return (
    <div>
      {/* 화상서비스 테스트 */}
      <WebTest />

      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-5">최근 판매상품</h1>
        {error ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-red-500">상품이 없습니다.</div>
          </div>
        ) : (
          <ProductCard products={products} navigationId="recent" />
        )}
      </div>

      {/* 광고 */}
      <div className="w-full h-[250px] bg-gray-200 rounded-xl mb-20"></div>

      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-5">요즘 핫한 키워드 <span className="text-blue-500">{hotKeyword}</span></h1>
        <ProductCard products={hotKeywordProducts} navigationId="hot" />
      </div>

      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-5">화상통화 가능한 상품👀</h1>
        <ProductCard products={videoCallProducts} navigationId="video" />
      </div>
    </div>
  );
}