import { create } from 'zustand';
import { useAuthStore } from '@/stores/auth/authStore';
import { useChatRoomStore } from '@/stores/chatting/chatRoomStore';

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
  videoSchedule: any[];
  getSchedule: () => Promise<void>;
}

export const useReservationStore = create<ReservationState>((set) => ({
  videoSchedule: [],
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
      set({ videoSchedule: data });
    } catch (error) {
      console.error('Failed to get schedule', error);
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

      /*if (response.ok) {
        // 예약 완료 후 채팅방에 공지글 전송
        const { sendMessage } = useChatRoomStore.getState();
        const formattedDate = startAt.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        //const noticeMessage = `📅 화상 채팅이 예약되었습니다!\n\n📆 예약 일시: ${formattedDate}\n\n⏰ 예약된 시간에 맞춰 화상 채팅을 시작해주세요.`;
        
        //sendMessage(chatRoomId, noticeMessage);
      }*/
    }
    catch (error) {
      console.error('Failed to add schedule', error)
    }
  }
}));
