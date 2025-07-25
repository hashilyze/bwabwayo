import React from "react";

export default function Sidebar(){
  return(
    <aside className="w-64 flex-shrink-0 bg-white rounded-xl shadow p-8 hidden lg:block">
        <h2 className="text-3xl font-bold mb-10">마이페이지</h2>
        <nav>
            <ul className="space-y-8">
                {/* 거래정보 섹션 */}
                <li>
                    <h3 className="text-xl font-bold mb-4">거래정보</h3>
                    <ul className="space-y-3 pl-2">
                        <li><a href="#" className="text-gray-600 hover:text-blue-600">구매 상품</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-blue-600">판매 상품</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-blue-600">찜 상품</a></li>
                    </ul>
                </li>

                {/* 화상채팅 섹션 (선으로 구분) */}
                <li className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold mb-4">화상채팅</h3>
                    <ul className="space-y-3 pl-2">
                        <li><a href="#" className="text-gray-600 hover:text-blue-600">화상 채팅 일정</a></li>
                    </ul>
                </li>

                {/* 내 정보 섹션 (선으로 구분) */}
                <li className="border-t border-gray-200 pt-8">
                    <h3 className="text-xl font-bold mb-4">내 정보</h3>
                    <ul className="space-y-3 pl-2">
                        <li><a href="#" className="text-gray-600 hover:text-blue-600">내 정보 수정</a></li>
                        <li><a href="#" className="text-gray-600 hover:text-blue-600">회원탈퇴</a></li>
                    </ul>
                </li>
            </ul>
        </nav>
    </aside>
  )
}
    