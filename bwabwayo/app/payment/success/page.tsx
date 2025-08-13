'use client'

import { Suspense } from 'react'
import { PaymentSuccessPage } from '@/components/chat/modals/tossPay/PaymentSuccess'

function PaymentSuccessContent() {
  return <PaymentSuccessPage />
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  )
}
