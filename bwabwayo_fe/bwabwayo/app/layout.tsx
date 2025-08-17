import type { Metadata } from "next";
import '@/app/globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from "@/components/chat/Chatbot";
import LoginModalWrapper from '@/components/common/LoginModalWrapper';

export const metadata: Metadata = {
  title: "봐봐요",
  description: "화상중고거래 플랫폼, 봐봐요",
  icons: {
    icon: `${process.env.NEXT_PUBLIC_PUBLIC_URL}/favicon.png`,
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
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <Navbar />  
        <LoginModalWrapper />
        <div className="pt-[198px]">
          {children}
        </div>
        <Chatbot />
        <Footer />
      </body>
    </html>
  );
}