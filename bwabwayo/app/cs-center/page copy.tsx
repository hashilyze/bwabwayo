'use client';

import React, { useState } from 'react';
import InquiryForm from '@/components/cs-center/InquiryForm';
import InquiryList from '@/components/cs-center/InquiryList';
import ReportForm from '@/components/cs-center/ReportForm';
import ReportList from '@/components/cs-center/reportList';

// --- 타입 정의 ---
type Tab = 'inquiry' | 'report' | 'faq';

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

const InquirySection = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <InquiryForm onBack={() => setShowForm(false)} />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-gray-800">문의하기</button>
      </div>
      <InquiryList />
    </>
  );
};

const ReportSection = () => {
  const [showForm, setShowForm] = useState(false);

  if (showForm) {
    return <ReportForm onBack={() => setShowForm(false)} />;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(true)} className="px-4 py-2 text-sm text-white bg-black rounded hover:bg-gray-800">신고하기</button>
      </div>
      <ReportList />
    </>
  );
};

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