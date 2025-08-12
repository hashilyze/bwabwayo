'use client';

import { useInquiryStore } from "@/stores/cs-store/inquiryStore";
import { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination";

export const InquirySection = () => {
    const { inquiries, loading, error, getInquiries, totalPages, currentPage } = useInquiryStore();
    
    const [currentPageState, setCurrentPageState] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        getInquiries(currentPageState - 1, pageSize); // API는 0-based index를 사용
    }, [currentPageState]);

    const handlePageChange = (page: number) => {
        setCurrentPageState(page);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\. /g, '.').replace('.', '');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500">오류가 발생했습니다: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-0">
            {inquiries.length === 0 ? (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">문의 내역이 없습니다.</p>
                </div>
            ) : (
                inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="border-b border-[#EEEEEE] h-[136px] flex items-center">
                        <div className="flex justify-between items-center w-full px-[33px]">
                            {/* 왼쪽: 문의 내용 */}
                            <div className="flex-1">
                                <div className="space-y-2">
                                    {/* 상태 태그 */}
                                    <div className="inline-block">
                                        <div className={`px-3 py-1 text-xs font-light rounded-[15px] ${
                                            inquiry.reply 
                                                ? 'bg-[#FCE94F] text-[#998800]' // 답변완료: 노란색 배경, 진한 노란색 텍스트
                                                : 'bg-[#EEEEEE] text-[#7C7C7C]' // 답변대기: 회색 배경, 회색 텍스트
                                        }`}>
                                            {inquiry.reply ? '답변완료' : '답변대기'}
                                        </div>
                                    </div>
                                    {/* 제목 */}
                                    <div className="text-base text-[#191C21] font-medium">
                                        {inquiry.title}
                                    </div>
                                    {/* 날짜 */}
                                    <div className="text-xs text-[#7C7C7C] font-medium">
                                        {formatDate(inquiry.createdAt)}
                                    </div>
                                </div>
                            </div>
                            
                            {/* 오른쪽: 화살표 아이콘 */}
                            <div className="w-[17px] h-[17px]">
                                <svg 
                                    className="w-[17px] h-[17px] text-gray-400" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                ))
            )}
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        currentPage={currentPageState}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
};
