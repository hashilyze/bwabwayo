import AllModals from "@/components/chat/modals/AllModals"

export default function TestPage() {
    return (
        <div className="grid grid-cols-4 gap-10">
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>화상 예약 알림</h1>
                <AllModals message={{ content: '화상 예약 알림', createdAt: '2025-08-06T00:00:00' }} type="video" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>거래 시작 - 최종 금액 확인</h1>
                <AllModals message={{ content: '최종 금액 확인', createdAt: '2025-08-06T00:00:00' }} type="start" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>배송지와 계좌 공지</h1>
                <AllModals message={{ content: '최종 금액이 결정되었어요!', createdAt: '2025-08-06T00:00:00' }} type="lotation" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>입금 확인</h1>
                <AllModals message={{ content: '입금이 확인되었어요!', createdAt: '2025-08-06T00:00:00' }} type="check" />
            </div>
            <div className="flex flex-col gap-4 justify-center items-center mb-10">
                <h1>배송 조회</h1>
                <AllModals message={{ content: '배송 조회', createdAt: '2025-08-06T00:00:00' }} type="delivery" />
            </div>
        </div>
    )
}