'use client';

import { useState, useRef } from 'react';
import { useInquiryStore } from '@/stores/cs-store/inquiryStore';
import { useImageUploadStore } from '@/stores/imageUploadStore';

export const InquiryForm = () => {
    const { addInquiry, loading, error, success } = useInquiryStore();
    const {
        imgFiles,
        imgPreviews,
        uploadedImageUrls,
        isUploading,
        showAlert,
        handleUploadClick,
        handleFileChange,
        handleDeleteImage,
        resetImages,
        setShowAlert
    } = useImageUploadStore();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!title.trim() || !description.trim()) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }

        try {
            await addInquiry({
                title: title.trim(),
                description: description.trim(),
                images: uploadedImageUrls.map((url, index) => ({
                    imageUrl: url,
                    order: index
                }))
            });

            // 성공 시 폼 초기화
            setTitle('');
            setDescription('');
            resetImages();
            
            alert('문의가 성공적으로 등록되었습니다.');
        } catch (error) {
            console.error('문의 등록 실패:', error);
        }
    };

    const handleImageUploadClick = () => {
        if (handleUploadClick(5)) { // 최대 5개 이미지
            fileInputRef.current?.click();
        }
    };

    const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        await handleFileChange(event, 5); // 최대 5개 이미지
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-5">
            {showAlert && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl text-center">
                        <h3 className="text-lg font-bold mb-4">알림</h3>
                        <p>이미지는 최대 5개까지 첨부할 수 있습니다.</p>
                        <button onClick={() => setShowAlert(false)} className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">확인</button>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
                {/* 제목 입력 */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        제목 *
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="문의 제목을 입력해주세요"
                        required
                    />
                </div>

                {/* 내용 입력 */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        내용 *
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="문의 내용을 자세히 입력해주세요"
                        required
                    />
                </div>

                {/* 이미지 업로드 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        첨부 이미지 (선택사항)
                    </label>
                    
                    {/* 이미지 업로드 버튼 */}
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            type="button"
                            onClick={handleImageUploadClick}
                            disabled={isUploading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUploading ? '업로드 중...' : '이미지 선택'}
                        </button>
                        <span className="text-sm text-gray-500">
                            최대 5개까지 첨부 가능
                        </span>
                    </div>

                    {/* 숨겨진 파일 입력 */}
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                    />

                    {/* 파일명 목록 */}
                    {imgFiles.length > 0 && (
                        <div className="space-y-2">
                            {imgFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteImage(index)}
                                        className="text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? '등록 중...' : '문의 등록'}
                    </button>
                </div>
            </form>

            {/* 에러 메시지 */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            )}

            {/* 성공 메시지 */}
            {success && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 text-sm">문의가 성공적으로 등록되었습니다.</p>
                </div>
            )}
        </div>
    );
}; 