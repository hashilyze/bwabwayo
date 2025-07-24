import type { Metadata } from "next";
import { Noto_Sans_KR } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
 
const notoSansKR = Noto_Sans_KR({
  subsets: ['cyrillic', 'latin', 'latin-ext'],
})

export const metadata: Metadata = {
  title: "봐봐요",
  description: "화상중고거래 플랫폼, 봐봐요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.className}>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <body>
        <Navbar />
        <div className="bg-[#FAFDFF]">
          <div className="w-[1280px] m-auto py-12">
            {children}
          </div>
        </div>
        <Footer />
      </body>
    </html>
  );
}
