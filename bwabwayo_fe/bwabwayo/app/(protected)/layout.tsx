'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useModalStore } from '@/stores/modalStore' // modal 스토어 import

/**
 * 이 레이아웃은 (protected) 그룹 내의 모든 페이지에 적용됩니다.
 * 페이지가 렌더링되기 전에 사용자 인증 상태를 확인합니다.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      // 토큰이 없으면 로그인 모달을 띄우고 홈페이지로 리디렉션합니다.
      useModalStore.getState().openLoginModal();
      router.replace('/'); // 홈페이지로 이동
    } else {
      // 토큰이 존재하면 인증 확인이 완료된 것으로 간주합니다.
      setIsAuthChecked(true);
    }
  }, [router, pathname]);

  // 인증 확인이 완료될 때까지는 로딩 상태나 null을 반환하여 페이지 깜빡임을 방지합니다.
  if (!isAuthChecked) {
    return null; // 또는 <LoadingSpinner /> 같은 컴포넌트를 보여줄 수 있습니다.
  }

  // 인증이 확인된 경우에만 자식 페이지(children)를 렌더링합니다.
  return <>{children}</>;
}
