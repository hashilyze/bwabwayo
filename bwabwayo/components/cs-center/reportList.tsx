// components/cs-center/ReportList.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useReportStore } from '@/stores/cs-store/reportStore';
import type { Report } from '@/stores/cs-store/reportStore';
import ReportDetail from '@/components/cs-center/ReportDetail';

const ReportList = () => {
  // 1. reportStore에서 상태와 액션을 가져옵니다.
  const { reports, loading, error, getReports } = useReportStore();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const formatDateSimple = (dateString: string) => {
    if (!dateString) return '';
    const parsableDateString = dateString.replace(' ', 'T');
    return new Date(parsableDateString).toLocaleDateString('ko-KR');
  };

  // 2. 컴포넌트가 마운트될 때 getReports 액션을 호출하여 데이터를 가져옵니다.
  useEffect(() => {
    // 상세 보기에서 목록으로 돌아왔을 때는 목록을 새로고침하지 않습니다.
    if (!selectedReport) {
      getReports();
    }
  }, [getReports, selectedReport]);

  if (selectedReport) {
    return <ReportDetail report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  // 3. 로딩 상태에 따른 UI 처리
  if (loading) {
    return <div className="text-center py-10">신고 내역을 불러오는 중입니다...</div>;
  }

  // 4. 에러 상태에 따른 UI 처리
  if (error) {
    return <div className="text-center py-10 text-red-500">오류가 발생했습니다: {error}</div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">나의 신고 내역</h2>
      {reports.length === 0 ? (
        <div className="text-center text-gray-500 py-10">작성한 신고 내역이 없습니다.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {/* 5. 조회된 신고 목록을 순회하며 렌더링합니다. */}
          {reports.map((report) => (
            <li
              key={report.id}
              className="py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex items-center space-x-4">
                {/* 6. repliedAt 값에 따라 '처리완료' 또는 '처리대기' 배지를 표시합니다. */}
                {report.repliedAt ? (
                  <span className="px-2.5 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                    처리완료
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">
                    처리대기
                  </span>
                )}
                <p className="text-lg font-medium text-gray-900 truncate">{report.title}</p>
              </div>
              <p className="text-sm text-gray-500">{formatDateSimple(report.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportList;
