'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  status: string;
}

type Props = {
  products: Product[]; // 배열로 변경
}

export default function ProductCard({ products }: Props) {
  const router = useRouter();

  const handleCardClick = (e: MouseEvent<HTMLDivElement>, productId: number) => {
    const target = e.target as HTMLElement; 
    if (target.closest('a')) return; // Link 내부 클릭시 무시
    router.push(`/product/${productId}`);
  };

  return (
    <ul className="grid grid-cols-4 gap-[40px]">
      {products.map((product) => {
        const query = {
          seller_id: product.seller_id.toString(),
          title: product.title,
          thumbnail: product.thumbnail,
          price: product.price.toString(),
        };
        const queryString = new URLSearchParams(query).toString();

        return (
          <li key={product.id}>
            <div
              className="group rounded-[12px] overflow-hidden border border-[#eee] cursor-pointer"
              onClick={(e) => handleCardClick(e, product.id)}
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
                    <Link className='btn-gradient text-white px-3 py-2 rounded-md text-sm block' href={`/chat/${product.id}/${product.seller_id}?${queryString}`}>
                      화상거래예약
                    </Link>
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