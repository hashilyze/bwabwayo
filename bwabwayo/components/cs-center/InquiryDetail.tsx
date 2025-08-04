// components/cs-center/InquiryDetail.tsx
'use client';

import React from 'react';
import type { Inquiry } from '@/stores/cs-store/inquiryStore';

interface InquiryDetailProps {
  inquiry: Inquiry;
  onBack: () => void;
}

const InquiryDetail: React.FC<InquiryDetailProps> = ({ inquiry, onBack }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    // DB와 클라이언트의 날짜 형식을 모두 안정적으로 파싱하기 위해 공백을 'T'로 바꿉니다.
    const parsableDateString = dateString.replace(' ', 'T');
    return new Date(parsableDateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{inquiry.title}</h2>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>문의일: {formatDate(inquiry.createdAt)}</span>
          {inquiry.repliedAt ? (
            <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              답변완료
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
              답변대기
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">문의 내용</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{inquiry.description}</p>
        </div>

        {inquiry.images && inquiry.images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">첨부 이미지</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {inquiry.images.map((image, index) => (
                <img
                  key={index}
                  src={image.imageUrl}
                  alt={`첨부 이미지 ${index + 1}`}
                  className="w-full h-auto object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">답변 내용</h3>
          {inquiry.reply ? (
            <p className="text-gray-700 whitespace-pre-wrap">{inquiry.reply}</p>
          ) : (
            <p className="text-gray-500">아직 답변이 등록되지 않았습니다.</p>
          )}
          {inquiry.repliedAt && (
            <p className="text-right text-xs text-gray-400 mt-4">답변일: {formatDate(inquiry.repliedAt)}</p>
          )}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
          목록으로
        </button>
      </div>
    </div>
  );
};

export default InquiryDetail;
