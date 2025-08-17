"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const jwtToken =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzM4NCJ9.eyJzdWIiOiI0Mzc1MTI2ODM0Iiwicm9sZSI6IlVTRVIiLCJ0b2tlblR5cGUiOiJhY2Nlc3MiLCJpYXQiOjE3NTQzMjk4OTEsImV4cCI6MzMyNDY3OTM4OTF9.Ri8aEdsV2_37aZ9As4npi_kBvWv0ccQlUzyKweE4B-opos4h-4Ceb7OO4LQUFJp7";

export function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [responseData, setResponseData] = useState(null);

  useEffect(() => {
    async function confirm() {
      const requestData = {
        orderId: searchParams.get("orderId"),
        amount: searchParams.get("amount"),
        paymentKey: searchParams.get("paymentKey"),
        roomId: searchParams.get("roomId"),
      };

      // https://i13e202.p.ssafy.io/be/api/payments/confirm
      // http://localhost:8081/api/payments/confirm
      // /api/confirm/payment
      const response = await fetch("https://i13e202.p.ssafy.io/be/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(requestData),
      });

      const json = await response.json();
      console.log(json);
      if (!response.ok) {
        throw { message: json.message, code: json.code };
      }

      return json;
    }

    confirm()
      .then((data) => {
        setResponseData(data);

        setTimeout(() => {
          router.push(`/chat/${searchParams.get("roomId")}`);
        }, 1000);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [searchParams, router]);

  return (
    <div className="font-['Toss_Product_Sans',-apple-system,BlinkMacSystemFont,'Bazier_Square','Noto_Sans_KR','Segoe_UI','Apple_SD_Gothic_Neo',Roboto,'Helvetica_Neue',Arial,sans-serif]">
      <div className="max-w-[800px] mx-auto pt-8">
        {/* 성공 메시지 섹션 */}
        <div className="bg-white rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.01),0_6px_6px_rgba(0,0,0,0.06)] p-[50px] mt-[30px] text-center">
          <img 
            width="100" 
            src="https://static.toss.im/illusts/check-blue-spot-ending-frame.png" 
            alt="결제 완료"
            className="mx-auto mb-4"
          />
          <h2 className="text-[24px] font-semibold text-[#4e5968] mb-0">결제를 완료했어요</h2>
          <p className="text-[16px] text-[#6b7684] mt-2">잠시 후 창이 자동으로 닫힙니다.</p>
          
          <div className="mt-[50px] space-y-[10px]">
            <div className="flex justify-between items-center">
              <div className="text-left font-semibold text-[#4e5968]">결제금액</div>
              <div className="text-right text-[#4e5968]">
                {`${Number(searchParams.get("amount")).toLocaleString()}원`}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-left font-semibold text-[#4e5968]">주문번호</div>
              <div className="text-right text-[#4e5968]">
                {`${searchParams.get("orderId")}`}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div className="text-left font-semibold text-[#4e5968]">paymentKey</div>
              <div className="text-right text-[#4e5968] break-all max-w-[250px]">
                {`${searchParams.get("paymentKey")}`}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <Link href="https://docs.tosspayments.com/guides/v2/payment-widget/integration">
              <button className="bg-[#3182f6] text-[#f9fafb] font-semibold text-[15px] px-4 py-[11px] rounded-[7px] border-0 cursor-pointer transition-all duration-200 hover:bg-[#1b64da] w-[250px]">
                연동 문서
              </button>
            </Link>
            <Link href="https://discord.gg/A4fRFXQhRu">
              <button className="bg-[#e8f3ff] text-[#1b64da] font-semibold text-[15px] px-4 py-[11px] rounded-[7px] border-0 cursor-pointer transition-all duration-200 w-[250px]">
                실시간 문의
              </button>
            </Link>
          </div>
        </div>

        {/* Response Data 섹션 */}
        <div className="bg-white rounded-[10px] shadow-[0_10px_20px_rgba(0,0,0,0.01),0_6px_6px_rgba(0,0,0,0.06)] p-[50px] mt-[30px] text-left">
          <div className="font-semibold text-[#4e5968] mb-4">Response Data :</div>
          <div className="bg-[#f2f4f6] p-4 rounded-[6px] break-all">
            {responseData && (
              <pre className="text-[13px] text-[#4e5968] whitespace-pre-wrap">
                {JSON.stringify(responseData, null, 4)}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}