'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { MouseEvent } from 'react'

type Product = {
    id: number;
    seller_id: number;
    title: string;
    thumbnail: string;
    price: number;
    wish_count: number;
    view_count: number;
    is_like: boolean;
    status: boolean;
};

type Props = {
  product: Product;
};

export default function ProductCard({product}: Props) {
  const router = useRouter()

  // 카드 전체 클릭 시 상세페이지 이동
  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    // 클릭된 대상이 Link 안쪽이라면 동작 안 함
    const target = e.target as HTMLElement
    if (target.closest('a')) return

    router.push(`/product/${product.id}`)
  }

  const query = {
    seller_id: product.seller_id.toString(),
    title: product.title,
    thumbnail: product.thumbnail,
    price: product.price.toString(),
  };

  // URLSearchParams 가 자동으로 인코딩해줌
  const queryString = new URLSearchParams(query).toString();

  return (
    <div
      className="group rounded-[12px] overflow-hidden border border-[#eee] cursor-pointer"
      onClick={handleCardClick}
    >
      <div className='relative'>
        <div className="h-[290px] overflow-hidden">
          <img
            className="w-full transform transition-transform duration-300 group-hover:scale-105"
            src={product.thumbnail}
            alt={product.title}
          />
        </div>
        <div className="heartIcon absolute top-4 right-4">
          <img src="/icon/heart-on.svg" alt="" />
        </div>
      </div>
      <div className="p-4">
        <p className="text-md block h-[48px]">{product.title}</p>
        <p className="text-[20px] font-bold mt-2 mb-4">{product.price}원</p>
        <div className="flex justify-between items-center">
          <p className="text-sm text-[#7c7c7c]">
            찜 {product.view_count} · 조회 {product.wish_count}
          </p>
          <div>
            <div className='btn-gradient text-white px-3 py-2 rounded-md text-sm block' href={`/chat/${product.id}/${product.seller_id}?${queryString}`}>
              화상거래예약
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}