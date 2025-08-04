'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

import Category from '@/components/Category';
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/auth/authStore';
import { useModalStore } from '@/stores/modalStore';

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
    <nav className={`bg-white border-b-1 border-[#eee] fixed top-0 left-0 right-0 z-98 transition-shadow duration-200 ${isScrolled ? 'shadow' : ''}`}>
      {/* top-nav */}
      {/* <div className="flex flex-col bg-[#fafafa]">
        <div className="w-[1280px] m-auto py-2 flex justify-end text-sm text-gray-500 gap-4">
          <div className="flex gap-4">
            <button onClick={() => setShowLoginModal(true)} className="text-sm text-[#666] cursor-pointer">
              로그인/회원가입
            </button>
            <button className='cursor-pointer' onClick={handleMyPageClick}>내상점</button>
          </div>
        </div>
      </div> */}


    {/* center-nav */}
    <div className="center-nav border-t border-[#eee]">
        <div className="w-[1280px] m-auto py-4 pb-2 flex items-center justify-between">
            <div className="logo-wrap flex items-center gap-2 flex-1 mr-16">
                <div className="logo text-xl font-bold">
                    
                    <Link href="/"><Image src="/logo.png" alt="logo" className="h-[40px]" width={97} height={40} /></Link>
                </div>
                <form className="flex items-center ml-[80px] flex-1 px-2 border-1 border-[#eee] rounded-lg bg-[#fff]" onSubmit={handleSubmit}>
                    <div className="flex items-center px-3">
                        <svg 
                            width="16" 
                            height="16" 
                            viewBox="0 0 16 16" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                d="M7.5 13.5C10.8137 13.5 13.5 10.8137 13.5 7.5C13.5 4.18629 10.8137 1.5 7.5 1.5C4.18629 1.5 1.5 4.18629 1.5 7.5C1.5 10.8137 4.18629 13.5 7.5 13.5Z" 
                                stroke="#9CA3AF" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                            <path 
                                d="M11.5 11.5L14.5 14.5" 
                                stroke="#9CA3AF" 
                                strokeWidth="1.5" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="상품명을 검색해보세요."
                        value={title}
                        onChange={(e)=> setTitle(e.target.value)}
                        className="flex-1 pl-0 pr-3 py-3 text-sm focus:outline-none"
                    />
                    {title && (
                        <button 
                            type="button" 
                            onClick={() => setTitle('')}
                            className="flex items-center justify-center w-4 h-4 mx-3 cursor-pointer bg-gray-400 rounded-full"
                        >
                            <svg 
                                width="12" 
                                height="12" 
                                viewBox="0 0 12 12" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    d="M9 3L3 9M3 3L9 9" 
                                    stroke="#ffffff" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                </form>
            </div>
                         <div className="nav-btn-wrap flex gap-3">
                 <button 
                     onClick={() => {
                         if (isLoggedIn) {
                             router.push('/product/new');
                         } else {
                             openLoginModal();
                         }
                     }}
                     className="bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600"
                 >
                     판매하기
                 </button>
                 <button 
                     onClick={() => {
                         if (isLoggedIn) {
                             router.push('/chat');
                         } else {
                             openLoginModal();
                         }
                     }}
                     className="text-[#2B6CEE] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BFDBFE]"
                 >
                     채팅목록
                 </button>
                 <Link href="#" className="text-[#1BA54E] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BBF7D0]">알림</Link>
            
                <div 
                    className="relative"
                    ref={myPageMenuRef}
                >
                                         <button 
                         onClick={() => {
                             if (isLoggedIn) {
                                 // 로그인된 상태: 마이페이지 메뉴 토글
                                 setShowMyPageMenu(prev => !prev)
                             } else {
                                 // 로그인 안된 상태: 로그인 모달 띄우기
                                 openLoginModal()
                             }
                         }}
                         className="text-[#1BA54E] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BBF7D0] flex items-center gap-2"
                     >
                         <span>내상점</span>
                     </button>
                    
                    {/* 로그인된 상태일 때만 드롭다운 메뉴 표시 */}
                    {isLoggedIn && showMyPageMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                            {/* 사용자 정보 헤더 */}
                            <ul className="py-1">
                                <li>
                                    <Link href="/mypage" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
                                        <span>마이페이지</span>
                                    </Link>
                                </li>
                                <li className="border-t border-gray-100 mt-1 pt-1">
                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                        <span>로그아웃</span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>

    {/* btm-nav */}
    <div className="btm-nav">
        <div className="category-wrap relative w-[1280px] m-auto flex items-center gap-3" ref={categoryRef}>
            <div 
                className="flex items-center gap-3 cursor-pointer group relative before:absolute before:left-0 before:top-full before:w-full before:h-4 before:bg-transparent before:z-10"
                onMouseEnter={() => setShowCategory(true)}
                onMouseLeave={() => setShowCategory(false)}
            >
                <ul className="category-btn flex flex-col justify-between gap-[5px]">
                    <li className="w-5 h-[2px] bg-black"></li>
                    <li className="w-5 h-[2px] bg-black"></li>
                    <li className="w-5 h-[2px] bg-black"></li>
                </ul>
                <div className="text-sm">카테고리</div>
            </div>
            <ul className="flex items-center ml-2 text-[15px] font-normal">
                <li><Link className="nav-link block text-sm text-[#666] p-3 py-4 relative" href="/cs-center">고객센터</Link></li>
                <li><Link className="nav-link block text-sm text-[#666] p-3 py-4 relative" href="#">전체상품</Link></li>
            </ul>
            {showCategory && (
            <div 
                className="absolute left-0 top-full z-20"
                onMouseEnter={() => setShowCategory(true)}
                onMouseLeave={() => setShowCategory(false)}
            >
                <Category />
            </div>
            )}
        </div>
    </div>
        

    </nav>
        
        
  )
}
