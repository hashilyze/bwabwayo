'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChatBotStore } from '../../stores/chatBotStore';


// --- 타입 정의 ---
// 화면에 표시될 메시지의 타입을 정의합니다.
type DisplayMessage = {
  type: 'greeting' | 'user' | 'bot' | 'loading';
  text: string;
};


// 닫기 아이콘
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 hover:text-black">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// 전송 종이비행기 아이콘
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);
// 챗봇 얼굴 아이콘

const ChatbotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
      <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
    </svg>
);


// 챗봇 창 컴포넌트
// 이 컴포넌트는 챗봇의 UI와 내부 동작을 담당합니다.
function ChatbotWindow({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [messages, setMessages] = useState([
      //챗봇 초기 인사말
        { type: 'greeting', text: '안녕하세요, 무엇이 궁금하신가요?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const chatAreaRef = useRef<HTMLDivElement>(null);

    // Zustand store에서 챗봇 데이터, 로딩 상태, 에러 정보, API 호출 함수를 가져옵니다.
    const { chatBot, getChatBot, loading, error } = useChatBotStore();

    useEffect(() => {
        // chatAreaRef가 존재할 때 (컴포넌트가 마운트되었을 때) 스크롤을 가장 아래로 이동시킵니다.
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // zustande 스토어의 상태 변화 감지 useEffect
    // chatBot 데이터가 들어올 때마다 요약 + 상세 메시지 추가
useEffect(() => {
  if (loading || !Array.isArray(chatBot) || chatBot.length === 0) return;

  // 1) 요약 메시지
  const summary: DisplayMessage = {
    type: 'bot',
    text: `총 ${chatBot.length}개의 추천 상품이 있습니다.`,
  };

  // 2) 상품별 상세 메시지
  const details: DisplayMessage[] = chatBot.map((prod, idx) => ({
    type: 'bot',
    text:
      `(응답 ${idx + 1})\n` +
      `상품명 : ${prod.name}\n` +
      `특징   : ${prod.feature}\n` +
      `가격   : ${prod.priceRange}\n` +
      `장점   : ${prod.advantage}`,
  }));

  // 3) 기존 메시지 뒤에 요약 + 상세 메시지 붙이기
  setMessages(prev => [...prev, summary, ...details]);

  // 필요하다면 스토어 초기화 액션 호출
}, [chatBot, loading]);

    


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        // 1. 서버로 전송할 메시지 데이터를 JSON 객체로 구성합니다.
        const messagePayload = {
          sender: 'user', // 실제로는 로그인된 유저 ID 또는 세션 ID를 사용합니다.
          type: 'text',
          content: {
              text: inputValue,
          },
          timestamp: new Date().toISOString(), // 메시지 전송 시각
        };

        // 2. 구성된 JSON 객체를 콘솔에 출력합니다. (F12 개발자 도구에서 확인 가능)
        console.log('--- 전송할 메시지 (JSON) ---');
        console.log(JSON.stringify(messagePayload, null, 2));

        // 3. 기존 UI 업데이트 로직은 그대로 유지합니다.
        const userMessage = { type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // 챗봇 API 호출
        getChatBot(inputValue);


    };

    // 퀵버튼 클릭 시 처리
    const handleQuickAction = (actionText: string) => {
        const userMessage = { type: 'user', text: actionText };
        setMessages(prev => [...prev, userMessage]);
        
        // 챗봇 API 호출 with quick action text
        getChatBot(actionText);
    }
    // isOpen 상태에 따라 챗봇의 표시 여부를 결정합니다.
    // Tailwind CSS의 transition 클래스를 사용하여 부드러운 애니메이션 효과를 추가합니다.
    return (
        <div className={`fixed bottom-24 right-4 sm:right-8 w-[391px] h-[564px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
            {/* 헤더*/}
            <header className="flex items-center px-6 pt-4 pb-2 flex-shrink-0">
                <span className="text-xl font-bold text-[#3369ff]">AI 챗봇</span>
                <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-gray-100">
                    <CloseIcon />
                    <span className="sr-only">Close</span>
                </button>
            </header>
            {/* 구분선 */}
            <div className="h-px bg-gray-200 w-full" />

            <main ref={chatAreaRef} className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                    if (msg.type === 'greeting') {
                        return <div key={index} className="flex justify-center"><div className="text-gray-800 text-xs font-bold">{msg.text}</div></div>;
                    }
                    if (msg.type === 'user') {
                        return <div key={index} className="flex justify-end"><div className="bg-[#3369ff] text-white rounded-2xl rounded-br-lg px-4 py-3 max-w-[80%] text-sm font-medium">{msg.text}</div></div>;
                    }
                    if (msg.type === 'bot') {
                        return <div key={index} className="flex justify-start"><div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-3 max-w-[80%] text-sm">{msg.text}</div></div>;
                    }
                    return null;
                })}
            </main>
            {/* 퀵버튼 영역 */}
            <section className="px-6 py-4 border-t border-gray-200">
                <div className="space-y-2">
                    <button onClick={() => handleQuickAction('AI 상품 추천')} className="w-full bg-gray-100 rounded-full py-2.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors">AI 상품 추천</button>
                    <button onClick={() => handleQuickAction('자주 묻는 질문')} className="w-full bg-gray-100 rounded-full py-2.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors">자주 묻는 질문</button>
                </div>
            </section>
            {/* 메시지 입력 및 전송 */}
            <footer className="px-6 py-4 bg-white flex items-center border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="w-full flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none text-sm text-gray-800 placeholder-gray-500"
                        placeholder="메시지를 입력하세요"
                    />
                    <button 
                    onClick={() =>getChatBot(inputValue)}
                    className="w-10 h-10 ml-3 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition-colors">
                        <SendIcon />
                        <span className="sr-only">Send</span>
                    </button>
                </form>
            </footer>
        </div>
    );
}

// --- 최종 챗봇 컴포넌트 ---
// 이 컴포넌트 하나만 layout.tsx에 넣으면 됩니다.
export default function Chatbot() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    return (
        <>
            {/* 챗봇 열기/닫기 버튼 */}
            <button
                onClick={() => setIsChatbotOpen(prev => !prev)}
                className="fixed bottom-4 right-4 sm:right-8 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform z-50"
                aria-label="챗봇 열기/닫기"
            >
                {/* 챗봇이 열려있으면 닫기 아이콘, 닫혀있으면 챗봇 아이콘을 보여줍니다. */}
                {isChatbotOpen ? <CloseIcon /> : <ChatbotIcon />}
            </button>
            
            <ChatbotWindow isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        </>
    );
}