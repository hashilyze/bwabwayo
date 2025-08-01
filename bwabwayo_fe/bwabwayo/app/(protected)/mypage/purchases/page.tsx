// 파일 경로: app/shop/[id]/purchases/page.tsx
'use client'; // '구매확정' 버튼 등 상호작용이 있으므로 클라이언트 컴포넌트로 선언합니다.

import React from "react";
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.

// --- 타입 정의 (Type Definition) ---
// 구매 내역 데이터의 타입을 명확하게 정의합니다.
type Purchase = {
  id: number;
  image: string;
  name: string;
  price: string;
  status: string;
  confirm: string;
  delivery: {
    company: string;
    number: string;
  } | null;
  confirmDone: boolean;
};

// --- 가상 데이터 (Mock Data) ---
const purchases: Purchase[] = [
  {
    id: 1,
    image: "https://picsum.photos/200/200?random=10",
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    status: "배송준비중",
    confirm: "구매확정",
    delivery: null,
    confirmDone: false,
  },
  {
    id: 2,
    image: "https://picsum.photos/200/200?random=11",
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    status: "배송중",
    delivery: {
      company: "우체국택배",
      number: "262526865323",
    },
    confirm: "구매확정",
    confirmDone: false,
  },
  {
    id: 3,
    image: "https://picsum.photos/200/200?random=12",
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    status: "직거래",
    confirm: "구매확정완료",
    delivery: null,
    confirmDone: true,
  },
];

// --- 페이지 컴포넌트 (Page Component) ---
// 동적 경로([id])의 값을 params를 통해 받아옵니다.
export default function MyPagePurchase({ params }: { params: { id: string } }) {
  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용하고, userId prop을 전달합니다. */}
        <Sidebar userId={params.id} />

        {/* 메인 컨텐츠 */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">구매 상품</h1>
          
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 bg-gray-100 rounded-t-lg px-6 py-3 text-gray-500 text-base font-semibold mb-2">
            <div className="col-span-4">상품명</div>
            <div className="col-span-2 text-center">가격</div>
            <div className="col-span-3 text-center">배송상태</div>
            <div className="col-span-3 text-center">구매확정</div>
          </div>
          
          {/* 상품 리스트 */}
          <div className="divide-y divide-gray-200 bg-white rounded-b-lg shadow">
            {purchases.map((item) => (
              <div key={item.id} className="grid grid-cols-12 items-center px-6 py-6">
                {/* 상품명 및 이미지 */}
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-gray-700 whitespace-pre-line text-base">{item.name}</div>
                </div>
                
                {/* 가격 */}
                <div className="col-span-2 text-lg font-medium text-gray-900 text-center">{item.price}</div>
                
                {/* 배송상태 */}
                <div className="col-span-3 text-center">
                  <div className="text-base font-medium text-gray-900">{item.status}</div>
                  {item.delivery && (
                    <div className="text-xs text-gray-500 mt-1">
                      <div>{item.delivery.company}</div>
                      <div>{item.delivery.number}</div>
                    </div>
                  )}
                </div>
                
                {/* 구매확정 */}
                <div className="col-span-3 text-center">
                  {item.confirmDone ? (
                    <span className="inline-block px-4 py-1 rounded bg-gray-200 text-gray-600 text-base">{item.confirm}</span>
                  ) : (
                    <button className="px-4 py-1 rounded border border-blue-600 text-blue-600 font-semibold hover:bg-blue-50 transition-colors text-base">
                      {item.confirm}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
