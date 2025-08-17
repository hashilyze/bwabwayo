'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth/authStore';
import { useLoadingStore } from '@/stores/loadingStore';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function WithdrawalPage() {
  const router = useRouter();
  const { authenticatedFetch, logout } = useAuthStore();
  const { isLoading, showLoading, hideLoading } = useLoadingStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleWithdrawal = async () => {
    if (!window.confirm('정말로 회원 탈퇴를 진행하시겠습니까?')) return;
    setError(null);
    showLoading('회원 탈퇴 처리 중...');
    try {
      const response = await authenticatedFetch('https://i13e202.p.ssafy.io/be/api/users', {
        method: 'DELETE',
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || '회원 탈퇴에 실패했습니다.');
      }
      setSuccess(true);
      logout();
      hideLoading();
      router.replace('/');
    } catch (err: unknown) {
      let message = '회원 탈퇴 중 오류가 발생했습니다.';
      if (err instanceof Error) message = err.message;
      else if (typeof err === 'string') message = err;
      setError(message);
      hideLoading();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner text="회원 탈퇴 처리 중..." /></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">회원 탈퇴</h1>
      <p className="mb-6">정말로 회원 탈퇴를 원하십니까?</p>
      {error && <div className="mb-4 text-red-600 font-semibold">{error}</div>}
      <button
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        onClick={handleWithdrawal}
        disabled={isLoading || success}
      >
        회원 탈퇴
      </button>
    </div>
  );
}