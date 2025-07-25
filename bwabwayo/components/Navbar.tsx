'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
    const [query, setQuery] = useState('')
    const router = useRouter()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?query=${encodeURIComponent(query)}`)
    }

    return (
        <nav className="top-nav">
            {/* top-nav */}
            <div className="flex flex-col ">
                <div className="w-[1280px] m-auto py-2 flex justify-end text-sm text-gray-500 gap-4">
                    <div className="flex gap-4">
                        <Link href="/signin">로그인/회원가입</Link>
                        <Link href="/shop">내상점</Link>
                    </div>
                </div>
            </div>

            {/* center-nav */}
            <div className="center-nav border-t border-[#eee]">
                <div className="w-[1280px] m-auto py-4 flex items-center justify-between">
                    <div className="logo-wrap flex items-center gap-2">
                        <div className="logo text-xl font-bold">
                            <Link href="/">봐봐요</Link>
                        </div>
                        <form className="flex relative ml-[120px] w-[400px]" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="상품명을 검색해보세요."
                                value={query}
                                onChange={(e)=> setQuery(e.target.value)}
                                className="w-full border border-[#2B6CEE] rounded-tl-sm rounded-bl-sm px-4 py-3 text-sm focus:outline-none focus:unset"
                            />
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 w-4 cursor-pointer">
                                <img className="" src="/icon/search.svg" alt="검색" />
                            </button>
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
        <div className="btm-nav py-5">
            <div className="category-wrap w-[1280px] m-auto flex items-center gap-5">
                <ul className="w-6 h-5 flex flex-col justify-between cursor-pointer">
                    <li className="h-0.5 bg-gray-700 rounded"></li>
                    <li className="h-0.5 bg-gray-700 rounded"></li>
                    <li className="h-0.5 bg-gray-700 rounded"></li>
                </ul>

                <button className="text-xs border px-3 py-1 rounded-full text-blue-500 border-blue-300 hover:bg-blue-50">
                    봐봐요 고객센터
                </button>
            </div>
        </div>
        </nav>
  )
}