'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatBotStore } from '@/stores/chatBotStore';

// --- 타입 정의 ---
type DisplayMessage = {
  type: 'greeting' | 'user' | 'bot' | 'button';
  text: string;
};

// --- 아이콘 컴포넌트들 ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500 hover:text-black">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);
const ChatbotIcon = () => (
    <img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/chat-bot.png`} alt="챗봇 아이콘" />

);

// --- 챗봇 창 컴포넌트 ---
function ChatbotWindow({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [messages, setMessages] = useState<DisplayMessage[]>(
        [
            { type: 'bot', text: '안녕하세요, 봐봐요 챗봇입니다! 😊\n필요한 물건이 있으신가요?\nAI에게 추천을 받아보세요.' },
            { type: 'button', text: 'AI 상품 추천' }
        ]
    );
    const [inputValue, setInputValue] = useState('');
    const [inputActive, setInputActive] = useState(false); // 입력창 활성화 상태
    //채팅 영역
    const chatAreaRef = useRef<HTMLDivElement>(null);
    //챗봇 전체 영역
     const chatbotWindowRef = useRef<HTMLDivElement>(null);

    // Zustand 스토어에서 필요한 상태와 함수를 가져옵니다.
    // clearChatBot은 스토어에 추가해야 합니다.
    const { chatBot, getChatBot, loading, error, clearChatBot } = useChatBotStore();

    // 새 메시지가 추가될 때마다 스크롤을 맨 아래로 이동합니다.
    useEffect(() => {
        if (chatAreaRef.current) {
            chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // --- 수정된 부분: Zustand 스토어의 상태 변화 감지 ---
    useEffect(() => {
        // 로딩이 끝났고, 에러가 없으며, 새로운 챗봇 데이터가 있을 때만 실행합니다.
        // 서버 응답이 { products: [...] } 형태이므로, chatBot.products로 접근해야 합니다.
        if (!loading && !error && chatBot && Array.isArray(chatBot.products) && chatBot.products.length > 0) {
            
            // 마지막 사용자 메시지를 찾아 응답에 활용합니다.
            const lastUserMessage = [...messages].reverse().find(msg => msg.type === 'user');
            const userQuery = lastUserMessage ? lastUserMessage.text : '요청하신';

            // "추천해줘" 같은 불필요한 말을 제거하여 핵심 키워드만 남깁니다.
            // 사용자가 "추천해줘"만 입력한 경우를 대비해 기본값("요청하신 상품")을 설정합니다.
            const cleanedQuery = userQuery.replace(/(추천해줘|알려줘|찾아줘|추천해 줘|추천|알려|찾아|보여줘|골라줘|검색해줘)/g, '').trim() || '요청하신 상품';

            const items = chatBot.products;

            // 1. 첫 번째 안내 메시지 객체를 만듭니다.
            const summaryMessage: DisplayMessage = {
                type: 'bot',
                text: `${cleanedQuery} 추천해드릴게요!`
            };

            // 2. 각 상품 정보를 별개의 메시지 객체로 만듭니다.
            const detailMessages: DisplayMessage[] = items.map((product, index) => ({
                type: 'bot',
                text: `${index + 1}번째\n제품명 : ${product.name}\n ${product.feature}\n가격대 : ${product.priceRange}\n장점 : ${product.advantage}`
            }));

            // 3. 안내 메시지와 상품 메시지들을 하나의 배열로 합칩니다.
            const newBotMessages = [summaryMessage, ...detailMessages];

            // 4. 합쳐진 메시지들을 화면 상태에 추가합니다.
            setMessages(prev => [...prev, ...newBotMessages]);
            
            // 5. 처리가 끝난 스토어의 데이터를 비워줘서 중복 실행을 방지합니다.
            //    (chatBotStore.ts에 clearChatBot 액션이 추가되어 있어야 합니다.)
            if(clearChatBot) clearChatBot();
        }
    }, [chatBot, loading, error, clearChatBot]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage: DisplayMessage = { type: 'user', text: inputValue };
        setMessages(prev => [...prev, userMessage]);
        
        // Zustand 스토어의 getChatBot 함수를 호출하여 서버에 요청합니다.
        getChatBot(inputValue);

        setInputValue('');
    };
    
const handleQuickAction = (actionText: string) => {
        const userMessage: DisplayMessage = { type: 'user', text: actionText };

        if (actionText === 'AI 상품 추천') {
            setMessages(prev => [
                ...prev.filter(msg => msg.type !== 'button'), // 버튼 메시지 제거
                userMessage,
                {
                    type: 'bot',
                    text: `어떤 상품이 궁금하신가요? 예: 스마트폰, 경제책, 운동화`
                }
            ]);
            setInputActive(true); // 입력창 활성화
        } else {
            setMessages(prev => [...prev, userMessage]);
        }
    };
    // ChatbotWindow 컴포넌트 내부

    useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
    // 마우스 클릭 이벤트가 발생했을 때 실행되는 함수입니다.
    if (
        chatbotWindowRef.current && // chatbotWindowRef가 실제 DOM 요소를 참조하고 있는지 확인
        !chatbotWindowRef.current.contains(event.target as Node) // 클릭한 대상이 챗봇 창 내부에 있는지 확인
    ) {
        // 클릭한 대상이 챗봇 창 외부일 경우
        onClose(); // 챗봇 창을 닫는 동작을 수행하는 onClose 함수를 호출합니다.
    }
}

    // 2. 챗봇이 열려있을 때(isOpen === true)만 클릭 감지 장치를 설치합니다.
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }

    // 3. 챗봇이 닫히거나, 컴포넌트가 사라질 때 설치했던 감지 장치를 제거합니다. (매우 중요!)
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
    }, [isOpen, onClose]); // isOpen이나 onClose가 바뀔 때마다 이 로직을 재실행합니다.

    return (
        <div ref={chatbotWindowRef} className={`fixed z-98 bottom-24 right-4 sm:right-8 w-[391px] h-[564px] bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5 pointer-events-none'}`}>
            <header className="flex items-center px-6 pt-4 pb-2 flex-shrink-0">
                <span className="text-xl font-bold text-green-600">AI 챗봇</span>
                <button onClick={onClose} className="ml-auto p-1 rounded-full hover:bg-gray-200">
                    <CloseIcon />
                </button>
            </header>
            <div className="h-px bg-gray-200 w-full" />

            <main ref={chatAreaRef} className="flex-1 px-6 py-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => {
                    if (msg.type === 'greeting') {
                        return <div key={index} className="flex justify-center"><div className="text-gray-800 text-xs font-bold">{msg.text}</div></div>;
                    }
                    if (msg.type === 'user') {
                        return <div key={index} className="flex justify-end"><div className="bg-green-600 text-white rounded-2xl rounded-br-lg px-4 py-3 max-w-[80%] text-sm font-medium whitespace-pre-wrap">{msg.text}</div></div>;
                    }
                    if (msg.type === 'bot') {
                        // 첫 번째 bot 메시지에만 버튼을 붙임
                        const isFirstBot = index === messages.findIndex(m => m.type === 'bot');
                        return (
                            <div key={index} className="flex flex-col items-start space-y-2">
                                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-3 max-w-[80%] text-sm whitespace-pre-wrap">
                                    {msg.text}
                                    {isFirstBot && !inputActive && (
                                        <div className="mt-3 flex">
                                            <button
                                                onClick={() => handleQuickAction('AI 상품 추천')}
                                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-700 text-white font-bold rounded-full px-6 py-2 shadow-md hover:scale-105 hover:from-green-600 hover:to-green-700 transition-all text-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                                AI 상품 추천
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
                {/* 로딩 중일 때 "생각 중" 메시지를 표시합니다. */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-3 max-w-[80%] text-sm">
                            AI가 생각 중입니다...
                        </div>
                    </div>
                )}
            </main>
            
            {/* <section className="px-6 py-4 border-t border-gray-200">
                <div className="space-y-2">
                    <button
                        onClick={() => handleQuickAction('AI 상품 추천')}
                        className="w-full bg-gray-100 rounded-full py-2.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                        disabled={inputActive} // 이미 활성화되면 버튼 비활성화
                    >
                        AI 상품 추천
                    </button>
                </div>
            </section> */}
            {/* 입력창은 항상 보이되, inputActive가 false면 비활성화 + 색상 변경 */}
            <footer className="px-6 py-4 bg-white flex items-center border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="w-full flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className={`flex-1 rounded-full px-5 py-3 outline-none text-sm placeholder-gray-500
                            ${inputActive ? 'bg-gray-100 text-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                        `}
                        placeholder={inputActive ? "메시지를 입력하세요" : "AI 상품 추천을 먼저 눌러주세요"}
                        disabled={!inputActive || loading}
                    />
                    <button
                        type="submit"
                        className={`w-10 h-10 ml-3 rounded-full flex items-center justify-center flex-shrink-0
                            ${inputActive && !loading ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}
                            transition-colors`}
                        disabled={!inputActive || loading}
                    >
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </div>
    );
}

// --- 최종 챗봇 컴포넌트 ---
export default function Chatbot() {
    const [isChatbotOpen, setIsChatbotOpen] = useState(false);

    return (
        <>
            <button 
                onClick={() => setIsChatbotOpen(prev => !prev)}
                className="fixed bottom-4 right-4 sm:right-8 w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform z-50"
                aria-label="챗봇 열기/닫기"
            >
                {isChatbotOpen ? <CloseIcon /> : <ChatbotIcon />}
            </button>
            
            <ChatbotWindow isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
        </>
    );
}
