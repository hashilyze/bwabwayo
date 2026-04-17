'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OverlayPortal } from '@/components/chat/modals/OverlayPortal';
import { useAuthStore } from '@/stores/auth/authStore';
import { useInquiryStore } from '@/stores/cs-store/inquiryStore';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryModal = ({ isOpen, onClose }: InquiryModalProps) => {
  const router = useRouter();
  const { getInquiries } = useInquiryStore();
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
      alert('문의 제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      alert('문의 내용을 입력해주세요.');
      return;
    }

    try {
      const { authenticatedFetch } = useAuthStore.getState();
      const response = await authenticatedFetch('https://i13e202.p.ssafy.io/be/api/support/inquery/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          description: description,
          imageUrlList: uploadedImageKeys
        })
      });

      if (!response.ok) {
        throw new Error('문의 저장에 실패했습니다.');
      }

      alert('문의가 성공적으로 저장되었습니다.');
      onClose();
      
             // 문의내역 탭으로 이동하고 문의 목록 갱신
       router.push('/cs-center');
       // 문의 목록을 다시 불러와서 저장된 내용 갱신
       await getInquiries();
    } catch (error) {
      console.error('문의 저장 오류:', error);
      alert('문의 저장에 실패했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <OverlayPortal open={isOpen} onClose={onClose}>
      <div className="bg-white rounded-[30px] w-[550px] max-h-[90vh] overflow-y-auto shadow-[2px_4px_18px_0px_rgba(0,0,0,0.12)]">
        {/* 헤더 */}
        <div className="relative pt-[41px] pb-[20px]">
          <h2 className="text-[24px] font-bold text-black text-center font-['SUITE'] leading-[1.248]">
            1:1 문의하기
          </h2>
          <button
            onClick={onClose}
            className="absolute top-[17px] right-[17px] w-6 h-6 flex items-center justify-center text-[#999999] hover:text-gray-700 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M13 1L1 13M1 1L13 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 안내 메시지 */}
        <div className="px-[51px] pb-[8px]">
          <p className="text-[14px] font-medium text-black font-['SUITE'] leading-[1.248]">
            문의하신 사항은 확인 후 영업일 2~5일 이내 순차적으로 답변 드리겠습니다.
          </p>
        </div>

        {/* 문의 제목 입력 */}
        <div className="px-[48px] pb-[10px]">
          <h3 className="text-[14px] font-semibold text-black font-['SUITE'] leading-[1.248] mb-[12px]">
            문의 제목
          </h3>
          <div className="w-[450px] h-[46px] border-[0.7px] border-[#A2A2A2] rounded-[20px] p-[13px] relative">
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
               placeholder="문의 제목을 입력해주세요."
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

        {/* 문의 내용 입력 */}
        <div className="px-[48px] pb-[10px]">
          <h3 className="text-[14px] font-semibold text-black font-['SUITE'] leading-[1.248] mb-[12px]">
            문의 내용
          </h3>
          <div className="w-[450px] h-[140px] border-[0.7px] border-[#A2A2A2] rounded-[20px] p-[13px] relative">
            <textarea
              value={description}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setDescription(e.target.value);
                }
              }}
              placeholder="정확한 답변을 위해 문의 내용을 자세히 작성해 주세요."
              className="w-full h-full resize-none border-none outline-none text-[14px] font-medium text-black font-['SUITE'] leading-[1.248] placeholder-[#A2A2A2] placeholder:text-[12px] placeholder:font-semibold"
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
        <div className="px-[48px] pb-[0px]">
          <h3 className="text-[14px] font-semibold text-black font-['SUITE'] leading-[1.248] mb-[12px]">
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

        {/* 유의사항 */}
        <div className="px-[45px] pb-[8px] pt-[0px]">
          <div className="w-[450px] bg-[#F6F8F9] rounded-[20px] p-[20px] relative">
            <h3 className="text-[14px] font-semibold text-black font-['SUITE'] leading-[1.248] mb-[8px]">
              문의 작성 시 유의사항
            </h3>
            {/* 구분선 */}
            <div className="w-full h-[0.5px] bg-[#ACADB0] mb-[12px]"></div>
            <div className="text-[12px] font-medium text-[#A2A2A2] font-['SUITE'] leading-[1.4] space-y-[8px]">
              <p>• 상담에 필요한 정보 외 개인정보를 포함하지 않도록 주의해주세요.</p>
              <p>• 산업안전 보건법에 따라 고객응대 근로자 보호조치를 시행하고 있어요.</p>
              <p>• 욕설 또는 폭언을 하지 말아주세요.</p>
              <p>• 자주묻는질문을 확인하면 답변을 빨리 받을 수 있어요.</p>
              <p>• 접수는 24시간 가능하지만, 답변은 9시 - 18시 사이에 순차적으로 받을 수 있어요.</p>
            </div>
          </div>
        </div>

        {/* 저장하기 버튼 */}
        <div className="px-[48px] pb-[30px]">
          <button 
            onClick={handleSubmit}
            className="w-[450px] h-[46px] bg-[#FFAE00] border-[1.5px] border-black rounded-[30px] text-[18px] font-semibold text-black font-['SUITE'] leading-[1.248] hover:bg-[#FF9500] transition-colors"
          >
            저장하기
          </button>
        </div>
      </div>
    </OverlayPortal>
  );
};
