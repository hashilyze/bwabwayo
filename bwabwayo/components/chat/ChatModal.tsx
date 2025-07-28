'use client';

import React from 'react';

const ChatInputActive: React.FC = () => {
  return (
    <div className="w-full max-w-xl mx-auto">
      {/* 상단 입력창 */}
      <div className="bg-white border border-gray-200 rounded-[38px] flex items-center px-6 py-3 relative">
        {/* + 버튼 */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
          <div className="w-6 h-6 border border-gray-400 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c7c7c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
        </div>
        {/* 입력창 */}
        <input
          type="text"
          placeholder="메세지를 입력하세요."
          className="flex-1 pl-12 pr-4 py-2 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
        />
      </div>

      {/* 하단 +버튼 확장 메뉴 */}
      <div className="flex justify-center gap-8 mt-6">
        {/* 거래시작 */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-[#fafafa] border border-gray-400 rounded-full flex items-center justify-center mb-1">
            {/* 아이콘 자리(원형) */}
          </div>
          <span className="text-xs text-black">거래시작</span>
        </div>
        {/* 화상채팅예약 */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-[#fafafa] border border-gray-400 rounded-full flex items-center justify-center mb-1">
            {/* 아이콘 자리(원형) */}
          </div>
          <span className="text-xs text-black">화상채팅예약</span>
        </div>
        {/* 이미지 첨부 */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-[#fafafa] border border-gray-400 rounded-full flex items-center justify-center mb-1">
            {/* 아이콘 자리(원형) */}
          </div>
          <span className="text-xs text-black">이미지 첨부</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInputActive;