'use client'

// 원본은 ProductCard.tsx입니다.
import ProductCard from "@/components/product/ProductCard";
import WebTest from "@/components/home/WebTest";
import React, { useEffect, useState, Suspense } from 'react';
import { useProductStore } from '@/stores/product/productStore';
import { useSearchParams } from 'next/navigation';
import { useModalStore } from '@/stores/modalStore';
import { useAuthStore } from '@/stores/auth/authStore';
import RecommendItems from "@/components/home/RecommendItems";
import Banner from "@/components/home/Banner";
import { ProductWithSeller, ProductCardUIData } from '@/stores/product/productStore';
import { transformToProductCardData } from '@/lib/dataTransFormers';
import Link from "next/link";

// swiper
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
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

  // products가 없거나 빈 배열인 경우 처리
  if (!products || products.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg text-[#777]">상품이 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="relative px-[70px]">
      <Swiper
         modules={[Pagination, Navigation]}
         spaceBetween={32}
         slidesPerView={4}
         slidesPerGroup={4}
         loop={false}
         pagination={{ clickable: true }}
         navigation={false}
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
         {products.map((item) => {
          // React key로 사용될 id가 있는지 먼저 확인하는 것이 안전합니다.
          if (!item.product?.id) return null;

          // ✅ 데이터 변환을 반복문 '안에서' 각 item에 대해 실행합니다.
          const cardDataForItem = transformToProductCardData(item);

          return (
            <SwiperSlide key={item.product.id}>
              {/* ✅ 방금 변환한 개별 데이터를 item 프롭으로 전달합니다. */}
              <ProductCard item={cardDataForItem} />
            </SwiperSlide>
          );
        })}
      </Swiper>
      <button 
        className={`custom-prev-${navigationId} hover:bg-[#343D48] pl-1 z-1 absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded transition-all duration-200 ${
          isBeginning 
            ? 'bg-[#FCE94F] cursor-not-allowed opacity-50 border-3 border-black' 
            : 'bg-[#FCE94F] hover:bg-[#343D48] cursor-pointer border-3 border-black'
        }`} 
        onClick={handlePrev}
        disabled={isBeginning}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M15.8122 5.34218C16.4517 6.0669 16.3825 7.17278 15.6578 7.81224L8.645 14L15.6578 20.1878C16.3825 20.8273 16.4517 21.9331 15.8122 22.6579C15.1727 23.3826 14.0669 23.4517 13.3421 22.8122L5.26706 15.6872C4.25192 14.7914 4.25192 13.2086 5.26706 12.3129L13.3421 5.1878C14.0669 4.54835 15.1727 4.61747 15.8122 5.34218Z" fill="black" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"/>
        </svg>
      </button>
      <button 
        className={`custom-next-${navigationId} hover:bg-[#343D48] pr-1 z-1 absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded transition-all duration-200 ${
          isEnd 
          ? 'bg-[#FCE94F] cursor-not-allowed opacity-50 border-3 border-black' 
          : 'bg-[#FCE94F] hover:bg-[#343D48] cursor-pointer border-3 border-black'
        }`} 
        onClick={handleNext}
        disabled={isEnd}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M12.1878 5.34218C11.5483 6.0669 11.6175 7.17278 12.3422 7.81224L19.355 14L12.3422 20.1878C11.6175 20.8273 11.5483 21.9331 12.1878 22.6579C12.8273 23.3826 13.9331 23.4517 14.6579 22.8122L22.7329 15.6872C23.7481 14.7914 23.7481 13.2086 22.7329 12.3129L14.6579 5.1878C13.9331 4.54835 12.8273 4.61747 12.1878 5.34218Z" fill="black" filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.3))"/>
        </svg>
      </button>
    </div>
  );
}

const adsContainer = () => {
  return [
    {
    id:1,
    url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/banner/banner-1.png`,
    alt: '광고 배너 1',
    link: 'https://i13e202.p.ssafy.io/fe/',
  },
  {
    id:2,
    url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/banner/banner-2.png`,
    alt: '광고 배너 2',
    link: 'https://www.ssafy.com/ksp/jsp/swp/swpMain.jsp',
  },
  {
    id:2,
    url: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/banner/banner-3.png`,
    alt: '광고 배너 3',
    link: 'https://i13e206.p.ssafy.io/',
  }
  ]
}

export default function Home() {
  const { products, hotKeywordProducts, videoCallProducts, newProducts, loading, error, getProducts, getHotKewordProducts, getVideoCallProducts, getNewProducts } = useProductStore();
  const { initializeAuth, setGlobalToken, getToken } = useAuthStore();
  const hotKeyword = '라부부';

  useEffect(() => {
    // 토큰 초기화 및 전역 토큰 설정
    const initializeToken = () => {
      initializeAuth();
      const token = getToken();
      
      if (token) {
        setGlobalToken(token);
      }
    };

    initializeToken();
  }, [initializeAuth, setGlobalToken, getToken]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 네 API를 병렬로 실행 (더 빠름)
        await Promise.all([
          getProducts(),
          getNewProducts(20, true),
          getHotKewordProducts(hotKeyword, true),
          getVideoCallProducts(true)
        ]);
      } catch (error) {
        console.error('데이터 로딩 실패:', error);
      }
    };
    
    fetchData();
  }, [getProducts, getNewProducts, getHotKewordProducts, getVideoCallProducts]);

  return (
    <div className="">
      {/* 인증 처리 */}
      <Suspense fallback={null}>
        <AuthHandler />
      </Suspense>

      {/* 광고 : swiper 들어갈 예정 */}
      <div className="bg-[#E8F4E9]">
          {/* 광고 Swiper */}
          <Swiper
             modules={[Autoplay, Pagination]}
             slidesPerView={1}
             loop={true}
             autoplay={{
               delay: 3000,
               disableOnInteraction: false,
             }}
             pagination={{
               clickable: true,
               bulletActiveClass: 'swiper-pagination-bullet-active',
               bulletClass: 'swiper-pagination-bullet',
             }}
             className="ad-swiper"
           >
            {adsContainer().map((ad) => (
              <SwiperSlide key={ad.id}>
                <Link href={ad.link} className="flex items-center justify-center h-full">
                  <img 
                    src={ad.url} 
                    alt={ad.alt} 
                    className="w-full h-full object-contain"
                  />
                </Link>
              </SwiperSlide>
            ))}
           </Swiper>
      </div>

      {/* 카테고리 추천 */}
      <div className="container-default bg-white m-auto">
        <RecommendItems />
      </div>

      {/* 최근 판매 상품 */}
      <div className="bg-[#F6F8F9] py-30 pb-20">
        <div className="container-wide m-auto">
          <div className="relative">
            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/title-deco-1.png`} alt="최근 판매상품"
              className="absolute -top-3 -left-[30px] w-[320px] opacity-30"
            />
            <h1 className="text-[40px] font-bold mb-5 relative z-1 ml-[70px]">NEW ITEMS</h1>
          </div>
          {newProducts && newProducts.length > 0 ? (
            <ProductSlider products={newProducts} navigationId="recent" />
          ) : (
            <div className="flex justify-center items-center py-8">
              <div className="text-lg text-[#777]">상품이 없습니다.</div>
            </div>
          )}
        </div>
      </div>

      {/* 전광판 */}
      <div className="h-[250px] bg-black flex justify-center items-center overflow-hidden">
        <Banner />
      </div>
      
      {/* hot items */}
      <div className="bg-[#F6F8F9] py-30 pb-40">
        <div className="container-wide m-auto">
          <div className="relative">
            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/title-deco-2.png`} alt="핫한상품"
              className="absolute -top-3 -left-[30px] w-[320px] opacity-15"
            />
            <h1 className="flex items-center gap-2 text-[40px] font-bold mb-5 relative z-1 ml-[70px]">HOT ITEMS
              <span className="text-blue-500 font-bold">`{hotKeyword}`</span>
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/fire-icon.png`} alt="화상거래 가능한 상품" className="h-[40px]" />
            </h1>
          </div>
          {hotKeywordProducts && hotKeywordProducts.length > 0 ? (
          <ProductSlider products={hotKeywordProducts} navigationId="hot" />
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-[#777]">해당 키워드의 제품이 없습니다.</div>
          </div>
        )}
        </div>

        {/* 화상통화 가능 */}
        <div className="container-wide m-auto mt-[120px]">
          <div className="relative">
            <h1 className="flex items-center gap-2 text-[40px] font-bold mb-5 relative z-1 ml-[70px]">화상거래 가능한 상품
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/video-icon.png`} alt="화상거래 가능한 상품" className="h-[50px]" />
            </h1>
          </div>
          {videoCallProducts && videoCallProducts.length > 0 ? (
            <ProductSlider products={videoCallProducts} navigationId="video" />
          ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-lg text-[#777]">화상거래 가능 제품이 없습니다.</div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}