import type { Metadata } from "next";
import '@/app/globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from "@/components/chat/Chatbot";
import LoginModalWrapper from '@/components/common/LoginModalWrapper';
import { Suspense } from "react";

// 환경별 basePath 설정
const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/fe' : '';
};

export const metadata: Metadata = {
  title: "봐봐요",
  description: "화상중고거래 플랫폼, 봐봐요",
  icons: {
    icon: `${getBasePath()}/favicon.png`,
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
        <div className="bg-[#FAFDFF] pt-[240px]">
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