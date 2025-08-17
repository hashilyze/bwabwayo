"use client";

import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";
import { X } from 'lucide-react';
import { useMyStore } from '@/stores/mypage/myStore';

// ------  SDK 초기화 ------
// TODO: clientKey는 개발자센터의 API 개별 연동 키 > 결제창 연동에 사용하려할 MID > 클라이언트 키로 바꾸세요.
// TODO: server.js 의 secretKey 또한 결제위젯 연동 키가 아닌 API 개별 연동 키의 시크릿 키로 변경해야 합니다.
// TODO: 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요. 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// @docs https://docs.tosspayments.com/sdk/v2/js#토스페이먼츠-초기화
const clientKey = "test_ck_yL0qZ4G1VOKNp2R5jMxkVoWb2MQY";

interface PaymentCheckoutProps {
  onClose: () => void;
  amount: number;
  orderName: string;
  roomId: number;
  productId: number;
}

type PaymentMethod = "CARD" | "TRANSFER" | "VIRTUAL_ACCOUNT" | "MOBILE_PHONE" | "CULTURE_GIFT_CERTIFICATE" | "FOREIGN_EASY_PAY" | null;

function generateRandomString() {
  if (typeof window === "undefined") return "";
  return window.btoa(Math.random().toString()).slice(0, 20);
}

export function PaymentCheckoutPage({ onClose, amount, orderName, roomId, productId }: PaymentCheckoutProps) {
  const [payment, setPayment] = useState<any>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [customerKey, setCustomerKey] = useState("");
  const { userData, fetchUserData } = useMyStore();

  const paymentAmount = {
    currency: "KRW",
    value: amount,
  };

  function selectPaymentMethod(method: PaymentMethod) {
    setSelectedPaymentMethod(method);
  }

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      setCustomerKey(generateRandomString());
    }
  }, []);

  // 사용자 정보 가져오기
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    async function fetchPayment() {
      if (!customerKey) return;
      
      try {
        const tossPayments = await loadTossPayments(clientKey);

        // 회원 결제
        // @docs https://docs.tosspayments.com/sdk/v2/js#tosspaymentspayment
        const payment = tossPayments.payment({
          customerKey,
        });
        // 비회원 결제
        // const payment = tossPayments.payment({ customerKey: ANONYMOUS });

        setPayment(payment);
      } catch (error) {
        console.error("Error fetching payment:", error);
      }
    }

    fetchPayment();
  }, [clientKey, customerKey]);

  // ------ '결제하기' 버튼 누르면 결제창 띄우기 ------
  // @docs https://docs.tosspayments.com/sdk/v2/js#paymentrequestpayment
  async function requestPayment() {
    if (!payment || !selectedPaymentMethod) return;
    
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
    switch (selectedPaymentMethod) {
      case "CARD":
        await payment.requestPayment({
          method: "CARD", // 카드 및 간편결제
          amount: paymentAmount,
          orderId: generateRandomString(), // 고유 주문번호
          orderName: orderName,
          successUrl: window.location.origin + `${process.env.NEXT_PUBLIC_PUBLIC_URL}/chat/payment?roomId=${roomId}`, // 결제 요청이 성공하면 리다이렉트되는 URL
          failUrl: window.location.origin + "/fail", // 결제 요청이 실패하면 리다이렉트되는 URL
          customerEmail: "customer123@gmail.com",
          customerName: userData?.nickname || "사용자",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          card: {
            useEscrow: false,
            flowMode: "DEFAULT",
            useCardPoint: false,
            useAppCardOnly: false,
          },
        });
        break;
      case "TRANSFER":
        await payment.requestPayment({
          method: "TRANSFER", // 계좌이체 결제
          amount: paymentAmount,
          orderId: generateRandomString(),
          orderName: orderName,
          successUrl: window.location.origin + `${process.env.NEXT_PUBLIC_PUBLIC_URL}/chat/payment?roomId=${roomId}`,
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: userData?.nickname || "사용자",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          transfer: {
            cashReceipt: {
              type: "소득공제",
            },
            useEscrow: false,
          },
        });
        break;
      case "VIRTUAL_ACCOUNT":
        await payment.requestPayment({
          method: "VIRTUAL_ACCOUNT", // 가상계좌 결제
          amount: paymentAmount,
          orderId: generateRandomString(),
          orderName: orderName,
          successUrl: window.location.origin + `${process.env.NEXT_PUBLIC_PUBLIC_URL}/chat/payment?roomId=${roomId}`,
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: userData?.nickname || "사용자",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          virtualAccount: {
            cashReceipt: {
              type: "소득공제",
            },
            useEscrow: false,
            validHours: 24,
          },
        });
        break;
      case "MOBILE_PHONE":
        await payment.requestPayment({
          method: "MOBILE_PHONE", // 휴대폰 결제
          amount: paymentAmount,
          orderId: generateRandomString(),
          orderName: orderName,
          successUrl: window.location.origin + `${process.env.NEXT_PUBLIC_PUBLIC_URL}/chat/payment?roomId=${roomId}`,
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: userData?.nickname || "사용자",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
        });
        break;
      case "CULTURE_GIFT_CERTIFICATE":
        await payment.requestPayment({
          method: "CULTURE_GIFT_CERTIFICATE", // 문화상품권 결제
          amount: paymentAmount,
          orderId: generateRandomString(),
          orderName: orderName,
          successUrl: window.location.origin + `${process.env.NEXT_PUBLIC_PUBLIC_URL}/chat/payment?roomId=${roomId}`,
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: userData?.nickname || "사용자",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
        });
        break;
      case "FOREIGN_EASY_PAY":
        await payment.requestPayment({
          method: "FOREIGN_EASY_PAY", // 해외 간편결제
          amount: {
            value: 100,
            currency: "USD",
          },
          orderId: generateRandomString(),
          orderName: orderName,
          successUrl: window.location.origin + `${process.env.NEXT_PUBLIC_PUBLIC_URL}/chat/payment?roomId=${roomId}`,
          failUrl: window.location.origin + "/fail",
          customerEmail: "customer123@gmail.com",
          customerName: userData?.nickname || "사용자",
          // 가상계좌 안내, 퀵계좌이체 휴대폰 번호 자동 완성에 사용되는 값입니다. 필요하다면 주석을 해제해 주세요.
          // customerMobilePhone: "01012341234",
          foreignEasyPay: {
            provider: "PAYPAL", // PayPal 결제
            country: "KR",
          },
        });
        break;
    }
  }

  // async function requestBillingAuth() {
  //   if (!payment) return;
    
  //   await payment.requestBillingAuth({
  //     method: "CARD", // 자동결제(빌링)은 카드만 지원합니다
  //     successUrl: window.location.origin + "/payment/billing", // 요청이 성공하면 리다이렉트되는 URL
  //     failUrl: window.location.origin + "/fail", // 요청이 실패하면 리다이렉트되는 URL
  //     customerEmail: "customer123@gmail.com",
  //     customerName: userData?.nickname || "사용자",
  //   });
  // }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="border-2 border-black bg-white w-[600px] max-h-[90vh] relative rounded-[10px] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute w-6 h-6 top-8 right-8 items-center justify-center"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8">
          {/* 일반 결제 섹션 */}
          <div className="text-center">
            <div className="flex flex-col items-center justify-center gap-2 mb-4">
              <h1 className="text-2xl font-semibold">일반 결제</h1>
              <p className="text-md font-semibold">결제 금액: {amount.toLocaleString()}원</p>
            </div>
            
            {/* 결제 방법 선택 */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              <button
                id="CARD"
                className={`text-[15px] font-semibold px-4 py-[11px] rounded-[7px] border transition-all duration-200 ${
                  selectedPaymentMethod === "CARD" 
                    ? "bg-[#e5efff] border-[#3182f6] text-[#3182f6]" 
                    : "bg-white border-black text-black hover:bg-gray-50"
                }`}
                onClick={() => selectPaymentMethod("CARD")}
              >
                카드
              </button>
              <button
                id="TRANSFER"
                className={`text-[15px] font-semibold px-4 py-[11px] rounded-[7px] border transition-all duration-200 ${
                  selectedPaymentMethod === "TRANSFER" 
                    ? "bg-[#e5efff] border-[#3182f6] text-[#3182f6]" 
                    : "bg-white border-black text-black hover:bg-gray-50"
                }`}
                onClick={() => selectPaymentMethod("TRANSFER")}
              >
                계좌이체
              </button>
              <button
                id="VIRTUAL_ACCOUNT"
                className={`text-[15px] font-semibold px-4 py-[11px] rounded-[7px] border transition-all duration-200 ${
                  selectedPaymentMethod === "VIRTUAL_ACCOUNT" 
                    ? "bg-[#e5efff] border-[#3182f6] text-[#3182f6]" 
                    : "bg-white border-black text-black hover:bg-gray-50"
                }`}
                onClick={() => selectPaymentMethod("VIRTUAL_ACCOUNT")}
              >
                가상계좌
              </button>
              <button
                id="MOBILE_PHONE"
                className={`text-[15px] font-semibold px-4 py-[11px] rounded-[7px] border transition-all duration-200 ${
                  selectedPaymentMethod === "MOBILE_PHONE" 
                    ? "bg-[#e5efff] border-[#3182f6] text-[#3182f6]" 
                    : "bg-white border-black text-black hover:bg-gray-50"
                }`}
                onClick={() => selectPaymentMethod("MOBILE_PHONE")}
              >
                휴대폰
              </button>
              <button
                id="CULTURE_GIFT_CERTIFICATE"
                className={`text-[15px] font-semibold px-4 py-[11px] rounded-[7px] border transition-all duration-200 ${
                  selectedPaymentMethod === "CULTURE_GIFT_CERTIFICATE" 
                    ? "bg-[#e5efff] border-[#3182f6] text-[#3182f6]" 
                    : "bg-white border-black text-black hover:bg-gray-50"
                }`}
                onClick={() => selectPaymentMethod("CULTURE_GIFT_CERTIFICATE")}
              >
                문화상품권
              </button>
              <button
                id="FOREIGN_EASY_PAY"
                className={`text-[15px] font-semibold px-4 py-[11px] rounded-[7px] border transition-all duration-200 ${
                  selectedPaymentMethod === "FOREIGN_EASY_PAY" 
                    ? "bg-[#e5efff] border-[#3182f6] text-[#3182f6]" 
                    : "bg-white border-black text-black hover:bg-gray-50"
                }`}
                onClick={() => selectPaymentMethod("FOREIGN_EASY_PAY")}
              >
                해외간편결제
              </button>
            </div>
            
            {/* 결제하기 버튼 */}
            <button 
              className="font-semibold text-black w-[121px] h-[41px] top-[150px] left-[336px] bg-[#ffae00] rounded-[30px] border-2 border-black transition-transform hover:scale-105"
              onClick={() => requestPayment()}
              disabled={!selectedPaymentMethod}
            >
              결제하기
            </button>
          </div>

          {/* 정기 결제 섹션 */}
          {/* <div className="text-center mt-[30px] pt-[30px] border-t border-[#e5e8eb]">
            <h1 className="text-[24px] font-semibold text-[#4e5968] mb-4">정기 결제</h1>
            <button 
              className="bg-[#3182f6] text-[#f9fafb] font-semibold text-[15px] px-4 py-[11px] rounded-[7px] border-0 cursor-pointer transition-all duration-200 hover:bg-[#1b64da] w-[250px]"
              onClick={() => requestBillingAuth()}
            >
              빌링키 발급하기
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
}