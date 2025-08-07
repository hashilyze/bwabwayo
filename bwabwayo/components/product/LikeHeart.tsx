// components/product/LikeHeart.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLikeProductStore } from '@/stores/product/likeProductStore';

// SVG 아이콘 예시입니다. 실제 프로젝트의 아이콘으로 교체해주세요.
const HeartIconFilled = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-500">
    <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.344-.688 15.247 15.247 0 01-1.344.688l-.022.012-.007.003h-.001ac.001z" />
    <path fillRule="evenodd" d="M12 21.75l-1.145-.996C4.22 15.825 1.5 12.563 1.5 8.999a5.25 5.25 0 0110.5 0c0 3.564-2.72 6.826-9.355 11.755L12 21.75z" clipRule="evenodd" />
  </svg>
);

const HeartIconOutlined = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);


interface LikeHeartProps {
  productId: number;
  initialIsLiked?: boolean; // (선택) 부모 컴포넌트에서 초기 상태를 전달하여 깜빡임 방지
}

export default function LikeHeart({ productId, initialIsLiked }: LikeHeartProps) {
  // 1. 컴포넌트 내부 상태 관리
  // isLiked: 현재 좋아요 상태 (UI 즉시 반응을 위해)
  // isLoading: API 요청 중인지 여부 (중복 클릭 방지)
  const [isLiked, setIsLiked] = useState(initialIsLiked ?? false);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Zustand 스토어에서 필요한 액션과 상태 가져오기
  const { toggleLike, checkLikeStatus } = useLikeProductStore();

  // 3. 컴포넌트가 마운트될 때, 서버의 좋아요 상태를 확인하여 동기화
  useEffect(() => {
    let isActive = true; // 컴포넌트 언마운트 시 상태 업데이트 방지용 플래그

    const verifyLikeStatus = async () => {
      // initialIsLiked가 전달되지 않은 경우에만 서버에 확인
      if (initialIsLiked === undefined) {
        const status = await checkLikeStatus(productId);
        if (isActive) {
          setIsLiked(status);
        }
      }
    };

    verifyLikeStatus();

    return () => {
      isActive = false;
    };
  }, [productId, checkLikeStatus, initialIsLiked]);

  // 4. 좋아요 버튼 클릭 핸들러
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();  // 부모 요소(예: Link)의 기본 동작 방지
    e.stopPropagation(); // 이벤트 버블링 방지

    if (isLoading) return; // 로딩 중 중복 클릭 방지

    setIsLoading(true);

    // 5. 낙관적 업데이트 (UI를 먼저 변경)
    const previousIsLiked = isLiked;
    setIsLiked(!isLiked);

    try {
      // 스토어의 toggleLike 액션 호출
      await toggleLike(productId);
    } catch (e) {
      // 6. API 요청 실패 시, UI 상태를 원래대로 되돌림
      console.error('좋아요 토글 실패:', e);
      setIsLiked(previousIsLiked);
      alert('좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. UI 렌더링
  return (
    <button 
      onClick={handleToggleLike} 
      disabled={isLoading} 
      aria-label={isLiked ? '좋아요 취소' : '좋아요 추가'}
      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
    >
      {isLiked ? <HeartIconFilled /> : <HeartIconOutlined />}
    </button>
  );
}
