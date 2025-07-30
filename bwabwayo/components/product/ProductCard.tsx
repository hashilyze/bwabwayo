'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent, useState } from 'react'

// swiper
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import LikeHeart from './LikeHeart';

interface Seller {
  id: number
  nickname: string
}

interface Product {
  id: number
  category_id: number
  thumbnail: string
  title: string
  price: string
  view_count: string
  wish_count: string
  is_like: boolean
  sale_status: number
  can_video_call: boolean
  created_at: string
}

export interface ProductWithSeller {
  product: Product
  seller: Seller
}

type Props = {
  products: ProductWithSeller[]
  navigationId?: string
}

export default function ProductCard({ products, navigationId = 'default' }: Props) {
  const router = useRouter();

  const handleCardClick = (e: MouseEvent<HTMLDivElement>, productId: number) => {
    const target = e.target as HTMLElement; 
    if (target.closest('a')) return; // Link 내부 클릭시 무시
    router.push(`/product/${productId}`);
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: string): string => {
    const numPrice = parseInt(price);
    return numPrice.toLocaleString();
  };

  // 상대적 시간 계산 함수
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const createdAt = new Date(dateString);
    const diffInMs = now.getTime() - createdAt.getTime();
    
    const minutes = Math.floor(diffInMs / (1000 * 60));
    const hours = Math.floor(diffInMs / (1000 * 60 * 60));
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) {
      return '방금 전';
    } else if (minutes < 60) {
      return `${minutes}분 전`;
    } else if (hours < 24) {
      return `${hours}시간 전`;
    } else {
      return `${days}일 전`;
    }
  };
  
  // swiper 상태 관리
  const [swiper, setSwiper] = useState<SwiperClass>();
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  
  // 슬라이드 이벤트핸들러
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
        className="swiper grid grid-cols-6 gap-6"
      >
        {products.map((item) => {
          const { product } = item;

          return (
            <SwiperSlide key={product.id}>
              <div
                className="cursor-pointer"
                onClick={(e) => handleCardClick(e, product.id)}
              >
                {/* 상품 이미지 */}
                <div className="aspect-square overflow-hidden rounded-lg">
                  <div className="absolute top-4 right-4 z-10">
                    <LikeHeart isLiked={product.is_like} />
                  </div>
                  <img
                    className="w-full h-full object-cover"
                    src={product.thumbnail || '/image/no-image.jpg'}
                    alt={product.title}
                  />
                </div>
                
                {/* 상품 정보 */}
                <div className="mt-5">
                  <h3 className="text-lg text-[#5a5a5a] leading-sung h-15 overflow-hidden">{product.title}</h3>
                  <p className="text-xl font-bold text-black mb-1">{formatPrice(product.price)}원</p>
                  <p className="text-sm font-light text-[#999999]">{getRelativeTime(product.created_at)}</p>
                  {product.can_video_call && (
                    <div className="text-[10px] font-bold text-[#1b8ee4] bg-[#f4f6f7] w-fit rounded-sm mt-1 px-1 border border-[#ecf1f4]">화상통화</div>
                  )}
                </div>
              </div>
            </SwiperSlide>
          );
        })}
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