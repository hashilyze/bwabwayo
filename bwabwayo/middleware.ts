import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// basePath 동적 가져오기
const getBasePath = () => {
  return process.env.NODE_ENV === 'production' ? '/fe' : '';
};

// 인증이 필요한 경로들
const protectedRoutes = [
  '/product/new',
  '/chat',
  '/signup',
  '/mypage',
  '/shop',
  '/test'
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
    
    // 토큰이 없으면 현재 페이지에 인증 필요 헤더를 추가
    if (!accessToken) {
      const response = NextResponse.next()
      response.headers.set('x-auth-required', 'true')
      return response
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