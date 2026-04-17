# Bwabwayo Frontend

## 채팅 모달 시스템 이해

### 전체 플로우

채팅 모달 시스템은 거래 시작부터 완료까지의 전체 과정을 단계별로 관리하는 시스템입니다.
모든 모달은 components/chat/modals/AllModals.tsx에 있습니다.

### 1. 거래 시작 (StartTradeModal)
- **트리거**: ChatModal에서 "거래시작" 버튼 클릭
- **API 요청**: 백엔드에 거래 시작 요청
- **백엔드 응답**: 채팅창에 `START_TRADE` 타입 메시지 전달
- **모달**: StartTradeModal 모달 표시
- **기능**: 최종 거래 금액 입력

### 2. 입금 요청 (RequestDepositModal)
- **트리거**: StartTradeModal에서 금액 입력 후 확인
- **API 요청**: `price` 파라미터와 함께 백엔드에 요청
- **백엔드 응답**: 채팅창에 `REQUEST_DEPOSIT` 타입 메시지 전달
- **모달**: RequestDepositModal 모달 표시
- **기능**: 입금 확인 및 결제 진행

### 3. 결제 모달 (PaymentConnect)
- **트리거**: RequestDepositModal에서 결제 방법 선택
- **결제 처리**: PaymentSuccess 페이지를 통한 결제 성공/실패 처리
- **백엔드 응답**: 결제 완료 후 `INPUT_DELIVERY_ADDRESS` 타입 메시지 전달
- **모달**: InputDeliveryAddressModal 모달 표시
- **기능**: 배송지 주소 입력

### 4. 배송지 입력 (InputDeliveryAddressModal)
- **트리거**: 결제 완료 후 자동
- **기능**: 구매자가 배송지 주소 입력
- **완료 시**: `INPUT_TRACKING_NUMBER` 타입 메시지 전달

### 5. 송장번호 입력 (InputTrackingAddressModal)
- **트리거**: 배송지 입력 완료 후
- **모달**: InputTrackingAddressModal 모달 표시
- **기능**: 택배사와 송장번호 입력
- **API 요청**: 택배 정보를 백엔드에 전송
- **백엔드 응답**: 
  - `START_DELIVERY` 타입 메시지 → StartDeliveryModal 모달 표시
  - 1초 후 `CONFIRM_PURCHASE` 타입 메시지 → ConfirmPurchaseModal 모달 표시

### 6. 거래 완료 확인 (ConfirmPurchaseModal)
- **트리거**: 송장번호 입력 완료 후
- **모달**: ConfirmPurchaseModal 모달 표시
- **기능**: 거래 완료 확인 및 리뷰 작성 링크 제공

### 7. 리뷰 작성 (ReviewModal) - 구현 예정
- **트리거**: ConfirmPurchaseModal에서 리뷰 작성 링크 클릭
- **모달**: ReviewModal 모달 표시
- **기능**: 구매 후기 및 평점 작성

## 메시지 타입 정의

```typescript
enum MessageType {
  START_TRADE = 'START_TRADE',
  REQUEST_DEPOSIT = 'REQUEST_DEPOSIT',
  INPUT_DELIVERY_ADDRESS = 'INPUT_DELIVERY_ADDRESS',
  INPUT_TRACKING_NUMBER = 'INPUT_TRACKING_NUMBER',
  START_DELIVERY = 'START_DELIVERY',
  CONFIRM_PURCHASE = 'CONFIRM_PURCHASE'
}
```

## 구현 상태

- [x] StartTradeModal
- [x] RequestDepositModal  
- [x] PaymentConnect (결제 시스템)
- [x] InputDeliveryAddressModal
- [x] InputTrackingAddressModal
- [x] StartDeliveryModal
- [x] ConfirmPurchaseModal
- [ ] ReviewModal (구현 예정)

## 파일 구조

```
components/chat/modals/
├── AllModals.tsx (모든 모달 컴포넌트 관리)
├── DeliveryForm.tsx
├── DeliverySelectForm.tsx
├── FinalPriceForm.tsx
├── InputPriceModal.tsx
├── OverlayPortal.tsx
├── PurchaseConfirm.tsx
├── ReportModal.tsx
├── ReservationModal.tsx
├── TrackingForm.tsx
└── tossPay/
    ├── PaymentCheckout.tsx
    └── PaymentSuccess.tsx
```
