## 작업 시 유의사항
1. 프로젝트 시작 시 pull 먼저!
2. commit전에도 pull 먼저!
2. 의존성 설치
3. 작업 시작
```
cd bwabwayo
git pull
npm i
npm run dev
```

## 토스페이먼츠 API 연결 과정

### 1단계: 토스페이먼츠 SDK 설치 및 초기 설정

#### 1.1 SDK 설치
```bash
npm install @tosspayments/tosspayments-sdk
```

#### 1.2 PaymentCheckout 컴포넌트 생성
`/components/chat/modals/tossPay/PaymentCheckout.tsx` 파일을 생성하여 토스페이먼츠 결제 기능을 구현했습니다.

주요 기능:
- 토스페이먼츠 SDK 초기화 및 결제 객체 생성
- 6가지 결제 방법 지원 (카드, 계좌이체, 가상계좌, 휴대폰, 문화상품권, 해외간편결제)
- 결제 방법 선택 UI 및 결제 요청 로직
- 정기 결제(빌링) 기능 지원

#### 1.3 주요 설정 사항
- **clientKey**: 토스페이먼츠 개발자센터에서 발급받은 클라이언트 키
- **customerKey**: 구매자의 고유 아이디 (현재는 랜덤 문자열 생성)
- **amount**: 결제 금액 설정 (KRW 12,900원)
- **결제 방법**: 카드, 계좌이체, 가상계좌, 휴대폰, 문화상품권, 해외간편결제 지원

#### 1.4 정기 결제 (빌링)
- 카드 자동결제 기능 지원
- 빌링키 발급 후 정기 결제 가능

### 2단계: 결제 성공 페이지 구현

#### 2.1 PaymentSuccess 컴포넌트 수정
`/components/chat/modals/tossPay/PaymentSuccess.tsx` 파일을 수정하여 결제 완료 후 서버에 결제 확인 요청을 보내는 로직을 구현했습니다.

주요 기능:
- 결제 완료 후 URL 파라미터에서 orderId, amount, paymentKey 추출
- 백엔드 API (`/api/payments/confirm`)에 결제 확인 요청
- 결제 성공 시 결제 정보 표시
- 결제 실패 시 fail 페이지로 리다이렉트