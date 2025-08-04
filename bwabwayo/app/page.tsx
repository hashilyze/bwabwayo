'use client'

import ProductCard from "@/components/product/ProductCard";
import WebTest from "@/components/home/WebTest";
import React, { useEffect, useState, Suspense } from 'react';
import { useProductStore } from '@/stores/product/productStore';
import { useSearchParams } from 'next/navigation';
import { useModalStore } from '@/stores/modalStore';
// swiper
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// 인증 처리 컴포넌트
function AuthHandler() {
  const searchParams = useSearchParams();
  const { openLoginModal } = useModalStore();

  useEffect(() => {
    const authRequired = searchParams.get('auth');
    if (authRequired === 'required') {
      openLoginModal();
    }
  }, [searchParams, openLoginModal]);

  return null;
}

// ProductSlider 컴포넌트
function ProductSlider({ products, navigationId }: { products: any[], navigationId: string }) {
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  
  const handlePrev = () => {
    swiper?.slidePrev()
  }
  const handleNext = () => {
    swiper?.slideNext()
  }

  return (
    <div className="relative">
      <Swiper
        modules={[Pagination, Navigation]}
        spaceBetween={20}
        slidesPerView={6}
        slidesPerGroup={3}
        pagination={{ clickable: true }}
        navigation={{
          nextEl: `.custom-next-${navigationId}`,
          prevEl: `.custom-prev-${navigationId}`,
        }}
        onSwiper={(e) => {
          setSwiper(e);
          setIsBeginning(e.isBeginning);
          setIsEnd(e.isEnd);
        }}
        onSlideChange={(e) => {
          setIsBeginning(e.isBeginning);
          setIsEnd(e.isEnd);
        }}
        className="swiper"
      >
        {products.map((item) => (
          <SwiperSlide key={item.product.id}>
            <ProductCard item={item} />
          </SwiperSlide>
        ))}
      </Swiper>
      <button 
        className={`custom-prev-${navigationId} hover:bg-[#343D48] pl-1 z-1 absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded transition-all duration-200 ${
          isBeginning 
            ? 'bg-gray-200 cursor-not-allowed opacity-50' 
            : 'bg-white/40 hover:bg-[#343D48] cursor-pointer'
        }`} 
        onClick={handlePrev}
        disabled={isBeginning}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M15.8122 5.34218C16.4517 6.0669 16.3825 7.17278 15.6578 7.81224L8.645 14L15.6578 20.1878C16.3825 20.8273 16.4517 21.9331 15.8122 22.6579C15.1727 23.3826 14.0669 23.4517 13.3421 22.8122L5.26706 15.6872C4.25192 14.7914 4.25192 13.2086 5.26706 12.3129L13.3421 5.1878C14.0669 4.54835 15.1727 4.61747 15.8122 5.34218Z" fill="white" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"/>
        </svg>
      </button>
      <button 
        className={`custom-next-${navigationId} hover:bg-[#343D48] pr-1 z-1 absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded transition-all duration-200 ${
          isEnd 
            ? 'bg-gray-200 cursor-not-allowed opacity-50' 
            : 'bg-white/40 hover:bg-[#343D48] cursor-pointer'
        }`} 
        onClick={handleNext}
        disabled={isEnd}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.1878 5.34218C11.5483 6.0669 11.6175 7.17278 12.3422 7.81224L19.355 14L12.3422 20.1878C11.6175 20.8273 11.5483 21.9331 12.1878 22.6579C12.8273 23.3826 13.9331 23.4517 14.6579 22.8122L22.7329 15.6872C23.7481 14.7914 23.7481 13.2086 22.7329 12.3129L14.6579 5.1878C13.9331 4.54835 12.8273 4.61747 12.1878 5.34218Z" fill="white" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"/>
        </svg>
      </button>
    </div>
  );
}

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
    <div className="py-12">
      {/* 인증 처리 */}
      <Suspense fallback={null}>
        <AuthHandler />
      </Suspense>
      
      {/* 화상서비스 테스트 */}
      <WebTest />

      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-5">최근 판매상품</h1>
        {products.length > 0 ? (
          <ProductSlider products={products} navigationId="recent" />
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-[#777]">상품이 없습니다.</div>
          </div>
        )}
      </div>

      {/* 광고 */}
      <div className="w-full h-[250px] bg-gray-200 rounded-xl mb-20"></div>

      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-5">요즘 핫한 키워드 <span className="text-blue-500">{hotKeyword}</span></h1>
        {hotKeywordProducts.length > 0 ? (
          <ProductSlider products={hotKeywordProducts} navigationId="hot" />
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-[#777]">해당 키워드의 제품이 없습니다.</div>
          </div>
        )}
      </div>

      <div className="mb-20">
        <h1 className="text-2xl font-bold mb-5">화상통화 가능한 상품👀</h1>
        {videoCallProducts.length > 0 ? (
          <ProductSlider products={videoCallProducts} navigationId="video" />
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-[#777]">화상통화 가능한 제품이 없습니다.</div>
          </div>
        )}
      </div>
    </div>
  );
}