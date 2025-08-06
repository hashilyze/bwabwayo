// 클라이언트에서 쿠키를 읽는 함수
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

// 인증 상태 확인 함수
export function isAuthenticated(): boolean {
  const accessToken = getCookie('accessToken');
  return !!accessToken;
} 