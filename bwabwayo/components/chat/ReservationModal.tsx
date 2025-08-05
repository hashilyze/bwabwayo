"use client";

import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useReservationStore } from "@/stores/chatting/reservationStore";

interface ReservationModalProps {
  onClose: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("reservation");
  const {
    selectedDate,
    selectedTime,
    setSelectedDate,
    setSelectedTime,
    resetReservation,
  } = useReservationStore();

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

  const handleReservation = () => {
    if (selectedDate && selectedTime) {
      alert(
        `예약 완료!\n날짜: ${selectedDate.toLocaleDateString()}\n시간: ${selectedTime}`
      );
      onClose();
    } else {
      alert("날짜와 시간을 모두 선택해주세요.");
    }
  };

  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 flex items-end z-5">
      <div className="bg-white p-8 rounded-lg w-full h-[500px]">
          <div>
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
        <div className="mt-6 flex justify-end">
            <button
              onClick={handleReservation}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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