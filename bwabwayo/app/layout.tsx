import type { Metadata } from "next";
import '@/app/globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from "@/components/chat/Chatbot";

import { Suspense } from "react";
import AuthHandler from "@/components/auth/AuthHandler";
export const metadata: Metadata = {
  title: "봐봐요",
  description: "화상중고거래 플랫폼, 봐봐요",
  icons: {
    icon: "/favicon.png",
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
        {/* 소셜 로그인 후 토큰 처리를 위해 최상단에 AuthHandler 추가 */}
        <Suspense fallback={null}>
          <AuthHandler />
        </Suspense>
        <Navbar />
        <div className="bg-[#FAFDFF] pt-[156px]">
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