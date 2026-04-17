'use client';

import React from 'react';
import Sidebar from "@/components/shop/Sidebar";

export default function MyPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-default m-auto pt-20 pb-30">
      <div className="flex gap-10">
        {/* userId를 전달하지 않으면 '마이페이지'용 사이드바가 렌더링됩니다. */}
        <Sidebar />
        
        <main className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
