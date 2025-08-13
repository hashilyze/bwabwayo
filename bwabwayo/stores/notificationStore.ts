import { create } from 'zustand';

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
    fetchNotifications: (token: string) => Promise<void>;
    startPolling: (token: string, interval?: number) => void;
    stopPolling: () => void;
    markAsRead: (id: number) => void;
    clearAll: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    return {
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        isPolling: false,
        
        fetchNotifications: async (token: string) => {
            try {
                set({ isLoading: true });
                const response = await fetch('https://i13e202.p.ssafy.io/be/api/notifications', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (response.ok) {
                    const data: NotificationResponse = await response.json();
                    const totalUnread = data.results.reduce((sum, notif) => sum + notif.unreadCount, 0);
                    set({ 
                        notifications: data.results,
                        unreadCount: totalUnread
                    });
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            } finally {
                set({ isLoading: false });
            }
        },
        
        startPolling: (token: string, interval: number = 10000) => {
            // 기존 폴링 중지
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
            
            // 즉시 한 번 실행
            get().fetchNotifications(token);
            
            // 주기적으로 실행
            pollingInterval = setInterval(() => {
                get().fetchNotifications(token);
            }, interval);
            
            set({ isPolling: true });
        },
        
        stopPolling: () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
                pollingInterval = null;
            }
            set({ isPolling: false });
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
