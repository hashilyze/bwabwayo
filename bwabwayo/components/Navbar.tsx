'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/auth/authStore';
import { useModalStore } from '@/stores/modalStore';
import Category from '@/components/Category';

// 새로운 카테고리
export default function Navbar() {
    const [title, setTitle] = useState('')
    const [showMyPageMenu, setShowMyPageMenu] = useState(false); // 내상점 메뉴 상태
    const [showCategory, setShowCategory] = useState(false); // 카테고리 표시 상태
    const { isLoggedIn, logout, initializeAuth, authenticatedFetch, getToken } = useAuthStore(); // 새로운 authStore 사용
    const { openLoginModal } = useModalStore();
    const [isScrolled, setIsScrolled] = useState(false) // 스크롤 상태 추가
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
    <nav className={`bg-white border-b-2 border-black fixed top-0 left-0 right-0 z-98 transition-shadow duration-200 ${isScrolled ? 'shadow' : ''}`}>
         <header className="w-[1280px] mx-auto">
            {/* 유틸리티 바 */}
            <div className="py-4 flex justify-end items-center gap-4">
              <span className="text-md text-gray-700 cursor-pointer hover:text-black">알림</span>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="text-md text-gray-700 cursor-pointer hover:text-black">
                  로그아웃
                </button>
              ) : (
                <button onClick={openLoginModal} className="text-md text-gray-700 cursor-pointer hover:text-black">로그인/회원가입</button>
              )}
              <Link href="/cs-center">
                  <span className="text-md text-gray-700 cursor-pointer hover:text-black">고객센터</span>
              </Link>
            </div>

            {/* 네비게이션 바 */}
            <nav className="bg-white ">
              <div className="flex items-center justify-between h-15">
                <div className="flex items-center gap-8 -ml-2">
                    <Link href="/">
                      <div className="relative h-[58px] w-[150px]">
                        <img src={`${process.env.PUBLIC_URL} + /logo.png`} alt="봐봐요" style={{objectFit: 'contain'}} />
                      </div>
                    </Link>
                </div>
                <div className="flex items-center gap-8"> 
                  <form className="flex bg-[#fafafa] border-2 border-black rounded-[16px] px-6 items-center justify-between w-[450px]" onSubmit={handleSubmit}>
                    <input
                      type="text"
                      placeholder="검색어를 입력하세요"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-md font-semibold text-gray-900 py-4 focus:outline-none"
                    />
                    <button type="submit" className="relative w-5 h-5">
                      <Image src="/icon/search.svg" alt="검색" fill />
                    </button>
                  </form>
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={() => {
                        if (isLoggedIn) {
                          router.push('/chat')
                        } else {
                          openLoginModal()
                        }
                      }}
                      className="cursor-pointer flex gap-3 text-xl items-end"
                    >
                       <div className="relative w-6 h-6">
                        <Image src="/icon/chat.svg" alt="채팅" fill />
                        </div>
                      채팅하기
                    </button>
                    {/* <Link href="/mypage/wishlist" className="cursor-pointer flex gap-2 text-xl items-end" >
                      <div className="relative w-6 h-6"><Image src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`} alt="찜" fill /></div>
                      찜 목록
                    </Link> */}
                     <button 
                       onClick={() => {
                         if (isLoggedIn) {
                           router.push('/mypage')
                         } else {
                           openLoginModal()
                         }
                       }}
                       className="cursor-pointer flex gap-2 text-xl items-end"
                     >
                       <div className="relative w-6 h-6"><Image src="/icon/people-white.svg" alt="프로필" fill /></div>
                       마이페이지
                     </button>
                  </div>
                </div>
              </div>
          </nav>

          {/* 하단 메뉴 바 */}
            <div className="flex items-center relative">
              <div
                 className="flex items-center cursor-pointer pt-8 pb-5 after:content-[''] after:mx-8 after:w-px after:h-6 after:bg-black"
                 onMouseEnter={() => setShowCategory(true)}
                 onMouseLeave={() => setShowCategory(false)}
               >
                <ul className="category-btn flex flex-col justify-between mr-4 gap-[5px]">
                    <li className="w-5 h-[2px] bg-black"></li>
                    <li className="w-5 h-[2px] bg-black"></li>
                    <li className="w-5 h-[2px] bg-black"></li>
                </ul>
                <span className="text-xl font-semibold">전체 카테고리</span>
                {showCategory && (
                  <div className="absolute top-full left-0 z-50 border-t-2 border-black">
                    <Category />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 pt-8 pb-5">
                  <button 
                    onClick={() => {
                      if (isLoggedIn) {
                        router.push('/product/new')
                      } else {
                        openLoginModal()
                      }
                    }}
                    className="text-xl font-semibold text-[#ffae00] cursor-pointer"
                  >
                    판매하기
                  </button>
                  <span onClick={() => router.push('/search')} className="text-xl font-semibold cursor-pointer">판매글 보기</span>
              </div>
            </div>
        </header>
    </nav>
  )
}
