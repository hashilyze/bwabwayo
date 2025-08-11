'use client';

import React from 'react';
import Sidebar from '@/components/shop/Sidebar';

// --- 타입 정의 ---
interface Address {
  id: number;
  recipientName: string;
  recipientPhoneNumber: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  isDefault: boolean;
}

// --- 컴포넌트 ---

// B. 개별 주소 항목 컴포넌트
const AddressItem: React.FC<{ address: Address }> = ({ address }) => {
  const isDefault = address.isDefault;

  return (
    <div
      className={`flex items-center justify-between rounded-lg p-5 transition-all ${
        isDefault ? 'bg-white shadow-md border border-yellow-400' : 'bg-gray-100'
      }`}
    >
      <div className="flex items-center space-x-4">
        <svg
          className={`h-6 w-6 flex-shrink-0 ${isDefault ? 'text-yellow-500' : 'text-gray-400'}`}
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex flex-col">
          <p className="font-semibold text-gray-800">{address.recipientName}</p>
          <p className="text-sm text-gray-500">({address.zipcode}) {address.address} {address.addressDetail}</p>
        </div>
      </div>
      <div className={`h-5 w-5 rounded-full border-2 ${isDefault ? 'border-yellow-500 bg-yellow-500' : 'border-gray-300'}`}>
        {isDefault && <div className="h-full w-full rounded-full border-2 border-white"></div>}
      </div>
    </div>
  );
};

// C. 미리보기용 더미 데이터
const dummyAddresses: Address[] = [
    {
      id: 1,
      recipientName: '홍길동',
      recipientPhoneNumber: '010-1234-5678',
      zipcode: '47545',
      address: '부산광역시 연제구 중앙대로 1134번길',
      addressDetail: '34, 201호',
      isDefault: true,
    },
    {
      id: 2,
      recipientName: '김철수',
      recipientPhoneNumber: '010-8765-4321',
      zipcode: '48058',
      address: '부산광역시 해운대구 좌동순환로 433번길',
      addressDetail: '30, 104동 501호',
      isDefault: false,
    },
    {
      id: 3,
      recipientName: '이영희',
      recipientPhoneNumber: '010-5555-4444',
      zipcode: '46708',
      address: '부산광역시 강서구 녹산산단382로14번길',
      addressDetail: '14, 사무동 3층',
      isDefault: false,
    },
];


// D. 메인 페이지 컴포넌트
export default function AddressPage() {
  // 상태 관리 로직을 제거하고 더미 데이터를 직접 사용합니다.
  const addresses = dummyAddresses;
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-row gap-10 py-12 px-4">
        {/* 1. 사이드바 */}
        <Sidebar />
    
        {/* 2. 메인 컨텐츠 */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">배송지 관리</h1>
          
          <div className="bg-white p-8 rounded-xl shadow-sm">
            {/* 주소 목록 */}
            <div className="space-y-4">
              {addresses.length > 0 ? (
                addresses.map((address) => (
                  <AddressItem
                    key={address.id}
                    address={address}
                  />
                ))
              ) : (
                <div className="py-16 text-center text-gray-500">
                  등록된 배송지가 없습니다.
                </div>
              )}
            </div>

            {/* 새 주소 추가 버튼 */}
            <div className="mt-6">
              <button className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 py-3 text-gray-600 transition hover:bg-gray-50">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>배송지 추가</span>
              </button>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="mt-8 flex justify-end">
            <button className="rounded-lg bg-yellow-400 px-8 py-3 font-semibold text-gray-900 hover:bg-yellow-500 transition-colors">
              저장하기
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
