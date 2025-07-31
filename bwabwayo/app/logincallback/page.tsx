'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accesstoken = searchParams.get('accessToken')

  useEffect(() => {
    if (accesstoken) {
      // AuthHandler가 신규 유저 리디렉션을 이미 처리하므로,
      // 이 페이지는 기존 유저의 로그인 성공 케이스만 처리합니다.
      localStorage.setItem('accessToken', accesstoken)
    }
    // 토큰 유무와 관계없이 메인 페이지로 이동시킵니다.
    router.replace('/')
  }, [accesstoken, router])

  // 이 컴포넌트는 UI를 렌더링하지 않고 리디렉션 로직만 처리합니다.
  // 로딩 UI는 Suspense의 fallback으로 처리됩니다.
  return null;
}

export default function KakaoCallbackPage() {
  return <Suspense fallback={<div>로그인 중입니다...</div>}>
    <CallbackHandler />
  </Suspense>
}