'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';
import useSendTypeMessageStore from '@/stores/chatting/sendTypeMessage';
import { useParams } from 'next/navigation';

interface ChatInputActiveProps {
  onOpenReservationModal: () => void;
  myUserId?: string | null;
}

const ChatInputActive: React.FC<ChatInputActiveProps> = ({ onOpenReservationModal, myUserId }) => {
  const params = useParams();
  const roomId = Number(params.roomId);
  const { sendMessage, currentSelectedRoom } = useChatRoomStore();
  const { negotiation } = useSendTypeMessageStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [imgFiles, setImgFiles] = useState<File[]>([]);
  const [imgPreviews, setImgPreviews] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // seller인지 확인
  const currentUserId = currentSelectedRoom?.userId.toString();
  const sellerId = currentSelectedRoom?.seller.id.toString();
  const isSeller = currentUserId === sellerId;
  
  // buyer인지 확인
  const buyerId = currentSelectedRoom?.buyer.id.toString();
  const isBuyer = currentUserId === buyerId;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 이미지 업로드 박스 클릭
  const handleUploadClick = () => {
    if (imgFiles.length >= 1) {
      alert('이미지는 1개만 첨부할 수 있습니다.');
      return;
    }
    if (isUploading) {
      alert('이미지 업로드 중입니다. 잠시만 기다려주세요.');
      return;
    }
    fileInputRef.current?.click();
  };

  // 파일 선택 시 처리
  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // 1개 제한 확인
    if (imgFiles.length + fileArray.length > 1) {
      alert('이미지는 1개만 첨부할 수 있습니다.');
      return;
    }

    // 파일 정보를 먼저 저장
    setImgFiles(prev => [...prev, ...fileArray]);

    try {
      // S3에 업로드 (성공 시 미리보기 URL 업데이트됨)
      await uploadToS3(fileArray);
      // 업로드 완료 후 메뉴 닫기
      setIsMenuOpen(false);
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

      const response = await fetch('https://i13e202.p.ssafy.io/be/api/storage/upload/product', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      console.log('S3 업로드 성공:', data);

      // S3에서 받아온 URL들을 저장
      const imageUrls = data.results.map((item: any) => item.url);

      setImgPreviews(prev => [...prev, ...imageUrls]);
      setUploadedImageUrls(prev => [...prev, ...imageUrls]);

    } catch (error) {
      setImgFiles(prev => prev.slice(0, prev.length - files.length));
      console.error('S3 업로드 오류:', error);
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  // 이미지 삭제
  const handleDeleteImage = (index: number) => {
    // 상태에서 제거 (S3 URL이므로 메모리 해제 불필요)
    setImgFiles(prev => prev.filter((_, i) => i !== index));
    setImgPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (messageInput.trim() || uploadedImageUrls.length > 0) {
      try {
        console.log('📤 메시지 전송 시도:', messageInput, '이미지:', uploadedImageUrls);
        
        // 텍스트 메시지가 있으면 전송
        if (messageInput.trim()) {
          await sendMessage(roomId, messageInput);
        }
        
        // 이미지가 있으면 IMAGE 타입으로 전송
        if (uploadedImageUrls.length > 0) {
          const imageMessage = uploadedImageUrls.join(', ');
          await sendMessage(roomId, imageMessage, 'IMAGE');
        }
        
        // 상태 초기화
        setMessageInput('');
        setImgFiles([]);
        setImgPreviews([]);
        setUploadedImageUrls([]);
        
        // 메시지 전송 후 입력창에 포커스 유지
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
        
        console.log('✅ 메시지 전송 완료');
      } catch (error) {
        console.error('❌ 메시지 전송 실패:', error);
        // 에러 발생 시에도 입력창 포커스 유지
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSendMessage();
  };

  return (
    <div className="w-full">
      {/* 숨겨진 파일 input */}
      <input
         ref={fileInputRef}
         type="file"
         accept="image/*"
         onChange={handleFileChange}
         style={{ display: 'none' }}
       />
      
      {/* 이미지 미리보기 영역 */}
       {imgPreviews.length > 0 && (
         <div className="bg-white/50 p-4 border-t border-gray-200">
           <div className="flex flex-wrap gap-2 justify-center">
             {imgPreviews.map((preview, index) => (
               <div key={index} className="relative">
                 <div className="w-40 h-40 rounded-lg flex items-center justify-center relative overflow-hidden">
                   <img 
                     src={preview} 
                     alt={`미리보기 ${index + 1}`}
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       const target = e.target as HTMLImageElement;
                       target.style.display = 'none';
                       target.parentElement!.innerHTML = '<span class="text-white text-sm">이미지</span>';
                     }}
                   />
                   <button
                     onClick={() => handleDeleteImage(index)}
                     className="absolute top-2 right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-sm hover:bg-gray-800 transition-colors cursor-pointer"
                     aria-label="이미지 삭제"
                   >
                     ×
                   </button>
                 </div>
               </div>
             ))}
           </div>
         </div>
       )}
       
       {/* 하단 입력창 */}
       <form onSubmit={handleSubmit} className="h-[90px] bg-white border-t border-gray-200 flex items-center px-8">
        {/* 첨부 버튼 */}
        <div
          className="w-[30px] h-[30px] border border-gray-500 rounded-full flex items-center justify-center mr-4 cursor-pointer transition-transform duration-200 hover:rotate-90"
          onClick={toggleMenu}
        >
          <div className="flex items-center justify-center">
            <div className="w-[2px] h-[12px] bg-gray-500 rounded"></div>
            <div className="w-[12px] h-[2px] bg-gray-500 rounded absolute"></div>
          </div>
        </div>
        {/* 입력창 */}
        <div className="flex-1 h-[52px] bg-gray-50 rounded-[38px] flex items-center px-5">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메세지를 입력하세요."
            className="flex-1 bg-transparent text-md text-gray-500 outline-none placeholder-gray-500"
            autoComplete="off"
          />
        </div>

        {/* 전송 버튼 */}
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={!messageInput.trim() && uploadedImageUrls.length === 0}
          className={`ml-3 px-5 h-[52px] rounded-full text-md font-medium transition-colors ${
            messageInput.trim() || uploadedImageUrls.length > 0
              ? 'bg-[#fce94f] text-black border-2 border-black hover:scale-105 transition-all duration-200'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          전송
        </button>
      </form>

      {/* 하단 +버튼 확장 메뉴 */}
      {isMenuOpen && (
        <div className="grid grid-cols-3 gap-4 border-t border-[#eee] py-6 px-8 animate-in slide-in-from-bottom-2 duration-300">
          {/* 거래시작 */}
          <div 
            className={`flex flex-col items-center ${isSeller ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={() => {
              if (isSeller) {
                negotiation(roomId);
                setIsMenuOpen(false); // 메뉴 닫기
              }
            }}
          >
            <div className={`w-[51px] h-[51px] rounded-full flex items-center justify-center mb-[7px] ${
              isSeller 
                ? 'bg-[#fafafa] border border-[#9b9b9b]' 
                : 'bg-gray-200 border border-gray-300'
            }`}>
              <img 
                src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/start-trade.svg`} 
                alt="거래시작" 
                className={`w-5 h-5 ${isSeller ? '' : 'opacity-50'}`} 
              />
            </div>
            <span className={`text-xs ${isSeller ? 'text-black' : 'text-gray-400'}`}>거래시작</span>
          </div>

          {/* 화상채팅예약 */}
          <div 
            className={`flex flex-col items-center ${isBuyer ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={() => {
              if (isBuyer) {
                onOpenReservationModal(); // 부모로부터 받은 함수 호출
                setIsMenuOpen(false); // 메뉴 닫기
              }
            }}
          >
            <div className={`w-[51px] h-[51px] rounded-full flex items-center justify-center mb-[7px] ${
              isBuyer 
                ? 'bg-[#fafafa] border border-[#9b9b9b]' 
                : 'bg-gray-200 border border-gray-300'
            }`}>
              <img 
                src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/video.svg`} 
                alt="화상채팅예약" 
                className={`w-5 h-5 ${isBuyer ? '' : 'opacity-50'}`} 
              />
            </div>
            <span className={`text-xs ${isBuyer ? 'text-black' : 'text-gray-400'}`}>화상채팅예약</span>
          </div>

          {/* 이미지 첨부 */}
          <div 
            className="flex flex-col items-center cursor-pointer"
            onClick={() => {
              handleUploadClick();
              setIsMenuOpen(false); // 메뉴 닫기
            }}
          >
            <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
              <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/image.svg`} alt="이미지 첨부" className="w-4 h-4" />
            </div>
            <span className="text-xs text-black">이미지 첨부</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInputActive;