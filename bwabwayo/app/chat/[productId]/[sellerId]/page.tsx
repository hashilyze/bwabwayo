'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface ChatPageProps {
  params: {
    productId: string
    sellerId: string
  }
}

export default function ChatPage({ params }: ChatPageProps) {
  const { productId, sellerId } = params
  const searchParams = useSearchParams()

  const title = searchParams.get('title') ?? '제목 없음'
  const thumbnail = searchParams.get('thumbnail') ?? ''
  const price = Number(searchParams.get('price') ?? '0')
  const displayPrice = isNaN(price) ? '가격 정보 없음' : `${price.toLocaleString()}원`

  const [sellerProducts, setSellerProducts] = useState<
    { id: number; title: string; price: number }[]
  >([])

  useEffect(() => {
    setSellerProducts([
      { id: 1, title: '상품 A', price: 10000 },
      { id: 2, title: '상품 B', price: 25000 },
      { id: 3, title: '상품 C', price: 15000 },
    ])
  }, [sellerId])

  return (
    <div>
      <h1>채팅방 - 상품 예약</h1>
      <h2>{title}</h2>
      {thumbnail && <img src={thumbnail} alt={title} loading="lazy" style={{ width: 200 }} />}
      <p>{displayPrice}</p>

      <h3>판매자의 다른 상품</h3>
      <ul>
        {sellerProducts.map((p) => (
          <li key={p.id}>
            {p.title} - {p.price.toLocaleString()}원
          </li>
        ))}
      </ul>
    </div>
  )
}