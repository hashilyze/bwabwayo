'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Sidebar from "@/components/shop/Sidebar";
import ProductCard from "@/components/mypage/MyProductCard";
import SellerTitle from '@/components/shop/SellerTitle';
import { useMyStore, Evaluation } from '@/stores/mypage/myStore';
import { useMyActivityStore, ActivityProduct } from '@/stores/mypage/myActivityStore';



export default function MyPage() {
  const { userData, loading: userLoading, error: userError, fetchUserData } = useMyStore();
  const { salesList, salesTotalElements, loading: salesListLoading, error:salesListError, fetchSales} = useMyActivityStore();
  useEffect(() => {
    fetchUserData();
    fetchSales();
  }, [fetchUserData, fetchSales]);

  // 현재 로그인한 사용자의 상품만 필터링합니다.
  const myProducts = salesList

  // 상점 후기 총 개수 계산

  // 로딩 및 에러 상태 처리
  if (userLoading || salesListLoading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  if (userError || salesListError) {
    return <div className="flex justify-center items-center h-screen">에러: {userError || salesListError}</div>;
  }

  if (!userData) {
    return <div className="flex justify-center items-center h-screen">사용자 정보를 불러올 수 없습니다.</div>;
  }

  // SellerTitle 컴포넌트에 전달할 props를 userData로부터 명시적으로 매핑합니다.
  // 이렇게 하면 타입 안정성이 높아지고, SellerTitle은 필요한 데이터만 받게 됩니다.
  const sellerDataForTitle = {
    id: userData.userId,
    nickname: userData.nickname,
    sellerImage: userData.profileImage || null, // profileImage를 sellerImage로 매핑
    profileImage: userData.profileImage || null,
    rating: userData.rating,
    score: userData.score,
    bio: userData.bio || '상점 소개가 없습니다.',
    dealcount: userData.dealCount || 0,
    reviewCount: userData.reviewCount || 0, // 선택적 속성, 필요에 따라 추
  };

  // 상점 후기 항목 데이터 (실제 item_id에 맞춰야 합니다)
const reviewTextMap: Record<string, string> = {
  1: '응답이 빨라요.',
  2: '친절해요.',
  3: '설명이 정확해요.',
  4: '약속시간을 잘 지켜요.',
  5: '좋은 제품이에요.',
  6: '재구매 의사 있어요.',
  7: '포장이 깔끔해요.',
  8: '거래 장소가 안전했어요.',
};
const formattedEvaluations = userData.evaluation.map((item) => ({
  id: item.item_id,
  text: reviewTextMap[item.item_id] || item.description,
  count: item.number,
}));



  return (
    <div>
      <div className="flex gap-10">
        {/* userId를 전달하지 않으면 '마이페이지'용 사이드바가 렌더링됩니다. */}
        <Sidebar />

        <main className='flex-4 '>
          <div className="grid grid-cols-2 gap-6">
            <SellerTitle seller={sellerDataForTitle} />

            <div className="flex-1 max-w-[544px]">
              {/* 상품 등록 섹션 */}
              <div className="bg-white rounded-xl p-6 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-black mb-1">상품 설명이 자동!</h3>
                    <p className="text-gray-500 text-sm">카테고리를 선택하면 자동으로 상품 설명을 채워줘요</p>
                  </div>
                  <Link href="/product/new" className="bg-gray-600 text-white rounded-full px-4 py-2 text-sm font-normal hover:bg-gray-700 transition">
                    상품 등록
                  </Link>
                </div>
              </div>

              {/* 통계 섹션 */}
              <ul className="grid grid-cols-4 border border-gray-200 rounded-xl overflow-hidden">
                 {/* 판매상품 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">판매상품</div>
                   <div className="text-black text-xl font-normal">{myProducts.length}</div>
                 </li>
                 
                 {/* 거래후기 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">거래후기</div>
                   <div className="text-black text-xl font-normal">{userData.dealCount ?? 0}</div>
                 </li>
                 
                 {/* 화상거래 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">화상거래</div>
                   <div className="text-black text-xl font-normal">0</div>
                 </li>
                 
                 {/* 포인트 */}
                 <li className="p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
                   <div className="text-gray-500 text-sm mb-2">포인트</div>
                   <div className="text-black text-xl font-normal">{userData.point.toLocaleString()} P</div>
                 </li>
              </ul>
            </div>
          </div>

          {/* 판매 물품 섹션 */}
          <section className="mt-12">
            <h3 className="text-xl font-bold mb-6">판매 물품</h3>
            {myProducts.length > 0 ? (
              <ul className="grid grid-cols-4 gap-6 gap-y-12">
                {myProducts.map((item: ActivityProduct) => (
                  <li key={item.product.id}>
                    <ProductCard item={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-gray-500 py-12">판매중인 상품이 없습니다.</div>
            )}
          </section>

          {/* 상점 후기 섹션 */}
         <section className="mt-12">
  <h3 className="text-xl font-bold mb-4">상점 후기</h3>
  <div className="flex items-center gap-2 text-lg font-bold mb-6">
    <span>{userData.rating}</span>
    <span className="text-gray-500 text-base font-normal">총 후기</span>
    <span>{userData.reviewCount}</span>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {formattedEvaluations.map((item) => (
  <div key={item.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
    <span className="text-gray-600">{item.text}</span>
    <span className="font-bold text-blue-600">{item.count}</span>
  </div>
))}
  </div>
</section>
        </main>
      </div>
    </div>
  );
}