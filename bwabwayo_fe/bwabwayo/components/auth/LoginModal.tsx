// 파일 경로: components/auth/LoginModal.tsx (모달 형태로 수정)
'use client';

import React from 'react';
import Link from 'next/link';

// --- 아이콘 컴포넌트 ---
const KakaoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#181600" d="M16 4.656c-6.075 0-11 3.937-11 8.812 0 3.469 2.513 6.5 6.263 7.937l-.95 3.422 3.637-2.437h2.05c6.075 0 11-3.937 11-8.812s-4.925-8.812-11-8.812z"/>
  </svg>
);

// --- Props 타입 정의 ---
// 모달의 열림/닫힘 상태를 제어하기 위한 props 타입을 정의합니다.
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- 로그인 모달 컴포넌트 ---
const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  // isOpen prop이 false이면 모달을 렌더링하지 않습니다.
  if (!isOpen) return null;
  const kakaoAuthUrl = `http://i13e202.p.ssafy.io/be/oauth2/authorization/kakao`;

  return (
    // --- 수정된 부분: 모달 오버레이 ---
    // fixed inset-0: 화면 전체를 덮습니다.
    // bg-black bg-opacity-50: 반투명한 검은색 배경을 만듭니다.
    // flex items-center justify-center: 내부 콘텐츠를 화면 정중앙에 배치합니다.
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-99">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-[570px]">
        {/* 닫기 버튼 */}
        <div className="flex justify-end mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* 로고 */}
        <div className="flex justify-center mb-6">
            <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/logo.png`}  alt="봐봐요" className='w-[200px]' />
        </div>
        {/* 제목 및 설명 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            봐봐요로 중고거래 시작하기
          </h2>
          <p className="text-md text-gray-500">
            간편하게 가입하고 상품을 확인하세요
          </p>
        </div>
        {/* 소셜 로그인 버튼 */}
        <div className="mb-8">
          <button onClick={() => window.location.href = kakaoAuthUrl} className="w-full bg-[#FEE500] hover:bg-[#F7E600] text-[#181600] font-medium py-4 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2 cursor-pointer">
            <KakaoIcon />
            <span className='text-lg'>카카오로 시작하기</span>
          </button>
        </div>
        {/* 구분선 */}
        <hr className="border-gray-200 mb-6" />
        {/* 푸터 */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            도움이 필요하면{' '}
            <Link 
              href="/cs-center" 
              onClick={onClose} 
              className="font-semibold text-gray-600 underline hover:text-gray-800">
              고객센터
            </Link>
            로 문의 부탁드립니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
