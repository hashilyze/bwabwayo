import Image from "next/image";

export default function ChatDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center gap-4">
          <Image src="/logo.png" alt="" className="h-10" width={95} height={40} />
          <p className="text-mg text-[#666]">대화방을 선택해주세요</p>
      </div>
    </div>
  )
} 