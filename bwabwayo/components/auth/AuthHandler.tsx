'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// 소셜 로그인 후 리디렉션될 때 URL의 토큰을 처리하는 컴포넌트입니다.
// 이 컴포넌트는 메인 레이아웃에 한 번만 포함시키면 됩니다.
const AuthHandler = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // URL에서 accessToken과 isNewUser 파라미터를 가져옵니다.
    const accessToken = searchParams.get('accessToken');
    const isNewUser = searchParams.get('isNewUser');

    // accessToken이 URL에 존재하는 경우에만 로직을 실행합니다.
    if (accessToken) {
      // Case 2: 신규 유저라서 회원가입 페이지로 보내야 하는 경우 (isNewUser=true)
      if (isNewUser === 'true') {
        // 회원가입 페이지로 리디렉션합니다. 기존 쿼리 파라미터를 그대로 넘겨줍니다.
        // signUpStore에서 이 파라미터들을 사용합니다.
        const signupUrl = `/signup?${searchParams.toString()}`;
        router.replace(signupUrl);
      } else {
        // Case 1: 기존 유저가 로그인한 경우 (isNewUser가 'false'이거나, 파라미터가 없는 경우 등)
        console.log('기존 유저 로그인. 토큰을 localStorage에 저장합니다.');

        // 1. 토큰을 localStorage에 저장합니다.
        localStorage.setItem('accessToken', accessToken);

        // 2. (권장) 별도의 인증 스토어(useAuthStore)의 상태를 업데이트합니다.
        // 예: useAuthStore.getState().login(accessToken);

        // 3. URL에서 토큰 정보를 제거하여 주소창을 깔끔하게 정리합니다.
        // router.replace를 사용하면 페이지를 새로고침하지 않고 URL만 변경할 수 있습니다.
        // window.location.pathname 대신 Next.js의 usePathname을 사용해야 basePath와 함께 사용할 때 안전합니다.
        // usePathname()은 basePath를 제외한 현재 경로를 반환합니다 (예: /)
        router.replace(pathname, { scroll: false });
      }
    }
  }, [searchParams, router, pathname]);

  // 이 컴포넌트는 UI를 렌더링하지 않고 로직만 처리합니다.
  return null;
};

export default AuthHandler;
