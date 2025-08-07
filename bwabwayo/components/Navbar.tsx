'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/auth/authStore';
import { useModalStore } from '@/stores/modalStore';

// 새로운 카테고리
export default function Navbar() {
    const [title, setTitle] = useState('')
    const [showCategory, setShowCategory] = useState(false);
    const [showMyPageMenu, setShowMyPageMenu] = useState(false); // 내상점 메뉴 상태
    const { isLoggedIn, logout, initializeAuth, authenticatedFetch, getToken } = useAuthStore(); // 새로운 authStore 사용
    const { openLoginModal } = useModalStore();
    const [isScrolled, setIsScrolled] = useState(false) // 스크롤 상태 추가
    const categoryRef = useRef<HTMLDivElement>(null);
    const myPageMenuRef = useRef<HTMLDivElement>(null); // 내상점 메뉴 참조
    const router = useRouter()
    const { getCategories } = useCategoryStore();

    // 컴포넌트 마운트 시 카테고리 데이터 로드
    useEffect(() => {
        getCategories();
    }, [getCategories]);

    // 컴포넌트 마운트 시 로그인 상태 확인 (토큰 초기화)
    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    // 스크롤 이벤트 리스너 추가
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 내상점 메뉴 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (myPageMenuRef.current && !myPageMenuRef.current.contains(event.target as Node)) {
                setShowMyPageMenu(false);
            }
        };

        if (showMyPageMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMyPageMenu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?title=${encodeURIComponent(title)}`)
  }

  const handleLogout = async () => {
    try {
      // 서버에 로그아웃 요청을 보냅니다.
      // 강화된 authenticatedFetch가 자동으로 토큰 관리, 갱신, 재시도를 처리합니다.
      await authenticatedFetch('https://i13e202.p.ssafy.io/be/api/auth/refresh/logout', {
        method: 'POST'
      });
    } catch (error) {
      // 서버 요청 실패 시에도 클라이언트 측 로그아웃은 진행되도록 합니다.
      console.error('Logout failed on server:', error);
    } finally {
      // AuthStore의 logout 액션을 호출합니다.
      logout();
      // 사용자 정보도 초기화
      setShowMyPageMenu(false);
      router.replace('/'); 
    }
  };

  return (
    <nav className={`bg-white border-b border-[#eee] fixed top-0 left-0 right-0 z-98 transition-shadow duration-200 ${isScrolled ? 'shadow' : ''}`}>
         <header>
                {/* 유틸리티 바 */}
                <div className="bg-white">
                  <div className="max-w-7xl mx-auto px-4 flex justify-end items-center h-10 gap-6">
                    <span className="text-sm text-gray-700 cursor-pointer hover:text-black">알림</span>
                    {isLoggedIn ? (
                      <button onClick={handleLogout} className="text-sm text-gray-700 cursor-pointer hover:text-black">
                        로그아웃
                      </button>
                    ) : (
                      <button onClick={openLoginModal} className="text-sm text-gray-700 cursor-pointer hover:text-black">로그인/회원가입</button>
                    )}
                    <Link
                href="/cs-center"
              >
                    <span className="text-sm text-gray-700 cursor-pointer hover:text-black">고객센터</span>

              </Link>
                  </div>
                </div>
                {/* 네비게이션 바 */}
                <nav className="bg-white ">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center justify-between h-15">
                    <div className="flex items-center gap-8">
                         <Link href="/">
                            <Image src="/logo.png" alt="봐봐요" width={169} height={57} />
                         
                         </Link>
                    </div>
                    <div className="flex items-center gap-8">
                      <form className="relative" onSubmit={handleSubmit}>
                        <input
                          type="text"
                          placeholder="검색어를 입력하세요"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="w-80 h-14 bg-gray-100 rounded-[18px] pl-6 pr-24 text-lg font-semibold placeholder-gray-400"
                        />
                        {title && (
                          <button
                            type="button"
                            onClick={() => setTitle('')}
                            className="absolute right-14 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-5 h-5 bg-gray-300 hover:bg-gray-400 rounded-full"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9 3L3 9M3 3L9 9"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          type="submit"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        >
                          <Image
                            src="/icon/search.svg"
                            alt="검색"
                            width={30}
                            height={30}
                          />
                        </button>
                      </form>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => {
                            if (isLoggedIn) {
                              router.push('/chat');
                            } else {
                              openLoginModal();
                            }
                          }}
                          className="cursor-pointer"
                        >
                        {/* fe 임의 추가 */}
                          <Image src="/fe/icon/chat.svg" alt="채팅" width={32} height={32} />
                        </button>
                        <button
                          onClick={() => {
                            if (isLoggedIn) {
                              router.push('/mypage/wishlist');
                            } else {
                              openLoginModal();
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <Image src="/icon/heart-off.svg" alt="찜" width={32} height={32} />
                        </button>
                        <button
                          onClick={() => {
                            if (isLoggedIn) {
                              router.push('/mypage');
                            } else {
                              openLoginModal();
                            }
                          }}
                          className="cursor-pointer"
                        >
                        {/* fe임의 추가 */}
                          <Image src="/fe/icon/people-white.svg" alt="프로필" width={32} height={32} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </nav>
              {/* 하단 메뉴 바 */}
              <div className="bg-white border-b border-black">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="flex items-center gap-8 h-15">
                    <div className="flex items-center gap-4 cursor-pointer">
                      <ul className="category-btn flex flex-col justify-between gap-[5px]">
                            <li className="w-5 h-[2px] bg-black"></li>
                            <li className="w-5 h-[2px] bg-black"></li>
                            <li className="w-5 h-[2px] bg-black"></li>
                        </ul>
                      <span className="text-2xl font-semibold">전체 카테고리</span>
                    </div >
                    <div className="w-px h-6 bg-black" />
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => {
                                    if (isLoggedIn) {
                                        router.push('/product/new');
                                    } else {
                                        openLoginModal();
                                    }
                                }}
                                className="text-2xl font-semibold text-[#ffae00] cursor-pointer"
                            >
                                판매하기
                            </button>
                            <span onClick={() => router.push('/search')} className="text-2xl font-semibold cursor-pointer">판매글 보기</span>
                        </div>
                  </div>
                </div>
              </div>
              </header>
    </nav>
        
        
  )
}
