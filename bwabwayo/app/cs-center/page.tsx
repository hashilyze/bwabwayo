'use client';

import { InquirySection } from '@/components/cs-center/InquirySection';
import { ReportSection } from '@/components/cs-center/ReportSection';
import { FaqSection } from '@/components/cs-center/FaqSection';
import { useState } from 'react';

type Tab = 'inquiry' | 'report' | 'faq';

export default function CustomerServicePage() {
  const [activeTab, setActiveTab] = useState<Tab>('inquiry');
  const tabs = [
    { id: 'inquiry', label: '문의 내역' },
    { id: 'report', label: '신고 내역' },
    { id: 'faq', label: '자주 묻는 질문' },
  ];

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">고객센터</h1>

      <div>
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
      </div>

    </div>
  );
}