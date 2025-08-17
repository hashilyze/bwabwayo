'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ProductCard from "@/components/product/ProductCard";
import SellerTitle from '@/components/shop/SellerTitle';
import { useMyStore, Evaluation } from '@/stores/mypage/myStore';
import { useMyActivityStore, ActivityProduct } from '@/stores/mypage/myActivityStore';
import { useLoadingStore } from '@/stores/loadingStore';

export default function MyPage() {
  const { userData, loading: userLoading, error: userError, fetchUserData } = useMyStore();
  const { salesList, salesTotalElements, loading: salesListLoading, error:salesListError, fetchSales} = useMyActivityStore();
  const { showLoading, hideLoading } = useLoadingStore();
  
  useEffect(() => {
    const loadData = async () => {
      showLoading('데이터를 불러오는 중...');
      try {
        await Promise.all([fetchUserData(), fetchSales({})]);
      } finally {
        hideLoading();
      }
    };
    loadData();
  }, [fetchUserData, fetchSales, showLoading, hideLoading]);

  // 현재 로그인한 사용자의 상품만 필터링합니다.
  const myProducts = salesList

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
    profileImage: userData.profileImage || null,
    rating: userData.rating,
    score: userData.score,
    bio: userData.bio || '상점 소개가 없습니다.',
    dealCount: userData.dealCount || 0, // ← 이름 맞춤!
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
    <div className="flex flex-col gap-15">
      <div className="flex gap-10">
        {userData && <SellerTitle seller={sellerDataForTitle} disableLink={true} />}

        <div className="flex-6">
          {/* 상품 등록 섹션 */}
          <div className="rounded-xl p-6 mb-4 bg-[#F7F9FA]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16"><img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/mypage-addproduct.png`} alt="" /></div>
                <div>
                  <h3 className="text-xl font-bold text-black mb-1">상품 설명이 자동!</h3>
                  <p className="text-gray-500 text-md">카테고리를 선택하면 자동으로 상품 설명을 채워줘요</p>
                </div>
              </div>
              <Link
                href="/product/new"
                className="bg-gray-600 text-white text-center rounded-full px-4 py-2 text-md font-normal hover:bg-gray-700 transition whitespace-nowrap min-w-[100px]"
              >
                상품등록
              </Link>
            </div>
          </div>

          {/* 통계 섹션 */}
          <ul className="flex border border-gray-200 rounded-xl overflow-hidden">
            {/* 판매상품 */}
            <li className="flex-1 p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
              <div className="text-gray-500 text-md mb-1">판매상품</div>
              <div className="text-black text-xl font-normal min-w-[60px]">{salesTotalElements}</div>
            </li>
            
            {/* 거래후기 */}
            <li className="flex-1 p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
              <div className="text-gray-500 text-md mb-1">거래후기</div>
              <div className="text-black text-xl font-normal min-w-[60px]">{userData.reviewCount ?? 0}</div>
            </li>
            
            {/* 화상거래 */}
            {/* <li className="flex-1 p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
              <div className="text-gray-500 text-sm mb-1">화상거래</div>
              <div className="text-black text-xl font-normal min-w-[60px]">0</div>
            </li> */}
            
            {/* 포인트 */}
            <li className="flex-2 p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
              <div className="text-gray-500 text-md mb-1">포인트</div>
              <div className="text-black text-xl font-normal min-w-[90px]">{userData.point.toLocaleString()} P</div>
            </li>
          </ul>
        </div>
      </div>

      {/* 판매 물품 섹션 */}
      <section className="">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">판매 물품</h3>
          {salesTotalElements > 4 && (
            <Link href="/mypage/sales" className="text-sm font-semibold text-gray-600 hover:text-blue-600 hover:underline">
              더보기 &gt;
            </Link>
          )}
        </div>
        {myProducts.length > 0 ? (
          <ul className="grid grid-cols-4 gap-6 gap-y-12">
            {myProducts.slice(0, 4).map((activityItem: ActivityProduct) => (
               <li key={activityItem.product.id}>
                 <ProductCard
                   item={{
                     ...activityItem.product,
                     isLike: activityItem.product.isLike ?? false,
                   }}
                   height={240}
                 />
               </li>
             ))}
          </ul>
        ) : (
          <div className="text-center text-gray-500 py-12">판매중인 상품이 없습니다.</div>
        )}
      </section>

      {/* 상점 후기 섹션 */}
       <section className="">
         <h3 className="text-2xl font-bold mb-4">상점 후기</h3>
         
         {/* 평점 및 총 후기 수 */}
         <div className="border border-[#d9d9d9] rounded-[15px] p-6 mb-6">
           <div className="flex items-center justify-center">
             <div className="flex items-center gap-10 w-full">
              {/* 평점 */}
              <div className="flex flex-col items-center flex-1">
                <span className="text-2xl font-bold text-black">{userData.rating.toFixed(1)}</span>
                 <div className="flex gap-1 mt-2">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <div key={star} className="w-6 h-6">
                       <img 
                         src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/star-${star <= Math.floor(userData.rating) ? 'on' : 'off'}.svg`} 
                         alt={`별점 ${star}`}
                         className="w-full h-full"
                       />
                     </div>
                   ))}
                 </div>
               </div>
               
               {/* 구분선 */}
               <div className="w-px h-9 bg-[#eeeeee] border border-[#d9d9d9]"></div>
               
               {/* 총 후기 수 */}
               <div className="flex flex-col items-center flex-1">
                 <span className="text-2xl font-bold text-black">{userData.reviewCount}</span>
                 <span className="text-[14px] text-[#7c7c7c] mt-1">총 후기</span>
               </div>
             </div>
           </div>
         </div>
         
         {/* 후기 항목들 */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
           {formattedEvaluations.length > 0 ? (
             formattedEvaluations.map((item) => (
               <div key={item.id} className="bg-[#F5F5F5] rounded-2xl py-4 px-6 flex justify-between items-center">
                 <span className="">{item.text}</span>
                 <span className="font-bold">{item.count}</span>
               </div>
             ))
           ) : (
             <div className="col-span-2 text-center text-gray-500 py-8">
               등록된 후기가 없습니다.
             </div>
           )}
         </div>
       </section>
    </div>
  );
}