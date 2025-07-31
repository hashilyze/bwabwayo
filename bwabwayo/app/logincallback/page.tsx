'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function KakaoCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accesstoken = searchParams.get('accessToken')

  useEffect(() => {
    if (accesstoken) {
      // AuthHandler가 신규 유저 리디렉션을 이미 처리하므로,
      // 이 페이지는 기존 유저의 로그인 성공 케이스만 처리합니다.
      localStorage.setItem('accessToken', accesstoken)
      // ✅ 메인 페이지로 이동
      router.replace('/')
    }
    else {
      // ✅ 토큰이 없으면 에러 처리 또는 로그인 페이지로 리디렉션
      router.replace('/')
    }  
  }, [accesstoken, router])

  return <div>로그인 중입니다...</div>
}