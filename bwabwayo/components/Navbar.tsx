'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import Link from 'next/link'
import Category from './Category'
import LoginModal from './auth/LoginModal'

export default function Navbar() {
  const [title, setTitle] = useState('')
  const [showCategory, setShowCategory] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false) // 모달 상태 추가
  const categoryRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/search?title=${encodeURIComponent(title)}`)
  }

  return (
    <nav className="border-b-1 border-[#eee]">
      {/* top-nav */}
      <div className="flex flex-col">
        <div className="w-[1280px] m-auto py-2 flex justify-end text-sm text-gray-500 gap-4">
          <div className="flex gap-4">
            <button onClick={() => setShowLoginModal(true)} className="text-sm text-gray-500 hover:underline">
              로그인/회원가입
            </button>
            <Link href="/shop">내상점</Link>
          </div>
        </div>
      </div>


            {/* center-nav */}
            <div className="center-nav border-t border-[#eee]">
                <div className="w-[1280px] m-auto py-4 flex items-center justify-between">
                    <div className="logo-wrap flex items-center gap-2 flex-1 mr-16">
                        <div className="logo text-xl font-bold">
                            <Link href="/">봐봐요</Link>
                        </div>
                        <form className="flex items-center ml-[120px] flex-1 px-2 border-1 border-[#f9f9f9] rounded-lg bg-[#F1F4F6]" onSubmit={handleSubmit}>
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
                                className="flex-1 pl-0 pr-3 py-3 text-sm focus:outline-none bg-transparent"
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
                        <Link href="/product/new" className="bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600">판매하기</Link>
                        <Link href="/chat" className="text-[#2B6CEE] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BFDBFE]">채팅목록</Link>
                        <Link href="#" className="text-[#1BA54E] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BBF7D0]">알림</Link>
                    </div>
                </div>
            </div>

            {/* btm-nav */}
            <div className="btm-nav py-4">
                <div className="category-wrap relative w-[1280px] m-auto flex items-center gap-5" ref={categoryRef}>
                    <div 
                        className="flex gap-3 items-center bg-[#212121] rounded-lg px-4 py-3 cursor-pointer group relative before:absolute before:left-0 before:top-full before:w-full before:h-4 before:bg-transparent before:z-10"
                        onMouseEnter={() => setShowCategory(true)}
                        onMouseLeave={() => setShowCategory(false)}
                    >
                        <ul className="category-btn w-4 h-3 flex flex-col justify-between">
                            <li className="h-0.5 bg-white rounded"></li>
                            <li className="h-0.5 bg-white rounded"></li>
                            <li className="h-0.5 bg-white rounded"></li>
                        </ul>
                        <div className="text-white text-sm">카테고리</div>
                    </div>
                    <ul className="flex items-center gap-7 ml-2 text-[15px] font-normal">
                        <li><Link href="#">고객센터</Link></li>
                    </ul>
                    {showCategory && (
                    <div 
                        className="absolute left-0 top-full mt-4 z-20"
                        onMouseEnter={() => setShowCategory(true)}
                        onMouseLeave={() => setShowCategory(false)}
                    >
                        <Category />
                    </div>
                    )}
                </div>
            </div>
                {/* ✅ 모달은 nav 바깥에서 조건부로 렌더링 */}
    {showLoginModal && (
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    )}

        </nav>
        
        
  )
}
