'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OverlayPortal } from '@/components/chat/modals/OverlayPortal';
import { useAuthStore } from '@/stores/auth/authStore';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sellerNickname: string;
  sellerId: string;
}

export const ReportModal = ({ isOpen, onClose, sellerNickname, sellerId }: ReportModalProps) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 열릴 때마다 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setImgFiles([]);
      setImgPreviews([]);
      setUploadedImageKeys([]);
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleUploadClick = () => {
    if (imgFiles.length >= 10) {
      alert('이미지는 최대 10개까지 첨부할 수 있습니다.');
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // 10개 제한 확인
    if (imgFiles.length + fileArray.length > 10) {
      alert('이미지는 최대 10개까지 첨부할 수 있습니다.');
      return;
    }

    // 파일 정보를 먼저 저장
    setImgFiles(prev => [...prev, ...fileArray]);

    try {
      // S3에 업로드
      await uploadToS3(fileArray);
    } catch (error) {
      console.error('파일 업로드 중 오류:', error);
      // 오류 발생 시 추가된 파일 정보 제거
      setImgFiles(prev => prev.slice(0, prev.length - fileArray.length));
    }

    // input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // S3 업로드 함수
  const uploadToS3 = async (files: File[]) => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      // 이미지 업로드는 FormData를 사용하므로 fetch를 직접 사용
      const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('S3 업로드 성공:', data);

      // S3에서 받아온 key값들을 바로 images에 저장
      const imageKeys = data.results.map((item: { key: string; url: string }) => item.key);
      const imageUrls = data.results.map((item: { key: string; url: string }) => item.url);

      setImgPreviews(prev => [...prev, ...imageUrls]);
      setUploadedImageKeys(prev => [...prev, ...imageKeys]);

    } catch (error) {
      setImgFiles(prev => prev.slice(0, prev.length - files.length));
      console.error('S3 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (index: number) => {
    setImgFiles(prev => prev.filter((_, i) => i !== index));
    setImgPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImageKeys(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('신고 제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      alert('신고 내용을 입력해주세요.');
      return;
    }

    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const response = await authenticatedFetch('https://i13e202.p.ssafy.io/be/api/support/report/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          description: description,
          targetId: sellerId,
          imageUrlList: uploadedImageKeys
        })
      });

      if (!response.ok) {
        throw new Error('신고 저장에 실패했습니다.');
      }

      alert('신고가 성공적으로 접수되었습니다.');
      onClose();
    } catch (error) {
      console.error('신고 저장 오류:', error);
      alert('신고 접수에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <OverlayPortal open={isOpen} onClose={onClose}>
      <div className="bg-white rounded-[30px] w-[476px] max-h-[90vh] overflow-y-auto shadow-[2px_4px_18px_0px_rgba(0,0,0,0.12)]">
        {/* 헤더 */}
        <div className="relative pt-[50px] pb-[15px]">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-[15px]">
              <h2 className="text-[24px] font-bold text-black font-['SUITE'] leading-[1.248]">
                신고하기
              </h2>
              <img 
                src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/report-icon.png`} 
                alt="신고 아이콘" 
                className="w-[25px] h-[25px] -mt-1"
              />
            </div>
            <p className="text-[12px] font-medium text-black font-['SUITE'] leading-[1.248] text-center max-w-[226px]">
              거래 중 불쾌하거나 수상한 사용자가 있으신가요?<br />
              안전한 거래 환경을 위해 신고해 주세요!
            </p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-[18px] right-[18px] w-6 h-6 flex items-center justify-center text-[#999999] hover:text-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 신고할 상점명 */}
        <div className="px-[49px] pb-[8px]">
          <h3 className="text-[12px] font-semibold text-black font-['SUITE'] leading-[1.248]">
            신고할 상점명
          </h3>
        </div>

        {/* 판매자 닉네임 */}
        <div className="px-[55px] pb-[8px]">
          <p className="text-[16px] font-medium text-[#7C7C7C] font-['SUITE'] leading-[1.248] text-left">
            {sellerNickname}
          </p>
        </div>

        {/* 신고 제목 입력 */}
        <div className="px-[49px] pb-[8px]">
          <h3 className="text-[12px] font-semibold text-black font-['SUITE'] leading-[1.248]">
            신고 제목
          </h3>
        </div>

        {/* 신고 제목 입력 필드 */}
        <div className="px-[48px] pb-[8px]">
          <div className="w-[380px] h-[46px] border-[0.7px] border-[#A2A2A2] rounded-[20px] p-[13px] relative">
            <textarea
              value={title}
              onChange={(e) => {
                if (e.target.value.length <= 50) {
                  setTitle(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              placeholder="신고 제목을 입력해주세요."
              className="w-full h-full resize-none border-none outline-none text-[14px] font-medium text-black font-['SUITE'] leading-[1.248] placeholder-[#A2A2A2] placeholder:text-[12px] placeholder:font-semibold"
              style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}
              rows={1}
              maxLength={50}
            />
            <div className="absolute bottom-2 right-2">
              <span className="text-[12px] text-[#A2A2A2] font-['SUITE']">
                {title.length}/50
              </span>
            </div>
          </div>
        </div>

        {/* 신고 내용 */}
        <div className="px-[49px] pb-[8px]">
          <h3 className="text-[12px] font-semibold text-black font-['SUITE'] leading-[1.248]">
            신고 내용
          </h3>
        </div>

        {/* 신고 내용 입력 */}
        <div className="px-[48px] pb-[15px]">
          <div className="w-[380px] h-[152px] border-[0.7px] border-[#A2A2A2] rounded-[20px] p-[13px] relative">
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="정확한 답변을 위해 신고 내용을 자세히 작성해 주세요."
              className="w-full h-full resize-none border-none outline-none text-[14px] font-medium text-black font-['SUITE'] leading-[1.248] placeholder-[#A2A2A2]"
              style={{ whiteSpace: 'pre-wrap' }}
              rows={8}
              maxLength={255}
            />
            <div className="absolute bottom-2 right-2">
              <span className="text-[12px] text-[#A2A2A2] font-['SUITE']">
                {description.length}/255
              </span>
            </div>
          </div>
        </div>

        {/* 사진 첨부 */}
        <div className="px-[48px] pb-[20px]">
          <h3 className="text-[12px] font-semibold text-black font-['SUITE'] leading-[1.248] mb-[8px]">
            사진 첨부
          </h3>
          <div className="flex items-center space-x-4 overflow-x-auto pb-4">
            <div
              onClick={handleUploadClick}
              className={`flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 hover:bg-gray-200 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mb-1"></div>
                  <span className="text-xs text-gray-500">업로드 중...</span>
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-gray-500 mt-1">{imgPreviews.length}/10</span>
                </>
              )}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            {imgPreviews.map((preview, index) => (
              <div key={preview} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
                <img src={preview} alt={`이미지 미리보기 ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  disabled={isUploading}
                  className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-0.5 hover:bg-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="이미지 삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 신고하기 버튼 */}
        <div className="px-[63px] pb-[31px]">
          <button
            onClick={handleSubmit}
            className="w-[352px] h-[46px] bg-[#FFAE00] border-[1.5px] border-black rounded-[30px] text-[18px] font-semibold text-black font-['SUITE'] leading-[1.248] hover:bg-[#FF9500] transition-colors"
          >
            신고하기
          </button>
        </div>
      </div>
    </OverlayPortal>
  );
};
