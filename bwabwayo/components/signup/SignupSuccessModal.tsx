'use client';

import React from 'react';

interface SignupSuccessModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  loginPoint: number | null;
  signUpPoint: number | null;
}

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-green-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SignupSuccessModal: React.FC<SignupSuccessModalProps> = ({ isOpen, onConfirm, loginPoint, signUpPoint }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon />
        </div>
        <h2 className="text-2xl font-bold mb-3">회원가입 완료!</h2>
        <p className="text-gray-600 mb-2">
          환영합니다! 첫 가입 축하로 <span className="font-bold text-yellow-500">{(signUpPoint ?? 0).toLocaleString()}포인트</span>가 적립되었어요.
        </p>
        <p className="text-gray-600 mb-6">
          또한 로그인 보너스로 <span className="font-bold text-yellow-500">{(loginPoint ?? 0).toLocaleString()}포인트</span>도 함께 지급되었습니다.
        </p>
        <button
          onClick={onConfirm}
          className="w-full py-3 bg-yellow-400 border border-black rounded-full font-bold text-lg hover:bg-yellow-300 transition"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default SignupSuccessModal;
