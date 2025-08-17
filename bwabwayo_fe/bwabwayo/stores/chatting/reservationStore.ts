import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

const { authenticatedFetch } = useAuthStore.getState();

interface ReservationState {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  resetReservation: () => void;
  addSchedule: (startAt: Date, chatRoomId: number) => Promise<void>;
  videoSchedules: any[];
  getSchedule: () => Promise<void>;
  deleteSchedule: (chatRoomId: number, scheduleId: number) => Promise<void>;
}

export const useReservationStore = create<ReservationState>((set) => ({
  videoSchedules: [],
  selectedDate: null,
  selectedTime: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  resetReservation: () => set({ selectedDate: null, selectedTime: null }),

  getSchedule: async () => {
    try {
      const response = await authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/users/video`);
      const data = await response.json();
      console.log(data);
      // API 응답이 배열인지 확인하고, 배열이 아니면 빈 배열로 설정
      const schedules = Array.isArray(data) ? data : [];
      set({ videoSchedules: schedules });
    } catch (error) {
      console.error('Failed to get schedule', error);
      // 에러 발생 시 빈 배열로 설정
      set({ videoSchedules: [] });
    }
  },

  addSchedule: async (startAt: Date, chatRoomId: number) => {
    try {
      const scheduleData = {
        startAt: startAt.toISOString(),
      };
      
      const response = await authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${chatRoomId}/schedule`, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });
    }
    catch (error) {
      console.error('Failed to add schedule', error)
    }
  },

  deleteSchedule: async (chatRoomId: number, scheduleId: number) => {
    try {
      const response = await authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${chatRoomId}/schedule/${scheduleId}`, {
        method: 'DELETE',
      });
      console.log(response);
    } catch (error) {
      console.error('Failed to delete schedule', error)
    }
  }
}));
