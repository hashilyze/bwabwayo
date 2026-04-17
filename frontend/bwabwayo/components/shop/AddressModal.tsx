'use client';

import React, { useState, FormEvent } from 'react';
import Script from 'next/script'; // Daum 우편번호 서비스를 위해 Script 태그를 import 합니다.
import { useMyAddressStore } from '@/stores/mypage/myAddressStore';
import { DaumPostcodeData } from '@/types/daum';

// --- 타입 정의 ---
interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- 주소 추가 모달 컴포넌트 ---
const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  // 모달 내부 폼 상태를 관리하기 위한 useState 훅을 추가합니다.
  const [zipcode, setZipcode] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhoneNumber, setRecipientPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Zustand 스토어에서 addAddress 액션을 가져옵니다.
  const addAddress = useMyAddressStore((state) => state.addAddress);

  // 모달이 닫힐 때 내부 상태를 초기화하는 함수
  const resetForm = () => {
    setZipcode('');
    setAddress('');
    setAddressDetail('');
    setRecipientName('');
    setRecipientPhoneNumber('');
  };


  if (!isOpen) return null;

  // 폼 제출 시 실행될 함수입니다.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); 

    // 유효성 검사: 모든 필드가 채워져 있는지, 공백만 있는지 확인합니다.
    if (!zipcode.trim() || !address.trim() || !addressDetail.trim() || !recipientName.trim() || !recipientPhoneNumber.trim()) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Zustand 스토어의 addAddress 액션을 호출합니다.
      await addAddress({
        recipientName: recipientName.trim(),
        recipientPhoneNumber: recipientPhoneNumber.trim(),
        zipcode: zipcode.trim(),
        address: address.trim(),
        addressDetail: addressDetail.trim(),
      });

      alert('새 주소가 성공적으로 추가되었습니다.');
      resetForm(); // 폼 상태 초기화
      onClose(); // 모달 닫기
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '주소 추가 중 오류가 발생했습니다.';
      console.error('주소 추가 실패:', errorMessage);
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };



  // '우편번호 찾기' 버튼 클릭 시 실행될 함수입니다.
  const handleAddressSearch = () => {
      if (window.daum && window.daum.Postcode) {
          new window.daum.Postcode({
              oncomplete: function(data: DaumPostcodeData) {
                  let fullAddress = data.address;
                  let extraAddress = '';
                  if (data.addressType === 'R') {
                      if (data.bname !== '') extraAddress += data.bname;
                      if (data.buildingName !== '') extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
                      fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
                  }
                  setAddress(fullAddress);
                  setZipcode(data.zonecode);
              }
          }).open();
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99">
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="afterInteractive" />      
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[570px]">
        
        {/* 헤더 & 닫기 버튼 */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">새 배송지 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl" aria-label="닫기">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* 우편번호 */}
            <div className="flex items-center gap-4">
                <input 
                    type="text" 
                    placeholder="우편번호"
                    value={zipcode} // 상태와 연결
                    className="w-full border border-gray-300 rounded-full px-5 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                    readOnly
                />
                <button 
                    type="button"
                    onClick={handleAddressSearch} // 핸들러 연결
                    className="w-48 flex-shrink-0 h-[52px] border border-gray-300 rounded-full text-black font-semibold hover:bg-gray-100 transition-colors"
                >
                    우편번호 찾기
                </button>
            </div>

            {/* 기본주소 */}
            <input 
                type="text" 
                placeholder="기본주소"
                value={address} // 상태와 연결
                className="w-full border border-gray-300 rounded-full px-5 py-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                readOnly
            />

            {/* 상세주소 */}
            <input 
                type="text" 
                placeholder="상세주소"
                value={addressDetail} // 상태와 연결
                onChange={(e) => setAddressDetail(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" 
            />

            {/* 수령인 */}
            <input 
                type="text" 
                placeholder="수령인"
                value={recipientName} // 상태와 연결
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" 
            />

            {/* 수령인 전화번호 */}
            <input 
                type="tel" 
                placeholder="수령인 전화번호"
                value={recipientPhoneNumber} // 상태와 연결
                onChange={(e) => setRecipientPhoneNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-400" 
            />
            
            {/* 하단 버튼 */}
            <div className="pt-6">
                <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-[52px] bg-yellow-400 border border-black rounded-full text-black font-bold text-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300"
                >
                    {isSubmitting ? '추가 중...' : '새 주소 추가'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;