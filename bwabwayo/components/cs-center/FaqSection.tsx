import { useState } from "react";

interface FaqItem {
    id: number;
    category: string;
    question: string;
    answer: string;
}

const faqData: FaqItem[] = [    
    { id: 1, category: '이용문의', question: '상품 등록은 어떻게 하나요?', answer: '로그인 후, 메인 페이지의 "상품 판매하기" 버튼을 통해 상품을 등록할 수 있습니다.' },
    { id: 2, category: '거래', question: '거래는 어떻게 이루어지나요?', answer: '구매자가 거래를 시작하면 판매자와의 채팅방이 열립니다.' },
    { id: 3, category: '계정', question: '비밀번호를 변경하고 싶어요?', answer: '마이페이지의 "내 정보 수정" 메뉴에서 비밀번호를 변경할 수 있습니다.' },
];

export const FaqSection = () => {
    const [openId, setOpenId] = useState<number | null>(null);
    
    return (
      <div>
        {faqData.map(item => (
          <div key={item.id} className="border-b">
            <button 
              onClick={() => setOpenId(openId === item.id ? null : item.id)} 
              className="w-full flex justify-between items-center py-4 text-left"
            >
              <span className="text-sm font-medium text-gray-800">{item.question}</span>
              <svg 
                className={`w-4 h-4 transform transition-transform ${openId === item.id ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openId === item.id && <div className="text-sm text-gray-500 pb-4">{item.answer}</div>}
          </div>
        ))}
      </div>
    );
  };