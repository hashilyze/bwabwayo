import { create } from 'zustand';
import { useAuthStore } from './auth/authStore';
import { registerRefreshCallback, unregisterRefreshCallback } from './auth/authStore';

export interface Notification {
    id: number;
    title: string;
    message: string;
    createdAt: string;
    thumbnail: string;
    unreadCount: number;
    receiverId: string;
    productId: number;
    chatroomId: number;
}

interface NotificationResponse {
    size: number;
    results: Notification[];
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isPolling: boolean;
    fetchNotifications: () => Promise<void>;
    startPolling: (interval?: number) => void;
    stopPolling: () => void;
    markAsRead: (id: number) => void;
    clearAll: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
    let pollingInterval: NodeJS.Timeout | null = null;
    let currentInterval: number = 10000; // 현재 폴링 간격 저장
    
    // 토큰 갱신 성공 시 폴링 재시작 콜백
    const restartPollingCallback = () => {
        const { isPolling } = get();
        if (isPolling) {
            console.log('🔄 토큰 갱신 성공, 알림 폴링 재시작');
            // 현재 폴링 간격으로 재시작
            get().startPolling(currentInterval);
        }
    };
    
    return {
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        isPolling: false,
        
        fetchNotifications: async () => {
            try {
                set({ isLoading: true });
                
                // authenticatedFetch를 사용하여 토큰 자동 갱신 처리
                const response = await useAuthStore.getState().authenticatedFetch('https://i13e202.p.ssafy.io/be/api/notifications');
                
                if (response.ok) {
                    const data: NotificationResponse = await response.json();
                    const totalUnread = data.results.reduce((sum, notif) => sum + notif.unreadCount, 0);
                    set({ 
                        notifications: data.results,
                        unreadCount: totalUnread
                    });
                } else if (response.status === 401) {
                    console.log('❌ 토큰이 만료되어 폴링을 중지합니다.');
                    get().stopPolling();
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                // 에러 발생 시에도 폴링은 계속 유지 (토큰 갱신 후 재시도)
            } finally {
                set({ isLoading: false });
            }
        },
        
        startPolling: (interval: number = 10000) => {
            // 기존 폴링 중지
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
            
            // 현재 간격 저장
            currentInterval = interval;
            
            console.log('🚀 알림 폴링 시작');
            
            // 즉시 한 번 실행
            get().fetchNotifications();
            
            // 주기적으로 실행
            pollingInterval = setInterval(() => {
                get().fetchNotifications();
            }, interval);
            
            set({ isPolling: true });
            
            // 토큰 갱신 콜백 등록 (폴링 시작 시에만)
            registerRefreshCallback(restartPollingCallback);
        },
        
        stopPolling: () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            set({ isPolling: false });
            
            // 폴링 중지 시 콜백 제거
            unregisterRefreshCallback(restartPollingCallback);
        },
        
        markAsRead: (id) => set((state) => {
            const notification = state.notifications.find(notif => notif.id === id);
            const unreadCountToSubtract = notification ? notification.unreadCount : 0;
            
            return {
                notifications: state.notifications.map(notif => 
                    notif.id === id ? { ...notif, unreadCount: 0 } : notif
                ),
                unreadCount: Math.max(0, state.unreadCount - unreadCountToSubtract)
            };
        }),
        
        clearAll: () => set({
            notifications: [],
            unreadCount: 0
        }),
        
        setUnreadCount: (count) => set({ unreadCount: count })
    };
});
