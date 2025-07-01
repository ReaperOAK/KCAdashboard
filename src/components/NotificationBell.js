
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../utils/api';

const NOTIFICATION_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'general', label: 'General' },
  { id: 'class', label: 'Classes' },
  { id: 'tournament', label: 'Tournaments' },
  { id: 'assignment', label: 'Assignments' },
  { id: 'attendance', label: 'Attendance' },
  { id: 'announcement', label: 'Announcements' },
  { id: 'achievement', label: 'Achievements' }
];

const getCategoryColor = (category) => {
  const colors = {
    general: 'bg-gray-500',
    class: 'bg-secondary',
    tournament: 'bg-accent',
    assignment: 'bg-highlight',
    attendance: 'bg-orange-500',
    announcement: 'bg-blue-500',
    achievement: 'bg-green-600'
  };
  return colors[category] || 'bg-gray-500';
};

const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
};

const NotificationCategoryTabs = React.memo(function NotificationCategoryTabs({ categories, activeCategory, onChange }) {
  return (
    <div className="flex p-2 space-x-2 overflow-x-auto">
      {categories.map(category => (
        <button
          key={category.id}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${
            activeCategory === category.id
              ? 'bg-secondary text-white'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-dark'
          }`}
          onClick={() => onChange(category.id)}
          aria-pressed={activeCategory === category.id}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
});

const NotificationList = React.memo(function NotificationList({ notifications, onNotificationClick, onDelete }) {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-2.586a1 1 0 0 0-.707.293l-2.414 2.414a1 1 0 0 1-.707.293h-3.172a1 1 0 0 1-.707-.293l-2.414-2.414A1 1 0 0 0 6.586 13H4" />
        </svg>
        <p className="mt-2">No notifications in this category</p>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto flex-grow">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
            notification.is_read ? '' : 'bg-blue-50'
          }`}
          onClick={() => onNotificationClick(notification)}
          tabIndex={0}
          role="button"
          aria-label={`Notification: ${notification.title}`}
        >
          <div className="flex justify-between items-start">
            <span className={`px-2 py-1 text-xs rounded-full text-white ${getCategoryColor(notification.category)}`}>{notification.category}</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">{getRelativeTime(notification.created_at)}</span>
              <button
                onClick={e => onDelete(e, notification.id)}
                className="text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-accent rounded"
                aria-label="Delete notification"
                tabIndex={0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <h4 className="font-semibold text-secondary mt-2">{notification.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
          {notification.link && (
            <div className="mt-2">
              <a
                onClick={e => e.stopPropagation()}
                href={notification.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-secondary hover:underline inline-flex items-center focus:outline-none focus:ring-2 focus:ring-accent rounded"
                aria-label="View details"
              >
                <span>View details</span>
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

const NotificationPanel = React.memo(function NotificationPanel({
  isOpen,
  unreadCount,
  categories,
  activeCategory,
  onCategoryChange,
  notifications,
  onNotificationClick,
  onDelete,
  onMarkAllAsRead,
  onSettingsClick
}) {
  if (!isOpen) return null;
  return (
    <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 max-h-[80vh] flex flex-col border border-gray-light">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="text-sm text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
            aria-label="Mark all as read"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="border-b">
        <NotificationCategoryTabs categories={categories} activeCategory={activeCategory} onChange={onCategoryChange} />
      </div>
      <NotificationList notifications={notifications} onNotificationClick={onNotificationClick} onDelete={onDelete} />
      <div className="p-3 border-t text-center">
        <button
          onClick={onSettingsClick}
          className="text-sm text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded"
          aria-label="Notification Settings"
        >
          Notification Settings
        </button>
      </div>
    </div>
  );
});

export function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const notificationRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await ApiService.get('/notifications/get.php');
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (error) {
      // Optionally show a toast or error boundary
      // console.error('Failed to fetch notifications:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Filter notifications by category
  const filteredNotifications = useMemo(() => {
    if (activeCategory === 'all') return notifications;
    return notifications.filter(n => n.category === activeCategory);
  }, [notifications, activeCategory]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const markAsRead = useCallback(async (notificationId) => {
    try {
      await ApiService.post('/notifications/mark-read.php', { id: notificationId });
      fetchNotifications();
    } catch {}
  }, [fetchNotifications]);

  const handleCategoryChange = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  const handleNotificationClick = useCallback((notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      if (notification.link.startsWith('/')) {
        navigate(notification.link);
      } else {
        window.open(notification.link, '_blank');
      }
    }
    if (window.innerWidth < 768) setIsOpen(false);
  }, [navigate, markAsRead]);

  const markAllAsRead = useCallback(async () => {
    try {
      await ApiService.post('/notifications/mark-all-read.php');
      fetchNotifications();
    } catch {}
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (e, notificationId) => {
    e.stopPropagation();
    try {
      await ApiService.post('/notifications/delete.php', { id: notificationId });
      fetchNotifications();
    } catch {}
  }, [fetchNotifications]);

  const handleSettingsClick = useCallback(() => {
    setIsOpen(false);
    navigate('/notifications/preferences');
  }, [navigate]);

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="relative p-2 text-white hover:bg-secondary rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="Notifications"
        tabIndex={0}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationPanel
        isOpen={isOpen}
        unreadCount={unreadCount}
        categories={NOTIFICATION_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        notifications={filteredNotifications}
        onNotificationClick={handleNotificationClick}
        onDelete={deleteNotification}
        onMarkAllAsRead={markAllAsRead}
        onSettingsClick={handleSettingsClick}
      />
    </div>
  );
}

export default NotificationBell;
