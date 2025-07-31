'use client'

import SellerTitle from "@/components/shop/SellerTitle";
import Link from "next/link";
import { useProductStore } from "@/stores/productStore";
import { useEffect } from "react";
import { useParams } from "next/navigation";

export default function ProductDetailPage() {
  const { product, loading, error, getProductDetail } = useProductStore();
  const params = useParams();
  const productId = Number(params.id);

  useEffect(() => {
    getProductDetail(productId);
  }, [getProductDetail, productId]);
  
  return (
    <div className="relative min-h-screen py-12">
      <div className="flex flex-row gap-12 relative">
        {/* Product Images */}
        <div className="flex-2 w-full max-w-md">
          <div className="sticky top-45 z-10">
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <img 
                  src={product?.product.thumbnail || '/image/no-image.jpg'} 
                  alt="상품 대표 이미지" 
                  className="w-full h-auto aspect-square object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/image/no-image.jpg';
                  }}
                />
              </div>
              <ul className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(num => (
                  <li key={num}>
                    <img 
                      src={product?.product.thumbnail || '/image/no-image.jpg'} 
                      alt={`상품 썸네일${num}`} 
                      className="rounded-xl border border-[#eeeeee] object-cover aspect-square"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/image/no-image.jpg';
                      }}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-3 min-h-screen">
          <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
            <p className="text-gray-500 text-sm mb-2">홈 &gt; 디지털</p>
            <div className="flex flex-col mt-6 mb-2">
              <h1 className="text-2xl font-bold">{product?.product.title}</h1>
              <p className="text-[32px] font-black text-gray-800">{product?.product.price}원</p>
            </div>
            <div className="text-gray-400 text-sm mb-[30px]">
              {product?.product.createdAt} · 찜 {product?.product.wishCount} · 조회 {product?.product.viewCount}
            </div>
            
            <ul className="flex items-center mb-4 border border-gray-200 rounded-lg p-6 relative">
              <li className="flex flex-1 flex-col gap-1 items-center">
                <div className="text-xs text-black/50">가격제안</div>
                <div className="text-base font-semibold">가능</div>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">화상거래</p>
                <p className="text-base font-semibold">가능</p>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">거래방식</p>
                <p className="text-base font-semibold">직거래, 택배</p>
              </li>
              <li className="flex-0.5 flex items-center justify-center">
                <div className="block w-[1px] h-7 bg-gray-200"></div>
              </li>
              <li className="flex flex-1 flex-col gap-1 items-center">
                <p className="text-xs text-black/50">배송비</p>
                <p className="text-base font-semibold">3,500원</p>
              </li>
            </ul>

            <div className="flex gap-4">
              <div className="flex-1 py-4 flex items-center justify-center gap-2 border-1 border-[#eee] text-[#777] rounded-lg cursor-pointer">
                <img 
                  src={product?.product.isLike ? "/icon/heart-on.svg" : "/icon/heart-off.svg"} 
                  alt="찜하기" 
                  className="w-4 h-4" 
                />
                찜하기
              </div>
              <Link 
                href={`/chat/temp?productId=${product?.product.id}&sellerId=${product?.seller.id}`} 
                className="flex-1 py-4 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg py-3 font-bold cursor-pointer"
              >
                채팅하기
              </Link>
            </div>
          </div>
          
        {/* 판매자 정보 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col items-start gap-4">
          {/* 판매자 평판 */}
          <SellerTitle />

          {/* 판매물품 */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4">{product?.seller.nickname}님의 다른 상품</h3>
            <ul className="flex flex-col gap-4">
              {[1,2,3,4].map(num => (
                <li key={num} className="flex flex-row items-center gap-4">
                  <div>
                    <img 
                      src={product?.product.thumbnail || "/image/sample.png"} 
                      alt="" 
                      className="border border-[#eee] rounded-lg w-24 h-24 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/image/no-image.jpg';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm">{product?.product.title}</p>
                    <p className="text-lg font-semibold mb-1">{product?.product.price}원</p>
                    <p className="text-xs font-light text-gray-400">찜 {product?.product.wishCount} · 조회 {product?.product.viewCount}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-2xl py-[60px] px-[40px] mt-[40px] shadow-sm">
        <h2 className="text-2xl font-bold mb-6">상품 설명</h2>

        <div className="bg-[#F6F8F9] rounded-2xl py-8 px-6 flex flex-col gap-4">
          <h3 className="text-xl font-semibold">상세 정보</h3>
          <p className="text-gray-700">
          {product?.product.title}
          </p>
        </div>
        <ul className="bg-[#EFF6FF] flex justify-center py-12 mt-4 rounded-2xl">
          <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">네고가능 여부</p><p className="text-gray-600">가능해요</p></li>
          <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">거래방법</p><p className="text-gray-600">택배 / 직거래</p></li>
          <li className="flex-1 flex flex-col items-center gap-2"><p className="text-lg font-semibold">화상거래가능 여부</p><p className="text-gray-600">가능해요</p></li>
        </ul>
      </div>
    </div>
  );
};
