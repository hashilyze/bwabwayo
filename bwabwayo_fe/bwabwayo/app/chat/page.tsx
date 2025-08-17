'use client'

export default function ChatDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex flex-col items-center justify-center gap-4">
          <div className="relative h-10 w-40"><img src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/logo.png`} alt="Bwabwayo Logo" style={{objectFit: 'contain'}} /></div>
          <p className="text-mg text-[#666]">대화방을 선택해주세요</p>
      </div>
    </div>
  )
} 