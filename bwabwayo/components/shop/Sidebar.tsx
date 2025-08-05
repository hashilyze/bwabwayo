// 파일 경로: components/shop/Sidebar.tsx
'use client';

import React from "react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();
  const basePath = '/mypage';

  const menuItems = {
    "거래정보": [
      { name: "구매 상품", href: `${basePath}/purchases` },
      { name: "판매 상품", href: `${basePath}/sales` },
      { name: "찜 상품", href: `${basePath}/wishlist` },
    ],
    "화상채팅": [
      { name: "화상 채팅 일정", href: `${basePath}/schedule` },
    ],
    "내 정보": [
      { name: "내 정보 수정", href: `${basePath}/settings` },
      { name: "주소록", href: `${basePath}/address` },
      { name: "회원탈퇴", href: `${basePath}/withdrawal` },
    ]
  };

  return (
    <div className="w-64">
      <h2 className="text-2xl font-bold mb-6">마이페이지</h2>
      <nav>
        <ul className="space-y-5">
          {Object.entries(menuItems).map(([sectionTitle, items], index) => (
            <li key={sectionTitle} className={index > 0 ? "border-t border-gray-200 pt-6" : ""}>
              <h3 className="text-xl font-bold mb-3">{sectionTitle}</h3>
              <ul className="space-y-2">
                {items.map(item => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
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
    </div>
  );
}
