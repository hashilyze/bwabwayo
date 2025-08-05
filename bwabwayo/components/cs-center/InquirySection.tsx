'use client';

import { InquiryForm } from "@/components/cs-center/InquiryForm";
import { useInquiryStore } from "@/stores/cs-store/inquiryStore";
import { useEffect, useState } from "react";

export const InquirySection = () => {
    const { inquiries, loading, error, getInquiries, totalPages, currentPage } = useInquiryStore();
    
    const [currentPageState, setCurrentPageState] = useState(0);
    const [openInquiryId, setOpenInquiryId] = useState<number | null>(null);
    const pageSize = 10;

    useEffect(() => {
        getInquiries(currentPageState, pageSize);
    }, [currentPageState]);

    const handlePageChange = (page: number) => {
        setCurrentPageState(page);
        setOpenInquiryId(null); // 페이지 변경 시 열린 탭 닫기
    };

    const handleInquiryToggle = (inquiryId: number) => {
        setOpenInquiryId(openInquiryId === inquiryId ? null : inquiryId);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        // 이전 페이지 버튼
        if (currentPage > 0) {
            pages.push(
                <button
                    key="prev"
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50"
                >
                    이전
                </button>
            );
        }

        // 페이지 번호들
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border ${
                        i === currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    {i + 1}
                </button>
            );
        }

        // 다음 페이지 버튼
        if (currentPage < totalPages - 1) {
            pages.push(
                <button
                    key="next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                    다음
                </button>
            );
        }

        return pages;
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
        <div className="min-h-screen">
            <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* 헤더 */}
                <div className="mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">문의 내역</h2>
                    <p className="text-gray-600">고객님의 문의사항과 답변을 확인하실 수 있습니다.</p>
                </div>

                <InquiryForm />

                {/* 문의 목록 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <ul className="divide-y divide-gray-200">
                    {inquiries.length === 0 ? (
                        <li className="px-6 py-12 text-center">
                            <div className="text-gray-400 mb-2">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-sm">문의 내역이 없습니다.</p>
                        </li>
                    ) : (
                        inquiries.map((inquiry) => (
                            <li key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                                <div 
                                    className="title-wrap cursor-pointer px-6 py-4 flex justify-between items-center"
                                    onClick={() => handleInquiryToggle(inquiry.id)}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                                inquiry.reply 
                                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                            }`}>
                                                {inquiry.reply ? '답변완료' : '답변대기'}
                                            </span>
                                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                                                {inquiry.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {new Date(inquiry.createdAt).toLocaleDateString('ko-KR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center">
                                        <svg 
                                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                                openInquiryId === inquiry.id ? 'rotate-180' : ''
                                            }`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                
                                {openInquiryId === inquiry.id && (
                                    <div className="hide-wrap px-6 pb-4 bg-gray-50 border-t border-gray-100">
                                        <div className="space-y-4">
                                            {/* 문의 내용 */}
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 mb-2">문의 내용</h4>
                                                <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-200">
                                                    {inquiry.description}
                                                </div>
                                            </div>
                                            
                                            {/* 이미지가 있는 경우 */}
                                            {inquiry.images.length > 0 && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">첨부 이미지</h4>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {inquiry.images.map((image, index) => (
                                                            <img 
                                                                key={index}
                                                                src={image.imageUrl} 
                                                                alt="inquiry-image" 
                                                                className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                                                                onClick={() => window.open(image.imageUrl, '_blank')}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* 답변이 있는 경우 */}
                                            {inquiry.reply && (
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">답변</h4>
                                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                        <div className="text-sm text-gray-800 mb-2">
                                                            {inquiry.reply}
                                                        </div>
                                                        <div className="text-xs text-blue-600">
                                                            {inquiry.repliedAt && new Date(inquiry.repliedAt).toLocaleDateString('ko-KR', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>
            
                {/* 페이지네이션 */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center space-x-1 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                            {renderPagination()}
                        </nav>
                    </div>
                )}
            </main>
        </div>
    );
};
