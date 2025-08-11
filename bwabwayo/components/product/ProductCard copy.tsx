'use client'

import { useRouter } from 'next/navigation'
import { MouseEvent } from 'react'
import WishHeart from '@/components/product/wishHeart'
import { ProductWithSeller } from '@/stores/product/productStore'

type Props = {
  item: ProductWithSeller
}

export default function ProductCard({ item }: Props) {
  const router = useRouter()
  const product = item.product

  const handleCardClick = (e: MouseEvent<HTMLDivElement>, productId: number) => {
    const target = e.target as HTMLElement
    if (target.closest('a') || target.closest('button')) return
    router.push(`/product/${productId}`)
  }

  const formatPrice = (price: number): string => {
    return price.toLocaleString()
  }

  const getRelativeTime = (dateString: string): string => {
    if (!dateString) return ''
    const now = new Date()
    const createdAt = new Date(dateString)
    const diffInMs = now.getTime() - createdAt.getTime()

    const minutes = Math.floor(diffInMs / (1000 * 60))
    const hours = Math.floor(diffInMs / (1000 * 60 * 60))
    const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  return (
    <div
      className="cursor-pointer group"
      onClick={(e) => handleCardClick(e, product.id || 0)}
    >
      <div className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md">
        {/* 이미지 영역 */}
        <div className="relative w-full h-[240px] overflow-hidden rounded-t-2xl">
          <img
            src={product.thumbnail || `${process.env.NEXT_PUBLIC_PUBLIC_URL}/image/no-image.jpg`}
            alt={product.title}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-3 right-3 z-10">
            {typeof product.id === 'number' && (
              <WishHeart
                productId={product.id}
                initialIsLiked={product.isLike || false}
              />
            )}
          </div>
        </div>

        {/* 정보 영역 */}
        <div className="p-4 space-y-2">
          {/* 제목 */}
          <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-2">
            {product.title}
          </h3>

          {/* 가격 & 화상거래 */}
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-black">
              {formatPrice(product.price)}원
            </span>
            {product.canVideoCall && (
              <div className="bg-[#f4f6f7] rounded-sm px-1.5 py-0.5 flex items-center gap-1 border border-[#ecf1f4]">
                <img src="/icon/video.svg" alt="화상거래" />
                <span className="text-[#ffae00] text-[10px] font-semibold">화상거래</span>
              </div>
            )}
          </div>

          {/* 시간 & 찜/조회 */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>{getRelativeTime(product.createdAt || '')}</span>
            {/* <span>찜 {product.wish_count} · 조회 {product.view_count}</span> */}
          </div>
        </div>
      </div>
    </div>
  )
}