'use client'

import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {


  return (
    <>
      {/* nav, footer 숨기기 */}
      <style jsx global>{`
        nav, footer {
          display: none !important;
        }
        .pt-[198px] {
          padding-top: 0 !important;
        }
        body > div.pt-[198px] {
          padding-top: 0 !important;
        }
        div[class*="pt-[198px]"] {
          padding-top: 0 !important;
        }
        body > div {
          padding-top: 0 !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
        }
        [class*="pt-[198px]"] {
          padding-top: 0 !important;
        }
        body > div:first-child {
          padding-top: 0 !important;
        }
      `}</style>

      <div className="">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link href={`/`}>
                <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/logo.png`} alt="logo" className="h-10" />
              </Link>
              <h1 className="text-lg font-bold">관리자 페이지</h1>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="text-sm">
                  <div className="font-medium">관리자님</div>
                  <div className="text-gray-500">관리자 계정</div>
                </div>
              </div>
              <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">로그아웃</button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Left Sidebar */}
          <aside className="w-64 bg-gray-800 min-h-screen p-6">
            {/* 대분류: 고객지원 */}
            <div className="text-white font-semibold text-lg mb-2"><Link href="/admin">홈</Link></div>
            <div className="text-white font-semibold text-lg mb-2">고객지원</div>
            <div className="text-gray-300 text-md mb-2">
              <Link href="/admin/inquiries" className="block p-2 hover:">문의내용</Link>
              <Link href="/admin/reports" className="block p-2 hover:">신고내용</Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 bg-white">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
