'use client';

import React, { useState } from 'react';

interface ProductCard {
  id: number;
  title: string;
  price: number;
  image: string;
  likes: number;
  views: number;
  timeAgo: string;
  hasVideoTrade: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

const MainPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories: Category[] = [
    { id: 1, name: '아이폰', icon: '/image/sample.png' },
    { id: 2, name: '키링', icon: '/image/sample.png' },
    { id: 3, name: '스투시', icon: '/image/sample.png' },
    { id: 4, name: '베이프', icon: '/image/sample.png' },
    { id: 5, name: '신발', icon: '/image/sample.png' },
    { id: 6, name: '피규어', icon: '/image/sample.png' },
    { id: 7, name: '그래픽카드', icon: '/image/sample.png' },
    { id: 8, name: '티켓', icon: '/image/sample.png' },
  ];

  const sampleProducts: ProductCard[] = [
    {
      id: 1,
      title: '팝마트 라부부 코카콜라 시리즈 인형 키링',
      price: 70000,
      image: '/image/sample.png',
      likes: 4,
      views: 23,
      timeAgo: '1시간 전',
      hasVideoTrade: true,
    },
    {
      id: 2,
      title: '팝마트 라부부 코카콜라 시리즈 인형 키링',
      price: 70000,
      image: '/image/sample.png',
      likes: 4,
      views: 23,
      timeAgo: '1시간 전',
      hasVideoTrade: true,
    },
    {
      id: 3,
      title: '팝마트 라부부 코카콜라 시리즈 인형 키링',
      price: 70000,
      image: '/image/sample.png',
      likes: 4,
      views: 23,
      timeAgo: '1시간 전',
      hasVideoTrade: true,
    },
    {
      id: 4,
      title: '팝마트 라부부 코카콜라 시리즈 인형 키링',
      price: 70000,
      image: '/image/sample.png',
      likes: 4,
      views: 23,
      timeAgo: '1시간 전',
      hasVideoTrade: true,
    },
  ];

  const ProductCard: React.FC<{ product: ProductCard }> = ({ product }) => (
    <div className="bg-white border border-gray-200 rounded-[20px] overflow-hidden">
      <div className="relative">
        <div className="w-full h-[290px] bg-gray-200 relative">
          <img src={product.image} alt={product.title} className="object-cover" />
          <div className="absolute top-4 right-4 w-6 h-6 bg-white/50 rounded-full flex items-center justify-center">
            <div className="relative w-4 h-4">
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`} alt="찜" />
            </div>
          </div>
        </div>
        {product.hasVideoTrade && (
          <div className="absolute bottom-4 left-4 bg-[#ffe9ba] rounded-lg px-2 py-1 flex items-center gap-1">
            <div className="relative w-4 h-4">
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/video.svg`} alt="화상거래" />
            </div>
            <span className="text-[#ffae00] text-xs">화상거래</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-base text-black mb-2 leading-tight">{product.title}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-black">{product.price.toLocaleString()}원</span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{product.timeAgo}</span>
          <span>찜 {product.likes} · 조회 {product.views}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <header>
        {/* 유틸리티 바 */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 flex justify-end items-center h-10 gap-6">
            <span className="text-sm text-gray-700 cursor-pointer hover:text-black">알림</span>
            <span className="text-sm text-gray-700 cursor-pointer hover:text-black">로그인/회원가입</span>
            <span className="text-sm text-gray-700 cursor-pointer hover:text-black">고객센터</span>
          </div>
        </div>
        {/* 네비게이션 바 */}
        <nav className="bg-white ">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-15">
            <div className="flex items-center gap-8">
              <div className="relative h-[58px] w-[150px]">
                <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/logo.png`} alt="봐봐요" style={{ objectFit: 'contain' }}/>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  className="w-80 h-14 bg-gray-100 rounded-[18px] px-6 text-lg font-semibold placeholder-gray-400"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5">
                  <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/search.svg`} alt="검색" />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative w-6 h-6">
                  <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/people-white.svg`} alt="프로필" />
                </div>
                <div className="relative w-6 h-6">
                  <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`} alt="찜" />
                </div>
                <div className="relative w-6 h-6">
                  <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/chat.svg`} alt="채팅" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      {/* 하단 메뉴 바 */}
      <div className="bg-white border-b border-black">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-8 h-15">
            <div className="flex items-center gap-8 cursor-pointer">
              <ul className="category-btn flex flex-col justify-between gap-[5px]">
                    <li className="w-5 h-[2px] bg-black"></li>
                    <li className="w-5 h-[2px] bg-black"></li>
                    <li className="w-5 h-[2px] bg-black"></li>
                </ul>
              <span className="text-2xl font-semibold pr-4 border-r-2 border-black-300">전체 카테고리</span>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-2xl font-semibold text-[#ffae00] cursor-pointer">판매하기</span>
              <span className="text-2xl font-semibold cursor-pointer">판매글 보기</span>
            </div>
          </div>
        </div>
      </div>
      </header>

      {/* 광고 배너 */}
      <section className="bg-[#e8f4e9] py-16">
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="flex items-center justify-between">
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&lt;</span>
            </button>
            <div className="flex-1 mx-8">
              <div className="bg-white border border-black rounded-[15px] px-6 py-3 inline-block">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">1</span>
                  <span className="text-2xl text-gray-400">|</span>
                  <span className="text-2xl text-gray-400">13</span>
                  <span className="text-xl text-gray-400">&gt;</span>
                </div>
              </div>
            </div>
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&gt;</span>
            </button>
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 justify-center">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center relative">
                  <img
                    src={category.icon}
                    alt={category.name}
                    width={80}
                    height={80}
                    className="object-cover"
                  />
                </div>
                <span className="text-lg text-black">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW ITEMS 섹션 */}
      <section className="bg-[#f6f8f9] py-16 rounded-[80px]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-11 h-11 bg-[#fce94f] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">★</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-wider">NEW ITEMS</h2>
          </div>
          
          <div className="flex gap-6 mb-8">
            {sampleProducts.map((product) => (
              <div key={product.id} className="flex-1">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4">
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&lt;</span>
            </button>
            <div className="flex gap-2">
              <div className="w-5 h-5 bg-[#ffae00] border border-black rounded-full"></div>
              <div className="w-4 h-4 bg-white border border-black rounded-full"></div>
              <div className="w-4 h-4 bg-white border border-black rounded-full"></div>
            </div>
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&gt;</span>
            </button>
          </div>
        </div>
      </section>

      {/* HOT ITEMS 섹션 */}
      <section className="bg-[#f6f9fb] py-16 rounded-[80px]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#ffae00] rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">🔥</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-wider">HOT ITEMS</h2>
          </div>
          
          <div className="flex gap-6 mb-8">
            {sampleProducts.map((product) => (
              <div key={product.id} className="flex-1">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4">
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&lt;</span>
            </button>
            <div className="flex gap-2">
              <div className="w-5 h-5 bg-[#ffae00] border border-black rounded-full"></div>
              <div className="w-4 h-4 bg-white border border-black rounded-full"></div>
              <div className="w-4 h-4 bg-white border border-black rounded-full"></div>
            </div>
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&gt;</span>
            </button>
          </div>
        </div>
      </section>

      {/* 화상거래 가능한 상품 섹션 */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold mb-8">화상거래 가능한 상품</h2>
          
          <div className="flex gap-6 mb-8">
            {sampleProducts.map((product) => (
              <div key={product.id} className="flex-1">
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4">
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&lt;</span>
            </button>
            <div className="flex gap-2">
              <div className="w-5 h-5 bg-[#ffae00] border border-black rounded-full"></div>
              <div className="w-4 h-4 bg-white border border-black rounded-full"></div>
              <div className="w-4 h-4 bg-white border border-black rounded-full"></div>
            </div>
            <button className="w-12 h-12 bg-[#fce94f] border border-black rounded-xl flex items-center justify-center">
              <span className="text-2xl font-semibold">&gt;</span>
            </button>
          </div>
        </div>
      </section>

      {/* 챗봇 버튼 */}
      <div className="fixed bottom-8 right-8">
        <div className="w-16 h-16 bg-[#6fd962] border border-black rounded-full flex items-center justify-center">
          <span className="text-3xl font-bold">?</span>
        </div>
      </div>

      
    </div>
  );
};

export default MainPage;
