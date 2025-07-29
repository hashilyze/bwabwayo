import React from 'react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-[640px] max-w-full p-8 relative">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">새 배송지 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
        </div>
        {/* 우편번호 */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-gray-500 text-sm mb-1">우편번호</label>
            <input type="text" className="w-full border border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <button className="w-[181px] h-[49px] bg-gray-100 border border-gray-200 rounded text-black mt-6">우편번호 찾기</button>
        </div>
        {/* 기본주소지 */}
        <div className="mb-4">
          <label className="block text-gray-500 text-sm mb-1">기본주소지</label>
          <input type="text" className="w-full border border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        {/* 상세주소지 */}
        <div className="mb-4">
          <label className="block text-gray-500 text-sm mb-1">상세주소지</label>
          <input type="text" className="w-full border border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        {/* 수령인 */}
        <div className="mb-4">
          <label className="block text-gray-500 text-sm mb-1">수령인</label>
          <input type="text" className="w-full border border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        {/* 수령인 전화번호 */}
        <div className="mb-4">
          <label className="block text-gray-500 text-sm mb-1">수령인 전화번호</label>
          <input type="text" className="w-full border border-gray-200 rounded px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        {/* 기본 배송지로 등록 */}
        <div className="flex items-center mb-6">
          <input id="defaultAddress" type="checkbox" className="mr-2 accent-blue-600" />
          <label htmlFor="defaultAddress" className="text-gray-500 text-sm">기본 배송지로 등록</label>
        </div>
        {/* 하단 버튼 */}
        <button className="w-full h-[49px] bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-medium text-lg">새 주소 추가</button>
      </div>
    </div>
  );
};

export default AddressModal; 