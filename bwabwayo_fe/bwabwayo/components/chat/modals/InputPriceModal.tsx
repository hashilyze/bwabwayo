'use client'

import React, { useState } from 'react';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';

interface InputPriceModalProps {
  onClose: () => void;
  roomId: number;
}

const InputPriceModal: React.FC<InputPriceModalProps> = ({ onClose, roomId }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [price, setPrice] = useState('');
  const { sendMessage } = useChatRoomStore();

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log('최종 거래 가격 설정:', price);
    
    if (price.trim()) {
      // 가격 설정 후 REQUEST_DEPOSIT 타입 메시지 전송
      sendMessage(roomId, `최종 거래 가격: ${price}원`, "REQUEST_DEPOSIT");
      onClose();
    }
  }

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 flex items-end z-50">
      <div className="bg-white rounded-lg w-full relative h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4">최종 거래 가격 설정</h2>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
            >
              X
            </button>
          </div>
          
          <div className="flex flex-col items-center justify-center h-full">
            <div className="flex items-center gap-4 mb-8">
              <img
                className="w-[75px] h-[75px] object-cover"
                alt="Money icon"
                src={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/money-icon.png`}
              />
              <div className="text-center">
                <p className="text-lg font-medium text-black mb-2">
                  최종 거래 가격을 입력해주세요!
                </p>
                <p className="text-sm text-gray-600">
                  구매자와 합의한 최종 가격을 설정해주세요
                </p>
              </div>
            </div>
            
            <div className="w-full max-w-md">
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                최종 거래 가격
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="가격을 입력하세요 (예: 70000)"
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-lg"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                숫자만 입력해주세요 (원 단위)
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
          <button
            onClick={(e) => handleSubmit(e)}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded text-lg"
            disabled={!price.trim()}
          >
            가격 설정하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputPriceModal;
