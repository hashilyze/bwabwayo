'use client';

import React, { useEffect, useState } from 'react';
import { useMyAddressStore, Address } from '@/stores/mypage/myAddressStore';
import AddressModal from '@/components/shop/AddressModal';

// B. 개별 주소 항목 컴포넌트
interface AddressItemProps {
  address: Address;
  onDelete: (id: number) => void;
}

const AddressItem: React.FC<AddressItemProps> = ({ address, onDelete }) => {
  const handleDelete = () => {
    // 사용자에게 삭제 여부를 다시 한번 확인합니다.
    if (window.confirm('이 배송지를 정말 삭제하시겠습니까?')) {
      onDelete(address.id);
    }
  };
  return (
    <div
      className="flex items-center justify-between rounded-lg p-6 transition-all bg-gray-100"
    >
      <div className="flex items-center space-x-6">
        <svg
          className="h-8 w-8 flex-shrink-0 text-black"
          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex flex-col">
          <p className="font-semibold text-lg text-gray-800">{address.recipientName}</p>
          <p className="text-base text-gray-600">({address.zipcode}) {address.address} {address.addressDetail}</p>
        </div>
      </div>
     <div
  onClick={handleDelete}
  className="inline-flex items-center justify-center px-[14px] h-[34px] rounded-[10px] bg-white text-sm font-medium text-[#222] hover:text-red-500 border border-[#ebebeb] transition-colors cursor-pointer"
>
  삭제
</div>
    </div>
  );
};

export default function AddressPage() {
  const { addresses, loading, error, fetchAddresses, deleteAddress } = useMyAddressStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-row gap-10 py-12 px-4">
        {/* <Sidebar /> */}
    
        {/* 2. 메인 컨텐츠 */}
        <main className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">배송지 관리</h1>
          
          <div className="bg-white p-8 rounded-xl shadow-sm">
            {/* 주소 목록 */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-16 text-center text-gray-500">로딩 중...</div>
              ) : error ? (
                <div className="py-16 text-center text-red-500">에러: {error}</div>
              ) : addresses.length > 0 ? (
                addresses.map((address) => (
                  <AddressItem
                    key={address.id}
                    address={address}
                    onDelete={deleteAddress}
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
              <button
                onClick={handleOpenModal}
                className="flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 py-3 text-gray-600 transition hover:bg-gray-50"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>배송지 추가</span>
              </button>
            </div>
          </div>
        </main>
      </div>
      <AddressModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
