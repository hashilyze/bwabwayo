'use client';

import React from 'react';
import { useLoadingStore } from '@/stores/loadingStore';

export default function LoadingSpinner() {
  const { isLoading, loadingText } = useLoadingStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white/70 z-50 flex flex-col items-center justify-center">
      <div className="w-16 h-16">
        <img 
          src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/loading.gif`} 
          alt="로딩 중"
          className="w-full h-full object-contain"
        />
      </div>
      {loadingText && (
        <p className="mt-4 text-gray-600 text-sm">{loadingText}</p>
      )}
    </div>
  );
}
