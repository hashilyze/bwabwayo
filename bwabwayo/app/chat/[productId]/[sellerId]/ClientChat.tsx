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

  // 쿼리에서 전달받은 상품 정보 (변수명을 쿼리 키에 맞게 수정)
  const title = searchParams.get('title') ?? '제목 없음'
  const thumbnail = searchParams.get('thumbnail') ?? ''
  const priceStr = searchParams.get('price') ?? '0'
  const priceNum = Number(priceStr)
  const displayPrice = isNaN(priceNum) ? '가격 정보 없음' : `${priceNum.toLocaleString()}원`

  const dummySellerProducts: SellerProduct[] = [
    { id: 1, title: '상품 A', price: 10000 },
    { id: 2, title: '상품 B', price: 25000 },
    { id: 3, title: '상품 C', price: 15000 },
  ]
  
  const [sellerProducts, setSellerProducts] = useState<SellerProduct[]>(dummySellerProducts)

  // 실제 API 호출 예시
  // useEffect(() => {
  //   fetch(`http://43.203.212.189:8081/api/users/${sellerId}`)
  //     .then(res => {
  //       if (!res.ok) throw new Error('네트워크 응답 오류')
  //       return res.json()
  //     })
  //     .then(data => setSellerProducts(data))
  //     .catch(err => console.error('판매자 상품 불러오기 실패:', err))
  // }, [sellerId])

  return (
    <div>
      <h1>채팅방 - 상품 예약</h1>
      <h2>{title}</h2>
      {thumbnail && (
        <img src={thumbnail} alt={title} loading="lazy"/>
      )}
      <p>{displayPrice}</p>

      <h3>판매자 다른 상품</h3>
      <ul>
        {sellerProducts.map((p) => (
          <li key={p.id}>
            {p.title} - {p.price.toLocaleString()}원
          </li>
        ))}
      </ul>

      {/* 여기에 채팅 UI */}
    </div>
  )
}
