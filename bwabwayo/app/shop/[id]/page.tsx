'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from "@/components/product/ProductCard";
import SellerTitle, { Seller } from '@/components/shop/SellerTitle';
import { useMyActivityStore, ActivityProduct } from '@/stores/mypage/myActivityStore';
import { transformToProductCardData } from '@/lib/dataTransFormers';
import { useUserStore } from '@/stores/user/userStore';
import { useLoadingStore } from '@/stores/loadingStore';
import { ProductWithSeller } from '@/stores/product/productStore';
import Pagination from '@/components/common/Pagination';

export default function SellerShopInfo({ params }: { params: { id: string } }) {
  const { 
    salesList: sellerProducts, 
    salesTotalElements: productsTotalItems,
    salesTotalPages: productsTotalPages,
    loading: productsLoading, 
    error: productsError, 
    fetchSales: fetchProducts 
  } = useMyActivityStore();
  const { 
    user, 
    loading: userLoading, 
    error: userError, 
    getUser 
  } = useUserStore();
  const { showLoading, hideLoading } = useLoadingStore();
  
  const sellerId = params.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = 4; // 한 페이지에 4개의 상품을 표시
  
  useEffect(() => {
    const loadData = async () => {
      showLoading("상점 정보를 불러오는 중...");
      try {
        await Promise.all([
          getUser(sellerId),
          fetchProducts({ 
            sellerId: sellerId, 
            page: currentPage, 
            size: itemsPerPage 
          })
        ]);
      } catch(e) {
        console.error("데이터 로딩 중 오류 발생", e);
      } finally {
        hideLoading();
      }
    };
    if (sellerId) {
      loadData();
    }
  }, [sellerId, currentPage, getUser, fetchProducts, showLoading, hideLoading]);

  const handlePageChange = (pageNumber: number) => {
    router.push(`/shop/${sellerId}?page=${pageNumber}`);
  };

  const isLoading = userLoading || productsLoading;
  const error = userError || productsError;

  if (isLoading) return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  if (error) return <div className="flex justify-center items-center h-screen">에러: {error}</div>;
  if (!user) return <div className="flex justify-center items-center h-screen">사용자 정보를 불러올 수 없습니다.</div>;

   return (
    <div className="flex flex-col gap-12 container-default m-auto pt-20 pb-40">
      <div className="flex gap-10">
        <SellerTitle seller={user} /> 

        <div className="flex-4">
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

          <ul className="flex border border-gray-200 rounded-xl overflow-hidden">
            <li className="flex-1 p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
              <div className="text-gray-500 text-md mb-1">판매상품</div>
              <div className="text-black text-xl font-normal min-w-[60px]">{productsTotalItems}</div>
            </li>
            <li className="flex-1 p-6 text-center relative after:content-[''] after:absolute after:right-0 after:top-1/2 after:transform after:-translate-y-1/2 after:w-px after:h-10 after:bg-gray-200 last:after:hidden">
              <div className="text-gray-500 text-md mb-1">거래후기</div>
              <div className="text-black text-xl font-normal min-w-[60px]">{user.reviewCount ?? 0}</div>
            </li>
          </ul>
        </div>
      </div>

      {/* 판매 물품 섹션 */}
      <section className="">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">판매 물품 ({productsTotalItems}개)</h3>
        </div>
        {sellerProducts.length > 0 ? (
          // ✨ ul과 Pagination을 감싸는 div 추가
          <div>
            <ul className="grid grid-cols-4 gap-6 gap-y-12">
              {sellerProducts.map((item: ActivityProduct) => {
                if (!item.product?.id) return null;
                const cardData = transformToProductCardData(item);
                return (
                  <li key={item.product.id}>
                    <ProductCard item={cardData} height={240} />
                  </li>
                );
              })}
            </ul>
            
            <Pagination
              currentPage={currentPage}
              totalPages={productsTotalPages}
              onPageChange={handlePageChange}
              pageRangeDisplayed={5}
            />
          </div>
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
                <span className="text-2xl font-bold text-black">4.5</span>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div key={star} className="w-6 h-6">
                      <img 
                        src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/star-${star <= 4 ? 'on' : 'off'}.svg`} 
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
                <span className="text-2xl font-bold text-black">5</span>
                <span className="text-[14px] text-[#7c7c7c] mt-1">총 후기</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 후기 항목들 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#F5F5F5] rounded-2xl py-4 px-6 flex justify-between items-center">
            <span className="">구매확정이 빨라요.</span>
            <span className="font-bold">3</span>
          </div>
          <div className="bg-[#F5F5F5] rounded-2xl py-4 px-6 flex justify-between items-center">
            <span className="">친절하고 배려가 넘쳐요.</span>
            <span className="font-bold">5</span>
          </div>
          <div className="bg-[#F5F5F5] rounded-2xl py-4 px-6 flex justify-between items-center">
            <span className="">답장이 빨라요.</span>
            <span className="font-bold">3</span>
          </div>
          <div className="bg-[#F5F5F5] rounded-2xl py-4 px-6 flex justify-between items-center">
            <span className="">약속시간을 잘 지켜요.</span>
            <span className="font-bold">3</span>
          </div>
        </div>
      </section>
    </div>
  );
}
