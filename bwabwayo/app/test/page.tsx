'use client'
import { useState } from 'react'
import AllModals from "@/components/chat/modals/AllModals"
import { OverlayPortal } from "@/components/chat/modals/OverlayPortal"
import TrackingNumberModal from '@/components/chat/modals/TrackingForm'

export default function TestPage() {
    const [openTracking, setOpenTracking] = useState(false)

    return (
        <div className="grid grid-cols-2 gap-10">
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>화상 예약 알림</h1>
                <AllModals message={{ content: '화상 예약 알림', createdAt: '2025-08-06T00:00:00' }} type="RESERVE_VIDEOCALL" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>화상 예약 취소</h1>
                <AllModals message={{ content: '화상 예약 취소', createdAt: '2025-08-06T00:00:00' }} type="CANCEL_VIDEOCALL" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>화상 거래 시작</h1>
                <AllModals message={{ content: '화상 거래 시작', createdAt: '2025-08-06T00:00:00' }} type="START_VIDEOCALL" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>거래 시작 - 최종 금액 확인</h1>
                <AllModals message={{ content: '최종 금액 확인', createdAt: '2025-08-06T00:00:00' }} type="START_TRADE" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>결제요청</h1>
                <AllModals message={{ content: '결제 요청', createdAt: '2025-08-06T00:00:00' }} type="REQUEST_DEPOSIT" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>배송지 공지</h1>
                <AllModals message={{ content: '배송지가 입력되었어요', createdAt: '2025-08-06T00:00:00' }} type="INPUT_TRACKING_NUMBER" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>채팅방 생성</h1>
                <AllModals message={{ content: '채팅방이 생성되었어요!', createdAt: '2025-08-06T00:00:00' }} type="CREATE_ROOM" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>배송지 입력</h1>
                <AllModals message={{ content: '배송지 입력', createdAt: '2025-08-06T00:00:00' }} type="INPUT_DELIVERY_ADDRESS" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>배송 시작</h1>
                <AllModals message={{ content: '배송 시작', createdAt: '2025-08-06T00:00:00' }} type="START_DELIVERY" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>구매 확정 요청</h1>
                <AllModals message={{ content: '구매 확정 요청', createdAt: '2025-08-06T00:00:00' }} type="CONFIRM_PURCHASE" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>구매 확정</h1>
                <AllModals message={{ content: '구매 확정', createdAt: '2025-08-06T00:00:00' }} type="END_TRADE" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>송장번호 오버레이</h1>
                <button
                    onClick={() => setOpenTracking(true)}
                    className="px-4 py-2 rounded-md bg-black text-white"
                >
                    송장 입력 열기
                </button>
            </div>

            <OverlayPortal open={openTracking} onClose={() => setOpenTracking(false)}>
                <TrackingNumberModal
                    onClose={() => setOpenTracking(false)}
                    onSubmit={(v) => {
                        console.log('송장 등록 값:', v)
                        setOpenTracking(false)
                    }}
                />
            </OverlayPortal>
        </div>
    )
}