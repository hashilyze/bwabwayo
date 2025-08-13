"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useReservationStore } from "@/stores/chatting/reservationStore";
import { useChatRoomStore } from "@/stores/chatting/chatRoomStore";

interface ReservationModalProps {
  onClose: () => void;
  chatRoomId: number;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ onClose, chatRoomId }) => {
  const {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    resetReservation,
    addSchedule,
  } = useReservationStore();

  const { sendMessage } = useChatRoomStore();

  // Cleanup reservation state on unmount
  useEffect(() => {
    return () => {
      resetReservation();
    };
  }, [resetReservation]);

  const handleDateChange = (value: any) => {
    const date = value instanceof Date ? value : new Date(value);
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when new date is selected
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
  };

  const handleReservation = async () => {
    if (selectedDate && selectedTime) {
      // 날짜와 시간을 합쳐서 startAt 변수 생성
      const [hours, minutes] = selectedTime.split(':');
      const startAt = new Date(selectedDate);
      startAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      try {
        await addSchedule(startAt, chatRoomId);
        
        // 예약 완료 후 채팅방에 예약 정보 메시지 전송
        const reservationMessage = JSON.stringify({
          startAt: startAt.toISOString(),
          points: 1000, // 기본 포인트
          scheduleId: Date.now() // 임시 ID (실제로는 서버에서 받아야 함)
        });
        
        // await sendMessage(chatRoomId, reservationMessage, "RESERVE_VIDEOCALL");
        
        alert("예약되었습니다.");
        onClose(); // 모달 닫기
      } catch (error) {
        console.error("예약 중 오류:", error);
        alert("예약 중 오류가 발생했습니다.");
      }
    } else {
      alert("날짜와 시간을 모두 선택해주세요.");
    }
  };

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 flex items-end z-5">
      <div className="bg-white rounded-lg w-full relative h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold mb-4">화상 채팅 예약</h2>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
              X
            </button>
          </div>
          <div className="calender-wrap flex justify-center">
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()} // Prevent selecting past dates
            />
          </div>
          {selectedDate && (
            <div className="mt-4 animate-in fade-in duration-500">
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                시간 선택
              </label>
              <input
                type="time"
                id="time"
                value={selectedTime || ""}
                onChange={handleTimeChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
            <button
              onClick={handleReservation}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={!selectedDate || !selectedTime} // Disable button if date or time is not selected
            >
              예약하기
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReservationModal;