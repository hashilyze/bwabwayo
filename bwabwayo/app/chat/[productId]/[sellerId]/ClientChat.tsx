'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type SellerProduct = {
  id: number
  title: string
  price: number
}

type Props = {
  productId: string
  sellerId: string
}

export default function ClientChat({ productId, sellerId }: Props) {
  const searchParams = useSearchParams()

  // 쿼리 파라미터
  const title = searchParams.get('title') ?? '제목 없음'
  const thumbnail = searchParams.get('thumbnail') ?? ''
  const priceStr = searchParams.get('price') ?? '0'
  const priceNum = Number(priceStr)
  const displayPrice = isNaN(priceNum) ? '가격 정보 없음' : `${priceNum.toLocaleString()}원`

  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>([])

  // 🔧 실제 API 호출 또는 더미 데이터 사용
  useEffect(() => {
    // 실제 API 호출 시 사용
    // fetch(`http://your-api-url/api/users/${sellerId}/products`)
    //   .then((res) => res.json())
    //   .then((data) => setSellerProducts(data))
    //   .catch((err) => console.error(err))

    // 더미 데이터 예시
    const dummyProducts: SellerProduct[] = [
      { id: 1, title: '상품 A', price: 10000 },
      { id: 2, title: '상품 B', price: 25000 },
      { id: 3, title: '상품 C', price: 15000 },
    ]
    setSellerProducts(dummyProducts)
  }, [sellerId])

  return (
    <div>
      <h1>채팅방 - 상품 예약</h1>
      <h2>{title}</h2>
      {thumbnail && (
        <img src={thumbnail} alt={title} loading="lazy" style={{ width: 200 }} />
      )}
      <p>{displayPrice}</p>

      <h3>판매자의 다른 상품</h3>
      <ul>
        {sellerProducts.map((p) => (
          <li key={p.id}>
            {p.title} - {p.price.toLocaleString()}원
          </li>
        ))}
      </ul>

      {/* TODO: 채팅 UI 구성 */}
    </div>
  )
}
