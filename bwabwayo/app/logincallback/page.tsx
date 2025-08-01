'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const accessToken = searchParams.get('accessToken')
  const isNewUser = searchParams.get('isNewUser')

  useEffect(() => {
    const processLogin = async () => {
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
        try {
          // 백엔드에 AccessToken을 전달하여 리프레시 토큰을 쿠키에 설정하도록 요청합니다.
          await api.post('/be/api/auth/refresh/init', null, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          })

          // 요청 성공 후, authStore의 login 액션을 호출하여 상태를 업데이트하고
          // accessToken을 localStorage에 저장합니다.
          login(accessToken)
          router.replace('/')
        } catch (error) {
          console.error('로그인 초기화 요청 실패:', error)
          alert('로그인 처리 중 오류가 발생했습니다. 다시 시도해주세요.')
          router.replace('/') // 오류 발생 시에도 메인으로 이동
        }
      } else {
        // 신규 유저가 아니면서 accessToken도 없는 경우, 비정상적인 접근으로 간주합니다.
        // 메인 페이지로 이동시키거나 에러 처리를 할 수 있습니다.
        // alert('로그인 정보가 올바르지 않습니다.');
        router.replace('/')
      }
    }

    processLogin()
  }, [router, searchParams, accessToken, isNewUser, login])

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