'use client'

import { useEffect } from 'react'
import { useModalStore } from '@/stores/modalStore'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { openLoginModal } = useModalStore()

  useEffect(() => {
    // 서버에서 설정한 인증 필요 헤더 확인
    const checkAuthRequired = async () => {
      try {
        // 현재 페이지를 다시 요청하여 헤더 확인
        const response = await fetch(window.location.href, {
          method: 'HEAD',
          credentials: 'include'
        })
        
        if (response.headers.get('x-auth-required') === 'true') {
          openLoginModal()
        }
      } catch (error) {
        console.error('인증 상태 확인 실패:', error)
      }
    }

    checkAuthRequired()
  }, [openLoginModal])

  return <>{children}</>
}
