'use client';

import { InquirySection } from '@/components/cs-center/InquirySection';
import { ReportSection } from '@/components/cs-center/ReportSection';
import { FaqSection } from '@/components/cs-center/FaqSection';
import { InquiryModal } from '@/components/cs-center/modals/InquiryModal';
import { useState } from 'react';

type Tab = 'faq' | 'inquiry' | 'report';

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState<Tab>('faq');
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
  const [isFaqDetailOpen, setIsFaqDetailOpen] = useState(false);
  const tabs = [
    { id: 'faq', label: '자주묻는질문' },
    { id: 'inquiry', label: '문의내역' },
    { id: 'report', label: '신고내역' },
  ];

  const handleFaqDetailOpen = () => {
    setIsFaqDetailOpen(true);
  };

  const handleFaqDetailClose = () => {
    setIsFaqDetailOpen(false);
  };

  return (
    <div className="min-h-screen max-w-[1280px] mx-auto px-4 py-10">
      {/* 헤더 섹션 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">고객센터</h1>
        <button 
          onClick={() => setIsInquiryModalOpen(true)}
          className="bg-[#FFAE00] hover:bg-[#FF9500] text-black font-bold py-2 px-4 rounded-[20px] border-[1.5px] border-black transition-colors"
        >
          문의하기
        </button>
      </div>

      {/* 탭 네비게이션 - FAQ 상세가 열려있지 않을 때만 표시 */}
      {!isFaqDetailOpen && (
        <div className="mb-8">
          <div className="border-b-2 border-gray-200 mb-2"></div>
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 py-3 text-lg font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-black'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          <div className="border-b-2 border-gray-200 mt-2"></div>
        </div>
      )}

      {/* 컨텐츠 섹션 */}
      <section className="mb-24">
        {activeTab === 'faq' && (
          <FaqSection 
            onFaqDetailOpen={handleFaqDetailOpen}
            onFaqDetailClose={handleFaqDetailClose}
            isDetailOpen={isFaqDetailOpen}
          />
        )}
        {activeTab === 'inquiry' && <InquirySection />}
        {activeTab === 'report' && <ReportSection />}
      </section>

      {/* 1:1 문의하기 모달 */}
      <InquiryModal 
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
      />
    </div>
  );
}