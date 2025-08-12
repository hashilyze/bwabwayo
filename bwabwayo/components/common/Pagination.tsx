'use client';

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageRangeDisplayed?: number; // ✨ 한 번에 보여줄 페이지 번호 개수 (옵션)
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageRangeDisplayed = 5 // ✨ 기본값 5로 설정
}) => {
  if (totalPages <= 1) {
    return null;
  }

  // --- 슬라이딩 윈도우 로직 ---
  const getPageNumbers = () => {
    const halfRange = Math.floor(pageRangeDisplayed / 2);
    let startPage = currentPage - halfRange;
    let endPage = currentPage + halfRange;

    if (pageRangeDisplayed % 2 === 0) {
      endPage = currentPage + halfRange - 1;
    }

    if (startPage < 1) {
      startPage = 1;
      endPage = Math.min(pageRangeDisplayed, totalPages);
    }

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, totalPages - pageRangeDisplayed + 1);
    }

    return Array.from({ length: (endPage - startPage + 1) }, (_, i) => startPage + i);
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex justify-center items-center mt-8 space-x-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        이전
      </button>

      <div className="flex items-center space-x-2">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              currentPage === number
                ? 'bg-[#ffae00] text-white font-bold border border-[#ffae00]' // 활성 페이지 스타일
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            {number}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 text-gray-700 bg-white border rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        다음
      </button>
    </div>
  );
};

export default Pagination;
