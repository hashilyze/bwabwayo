import { create } from 'zustand';

interface ReservationState {
  selectedDate: Date | null;
  selectedTime: string | null;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string | null) => void;
  resetReservation: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedDate: null,
  selectedTime: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  resetReservation: () => set({ selectedDate: null, selectedTime: null }),
}));
