// components/cs-center/InquiryList.tsx

'use client';

import React, { useEffect } from 'react';
import { useInquiryStore } from '@/stores/cs-store/inquiryStore';

const InquiryList = () => {
  // 1. inquiryStore에서 상태와 액션을 가져옵니다.
  const { inquiries, loading, error, getInquiries } = useInquiryStore();

  // 2. 컴포넌트가 마운트될 때 getInquiries 액션을 호출하여 데이터를 가져옵니다.
  useEffect(() => {
    getInquiries();
  }, [getInquiries]);

  // 3. 로딩 상태에 따른 UI 처리
  if (loading) {
    return <div className="text-center py-10">문의 내역을 불러오는 중입니다...</div>;
  }

  // 4. 에러 상태에 따른 UI 처리
  if (error) {
    return <div className="text-center py-10 text-red-500">오류가 발생했습니다: {error}</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">나의 문의 내역</h2>
      {inquiries.length === 0 ? (
        <div className="text-center text-gray-500 py-10">작성한 문의 내역이 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {/* 5. 조회된 문의 목록을 순회하며 렌더링합니다. */}
          {inquiries.map((inquiry) => (
            <li key={inquiry.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* 6. repliedAt 값에 따라 '답변완료' 또는 '답변대기' 배지를 표시합니다. */}
                {inquiry.repliedAt ? (
                  <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                    답변완료
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                    답변대기
                  </span>
                )}
                <p className="text-lg font-medium text-gray-900 truncate">{inquiry.title}</p>
              </div>
              <p className="text-sm text-gray-500">
                {/* 7. createdAt 날짜를 보기 좋은 형식으로 표시합니다. */}
                {new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default InquiryList;
