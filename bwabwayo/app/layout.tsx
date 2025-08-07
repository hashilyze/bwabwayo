import type { Metadata } from "next";
import '@/app/globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from "@/components/chat/Chatbot";
import LoginModalWrapper from '@/components/common/LoginModalWrapper';
import { Suspense } from "react";
export const metadata: Metadata = {
  title: "봐봐요",
  description: "화상중고거래 플랫폼, 봐봐요",
  icons: {
    icon: `/favicon.png`,
  },
  other: {
    "Content-Security-Policy": "upgrade-insecure-requests",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      {/* <meta name="viewport" content="width=device-width, initial-scale=1.0" /> */}
      <body>
        <Suspense fallback={null}>
        </Suspense>
        <Navbar />
        <LoginModalWrapper />
        {/* Navbar가 fixed이므로, Navbar의 높이(약 162px)만큼 상단 패딩을 주어 콘텐츠가 가려지지 않게 합니다. */}
        {/* Navbar 높이: 유틸리티(40px) + 메인(60px) + 하단메뉴(60px) + 테두리(2px) = 162px */}
        <div className="bg-[#FAFDFF] pt-[162px]">
          <div className="w-[1280px] m-auto">
            {children}
          </div>
        </div>
        <Chatbot />
        <Footer />
      </body>
    </html>
  );
}