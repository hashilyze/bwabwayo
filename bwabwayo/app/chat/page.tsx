import Image from "next/image";

export default function ChatDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50">
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Image src="/logo.png" alt="로고" className="h-8" width={95} height={40} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">채팅</h2>
          <p className="text-gray-600 mb-4">대화방을 선택해주세요</p>
          <div className="flex items-center justify-center text-sm text-gray-500">
            <span className="mr-2">💬</span>
            <span>좌측에서 채팅방을 선택하여 대화를 시작하세요</span>
          </div>
        </div>
      </div>
    </div>
  )
} 