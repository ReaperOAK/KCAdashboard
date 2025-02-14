import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ApiService from '../utils/api';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();

    const fetchNotifications = async () => {
        try {
            const response = await ApiService.get('/notifications/get.php');
            setNotifications(response.notifications);
            setUnreadCount(response.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await ApiService.post('/notifications/mark-read.php', { id: notificationId });
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white hover:bg-[#461fa3] rounded-full"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
                    <div className="p-4 border-b">
                        <h3 className="text-lg font-semibold text-[#200e4a]">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="p-4 text-gray-500">No notifications</p>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification.id}
                                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                        !notification.is_read ? 'bg-blue-50' : ''
                                    }`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <h4 className="font-semibold text-[#461fa3]">{notification.title}</h4>
                                    <p className="text-sm text-gray-600">{notification.message}</p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(notification.created_at).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
