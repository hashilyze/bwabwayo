'use client';

import React from 'react';
import { useLoadingStore } from '@/stores/loadingStore';

export default function LoadingSpinner({ text = '로딩중입니다...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <svg className="animate-spin h-24 w-24 text-[#FFAE00]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      <span className="mt-6 text-2xl font-bold text-gray-600">{text}</span>
    </div>
  );
}
