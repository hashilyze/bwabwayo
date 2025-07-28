'use client';

import React, { useState } from 'react';
// next/image 대신 일반 img 태그를 사용하므로 Image import는 필요 없습니다.

// --- 타입 정의 ---
interface ChatItem {
  id: string;
  name: string;
  productName: string;
  time: string;
  avatarUrl?: string;
  productImageUrl?: string;
}

// --- 가상 데이터 ---
const chatData: ChatItem[] = [
  {
    id: '1',
    name: '고윤정',
    productName: '팝마트 라부부 코카콜라 시리즈 인형 키링',
    time: '7시간 전',
    avatarUrl: 'https://placehold.co/60x60/E2E8F0/4A5568?text=User',
    productImageUrl: 'https://placehold.co/40x40/E2E8F0/4A5568?text=Item',
  },
  {
    id: '2',
    name: '고윤정2',
    productName: '팝마트 라부부 코카콜라 시리즈 인형 키링',
    time: '7시간 전',
    avatarUrl: 'https://placehold.co/60x60/E2E8F0/4A5568?text=User2',
    productImageUrl: 'https://placehold.co/40x40/E2E8F0/4A5568?text=Item2',
  },
];

// --- 채팅 리스트 컴포넌트 ---
const ChatList: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto h-[85vh] flex rounded-2xl shadow-lg border border-gray-200">
        
        {/* Chat List */}
        {/* --- 수정된 부분: 너비 비율을 50%로 변경 --- */}
        <div className="w-full md:w-1/2 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-2xl font-bold text-black">전체 대화</h2>
          </div> 
          <div className="flex-1 overflow-y-auto">
            {chatData.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedChat?.id === chat.id ? 'border-blue-600 bg-blue-50' : 'border-transparent hover:bg-gray-50'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center space-x-4">
                  {/* --- 수정된 부분: next/image 대신 일반 img 태그 사용 --- */}
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden">
                    {chat.avatarUrl && (
                      <img src={chat.avatarUrl} alt={chat.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-black truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{chat.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{chat.productName}</p>
                  </div>
                  {/* --- 수정된 부분: next/image 대신 일반 img 태그 사용 --- */}
                  {chat.productImageUrl && (
                    <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                      <img src={chat.productImageUrl} alt={chat.productName} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {/* --- 수정된 부분: 너비 비율을 50%로 변경 --- */}
        <div className="hidden md:flex md:w-1/2 bg-white flex-col">
          {selectedChat ? (
            <>
              <div className="p-6 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-black">{selectedChat.name}</h2>
                <p className="text-sm text-gray-500">{selectedChat.productName}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              <p className="text-center text-gray-500">&apos;{selectedChat.name}&apos;님과의 대화 내용이 여기에 표시됩니다.</p>              </div>
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  </button>
                  <div className="flex-1 bg-gray-100 rounded-full px-4 py-2">
                    <input type="text" placeholder="메세지를 입력하세요." className="w-full bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500" />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-black mb-2">대화방을 선택해주세요</h3>
                <p className="text-sm text-gray-500">왼쪽 목록에서 대화를 시작할 채팅방을 선택하세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
