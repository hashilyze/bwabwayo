'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useCategoryStore } from '@/stores/categoryStore';
import { useAuthStore } from '@/stores/auth/authStore';
import { useModalStore } from '@/stores/modalStore';
import { useNotificationStore } from '@/stores/notificationStore';
import Category from '@/components/Category';
import NewCategory from '@/components/NewCategory';
import NotificationDropdown from './NotificationDropdown';
import { EventSourcePolyfill } from "event-source-polyfill";


// 새로운 카테고리
export default function Navbar() {
    const [title, setTitle] = useState('')
    const [showMyPageMenu, setShowMyPageMenu] = useState(false); // 내상점 메뉴 상태
    const [showCategory, setShowCategory] = useState(false); // 카테고리 표시 상태
    const [showNotifications, setShowNotifications] = useState(false); // 알림 드롭다운 상태

    const { isLoggedIn, isAdmin, logout, initializeAuth, authenticatedFetch, getToken, isSignupRequired } = useAuthStore(); // 새로운 authStore 사용
    const { openLoginModal } = useModalStore();
    const { unreadCount, delayedUnreadCount, fetchNotifications, startSSE, stopSSE, isSSEConnected } = useNotificationStore();
    const [isScrolled, setIsScrolled] = useState(false) // 스크롤 상태 추가
    const myPageMenuRef = useRef<HTMLDivElement>(null); // 내상점 메뉴 참조
    const categoryRef = useRef<HTMLDivElement>(null); // 카테고리 참조
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

    // 알림 수신 방식 설정 (SSE만 사용)
    useEffect(() => {
        if (!isLoggedIn) {
            stopSSE();
            return;
        }

        // SSE 사용
        startSSE();
        
        // 컴포넌트 언마운트 시 알림 수신 중지
        return () => {
            stopSSE();
        };
    }, [isLoggedIn, startSSE, stopSSE]);

    // 알림 드롭다운 상태에 따른 API 호출 관리
    useEffect(() => {
        // ✅ 1. 로그인 상태이면서 회원가입이 완료된 경우에만 알림 관련 API를 호출하도록 가드를 추가합니다.
        const token = getToken();
        if (isLoggedIn && !isSignupRequired && token) {
            if (showNotifications) {
                // 드롭다운이 열려있을 때는 전체 알림 목록을 가져옴
                fetchNotifications();
            } else {
                // 드롭다운이 닫혀있을 때는 읽지 않은 알림 수만 가져옴
                useNotificationStore.getState().fetchUnreadCount();
            }
        }
    }, [isLoggedIn, isSignupRequired, showNotifications, fetchNotifications, getToken]);

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
            alert('로그아웃 되었습니다.');
            router.replace('/'); 
        }
    };

    return (
        <nav className={`bg-white border-b-2 border-black fixed top-0 left-0 right-0 z-98 transition-shadow duration-200 ${isScrolled ? 'shadow' : ''}`}>
            <header className="w-[1280px] mx-auto">
                {/* 유틸리티 바 */}
                <div className="py-4 flex justify-end items-center gap-4 relative">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-xs" style={{display: 'none'}}>
                            <span className="text-gray-600">알림 방식:</span>
                            <span className="text-blue-500 font-medium">SSE</span>
                            {isSSEConnected && (
                                <span className="text-green-500 text-xs">●</span>
                            )}
                            {!isSSEConnected && (
                                <span className="text-red-500 text-xs">●</span>
                            )}
                        </div>
                        
                        {/* 알림 버튼 */}
                        <span 
                            className="text-md text-gray-700 cursor-pointer hover:text-black relative"
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            알림
                            {delayedUnreadCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {delayedUnreadCount > 9 ? '9+' : delayedUnreadCount}
                                </span>
                            )}
                        </span>
                        <NotificationDropdown 
                            isOpen={showNotifications} 
                            onClose={() => setShowNotifications(false)} 
                        />
                    </div>
                    {isLoggedIn && !isSignupRequired ? (
                        <button onClick={handleLogout} className="text-md text-gray-700 cursor-pointer hover:text-black">
                            로그아웃
                        </button>
                    ) : isLoggedIn && isSignupRequired ? (
                        <span className="text-md text-gray-700">회원가입 진행 중</span>
                    ) : (
                        <button onClick={openLoginModal} className="text-md text-gray-700 cursor-pointer hover:text-black">로그인/회원가입</button>
                    )}
                    <Link href="/cs-center">
                        <span className="text-md text-gray-700 cursor-pointer hover:text-black">고객센터</span>
                    </Link>
                    {isLoggedIn && isAdmin && (
                        <Link href="/admin">
                            <span className="text-md text-gray-700 cursor-pointer hover:text-black">관리자</span>
                        </Link>
                    )}
                </div>

                {/* 네비게이션 바 */}
                <nav className="bg-white ">
                    <div className="flex items-center justify-between h-15">
                        <div className="flex items-center gap-8 -ml-2">
                            <Link href="/">
                                <div className="relative h-[58px] w-[150px]">
                                    <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/logo.png`} alt="봐봐요" style={{objectFit: 'contain'}} />
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
                                    <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/search.svg`} alt="검색" />
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
                                    <div className="relative w-6 h-6 mb-0.5">
                                        <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/chat.svg`} alt="채팅" />
                                    </div>
                                    채팅하기
                                </button>
                                {/* <Link href="/mypage/wishlist" className="cursor-pointer flex gap-2 text-xl items-end" >
                                    <div className="relative w-6 h-6"><img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`} alt="찜" /></div>
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
                                    <div className="relative w-6 h-6"><img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/people-white.svg`} alt="프로필" /></div>
                                    마이페이지
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* 하단 메뉴 바 */}
                <div className="flex items-center relative">
                    <div
                        ref={categoryRef}
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
                        {/* {showCategory && (
                            <div className="absolute top-full left-0 z-50 border-t-2 border-black">
                                <Category />
                            </div>
                        )} */}
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
                
                {/* 카테고리 드롭다운 */}
                <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        showCategory ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                    onMouseEnter={() => setShowCategory(true)}
                    onMouseLeave={() => setShowCategory(false)}
                >
                    <NewCategory showCategory={showCategory} />
                </div>
            </header>
        </nav>
    )
}
