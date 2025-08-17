import { create } from 'zustand';
import { useAuthStore } from './auth/authStore';
import { registerRefreshCallback, unregisterRefreshCallback } from './auth/authStore';
import { EventSourcePolyfill } from 'event-source-polyfill';

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
    totalUnread: number;
    size: number;
    results: Notification[];
}

interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    isSSEConnected: boolean;
    // 지연 표시를 위한 상태 추가
    delayedUnreadCount: number;
    fetchNotifications: () => Promise<void>;
    fetchUnreadCount: () => Promise<void>;
    startSSE: () => void;
    stopSSE: () => void;
    markAsRead: (id: number) => void;
    markChatAsRead: (chatroomId: number) => Promise<void>;
    clearAll: () => void;
    setUnreadCount: (count: number) => void;
    // 새로운 함수 추가
    checkAndMarkChatNotification: (chatroomId: number) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set, get) => {
    let eventSource: EventSourcePolyfill | null = null;
    
    // 토큰 갱신 성공 시 SSE 재시작 콜백
    const restartNotificationCallback = () => {
        const { isSSEConnected } = get();
        if (isSSEConnected) {
            console.log('🔄 토큰 갱신 성공, SSE 재연결');
            get().startSSE();
        }
    };

    // 현재 활성화된 채팅방 ID를 가져오는 함수
    const getCurrentChatRoomId = (): number | null => {
        if (typeof window === 'undefined') return null;
        
        const pathname = window.location.pathname;
        const chatRoomMatch = pathname.match(/^\/chat\/(\d+)$/);
        
        if (chatRoomMatch) {
            return parseInt(chatRoomMatch[1], 10);
        }
        
        return null;
    };

    // 탭이 활성화되어 있고 현재 채팅방에 있다면 알림을 자동으로 읽는 함수
    const autoMarkChatNotificationAsRead = async (chatroomId: number) => {
        // 탭이 활성화되어 있는지 확인
        if (document.visibilityState !== 'visible') {
            return;
        }

        // 현재 URL이 해당 채팅방인지 확인
        const currentRoomId = getCurrentChatRoomId();
        if (currentRoomId === chatroomId) {
            try {
                console.log(`🔔 현재 활성화된 채팅방(${chatroomId})의 알림을 자동으로 읽음 처리합니다.`);
                await get().markChatAsRead(chatroomId);
            } catch (error) {
                console.error('❌ 자동 알림 읽음 처리 실패:', error);
            }
        }
    };
    
    return {
        notifications: [],
        unreadCount: 0,
        isLoading: false,
        isSSEConnected: false,
        // 지연 표시를 위한 상태 추가
        delayedUnreadCount: 0,
        
        fetchNotifications: async () => {
            try {
                set({ isLoading: true });
                
                // authenticatedFetch를 사용하여 토큰 자동 갱신 처리
                const response = await useAuthStore.getState().authenticatedFetch('https://i13e202.p.ssafy.io/be/api/notifications');
                
                if (response.ok) {
                    const data: NotificationResponse = await response.json();
                    const totalUnread = data.totalUnread;
                    set({ 
                        notifications: data.results
                    });
                    // setUnreadCount를 사용하여 지연 표시 로직 적용
                    get().setUnreadCount(totalUnread);
                } else if (response.status === 401) {
                    console.log('❌ 토큰이 만료되어 알림 수신을 중지합니다.');
                    get().stopSSE();
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                // 에러 발생 시에도 연결은 계속 유지 (토큰 갱신 후 재시도)
            } finally {
                set({ isLoading: false });
            }
        },

        fetchUnreadCount: async () => {
            const token = useAuthStore.getState().getToken();
            const isLoggedIn = useAuthStore.getState().isLoggedIn;
            const isSignupRequired = useAuthStore.getState().isSignupRequired;
            if (!token || !isLoggedIn || isSignupRequired) return; // 이중 방어: 조건 불충분 시 API 호출하지 않음
            try {
                // authenticatedFetch를 사용하여 토큰 자동 갱신 처리
                const response = await useAuthStore.getState().authenticatedFetch('https://i13e202.p.ssafy.io/be/api/notifications/count');
                
                if (response.ok) {
                    const data = await response.json();
                    const newUnreadCount = data.totalUnread || 0;
                    // setUnreadCount를 사용하여 지연 표시 로직 적용
                    get().setUnreadCount(newUnreadCount);
                } else if (response.status === 401) {
                    console.log('❌ 토큰이 만료되어 알림 수신을 중지합니다.');
                    get().stopSSE();
                }
            } catch (error) {
                console.error('Failed to fetch unread count:', error);
                // 에러 발생 시에도 연결은 계속 유지 (토큰 갱신 후 재시도)
            }
        },
        
        startSSE: () => {
            // 기존 SSE 연결 종료
            if (eventSource) {
                eventSource.close();
            }
            
            const token = useAuthStore.getState().getToken();
            if (!token) {
                console.log('❌ 토큰이 없어 SSE를 시작할 수 없습니다.');
                return;
            }
            
            console.log('🔌 SSE 연결 시작');
            
            try {
                eventSource = new EventSourcePolyfill('https://i13e202.p.ssafy.io/be/api/notifications/stream', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                eventSource.onopen = () => {
                    console.log('✅ SSE 연결 성공');
                    set({ isSSEConnected: true });
                };
                
                eventSource.onmessage = (event) => {
                    console.log('📨 SSE 메시지 수신:', event);
                    // 일반 메시지 처리
                };
                
                eventSource.addEventListener('notification', (event) => {
                    console.log('🔔 알림 이벤트 수신:', event);
                    
                    // notification 이벤트 수신 시 읽지 않은 알림 수만 새로고침
                    get().fetchUnreadCount();
                });
                
                eventSource.onerror = async (error) => {
                    console.error('❌ SSE 연결 오류:', error);
                    set({ isSSEConnected: false });
                    
                    // 토큰 만료로 인한 401 에러인지 확인
                    try {
                        // 간단한 API 호출로 토큰 상태 확인 (authenticatedFetch가 자동으로 토큰 갱신 처리)
                        const response = await useAuthStore.getState().authenticatedFetch('https://i13e202.p.ssafy.io/be/api/notifications');
                        
                        if (response.ok) {
                            // 토큰이 유효하거나 갱신된 경우 SSE 재연결 시도
                            console.log('🔄 토큰이 유효하거나 갱신되었으므로 SSE 재연결 시도');
                            setTimeout(() => {
                                get().startSSE();
                            }, 1000); // 1초 후 재연결
                            return;
                        }
                    } catch (tokenCheckError) {
                        console.log('🔍 토큰 상태 확인 실패');
                    }
                    
                    // 토큰 갱신이 실패했거나 다른 오류인 경우
                    console.log('🔄 SSE 오류로 연결 중단');
                };
                
                // 토큰 갱신 콜백 등록
                registerRefreshCallback(restartNotificationCallback);
                
            } catch (error) {
                console.error('❌ SSE 연결 실패:', error);
                set({ isSSEConnected: false });
            }
        },
        
        stopSSE: () => {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
            set({ isSSEConnected: false });
            
            // SSE 중지 시 콜백 제거
            unregisterRefreshCallback(restartNotificationCallback);
        },
        
        markAsRead: (id) => set((state) => {
            const notification = state.notifications.find(notif => notif.id === id);
            const unreadCountToSubtract = notification ? notification.unreadCount : 0;
            const newUnreadCount = Math.max(0, state.unreadCount - unreadCountToSubtract);
            
            // setUnreadCount를 사용하여 지연 표시 로직 적용
            setTimeout(() => {
                get().setUnreadCount(newUnreadCount);
            }, 0);
            
            return {
                notifications: state.notifications.map(notif => 
                    notif.id === id ? { ...notif, unreadCount: 0 } : notif
                ),
                unreadCount: newUnreadCount
            };
        }),
        
        markChatAsRead: async (chatroomId: number) => {
            try {
                // console.log('📤 채팅방 알림 읽음 처리:', chatroomId);
                
                const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/notifications/mark/chat/${chatroomId}`, {
                    method: 'POST',
                });

                if (response.ok) {
                    console.log('✅ 채팅방 알림 읽음 처리 성공');
                    // 채팅방 알림 읽음 처리 성공 후 읽지 않은 알림 수만 새로고침
                    get().fetchUnreadCount();
                } else {
                    console.error('❌ 채팅방 알림 읽음 처리 실패:', response.status);
                }
            } catch (error) {
                console.error('❌ 채팅방 알림 읽음 처리 중 오류:', error);
            }
        },

        // 새로운 함수: 채팅방 알림 확인 및 자동 읽음 처리
        checkAndMarkChatNotification: async (chatroomId: number) => {
            await autoMarkChatNotificationAsRead(chatroomId);
        },
        
        clearAll: () => {
            set({
                notifications: [],
                unreadCount: 0,
                delayedUnreadCount: 0
            });
        },
        
        setUnreadCount: (count) => {
            // 현재 읽지 않은 알림 수를 즉시 업데이트
            set({ unreadCount: count });
            
            // 지연 표시 로직: 500ms 후에 delayedUnreadCount 업데이트
            if (count > 0) {
                // 읽지 않은 알림이 있는 경우 500ms 후에 표시
                setTimeout(() => {
                    const currentState = get();
                    // 500ms 후에도 여전히 읽지 않은 알림이 있는 경우에만 표시
                    if (currentState.unreadCount > 0) {
                        set({ delayedUnreadCount: count });
                    }
                }, 500);
            } else {
                // 읽지 않은 알림이 0인 경우 즉시 표시 제거
                set({ delayedUnreadCount: 0 });
            }
        }
    };
});
