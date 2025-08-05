// 파일 경로: app/shop/[id]/sales/page.tsx
'use client'; // 페이지 내 상호작용을 위해 클라이언트 컴포넌트로 선언합니다.

import React from "react";
import Sidebar from "@/components/shop/Sidebar"; // Sidebar 컴포넌트를 import 합니다.
import { useMyPageActivityStore } from "@/stores/mypage/mypageActivityStore"; // Zustand 스토어를 import 합니다.

// --- 타입 정의 (Type Definition) ---
// 판매 내역 데이터의 타입을 명확하게 정의합니다.
type Sale = {
  id: number;
  image: string;
  name: string;
  price: string;
  deliveryStatus: string; // 배송 관련 상태 (예: 배송준비중, 직거래)
  saleStatus: "판매중" | "거래중" | "판매완료"; // 판매 진행 상태
};

// --- 가상 데이터 (Mock Data) ---
const sales: Sale[] = [
  {
    id: 1,
    image: "https://picsum.photos/200/200?random=20",
    name: "팝마트 라부부 코카콜라 시리즈 인형 키링",
    price: "70,000원",
    deliveryStatus: "배송대기",
    saleStatus: "판매중",
  },
  {
    id: 2,
    image: "https://picsum.photos/200/200?random=21",
    name: "포켓몬스터 카드 151",
    price: "85,000원",
    deliveryStatus: "직거래",
    saleStatus: "거래중",
  },
  {
    id: 3,
    image: "https://picsum.photos/200/200?random=22",
    name: "레고 스타워즈 임페리얼 스타 디스트로이어",
    price: "250,000원",
    deliveryStatus: "배송완료",
    saleStatus: "판매완료",
  },
];

// --- 페이지 컴포넌트 (Page Component) ---
// 동적 경로([id])의 값을 params를 통해 받아옵니다.
export default function MyPageSales({ params }: { params: { id: string } }) {
  // 판매 상태에 따라 다른 스타일을 반환하는 함수
  const getStatusChip = (status: Sale['saleStatus']) => {
    switch (status) {
      case "판매중":
        return <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">{status}</span>;
      case "거래중":
        return <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">{status}</span>;
      case "판매완료":
        return <span className="inline-block px-3 py-1 rounded-full bg-gray-200 text-gray-600 text-sm font-medium">{status}</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar 컴포넌트를 여기서 사용하고, userId prop을 전달합니다. */}
        <Sidebar  />

        {/* 메인 컨텐츠 */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-8">판매 상품</h1>
          
          {/* 테이블 헤더 */}
          <div className="grid grid-cols-12 bg-gray-100 rounded-t-lg px-6 py-3 text-gray-500 text-base font-semibold mb-2">
            <div className="col-span-4">상품명</div>
            <div className="col-span-2 text-center">가격</div>
            <div className="col-span-3 text-center">배송상태</div>
            <div className="col-span-3 text-center">판매상태</div>
          </div>
          
          {/* 상품 리스트 */}
          <div className="divide-y divide-gray-200 bg-white rounded-b-lg shadow">
            {sales.map((item) => (
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
                  <div className="text-base font-medium text-gray-900">{item.deliveryStatus}</div>
                </div>
                
                {/* 판매상태 */}
                <div className="col-span-3 text-center">
                  {getStatusChip(item.saleStatus)}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
