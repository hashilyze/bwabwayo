import ProductCard from "@/components/product/ProductCard";
import Chatbot from '@/components/chat/Chatbot';
import WebTest from "@/components/home/WebTest";
import React from 'react';

async function getSellingProducts() {
  // 실제로는 fetch 사용, 지금은 임의 데이터 반환
  // const res = await fetch("httpS://43.203.212.189:8081/", { cache: "no-store" });
  // const data = await res.json();

  const data = [
    {
      id: 1,
      seller_id: 5524,
      title: "팝마트 라부부 코카콜라 시리즈 인형 키링",
      thumbnail:"https://picsum.photos/200/300?random=1",
      price:70000,
      wish_count:5,
      view_count:23,
      is_like:true,
      status:true
    },
    {
      id: 2,
      seller_id: 2,
      title: "상품2",
      thumbnail:"https://picsum.photos/200/300?random=2",
      price:30000,
      wish_count:5,
      view_count:23,
      is_like:false,
      status:false
    },
  ];

  return data;
}

export default async function Home() {
  const sellingProducts = await getSellingProducts();

  return (
    <div>
      {/* 화상서비스 테스트 */}
      <WebTest />

      {/* 광고 */}
      <div className="w-full h-[250px] bg-gray-200 rounded-xl my-10"></div>

      <Chatbot className="display-none" />

      <div>
        <h1 className="text-2xl font-bold mb-5">판매상품</h1>
        <ProductCard products={sellingProducts} />
      </div>
    </div>
  );
}