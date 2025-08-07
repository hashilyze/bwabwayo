import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 인증이 필요한 경로들
const protectedRoutes = [
  // '/product/new',
  // '/chat',
  '/signup',
  // '/mypage',
  '/shop',
  '/protected'
]

// 인증이 필요한 경로인지 확인하는 함수
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => pathname.startsWith(route))
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // 인증이 필요한 경로인지 확인
  if (isProtectedRoute(pathname)) {
    // 쿠키에서 accessToken 확인
    const accessToken = request.cookies.get('accessToken')?.value
    
    // 토큰이 없으면 홈페이지로 리다이렉트
    if (!accessToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('auth', 'required')
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

// 미들웨어가 실행될 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
} 