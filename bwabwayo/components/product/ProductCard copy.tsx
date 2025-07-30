'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'
import LikeHeart from './LikeHeart'

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

  // 판매 상태 텍스트 반환
  const getSaleStatusText = (status: number): string => {
    switch (status) {
      case 1: return '판매중';
      case 2: return '거래중';
      case 3: return '판매완료';
      default: return '판매중';
    }
  };

  // 판매 상태 색상 반환
  const getSaleStatusColor = (status: number): string => {
    switch (status) {
      case 1: return 'text-green-600';
      case 2: return 'text-yellow-600';
      case 3: return 'text-gray-500';
      default: return 'text-green-600';
    }
  };

  return (
    <ul className="grid grid-cols-4 gap-[32px]">
      {products.map((item) => {
        const { product, seller } = item;
        const query = {
          seller_id: seller.id.toString(),
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price,
        };
        const queryString = new URLSearchParams(query).toString();

        return (
          <li key={product.id} className='bg-white'>
            <div
              className="group rounded-[12px] overflow-hidden border border-[#eee] cursor-pointer"
              onClick={(e) => handleCardClick(e, product.id)}
            >
              <div className='relative'>
                <div className="h-[290px] overflow-hidden bg-gray-200 flex items-center justify-center border-b border-[#eee]">
                  <img
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                    src={product.thumbnail || '/image/no-image.jpg'}
                    alt={product.title}
                  />
                </div>
                <div className="heartIcon absolute top-4 right-4">
                  <LikeHeart isLiked={product.is_like} />
                </div>
                {/* 판매 상태 표시 */}
                {product.sale_status !== 1 && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded ${getSaleStatusColor(product.sale_status)} bg-white`}>
                      {getSaleStatusText(product.sale_status)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <p className="text-md block h-[48px] overflow-hidden">{product.title}</p>
                <p className="text-[20px] font-bold mt-2 mb-2">{formatPrice(product.price)}원</p>
                <p className="text-sm text-[#7c7c7c] mb-2">판매자: {seller.nickname}</p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#7c7c7c]">
                    찜 {product.wish_count} · 조회 {product.view_count}
                  </p>
                  <div>
                    {product.sale_status === 1 ? (
                      <Link 
                        className='btn-gradient text-white px-3 py-2 rounded-md text-sm block' 
                        href={`/chat/${product.id}/${seller.id}?${queryString}`}
                      >
                        화상거래예약
                      </Link>
                    ) : (
                      <button 
                        className='bg-gray-400 text-white px-3 py-2 rounded-md text-sm cursor-not-allowed'
                        disabled
                      >
                        {getSaleStatusText(product.sale_status)}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}