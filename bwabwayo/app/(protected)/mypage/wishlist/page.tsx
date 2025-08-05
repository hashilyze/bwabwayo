'use client'; // 페이지 내 상호작용(클릭, 라우팅)을 위해 클라이언트 컴포넌트로 선언합니다.

import React, { MouseEvent } from "react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.

// --- 타입 정의 (Type Definition) ---
// 찜 목록 상품 데이터의 타입을 정의합니다.
type WishedProduct = {
  id: number;
  seller_id: number;
  title: string;
  thumbnail: string;
  price: number;
  wish_count: number;
  view_count: number;
  is_like: boolean; // 찜 목록이므로 항상 true일 것입니다.
  status: "판매중" | "판매완료";
};

// --- 가상 데이터 (Mock Data) ---
// 스크롤을 보여주기 위해 4개 이상의 상품 데이터를 생성합니다.
const wishedProducts: WishedProduct[] = [
  { id: 1, seller_id: 5524, title: "팝마트 라부부 코카콜라 시리즈 인형 키링", price: 70000, thumbnail: "https://picsum.photos/290/290?random=1", wish_count: 4, view_count: 23, is_like: true, status: "판매중" },
  { id: 2, seller_id: 1122, title: "산리오 정품 쿠로미 인형", price: 25000, thumbnail: "https://picsum.photos/290/290?random=2", wish_count: 18, view_count: 102, is_like: true, status: "판매중" },
  { id: 3, seller_id: 3344, title: "디즈니 100주년 미키마우스 피규어", price: 120000, thumbnail: "https://picsum.photos/290/290?random=3", wish_count: 31, view_count: 250, is_like: true, status: "판매중" },
  { id: 4, seller_id: 8877, title: "해리포터 지팡이 컬렉션", price: 95000, thumbnail: "https://picsum.photos/290/290?random=4", wish_count: 25, view_count: 180, is_like: true, status: "판매완료" },
  { id: 5, seller_id: 6655, title: "원피스 써니호 프라모델", price: 65000, thumbnail: "https://picsum.photos/290/290?random=5", wish_count: 15, view_count: 98, is_like: true, status: "판매중" },
  { id: 6, seller_id: 9900, title: "슬램덩크 강백호 피규어", price: 88000, thumbnail: "https://picsum.photos/290/290?random=6", wish_count: 22, view_count: 164, is_like: true, status: "판매중" },
];

// --- 상품 카드 컴포넌트 (ProductCard Component) ---
// 찜 목록 페이지에서 사용할 상품 카드 UI입니다.
function WishlistProductCard({ product }: { product: WishedProduct }) {
  const router = useRouter();

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('a')) return; // Link 내부 클릭 시 무시
    router.push(`/product/${product.id}`);
  };

  return (
    <div
      className="group rounded-xl overflow-hidden border border-gray-200 cursor-pointer flex flex-col shadow hover:shadow-lg transition-shadow"
      onClick={handleCardClick}
    >
      <div className='relative'>
        <div className="h-[290px] overflow-hidden">
          <img
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
            src={product.thumbnail}
            alt={product.title}
          />
        </div>
        {product.status === '판매완료' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-t-xl">
            <span className="text-white text-xl font-bold">판매완료</span>
          </div>
        )}
        {/* --- 수정된 부분 --- */}
        {/* 깨진 SVG 코드 대신, 다른 컴포넌트와 동일하게 <img> 태그를 사용합니다. */}
        {/* public/icon/heart-on.svg 파일이 존재해야 합니다. */}
        <div className="absolute top-4 right-4">
            <img src="/icon/heart-on.svg" alt="찜한 상품" className="w-7 h-7" />
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-md block h-[48px] font-medium text-gray-800">{product.title}</p>
        <p className="text-[20px] font-bold mt-2 mb-4 text-gray-900">{product.price.toLocaleString()}원</p>
        <div className="flex justify-between items-center mt-auto">
          <p className="text-sm text-gray-500">
            찜 {product.wish_count} · 조회 {product.view_count}
          </p>
          {product.status === '판매중' && (
            <Link 
              className='bg-gradient-to-r from-blue-500 to-blue-700 text-white px-3 py-2 rounded-md text-sm block' 
              href={`/chat/${product.id}/${product.seller_id}`}
            >
              화상거래예약
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


// --- 페이지 컴포넌트 (Page Component) ---
export default function MyPageWishlist() {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용하고, userId prop을 전달합니다. */}
        <Sidebar />

        {/* 메인 컨텐츠 */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">찜 상품</h1>
          
          {/* 상품 리스트 */}
          {/* 한 줄에 4개의 상품을 표시하는 grid 레이아웃을 사용합니다. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishedProducts.map((product) => (
              <WishlistProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
