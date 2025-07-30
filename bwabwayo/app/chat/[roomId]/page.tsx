import ChatModal from '@/components/chat/ChatModal'

export default function ChatRoomPage({ params }: { params: { roomId: number } }) {
  const roomId = params.roomId;

  return (
    <div className="h-full flex flex-col justify-between">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="text-center">
          <h1 className="text-[28px] font-bold text-black mb-4">채팅방 {roomId}</h1>
          <p className="text-lg font-semibold text-black">고윤정님과의 대화</p>
          <p className="text-sm text-gray-500 mt-2">여기에 실제 채팅 메시지들이 표시됩니다</p>
        </div>
      </div>

      <ChatModal />
    </div>
  )
} 