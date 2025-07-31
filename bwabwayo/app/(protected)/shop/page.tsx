'use client'
// 인증 로직은 (protected)/layout.tsx에서 처리하므로
// 페이지 컴포넌트는 비즈니스 로직에만 집중할 수 있습니다.
export default function ShopPage() {
 

    return (
        <div>
        <h1>Shop</h1>
        <p>이 페이지는 로그인한 사용자만 볼 수 있습니다.</p>
        </div>
    )
}