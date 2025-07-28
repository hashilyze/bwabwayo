// 파일 경로: app/login/page.tsx
'use client';

import React from 'react';

// --- 아이콘 컴포넌트 (Icon Component) ---
// 카카오 아이콘 SVG
const KakaoIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill="#181600" d="M16 4.656c-6.075 0-11 3.937-11 8.812 0 3.469 2.513 6.5 6.263 7.937l-.95 3.422 3.637-2.437h2.05c6.075 0 11-3.937 11-8.812s-4.925-8.812-11-8.812z"/>
  </svg>
);

// --- 소셜 로그인 페이지 컴포넌트 ---
export default function SocialLoginPage() {

  const handleKakaoLogin = () => {
    // Kakao Developers에서 발급받은 REST API 키를 환경 변수에서 가져옵니다.
    const REST_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY; 
    // 로그인 성공 시 카카오가 인가 코드를 보내줄 우리 서비스의 주소입니다.
    // 실제 배포 시에는 배포된 서버 주소로 변경해야 합니다.
    const REDIRECT_URI = 'http://localhost:3000/auth/kakao/callback'; 

    // 사용자를 카카오 인증 페이지로 보내기 위한 URL
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    // 해당 URL로 페이지를 이동시켜 카카오 로그인 과정을 시작합니다.
    window.location.href = kakaoAuthUrl;
  };

  return (
    // 페이지 전체를 감싸고, 콘텐츠를 중앙에 배치합니다.
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {/* 로그인 폼의 전체적인 형태를 정의합니다. */}
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        
        {/* 로고 */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-2xl">봐</span>
          </div>
        </div>

        {/* 제목 및 설명 */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            봐봐요로 중고거래 시작하기
          </h2>
          <p className="text-sm text-gray-500">
            간편하게 가입하고 상품을 확인하세요
          </p>
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="mb-8">
          <button
            onClick={handleKakaoLogin}
            className="w-full bg-[#FEE500] hover:bg-[#F7E600] text-[#181600] font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <KakaoIcon />
            <span>카카오로 시작하기</span>
          </button>
        </div>

        {/* 구분선 */}
        <hr className="border-gray-200 mb-6" />

        {/* 푸터 */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            도움이 필요하면{' '}
            <button className="font-semibold text-gray-600 underline hover:text-gray-800">
              고객센터
            </button>
            로 문의 부탁드립니다.
          </p>
        </div>
      </div>
    </div>
  );
};
