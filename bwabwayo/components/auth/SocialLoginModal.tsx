'use client';

import React from 'react';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialLoginModal: React.FC<SocialLoginModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleKakaoLogin = () => {
    // 카카오 로그인 로직 구현
    console.log('카카오 로그인 시도');
  };

  return (
<div className="fixed inset-0 bg-white bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">      <div className="bg-white rounded-xl p-8 w-96 max-w-sm mx-4">
        {/* Close Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">봐</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-black mb-2">
            봐봐요로 중고거래 시작하기
          </h2>
          <p className="text-sm text-gray-500">
            간편하게 가입하고 상품을 확인하세요
          </p>
        </div>

        {/* Social Login Button */}
        <div className="mb-8">
          <button
            onClick={handleKakaoLogin}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">카</span>
            </div>
            <span>카카오로 시작하기</span>
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-6"></div>

        {/* Footer Text */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            도움이 필요하면{' '}
            <button className="text-gray-500 underline hover:text-gray-700">
              고객센터
            </button>
            로 문의 부탁드립니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SocialLoginModal; 