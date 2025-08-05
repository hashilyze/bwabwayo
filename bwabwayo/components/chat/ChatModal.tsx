'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';
import { useParams } from 'next/navigation';

const ChatInputActive: React.FC = () => {
  const params = useParams()
  const roomId = Number(params.roomId)
  const { sendMessage } = useChatRoomStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      sendMessage(roomId, messageInput);
      setMessageInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  return (
    <div className="w-full">
      {/* 하단 입력창 */}
      <div className="h-[77px] bg-white border-t border-gray-200 flex items-center px-8">
        {/* 첨부 버튼 */}
        <div 
          className="w-[26px] h-[26px] border border-gray-500 rounded-full flex items-center justify-center mr-4 cursor-pointer transition-transform duration-200 hover:rotate-90" 
          onClick={toggleMenu}
        >
          <div className="flex items-center justify-center">
            <div className="w-[2px] h-[12px] bg-gray-500 rounded"></div>
            <div className="w-[12px] h-[2px] bg-gray-500 rounded absolute"></div>
          </div>
        </div>
        {/* 입력창 */}
        <div className="flex-1 h-[45px] bg-gray-50 rounded-[38px] flex items-center px-5">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메세지를 입력하세요."
            className="flex-1 bg-transparent text-xs text-gray-500 outline-none placeholder-gray-500"
          />
        </div>
        
        {/* 전송 버튼 */}
        <button
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
          className={`ml-3 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            messageInput.trim()
              ? 'bg-[#0047A5] text-white hover:bg-[#003d8f]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          전송
        </button>
      </div>

      {/* 하단 +버튼 확장 메뉴 */}
      {isMenuOpen && (
        <div className="grid grid-cols-3 gap-4 border-t border-[#eee] py-6 px-8 animate-in slide-in-from-bottom-2 duration-300">
          {/* 거래시작 */}
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
              <Image src="/icon/start-trade.svg" alt="거래시작" className="w-5 h-5" width={20} height={20} />
            </div>
            <span className="text-xs text-black">거래시작</span>
          </div>
          
          {/* 화상채팅예약 */}
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
              <Image src="/icon/video.svg" alt="화상채팅예약" className="w-5 h-5" width={20} height={20} />
            </div>
            <span className="text-xs text-black">화상채팅예약</span>
          </div>
          
          {/* 이미지 첨부 */}
          <div className="flex flex-col items-center cursor-pointer">
            <div className="w-[51px] h-[51px] bg-[#fafafa] border border-[#9b9b9b] rounded-full flex items-center justify-center mb-[7px]">
              <Image src="/icon/image.svg" alt="이미지 첨부" className="w-4 h-4" width={16} height={16} />
            </div>
            <span className="text-xs text-black">이미지 첨부</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInputActive;