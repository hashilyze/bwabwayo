'use client';

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function ChatPage() {
  const [roomId, setRoomId] = useState('room1');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // 방 입장
    socket.emit('join-room', roomId);

    // 메시지 수신
    socket.on('chat-message', ({ message, sender }) => {
      setMessages((prev) => [...prev, `${sender}: ${message}`]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [roomId]);

  const handleSend = () => {
    if (message.trim()) {
      socket.emit('chat-message', { roomId, message });
      setMessages((prev) => [...prev, `Me: ${message}`]);
      setMessage('');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">💬 채팅방: {roomId}</h1>
      <div className="border p-4 h-60 overflow-y-auto mb-4 bg-gray-100">
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 flex-1"
          placeholder="메시지를 입력하세요"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4">
          보내기
        </button>
      </div>
    </div>
  );
}