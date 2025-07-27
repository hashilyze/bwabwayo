// 파일 경로: components/shop/Sidebar.tsx
'use client'; // Link와 상호작용하려면 클라이언트 컴포넌트가 되어야 합니다.

import React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 현재 경로를 알기 위해 usePathname을 사용합니다.

// userId를 props로 받아 동적 경로를 생성해야 합니다.
// 이 컴포넌트를 사용하는 부모 페이지(예: layout.tsx)에서 userId를 전달해줘야 합니다.
export default function Sidebar({ userId }: { userId: string }) {
  const pathname = usePathname(); // 현재 URL 경로를 가져옵니다.

  // 메뉴 데이터를 객체로 관리하여 코드의 가독성과 유지보수성을 높입니다.
  const menuItems = {
    "거래정보": [
      { name: "구매 상품", href: `/shop/${userId}/purchases` },
      { name: "판매 상품", href: `/shop/${userId}/sales` },
      { name: "찜 상품", href: `/shop/${userId}/wishlist` },
    ],
    "화상채팅": [
      { name: "화상 채팅 일정", href: `/shop/${userId}/schedule` },
    ],
    "내 정보": [
      { name: "내 정보 수정", href: `/shop/${userId}/settings` },
      { name: "회원탈퇴", href: `/shop/${userId}/withdrawal` },
    ]
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white rounded-xl shadow p-8 hidden lg:block">
      {/* --- 수정된 부분 --- */}
      {/* h2 태그를 Link 컴포넌트로 감싸서 클릭 시 상점 메인 페이지로 이동하도록 합니다. */}
      <Link href={`/shop/${userId}`}>
        <h2 className="text-3xl font-bold mb-10 hover:text-blue-600 transition-colors">마이페이지</h2>
      </Link>
      
      <nav>
        <ul className="space-y-8">
          {Object.entries(menuItems).map(([sectionTitle, items], index) => (
            <li key={sectionTitle} className={index > 0 ? "border-t border-gray-200 pt-8" : ""}>
              <h3 className="text-xl font-bold mb-4">{sectionTitle}</h3>
              <ul className="space-y-3 pl-2">
                {items.map(item => (
                  <li key={item.name}>
                    {/* a 태그를 Next.js의 Link 컴포넌트로 교체합니다. */}
                    <Link 
                      href={item.href} 
                      // 현재 경로(pathname)와 링크의 경로(item.href)가 일치하면 활성화 스타일을 적용합니다.
                      className={`hover:text-blue-600 transition-colors ${pathname === item.href ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
