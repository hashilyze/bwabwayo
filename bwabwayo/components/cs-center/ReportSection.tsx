'use client';

import { useReportStore } from "@/stores/cs-store/reportStore";
import { useEffect, useState } from "react";
import Pagination from "@/components/common/Pagination";
import { OverlayPortal } from "@/components/chat/modals/OverlayPortal";

interface ImageModalContentProps {
    images: string[];
    currentIndex: number;
    onClose: () => void;
    onNext: () => void;
    onPrev: () => void;
}

const ImageModalContent = ({ images, currentIndex, onClose, onNext, onPrev }: ImageModalContentProps) => {
    // 키보드 이벤트 처리
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                onPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                onNext();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onPrev, onNext, onClose]);

    return (
        <div className="relative max-w-4xl max-h-[90vh] p-4">
            {/* 이미지 - 애니메이션 추가 */}
            <div className="transition-all duration-300 ease-in-out">
                <img 
                    src={images[currentIndex]} 
                    alt={`이미지 ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                    key={currentIndex} // 키 변경으로 애니메이션 트리거
                />
            </div>
            
            {/* 네비게이션 화살표 - 화면 좌우에서 10% 간격으로 고정 */}
            {images.length > 1 && (
                <>
                    <button 
                        onClick={onPrev}
                        className={`fixed left-[10%] top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 w-24 h-24 flex items-center justify-center transition-all duration-200 z-50 ${
                            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                        }`}
                        disabled={currentIndex === 0}
                    >
                        <svg 
                            className="w-20 h-20" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                    <button 
                        onClick={onNext}
                        className={`fixed right-[10%] top-1/2 transform -translate-y-1/2 text-black hover:text-gray-700 w-24 h-24 flex items-center justify-center transition-all duration-200 z-50 ${
                            currentIndex === images.length - 1 ? 'opacity-30 cursor-not-allowed' : 'opacity-100'
                        }`}
                        disabled={currentIndex === images.length - 1}
                    >
                        <svg 
                            className="w-20 h-20" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                        </svg>
                    </button>
                </>
            )}
            
            {/* 이미지 인덱스 표시 - 화면 하단에 고정 */}
            <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm z-10">
                {currentIndex + 1} / {images.length}
            </div>
        </div>
    );
};

export const ReportSection = () => {
    const { reports, loading, error, getReports, totalPages, currentPage } = useReportStore();
    
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [imageModal, setImageModal] = useState<{
        isOpen: boolean;
        images: string[];
        currentIndex: number;
    }>({
        isOpen: false,
        images: [],
        currentIndex: 0
    });
    const [currentPageState, setCurrentPageState] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        getReports(currentPageState - 1, pageSize); // API는 0-based index를 사용
    }, [currentPageState]);

    const handlePageChange = (page: number) => {
        setCurrentPageState(page);
    };

    const toggleItem = (id: number) => {
        const newExpandedItems = new Set(expandedItems);
        if (newExpandedItems.has(id)) {
            newExpandedItems.delete(id);
        } else {
            newExpandedItems.add(id);
        }
        setExpandedItems(newExpandedItems);
    };

    const openImageModal = (images: string[], startIndex: number = 0) => {
        setImageModal({
            isOpen: true,
            images,
            currentIndex: startIndex
        });
    };

    const closeImageModal = () => {
        setImageModal({
            isOpen: false,
            images: [],
            currentIndex: 0
        });
    };

    const nextImage = () => {
        if (imageModal.currentIndex < imageModal.images.length - 1) {
            setImageModal(prev => ({
                ...prev,
                currentIndex: prev.currentIndex + 1
            }));
        }
    };

    const prevImage = () => {
        if (imageModal.currentIndex > 0) {
            setImageModal(prev => ({
                ...prev,
                currentIndex: prev.currentIndex - 1
            }));
        }
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
            <div className="flex justify-center items-center py-16">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFAE00] mx-auto mb-4"></div>
                    <div className="text-gray-500 text-lg">신고 내역을 불러오는 중...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <div className="text-red-500 text-lg mb-4">오류가 발생했습니다</div>
                <div className="text-gray-600">{error}</div>
                <button 
                    onClick={() => getReports(0, pageSize)}
                    className="mt-4 px-6 py-2 bg-[#FFAE00] text-black font-semibold rounded-lg hover:bg-[#FF9500] transition-colors"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-[30px]">
            {/* 상단 안내 섹션 */}
            <div className="bg-white pt-8 pb-8">
                <div className="flex justify-between items-start gap-[30px] px-[90px]">
                    {/* 왼쪽: 안내 텍스트 */}
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-[#7C7C7C] leading-[1.21] h-[183px] flex flex-col justify-center">
                            <span className="text-black mb-2 text-3xl">신고해 주셔서 감사합니다.</span>
                            <span className="mt-4"></span>
                            <span>건전한 거래 문화를 만들기 위해 여러분의 작은 참여가 큰 힘이 됩니다.</span>
                            <span>허위 매물, 사기 시도, 부적절한 언행 등 이상한 점이 보이셨다면 지금 바로 신고해 주세요.</span>
                            <span>모든 신고는 비공개로 처리되며, 운영팀이 신속하고 공정하게 확인 후 조치합니다.</span>
                            <span className="text-black font-bold">안전한 거래를 위한 여러분의 목소리를 소중히 반영하겠습니다 :D</span>
                        </div>
                    </div>
                    
                    {/* 오른쪽: 이미지 */}
                    <div className="w-[183px] h-[183px] flex-shrink-0">
                        <img 
                            src="/image/cs-center/report-info-image.png" 
                            alt="신고 안내 이미지"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* 테이블 헤더와 모든 항목 */}
            <div className="relative pt-8">
                {/* 헤더 배경 */}
                <div className="bg-white h-[57px] flex items-center">
                    <div className="flex justify-between items-center w-full px-5">
                        <div className="w-[250px] text-base font-semibold text-black">신고 날짜</div>
                        <div className="w-[420px] text-base font-semibold text-black">상점명</div>
                        <div className="w-[420px] text-base font-semibold text-black">신고 제목</div>
                        <div className="w-[150px] text-base font-semibold text-black">상태</div>
                    </div>
                </div>
                {/* 하단 구분선 */}
                <div className="h-[1px] bg-gray-300"></div>
                
                {/* 모든 신고 항목 */}
                {reports.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg mb-2">신고 내역이 없습니다.</p>
                        <p className="text-gray-400 text-sm">첫 번째 신고를 작성해보세요!</p>
                    </div>
                ) : (
                    <div>
                        {reports.map((report, index) => {
                            const imageUrls = report.images?.map(img => img.imageUrl) || [];
                            const hasImages = imageUrls.length > 0;
                            
                            return (
                                <div key={report.id}>
                                    {/* 신고 항목 */}
                                    <div 
                                        className="h-[100px] flex items-center px-5 cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                                        onClick={() => toggleItem(report.id)}
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <div className="w-[250px] text-base font-medium text-gray-800">
                                                {formatDate(report.createdAt)}
                                            </div>
                                            <div className="w-[420px] text-base font-medium text-gray-800">
                                                {report.targetName}
                                            </div>
                                            <div className="w-[420px] text-base font-medium text-gray-800 truncate">
                                                {report.title}
                                            </div>
                                            <div className="w-[150px] flex items-center gap-2">
                                                <span className="text-base font-medium text-gray-800">
                                                    {report.reply ? '답변완료' : '검토중'}
                                                </span>
                                                {/* 회전하는 화살표 */}
                                                <div className={`w-4 h-4 transition-transform duration-200 ${
                                                    expandedItems.has(report.id) ? 'rotate-90' : ''
                                                }`}>
                                                    <svg 
                                                        className="w-4 h-4 text-[#9CA3AF]" 
                                                        fill="none" 
                                                        stroke="currentColor" 
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* 확장된 내용 */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        expandedItems.has(report.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                                    }`}>
                                        <div className="px-[24px] py-[20px] space-y-4">
                                            {/* 신고 내용과 이미지 섹션 */}
                                            <div className="flex gap-4 ml-4">
                                                {/* 신고할 때 넣은 이미지 */}
                                                {hasImages && (
                                                    <div className="relative w-20 h-20 flex-shrink-0">
                                                        <img 
                                                            src={imageUrls[0]}
                                                            alt="신고 이미지"
                                                            className="w-full h-full object-cover rounded-lg cursor-pointer"
                                                            onClick={() => openImageModal(imageUrls, 0)}
                                                        />
                                                        {/* 이미지 개수 표시 */}
                                                        {imageUrls.length > 1 && (
                                                            <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded-tl-lg">
                                                                +{imageUrls.length - 1}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* 신고할 내용 */}
                                                <div className="flex-1">
                                                    <div className="text-[14px] text-[#374151] leading-[1.6]" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {report.description}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* 답변 섹션 - 회색 박스 */}
                                            {report.reply && (
                                                <div className="bg-[#F3F4F6] rounded-lg p-4 mt-4">
                                                    <div className="text-[14px] font-medium text-[#111827] mb-2">
                                                        답변
                                                    </div>
                                                    <div className="text-[14px] text-[#374151] leading-[1.6]" style={{ whiteSpace: 'pre-wrap' }}>
                                                        {report.reply}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* 구분선 (마지막 항목 제외) */}
                                    {index < reports.length - 1 && (
                                        <div className="h-[1px] bg-gray-200 mx-5"></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
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
            
            {/* 이미지 모달 */}
            <OverlayPortal open={imageModal.isOpen} onClose={closeImageModal}>
                <ImageModalContent
                    images={imageModal.images}
                    currentIndex={imageModal.currentIndex}
                    onClose={closeImageModal}
                    onNext={nextImage}
                    onPrev={prevImage}
                />
            </OverlayPortal>
        </div>
    );
};
