'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth/authStore';
import { useModalStore } from '@/stores/modalStore';
import { isProtectedRoute } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isLoggedIn } = useAuthStore();
  const { openLoginModal } = useModalStore();
  const router = useRouter();

  useEffect(() => {
    // 현재 경로가 보호된 경로인지 확인
    const pathname = window.location.pathname;
    
    if (isProtectedRoute(pathname) && !isLoggedIn) {
      // 로그인되지 않은 상태에서 보호된 경로에 접근한 경우
      openLoginModal();
      // 홈페이지로 리다이렉트
      router.replace('/');
    }
  }, [isLoggedIn, openLoginModal, router]);

  // 로그인되지 않은 상태에서 보호된 경로에 접근한 경우 빈 화면 표시
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  if (isProtectedRoute(pathname) && !isLoggedIn) {
    return null;
  }

  return <>{children}</>;
} 