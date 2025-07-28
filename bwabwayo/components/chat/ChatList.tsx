'use client';

import React from 'react';
import Image from 'next/image';

interface ChatItem {
  id: string;
  name: string;
  productName: string;
  time: string;
  avatar?: string;
  productImage?: string;
}

const chatData: ChatItem[] = [
  {
    id: '1',
    name: '고윤정',
    productName: '팝마트 라부부 코카콜라 시리즈 인형 키링',
    time: '7시간 전',
  },
  {
    id: '2',
    name: '고윤정2',
    productName: '팝마트 라부부 코카콜라 시리즈 인형 키링',
    time: '7시간 전',
    productImage: '/product-image.jpg',
  },
];

const ChatList: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
     

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex">
          {/* Chat List */}
          <div className="w-1/2 bg-white border border-gray-200">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-black">전체 대화</h2>
            </div>

            {/* Chat Items */}
            <div className="divide-y divide-gray-100">
              {chatData.map((chat) => (
                <div key={chat.id} className="p-6 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="w-15 h-15 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-black">{chat.name}</h3>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{chat.productName}</p>
                    </div>
                    {chat.productImage && (
                      <div className="w-10 h-10 bg-gray-200 rounded flex-shrink-0"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="w-1/2 bg-white border border-gray-200">
            <div className="flex flex-col h-full">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-black">중고거래</h2>
              </div>

              {/* Chat Messages Area */}
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-black mb-2">대화방을 선택해주세요</h3>
                </div>
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 border border-gray-400 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-400 rounded"></div>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-full px-4 py-3">
                    <input
                      type="text"
                      placeholder="메세지를 입력하세요."
                      className="w-full bg-transparent outline-none text-sm text-gray-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

 
    </div>
  );
};

export default ChatList; 