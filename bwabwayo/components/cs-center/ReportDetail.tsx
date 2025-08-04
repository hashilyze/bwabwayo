// components/cs-center/ReportDetail.tsx
'use client';

import React from 'react';
import type { Report } from '@/stores/cs-store/reportStore';

interface ReportDetailProps {
  report: Report;
  onBack: () => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack }) => {
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
        <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>신고일: {formatDate(report.createdAt)}</span>
          {report.repliedAt ? (
            <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
              처리완료
            </span>
          ) : (
            <span className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
              처리대기
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">신고 내용</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{report.description}</p>
        </div>

        {report.images && report.images.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">첨부 이미지</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {report.images.map((image, index) => (
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

        {/* 답변이 있을 경우에만 처리 결과 섹션을 렌더링합니다. */}
        {/* {report.reply && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">처리 결과</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{report.reply}</p>
            {report.repliedAt && (
              <p className="text-right text-xs text-gray-400 mt-4">
                처리일: {formatDate(report.repliedAt)}
              </p>
            )}
          </div>
        )} */}
      </div>

      <div className="mt-8 flex justify-end">
        <button onClick={onBack} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
          목록으로
        </button>
      </div>
    </div>
  );
};

export default ReportDetail;
