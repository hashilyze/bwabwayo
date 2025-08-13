'use client';

import { useInquiryStore } from "@/stores/cs-store/inquiryStore";
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

export const InquirySection = () => {
    const { inquiries, loading, error, getInquiries, totalPages, currentPage } = useInquiryStore();
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
        getInquiries(currentPageState - 1, pageSize); // API는 0-based index를 사용
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
        <>
            <div className="space-y-0">
                {inquiries.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-2">
                            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-sm">문의 내역이 없습니다.</p>
                    </div>
                ) : (
                    inquiries.map((inquiry) => {
                        const imageUrls = inquiry.images?.map(img => img.imageUrl) || [];
                        const hasImages = imageUrls.length > 0;
                        
                        return (
                            <div key={inquiry.id} className="border-b border-[#F3F4F6]">
                                {/* 문의 항목 헤더 */}
                                <div 
                                    className="flex justify-between items-center py-[20px] px-[24px] cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                                    onClick={() => toggleItem(inquiry.id)}
                                >
                                                                                                              <div className="flex-1">
                                          <div className="flex flex-col gap-1">
                                              <span className={`px-2 py-1 text-xs rounded-full w-fit ${
                                                  inquiry.reply 
                                                      ? 'bg-green-100 text-green-800' 
                                                      : 'bg-yellow-100 text-yellow-800'
                                              }`}>
                                                  {inquiry.reply ? '답변완료' : '답변대기'}
                                              </span>
                                              <span className="text-[15px] font-medium text-[#111827] leading-[1.4]">
                                                  {inquiry.title}
                                              </span>
                                              <div className="text-[13px] text-[#6B7280]">
                                                  {formatDate(inquiry.createdAt)}
                                              </div>
                                          </div>
                                      </div>
                                    {/* 회전하는 화살표 */}
                                    <div className={`w-4 h-4 ml-[16px] flex-shrink-0 transition-transform duration-200 ${
                                        expandedItems.has(inquiry.id) ? 'rotate-90' : ''
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
                                
                                {/* 확장된 내용 */}
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                    expandedItems.has(inquiry.id) ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
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
                                                      {inquiry.description}
                                                  </div>
                                              </div>
                                          </div>
                                         
                                         {/* 답변 섹션 - 회색 박스 */}
                                         {inquiry.reply && (
                                             <div className="bg-[#F3F4F6] rounded-lg p-4 mt-4">
                                                 <div className="text-[14px] font-medium text-[#111827] mb-2">
                                                     답변
                                                 </div>
                                                 <div className="text-[14px] text-[#374151] leading-[1.6]" style={{ whiteSpace: 'pre-wrap' }}>
                                                     {inquiry.reply}
                                                 </div>
                                             </div>
                                         )}
                                     </div>
                                </div>
                            </div>
                        );
                    })
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
        </>
    );
};
