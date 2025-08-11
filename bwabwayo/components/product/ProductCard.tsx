'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'
import WishHeart from '@/components/product/wishHeart';
import { ProductCardUIData } from '@/stores/product/productStore';

type Props = {
  item: ProductCardUIData
  height?: number
}

export default function ProductCard({ item, height = 300 }: Props) {
  const router = useRouter();
  const product = item;
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
      className="cursor-pointer bg-white rounded-xl overflow-hidden border border-[#eee] hover:border-black hover:border-2 hover:shadow-md transition-all duration-300 flex flex-col"
      onClick={(e) => handleCardClick(e, product.id || 0)}
    >
      {/* 상품 이미지 */}
       <div className="relative border-b border-[#eee] flex-shrink-0 overflow-hidden">
         <div className="absolute top-4 right-4 z-10">
           {typeof product.id === 'number' && (
            <WishHeart 
              productId={product.id} 
              initialIsLiked={product.isLike || false} 
            />
            )}
         </div>
         <img
           className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
           src={product.thumbnail || '/image/no-image.jpg'}
           alt={product.title}
           style={{ height: `${height}px` }}
         />
       </div>
      
      {/* 상품 정보 */}
      <div className="p-5 flex flex-col justify-between h-full">
          <h3 className="text-xl leading-sung overflow-hidden mb-4" title={product.title}>
           {product.title.length > 25 ? `${product.title.slice(0, 25)}...` : product.title}
         </h3>
        <div className=''>
          {product.canVideoCall && (
            <div className="-ml-1 mb-2 text-[14px] text-[#d77c00] bg-[#FFE9BA] w-fit rounded-xl py-0.2 px-2">화상거래</div>
          )}
          <p className="text-xl font-bold text-black mb-1">{formatPrice(product.price.toString())}원</p>
          <div className="text-sm font-light text-[#999999] flex justify-between mt-2">
            <p className="">{getRelativeTime(product.createdAt || '')}</p>
            <p>찜 {product.wishCount} · 조회 {product.viewCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}