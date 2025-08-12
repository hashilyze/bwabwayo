import { useState } from "react";

interface FaqItem {
    id: number;
    question: string;
}

const faqData: FaqItem[] = [    
    { id: 1, question: '거래를 하면 안 되는 것들은 어떤 것이 있나요?' },
    { id: 2, question: '물건을 판매했는데 판매대금은 언제 입금되나요?' },
    { id: 3, question: '사기꾼의 주요 사기패턴과 유형이 궁금해요.' },
    { id: 4, question: '사기를 당하면 어떻게 처리해야 되나요?' },
    { id: 5, question: '구매할 때 결제 수수료는 어떻게 되나요?' },
    { id: 6, question: '포인트를 얻는 방법이 궁금해요.' },
    { id: 7, question: '신뢰도에 대해 궁금해요' },
    { id: 8, question: '회원탈퇴 후 재가입을 할 수 있나요?' },
    { id: 9, question: '회원정보 변경은 어디에서 하나요?' },
    { id: 10, question: '실수로 배송완료 전에 구매확정을 먼저 눌렀어요.' },
];

export const FaqSection = () => {
    return (
      <div className="space-y-0">
        {faqData.map((item, index) => (
          <div key={item.id} className={`border-b border-[#FAFAFA] ${index === faqData.length - 1 ? '' : 'border-b'}`}>
            <div className="flex justify-between items-center py-5 px-8">
              <span className="text-base font-medium text-[#191C21] flex-1">
                {item.question}
              </span>
              <div className="w-3 h-3 ml-4">
                <svg 
                  className="w-3 h-3 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };