'use client'

import { useRef, useEffect, useState } from 'react';
import { useNotificationStore, Notification } from '@/stores/notificationStore';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth/authStore';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const { notifications, unreadCount, markAsRead, fetchNotifications, isLoading } = useNotificationStore();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    // 2. isLoggedIn 상태를 가져옵니다.
    const { isLoggedIn } = useAuthStore();

    useEffect(() => {
        // 3. API 호출 로직 전체를 isLoggedIn 가드로 감싸줍니다.
        if (isLoggedIn) {
            if (isOpen) {
                setIsVisible(true);
                // 드롭다운이 열릴 때만 알림 목록을 가져옴
                // fetchNotifications();
            } else {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    // 드롭다운이 닫힐 때는 읽지 않은 알림 수만 업데이트
                    useNotificationStore.getState().fetchUnreadCount();
                }, 200);
                return () => clearTimeout(timer);
            }
        } else {
            // 로그아웃 상태일 때는 드롭다운이 보이지 않도록 처리
            setIsVisible(false);
        }
    // 4. 의존성 배열에 isLoggedIn을 추가합니다.
    }, [isOpen, isLoggedIn, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleNotificationClick = async (notification: Notification) => {
        markAsRead(notification.id);
        
        // 알림 클릭 시 POST 요청 전송
        await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/notifications/mark/${notification.id}`, { 
            method: 'POST' 
        });
        
        // 알림 목록을 다시 로딩하여 최신 상태로 업데이트
        await fetchNotifications();
        
        // chatroomId와 productId의 유무에 따라 페이지 이동
        if (notification.chatroomId) {
            // chatroomId가 있으면 채팅방으로 이동
            router.push(`/chat/${notification.chatroomId}`);
        } else if (notification.productId) {
            // productId가 있으면 상품 상세 페이지로 이동
            router.push(`/product/${notification.productId}`);
        } else {
            // 마이페이지로 이동
            router.push('/mypage');
        }
        
        // 드롭다운 닫기
        onClose();
        
        console.log('Notification clicked:', notification);
    };

    const handleDeleteNotification = async (e: React.MouseEvent, notification: Notification) => {
        e.stopPropagation(); // 알림 클릭 이벤트 전파 방지
        
        try {
            // 알림 읽기 요청 전송 (삭제 대신 읽음 처리)
            const response = await useAuthStore.getState().authenticatedFetch(`https://i13e202.p.ssafy.io/be/api/notifications/mark/${notification.id}`, { 
                method: 'POST' 
            });
            
            if (response.ok) {
                // 로컬 상태 업데이트
                markAsRead(notification.id);
                // 알림 목록 새로고침
                await fetchNotifications();
                console.log('Notification marked as read:', notification.id);
            } else {
                console.error('Failed to mark notification as read:', response.status);
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return '방금 전';
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
        return `${Math.floor(diffInMinutes / 1440)}일 전`;
    };

    if (!isVisible) return null;

    return (
        <div 
            ref={dropdownRef}
            className={`absolute top-full right-0 mt-2 w-80 bg-white border-2 border-black rounded-lg shadow-lg z-50 transition-all duration-200 ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
        >
            {/* 말풍선 꼬리 */}
            {/* <div className="absolute -top-3.5 left-27 w-0 h-0 border-l-[14px] border-r-[14px] border-b-[14px] border-l-transparent border-r-transparent border-b-black"></div>
            <div className="absolute -top-3 left-27 w-0 h-0 border-l-[14px] border-r-[13px] border-b-[13px] border-l-transparent border-r-transparent border-b-white"></div> */}
            
                <div className="p-4 border-b-2 border-black">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">알림</h3>
                </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto pb-2">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        로딩 중...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        새로운 알림이 없습니다
                    </div>
                ) : (
                    notifications.map((notification, index) => (
                        <div
                            key={notification.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                notification.unreadCount > 0 ? 'bg-blue-50' : ''
                            } ${
                                index < notifications.length - 1 ? 'border-b border-gray-200' : ''
                            } ${
                                index === notifications.length - 1 ? 'rounded-b-lg' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    <img
                                        // className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                                        className="w-12 h-12 object-cover rounded-lg"
                                        src={notification.thumbnail || '/image/no-image.jpg'}
                                        alt={notification.title}
                                        style={{ height: `${48}px`, width: `${48}px` }}
                                        />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                                            {notification.title}
                                        </h4>
                                        <div className="flex items-center gap-2">
                                            {notification.unreadCount > 0 && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                            )}
                                            <button
                                                onClick={(e) => handleDeleteNotification(e, notification)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
                                                title="알림 읽음 처리"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {formatDate(notification.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
