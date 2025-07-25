import React from "react";

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className }: ChatbotProps) {
  return (
    <div className="hidden w-[391px] h-[564px] bg-white rounded-[40px] shadow-lg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center px-6 pt-4 pb-2">
        {/* Back Arrow Icon Placeholder */}
        <button className="w-6 h-6 mr-2">
          {/* TODO: Replace with actual SVG icon */}
          <span className="sr-only">Back</span>
        </button>
        <span className="text-[20px] font-bold text-[#3369ff]">AI 챗봇</span>
        {/* Close Icon Placeholder */}
        <button className="ml-auto w-6 h-6">
          {/* TODO: Replace with actual SVG icon */}
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="h-[1px] bg-[#ececec] w-full" />
      {/* Quick Actions */}
      <div className="px-6 py-4">
        <div className="space-y-2">
          <button className="w-full bg-[#f4f4f4] rounded-[30px] py-2 text-center text-xs font-medium text-[#3e3e3e]">AI 상품 추천</button>
          <button className="w-full bg-[#f4f4f4] rounded-[30px] py-2 text-center text-xs font-medium text-[#3e3e3e]">자주 묻는 질문</button>
        </div>
      </div>
      {/* Chat Area */}
      <div className="flex-1 px-6 py-2 overflow-y-auto space-y-4">
        {/* Bot Message */}
        <div className="flex justify- end">
          <div className="bg-[#3369ff] text-white rounded-[20px] px-4 py-3 max-w-[70%] text-xs font-medium">
            What is the best programming language?
          </div>
        </div>
        {/* User Message */}
        <div className="flex justify-start">
          <div className="bg-[#eeeeee] text-[#656565] rounded-[20px] px-4 py-3 max-w-[70%] text-xs">
            There are many programming languages ​​in the market that are used in designing and building websites, various applications and other tasks.
          </div>
        </div>
        {/* Greeting */}
        <div className="flex justify-center">
          <div className="text-[#3f3f3f] text-xs font-bold">안녕하세요, 무엇이 궁금하신가요?</div>
        </div>
      </div>
      {/* Input Area */}
      <div className="px-6 py-4 bg-white flex items-center rounded-b-[40px] shadow-inner">
        <input
          type="text"
          className="flex-1 bg-transparent outline-none text-sm text-[#a2a2a2] placeholder-[#a2a2a2] font-bold"
          placeholder="Write your message"
        />
        {/* Mic Icon Placeholder */}
        <button className="w-6 h-6 ml-2">
          {/* TODO: Replace with actual SVG icon */}
          <span className="sr-only">Mic</span>
        </button>
        {/* Send Icon Placeholder */}
        <button className="w-6 h-6 ml-2">
          {/* TODO: Replace with actual SVG icon */}
          <span className="sr-only">Send</span>
        </button>
      </div>
    </div>
  );
} 