'use client'

import { useRef, useEffect, useState } from 'react';
import { useNotificationStore, Notification } from '@/stores/notificationStore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ isOpen, onClose }: NotificationDropdownProps) {
    const { notifications, unreadCount, markAsRead, fetchNotifications, isLoading } = useNotificationStore();
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            // 드롭다운이 열릴 때 알림 목록을 가져옴
            fetchNotifications();
        } else {
            const timer = setTimeout(() => setIsVisible(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, fetchNotifications]);

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
            <div className="p-4 border-b-2 border-black">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">알림</h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-500">
                        로딩 중...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        새로운 알림이 없습니다
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                                notification.unreadCount > 0 ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => handleNotificationClick(notification)}
                        >
                            <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                    {/* <Image
                                        src={notification.thumbnail}
                                        alt="상품 썸네일"
                                        width={48}
                                        height={48}
                                        className="w-12 h-12 object-cover rounded-lg"
                                    /> */}
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
                                        {notification.unreadCount > 0 && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                                        )}
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
