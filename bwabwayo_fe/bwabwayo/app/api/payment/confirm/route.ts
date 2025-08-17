import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { paymentKey, orderId, amount } = await request.json()

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { error: '필수 파라미터가 누락되었습니다.' },
        { status: 400 }
      )
    }

    // Toss Payments API를 통해 결제 확인
    const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.TOSS_PAYMENTS_SECRET_KEY + ':').toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Toss Payments API 오류:', result)
      return NextResponse.json(
        { error: result.message || '결제 확인에 실패했습니다.' },
        { status: response.status }
      )
    }

    // 결제 성공 시 응답
    return NextResponse.json({
      status: result.status,
      paymentKey: result.paymentKey,
      orderId: result.orderId,
      amount: result.totalAmount,
      method: result.method,
      requestedAt: result.requestedAt,
      approvedAt: result.approvedAt,
    })

  } catch (error) {
    console.error('결제 확인 처리 중 오류:', error)
    return NextResponse.json(
      { error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
