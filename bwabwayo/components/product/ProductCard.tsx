'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'

// swiper
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
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
  created_at: string
}

export interface ProductWithSeller {
  product: Product
  seller: Seller
}

type Props = {
  products: ProductWithSeller[]
}

export default function ProductCard({ products }: Props) {
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

  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={20}
      slidesPerView={6}
      pagination={{ clickable: true }}
      navigation

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
                <p className="text-md text-[#999999]">{getRelativeTime(product.created_at)}</p>
              </div>
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}