import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';

const { authenticatedFetch } = useAuthStore.getState();

interface Schedule {
  created_at: Date;
  productId: number;
}

interface ReservationState {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  resetReservation: () => void;
  addSchedule: (startAt: Date, chatRoomId: number) => Promise<void>;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedDate: null,
  selectedTime: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  resetReservation: () => set({ selectedDate: null, selectedTime: null }),

  addSchedule: async (startAt: Date, chatRoomId: number) => {
    try {
      const scheduleData = {
        startAt: startAt.toISOString(),
      };
      
      const response = await authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/chatrooms/${chatRoomId}/schedule`, {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });

      // console.log(response)
    }
    catch (error) {
      console.error('Failed to add schedule', error)
    }
  }
}));
