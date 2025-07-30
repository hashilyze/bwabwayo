'use client';

import React, { useState } from 'react';

// --- 타입 정의 ---
type Tab = 'inquiry' | 'report' | 'faq';

interface Inquiry {
  id: number;
  category: string;
  title: string;
  date: string;
  status: '답변 대기' | '답변 완료';
  isSecret: boolean;
}

interface Report {
  id: number;
  category: string;
  title: string;
  date: string;
  status: '처리 대기' | '처리 완료';
  isSecret: boolean;
}

interface FaqItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

const inquiryData: Inquiry[] = [
  { id: 1, category: '상품 문의', title: '팝마트 라부부 코카콜라 시리즈 재고 있나요?', date: '2023-10-26', status: '답변 완료', isSecret: false },
  { id: 2, category: '계정 문의', title: '비밀번호를 잊어버렸습니다.', date: '2023-10-25', status: '답변 완료', isSecret: true },
  { id: 3, category: '거래 문의', title: '거래 확정이 안돼요.', date: '2023-10-24', status: '답변 대기', isSecret: false },
];

const reportData: Report[] = [
  { id: 1, category: '부적절한 상품', title: '허위 매물인 것 같습니다.', date: '2023-11-01', status: '처리 완료', isSecret: false },
  { id: 2, category: '사용자 신고', title: '비매너 사용자를 신고합니다.', date: '2023-10-30', status: '처리 대기', isSecret: true },
];

const faqData: FaqItem[] = [
  { id: 1, category: '이용문의', question: '상품 등록은 어떻게 하나요?', answer: '로그인 후, 메인 페이지의 "상품 판매하기" 버튼을 통해 상품을 등록할 수 있습니다.' },
  { id: 2, category: '거래', question: '거래는 어떻게 이루어지나요?', answer: '구매자가 거래를 시작하면 판매자와의 채팅방이 열립니다.' },
  { id: 3, category: '계정', question: '비밀번호를 변경하고 싶어요?', answer: '마이페이지의 "내 정보 수정" 메뉴에서 비밀번호를 변경할 수 있습니다.' },
];

const LockClosedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400 mr-1">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

const ListItem: React.FC<{ item: Inquiry | Report }> = ({ item }) => {
  return (
    <li className="flex justify-between items-center py-4 border-b">
      <div className="flex items-center text-sm text-gray-800 truncate">
        {item.isSecret && <LockClosedIcon />}
        <span className="truncate max-w-xs">{item.isSecret ? '비밀글입니다.' : item.title}</span>
      </div>
      <div className="flex-shrink-0 text-xs text-gray-400">{item.date}</div>
    </li>
  );
};

const FaqAccordionItem: React.FC<{ item: FaqItem; isOpen: boolean; onClick: () => void }> = ({ item, isOpen, onClick }) => (
  <div className="border-b">
    <button onClick={onClick} className="w-full flex justify-between items-center py-4 text-left">
      <span className="text-sm font-medium text-gray-800">{item.question}</span>
      <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    {isOpen && <div className="text-sm text-gray-500 pb-4">{item.answer}</div>}
  </div>
);

const InquirySection = () => (
  <>
    <div className="flex justify-end mb-4">
      <button className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-gray-800">문의하기</button>
    </div>
    <ul>
      {inquiryData.map(item => <ListItem key={item.id} item={item} />)}
    </ul>
  </>
);

const ReportSection = () => (
  <>
    <div className="flex justify-end mb-4">
      <button className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-gray-800">신고하기</button>
    </div>
    <ul>
      {reportData.map(item => <ListItem key={item.id} item={item} />)}
    </ul>
  </>
);

const FaqSection = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  return (
    <div>
      {faqData.map(item => (
        <FaqAccordionItem
          key={item.id}
          item={item}
          isOpen={openId === item.id}
          onClick={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
};

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState<Tab>('inquiry');
  const tabs = [
    { id: 'inquiry', label: '문의 내역' },
    { id: 'report', label: '신고 내역' },
    { id: 'faq', label: '자주 묻는 질문' },
  ];

  return (
    <main className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">고객센터</h1>

      <nav className="flex border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section>
        {activeTab === 'inquiry' && <InquirySection />}
        {activeTab === 'report' && <ReportSection />}
        {activeTab === 'faq' && <FaqSection />}
      </section>
    </main>
  );
}