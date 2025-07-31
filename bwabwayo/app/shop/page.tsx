'use client'

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ShopPage() {
    const [isAuth, setIsAuth] = useState<string>('')
    const router = useRouter()

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        setIsAuth(token || '')
      }, [])
    
      if (isAuth === '') {
        return null // 깜빡임 방지: 인증 여부 파악 전까지는 아무것도 렌더링하지 않음
      }

    return (
        <div>
        <h1>Shop</h1>
        </div>
    )
}