'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accessToken = searchParams.get('accessToken')
  const isNewUser = searchParams.get('isNewUser')

  useEffect(() => {
    // 1. 신규 유저인지 먼저 확인합니다.
    if (isNewUser === 'true') {
      // 신규 유저인 경우, 회원가입 페이지로 모든 파라미터를 가지고 이동합니다.
      // 회원가입 페이지에서 accessToken을 포함한 다른 정보들을 활용할 수 있습니다.
      const signupUrl = `/signup?${searchParams.toString()}`
      router.replace(signupUrl)
      return // 리디렉션 후에는 더 이상 로직을 진행하지 않습니다.
    }

    // 2. 기존 유저인 경우, accessToken이 있는지 확인합니다.
    if (accessToken) {
      // accessToken을 localStorage에 저장하고 메인 페이지로 이동합니다.
      localStorage.setItem('accessToken', accessToken)
      router.replace('/')
    } else {
      // 신규 유저가 아니면서 accessToken도 없는 경우, 비정상적인 접근으로 간주합니다.
      // 메인 페이지로 이동시키거나 에러 처리를 할 수 있습니다.
      // alert('로그인 정보가 올바르지 않습니다.');
      router.replace('/')
    }
  }, [router, searchParams, accessToken, isNewUser])

  // 로직 처리 중에는 아무것도 렌더링하지 않습니다.
  // 로딩 UI는 부모의 Suspense fallback으로 처리됩니다.
  return null
}

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<div>로그인 중입니다...</div>}>
      <CallbackHandler />
    </Suspense>
  )
}