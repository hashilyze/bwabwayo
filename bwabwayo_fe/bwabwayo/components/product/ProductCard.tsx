'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'
import LikeHeart from './LikeHeart';
import { ProductWithSeller } from '@/stores/productStore';

type Props = {
  item: ProductWithSeller
}

export default function ProductCard({ item }: Props) {
  const router = useRouter();
  const product = item.product;
  // console.log(product)

  const handleCardClick = (e: MouseEvent<HTMLDivElement>, productId: number) => {
    const target = e.target as HTMLElement; 
    if (target.closest('a')) return; // Link 내부 클릭시 무시
    router.push(`/product/${productId}`);
  };

  // 가격 포맷팅 함수
  const formatPrice = (price: string): string => {
    return parseInt(price).toLocaleString();
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
    <div
      className="cursor-pointer"
      onClick={(e) => handleCardClick(e, product.id)}
    >
      {/* 상품 이미지 */}
      <div className="aspect-square overflow-hidden rounded-lg relative">
        <div className="absolute top-4 right-4 z-10">
          <LikeHeart isLiked={product.isLike} />
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
        <p className="text-sm font-light text-[#999999]">{getRelativeTime(product.createdAt)}</p>
        {product.canVideoCall && (
          <div className="text-[10px] font-bold text-[#1b8ee4] bg-[#f4f6f7] w-fit rounded-sm mt-1 px-1 border border-[#ecf1f4]">화상통화</div>
        )}
      </div>
    </div>
  );
}