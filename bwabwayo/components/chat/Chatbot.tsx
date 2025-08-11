"use client";

import React, { useState, useEffect, useRef } from "react";
import { useChatBotStore } from "@/stores/chatBotStore";
import Link from "next/link";

// --- 타입 정의 ---
type DisplayMessage = {
  type: "greeting" | "user" | "bot" | "button" | "listings";
  text: string;
  actions?: Action[];
  meta?: { productName?: string; productId?: number };
  items?: ListingItem[];
};

type Action = { key: "SIMILAR"; label: string; query: string };

type ListingItem = {
  id: number;
  title: string;
  price?: number | null;
  imageUrl?: string;
  categoryName?: string;
  href?: string;
};

// --- 아이콘 ---
const CloseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-6 h-6 text-gray-500 hover:text-black"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const SendIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6 text-white"
  >
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const ChatbotIcon = () => (
  <img
    src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/icon/chat-bot.png`}
    alt="챗봇 아이콘"
  />
);

// --- 챗봇 창 ---
function ChatbotWindow({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      type: "bot",
      text: "안녕하세요, 봐봐요 챗봇입니다! 😊\n필요한 물건이 있으신가요?\nAI에게 추천을 받아보세요.",
    },
    { type: "button", text: "AI 상품 추천" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [inputActive, setInputActive] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const chatbotWindowRef = useRef<HTMLDivElement>(null);

  const { chatBot, getChatBot, loading, error, clearChatBot } =
    useChatBotStore();

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (
      !loading &&
      !error &&
      chatBot &&
      Array.isArray(chatBot.products) &&
      chatBot.products.length > 0
    ) {
      const lastUserMessage = [...messages]
        .reverse()
        .find((msg) => msg.type === "user");
      const userQuery = lastUserMessage ? lastUserMessage.text : "요청하신";
      const cleanedQuery =
        userQuery
          .replace(
            /(추천해줘|알려줘|찾아줘|추천해 줘|추천|알려|찾아|보여줘|골라줘|검색해줘)/g,
            ""
          )
          .trim() || "요청하신 상품";

      const items = chatBot.products;

      const summaryMessage: DisplayMessage = {
        type: "bot",
        text: `${cleanedQuery} 추천해드릴게요!`,
      };

      const detailMessages: DisplayMessage[] = items.map(
        (product: any, index: number) => ({
          type: "bot",
          text: `${index + 1}번째\n제품명 : ${product.name}\n ${
            product.feature
          }\n가격대 : ${product.priceRange}\n장점 : ${product.advantage}`,
          meta: { productName: product.name, productId: product.id },
          actions: [
            {
              key: "SIMILAR",
              label: "유사한 판매글 보기",
              query: product.name,
            },
          ],
        })
      );

      setMessages((prev) => [...prev, summaryMessage, ...detailMessages]);
      if (clearChatBot) clearChatBot();
    }
  }, [chatBot, loading, error, clearChatBot, messages]);

  const handleActionClick = async (action: Action) => {
    if (action.key !== "SIMILAR") return;
    const keyword = action.query;

    setMessages((prev) => [
      ...prev,
      { type: "bot", text: `“${keyword}” 관련 판매글을 찾는 중이에요...` },
    ]);

    try {
      const res = await fetch(
        `https://i13e202.p.ssafy.io/be/api/ai?keyword=${encodeURIComponent(
          keyword
        )}`
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      const items: ListingItem[] = list.slice(0, 5).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: typeof p.price === "number" ? p.price : null,
        imageUrl:
          Array.isArray(p.imageUrls) && p.imageUrls[0]
            ? p.imageUrls[0]
            : undefined, // 절대 URL
        categoryName: p.categoryName,
        href: `/product/${p.id}`,
      }));

      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.text?.includes("관련 판매글을 찾는 중")) next.pop();
        return [
          ...next,
          { type: "listings", text: `“${keyword}” 유사한 판매글`, items },
        ];
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "죄송해요. 지금은 유사 판매글을 불러올 수 없어요.",
        },
      ]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const userMessage: DisplayMessage = { type: "user", text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    getChatBot(inputValue);
    setInputValue("");
  };

  const handleQuickAction = (actionText: string) => {
    const userMessage: DisplayMessage = { type: "user", text: actionText };

    if (actionText === "AI 상품 추천") {
      setMessages((prev) => [
        ...prev.filter((msg) => msg.type !== "button"),
        userMessage,
        {
          type: "bot",
          text: `어떤 상품이 궁금하신가요? 예: 스마트폰, 경제책, 운동화`,
        },
      ]);
      setInputActive(true);
    } else {
      setMessages((prev) => [...prev, userMessage]);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        chatbotWindowRef.current &&
        !chatbotWindowRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div
      ref={chatbotWindowRef}
      className={`fixed z-98 bottom-24 right-4 sm:right-8
                  w-[456px] h-[642px]
                  bg-white rounded-[40px] shadow-2xl flex flex-col overflow-hidden
                  transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-5 pointer-events-none"
                  }`}
    >
      <header className="flex items-center px-6 pt-4 pb-2 flex-shrink-0">
        <span className="text-[22px] font-bold text-green-600">AI 챗봇</span>
        <button
          onClick={onClose}
          className="ml-auto p-1 rounded-full hover:bg-gray-200"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="h-px bg-gray-200 w-full" />

      <main
        ref={chatAreaRef}
        className="flex-1 px-6 py-5 overflow-y-auto space-y-4"
      >
        {messages.map((msg, index) => {
          if (msg.type === "greeting") {
            return (
              <div key={index} className="flex justify-center">
                <div className="text-gray-800 text-xs font-bold">
                  {msg.text}
                </div>
              </div>
            );
          }

          if (msg.type === "user") {
            return (
              <div key={index} className="flex justify-end">
                {/* 사용자 말풍선: 폰트 16px, 너비 살짝↑ */}
                <div className="bg-green-600 text-white rounded-2xl rounded-br-lg px-4 py-3 max-w-[88%] text-[17px] font-medium whitespace-pre-wrap">
                  {msg.text}
                </div>
              </div>
            );
          }

          // 유사 판매글 카드
          if (msg.type === "listings") {
            const items = msg.items ?? [];
            const FALLBACK = "/image/no-image.jpg";

            return (
              <div key={index} className="flex flex-col items-start space-y-2">
                {/* 리스트 컨테이너: 폰트 16px, 너비↑ */}
                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-3 max-w-[94%] text-[17px]">
                  <div className="font-semibold mb-2">{msg.text}</div>

                  {items.length === 0 ? (
                    <div className="text-sm text-gray-500">결과가 없어요.</div>
                  ) : (
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li key={item.id} className="flex gap-3 items-start">
                          {/* 썸네일: 72 → 80 */}
                          <img
                            className="w-[80px] h-[80px] rounded-lg object-cover bg-gray-200 flex-shrink-0"
                            src={item.imageUrl || FALLBACK}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              img.onerror = null;
                              img.src = FALLBACK;
                            }}
                          />
                          {/* 오른쪽 정보 */}
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-[17px] font-medium leading-[1.5rem] whitespace-pre-wrap break-words break-all"
                              style={{ hyphens: "auto" }}
                            >
                              {item.title}
                            </div>

                            {item.categoryName && (
                              <div className="text-xs text-gray-500 mt-0.5">
                                {item.categoryName}
                              </div>
                            )}

                            <div className="text-sm mt-1">
                              {typeof item.price === "number"
                                ? `${item.price.toLocaleString()}원`
                                : "-"}
                            </div>

                            <div className="mt-1">
                              <Link
                                href={`/product/${item.id}`}
                                className="text-xs text-green-700 underline hover:text-green-800"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                판매글 보기
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          }

          // 일반 봇 메시지
          if (msg.type === "bot") {
            const isFirstBot =
              index === messages.findIndex((m) => m.type === "bot");
            return (
              <div key={index} className="flex flex-col items-start space-y-2">
                {/* 챗봇 말풍선: 폰트 16px, 너비↑, 패딩↑ */}
                <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-5 py-4 max-w-[90%] text-[17px] whitespace-pre-wrap leading-[1.5rem]">
                  {msg.text}

                  {isFirstBot && !inputActive && (
                    <div className="mt-3 flex">
                      <button
                        onClick={() => handleQuickAction("AI 상품 추천")}
                        className="flex items-center gap-2 bg-[#6FD962] text-white font-bold rounded-full px-6 py-2 shadow-md hover:scale-105 text-sm"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        AI 상품 추천
                      </button>
                    </div>
                  )}

                  {msg.actions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {msg.actions.map((a, i) => (
                        <button
                          key={i}
                          onClick={() => handleActionClick(a)}
                          className="px-4 py-2 text-sm font-semibold rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow"
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          }

          return null;
        })}

        {/* 로딩 버블 */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-3 max-w-[90%] text-[17px]">
              AI가 생각 중입니다...
            </div>
          </div>
        )}
      </main>

      <footer className="px-6 py-4 bg-white flex items-center border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="w-full flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`flex-1 rounded-full px-5 py-3 outline-none text-[17px] placeholder-gray-500 ${
              inputActive
                ? "bg-gray-100 text-gray-800"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
            placeholder={
              inputActive
                ? "메시지를 입력하세요"
                : "AI 상품 추천을 먼저 눌러주세요"
            }
            disabled={!inputActive || loading}
          />
          <button
            type="submit"
            className={`w-[42px] h-[42px] ml-3 rounded-full flex items-center justify-center flex-shrink-0 ${
              inputActive && !loading
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400"
            } transition-colors`}
            disabled={!inputActive || loading}
          >
            <SendIcon />
          </button>
        </form>
      </footer>
    </div>
  );
}

// --- 최종 챗봇 ---
export default function Chatbot() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsChatbotOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 sm:right-8 w-16 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-full shadow-xl flex items-center justify-center text-white transform hover:scale-110 transition-transform z-50"
        aria-label="챗봇 열기/닫기"
      >
        {isChatbotOpen ? <CloseIcon /> : <ChatbotIcon />}
      </button>

      <ChatbotWindow
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </>
  );
}
