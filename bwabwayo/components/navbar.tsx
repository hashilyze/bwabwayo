import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="top-nav">
        {/* 상단 바 */}
        <div className="flex flex-col ">
            <div className="w-[1280px] m-auto py-2 flex justify-end text-sm text-gray-500 gap-4">
                <div className="flex gap-4">
                <Link href="/signin">로그인 / 회원가입</Link>
                <Link href="/shop">내상점</Link>
                </div>
            </div>
        </div>

        {/* 메인 내비 */}
        <div className="center-nav border-t border-[#eee]">
            <div className="w-[1280px] m-auto py-4 flex items-center justify-between">
                <div className="logo-wrap flex items-center gap-2">
                    <div className="logo text-xl font-bold">봐봐요</div>
                    <div className="flex ml-[120px] w-[400px]">
                        <input
                            type="text"
                            placeholder="상품명을 검색해보세요."
                            className="w-full border border-gray-300 rounded-l-full px-4 py-2 text-sm"
                        />
                        <button className="bg-blue-500 rounded-r-full px-4 text-white hover:bg-blue-600">
                            🔍
                        </button>
                    </div>
                </div>
                <div className="nav-btn-wrap flex gap-3">
                    <Link href="/product/new" className="bg-orange-500 text-white text-sm px-4 py-2 rounded hover:bg-orange-600">판매하기</Link>
                    <Link href="/chat" className="text-[#2B6CEE] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BFDBFE]">채팅목록</Link>
                    <Link href="#" className="text-[#1BA54E] text-sm px-4 py-2 border border-[#eee] rounded hover:bg-[#BBF7D0]">알림</Link>
                </div>
            </div>
        </div>

      {/* 카테고리 바 (아직 내용 없음) */}
      <div className="btm-nav">
        <div className="category-wrap w-[1280px] m-auto flex items-center py-2 gap-5">
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
