'use client';

import React from 'react';
import Link from 'next/link';


export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 rounded-tl-3xl rounded-tr-3xl">
      {/* 푸터 */}
    <div className="max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-end">
        <div className="flex-1">
          <div className="">
            <div className="logo-wrap flex gap-4 -ml-2 mb-6">
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/logo-black.png`} alt="봐봐요" className='h-[40px] -translate-y-1' />
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/ssafy.png`} alt="ssafy-logo" className='h-[35px]' />
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/git.png`} alt="git-logo" className='h-[35px]' />
            </div>
            <div className="flex gap-4 mb-4 text-[#8c9bb4]">
              <span>이용약관</span>
              <span>|</span>
              <span>개인정보처리방침</span>
              <span>|</span>
              <Link
                href="/cs-center"
              >
                <span>고객센터</span>
              </Link>
              <span>|</span>
              <span>임직원 인증하기</span>
              <span>|</span>
              <span>제휴문의</span>
            </div>
            <div className="text-[#8c9bb4] space-y-2">
              <p>대표이사: 장종원 | 이사진: 조우영 | 전소슬 | 이재원 | 배준수 | 원윤서</p>
              <p>사업장 소재지: 부산사업장. 부산광역시 강서구 녹산산업중로 333</p>
              <p>사업명: 누구나 안심할 수 있는 중고거래 플랫폼</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-semibold mb-2">010-3932-1511</p>
          <Link href="/cs-center" >
            <p className="text-sm mb-2">고객센터 바로가기 &gt;</p>
          </Link>
          <p className="text-xs text-[#acadb0]">평일 09:00 ~ 18:00 (주말 및 공휴일 휴무)</p>
        </div>
      </div>
      <div className='w-full h-[1px] bg-white/50 my-8'></div>
        <p className="text-[#acadb0] text-sm leading-relaxed">
          봐봐요는 통신판매중개자이며, 통신판매의 당사자가 아닙니다. 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 따라 상품, 상품정보, 거래에 관한 책임은 개별 판매자에게 귀속하고, 봐봐요는 원칙적으로 회원간 거래에 대하여 책임을 지지 않습니다.
        </p>
    </div>
  </footer>
  );
}