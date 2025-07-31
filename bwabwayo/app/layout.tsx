import type { Metadata } from "next";
import '@/app/globals.css'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from "@/components/chat/Chatbot";

export const metadata: Metadata = {
  title: "봐봐요",
  description: "화상중고거래 플랫폼, 봐봐요",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      {/* <meta name="viewport" content="width=device-width, initial-scale=1.0" /> */}
      <body>
        <Navbar />
        <div className="bg-[#FAFDFF]">
          <div className="w-[1280px] m-auto py-12">
            {children}
          </div>
        </div>
        <Chatbot />
        <Footer />
      </body>
    </html>
  );
}