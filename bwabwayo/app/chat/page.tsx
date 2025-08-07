import Image from "next/image";
export default function ChatDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative h-10 w-40"><Image src="/logo.png" alt="Bwabwayo Logo" fill style={{objectFit: 'contain'}} /></div>
          <p className="text-mg text-[#666]">대화방을 선택해주세요</p>
      </div>
    </div>
  )
} 