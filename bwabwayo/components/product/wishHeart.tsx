import React, { useState, useEffect, useCallback } from 'react';
import { useLikeProductStore } from '@/stores/product/likeProductStore';

interface LikeHeartProps {
  productId: number;
  initialIsLiked?: boolean; // (선택) 부모 컴포넌트에서 초기 상태를 전달하여 깜빡임 방지
}

export default function LikeHeart({ productId, initialIsLiked = false }: LikeHeartProps) {
  // 1. 컴포넌트 내부 상태 관리
  // isLiked: 현재 좋아요 상태 (UI 즉시 반응을 위해)
  // isLoading: API 요청 중인지 여부 (중복 클릭 방지)
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isLoading, setIsLoading] = useState(false);

  // 2. Zustand 스토어에서 필요한 액션과 상태 가져오기
  const { addLike, removeLike, checkLikeStatus } = useLikeProductStore();

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
  const handleToggleLike = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault(); // 부모 요소(예: Link)의 기본 동작 방지
      e.stopPropagation(); // 이벤트 버블링 방지

      if (isLoading) return; // 로딩 중 중복 클릭 방지

      setIsLoading(true);

      // 5. 낙관적 업데이트 (UI를 먼저 변경)
      const previousIsLiked = isLiked;
      setIsLiked(!isLiked);

      try {
        // 이전 상태가 '좋아요'였다면, '좋아요 제거' API 호출
        if (previousIsLiked) {
          await removeLike(productId);
        } else {
          // 이전 상태가 '좋아요'가 아니었다면, '좋아요 추가' API 호출
          await addLike(productId);
        }
      } catch (e) {
        // 6. API 요청 실패 시, UI 상태를 원래대로 되돌림
        console.error('좋아요 토글 실패:', e);
        setIsLiked(previousIsLiked);
        alert('좋아요 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isLiked, addLike, removeLike, productId],
  );

  // 7. UI 렌더링
  return (
    <button 
      onClick={handleToggleLike} 
      disabled={isLoading} 
      aria-label={isLiked ? '좋아요 취소' : '좋아요 추가'}
      className="p-1 rounded-full cursor-pointer group"
    >
      <img
        src={isLiked ? `${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-on.svg` : `${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-off.svg`}
        alt={isLiked ? "좋아요 취소" : "좋아요"}
        className="w-6 h-6 group-hover:hidden"
      />
      <img
        src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/heart-on.svg`}
        alt="좋아요"
        className="w-6 h-6 hidden group-hover:block"
      />
    </button>
  );
}
