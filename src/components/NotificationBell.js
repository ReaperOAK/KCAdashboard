

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationsApi } from '../api/notifications';
import { BellIcon, Cog6ToothIcon, TrashIcon, EllipsisVerticalIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex p-2 gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      {categories.map(category => (
        <button
          key={category.id}
          className={`px-4 py-1 text-sm rounded-full whitespace-nowrap font-medium shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/60 ${
            activeCategory === category.id
              ? 'bg-gradient-to-r from-secondary to-accent text-white scale-105'
              : 'bg-white/70 hover:bg-accent/10 text-gray-700 border border-gray-200'
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
      <div className="p-6 text-center text-gray-400 flex flex-col items-center justify-center h-40">
        <BellIcon className="w-12 h-12 mb-2 opacity-40" />
        <p className="text-base">No notifications in this category</p>
      </div>
    );
  }
  return (
    <div className="overflow-y-auto flex-grow max-h-[60vh] px-2 md:px-4 py-2 scrollbar-thumb-gray-300 scrollbar-track-transparent scrollbar-w-2">
      {notifications.map((notification) => (
        <motion.div
          key={notification.id}
          layout
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`group relative bg-white/80 backdrop-blur-md rounded-xl shadow-md mb-3 px-4 py-3 flex flex-col gap-1 border border-gray-100 transition-all duration-200 hover:scale-[1.01] hover:shadow-lg cursor-pointer ${
            notification.is_read ? '' : 'ring-2 ring-accent/30 bg-accent/10'
          }`}
          onClick={() => onNotificationClick(notification)}
          tabIndex={0}
          role="button"
          aria-label={`Notification: ${notification.title}`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 flex items-center justify-center rounded-full text-white text-xs font-bold shadow ${getCategoryColor(notification.category)}`}>{notification.category[0].toUpperCase()}</span>
              <span className="text-xs text-gray-500 font-medium">{getRelativeTime(notification.created_at)}</span>
              {!notification.is_read && <EllipsisVerticalIcon className="text-accent w-5 h-5 animate-pulse" title="Unread" />}
            </div>
            <button
              onClick={e => onDelete(e, notification.id)}
              className="text-gray-300 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-accent rounded p-1 transition-colors"
              aria-label="Delete notification"
              tabIndex={0}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-semibold text-secondary text-base mt-1 leading-tight line-clamp-1">{notification.title}</h4>
          <p className="text-sm text-gray-700 mt-0.5 line-clamp-2">{notification.message}</p>
          {notification.link && (
            <div className="mt-2">
              <a
                onClick={e => e.stopPropagation()}
                href={notification.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent rounded"
                aria-label="View details"
              >
                <span>View details</span>
                <ExclamationCircleIcon className="w-4 h-4 ml-1 text-accent" />
              </a>
            </div>
          )}
        </motion.div>
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="notif-panel"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.18 }}
          className="fixed md:absolute right-0 left-0 md:left-auto mx-auto md:mx-0 top-20 md:top-12 w-full max-w-md md:max-w-lg lg:max-w-xl bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl z-50 max-h-[90vh] flex flex-col border border-gray-200 transition-all duration-300 animate-fade-in-up min-w-[320px] md:min-w-[400px]"
        >
          <div className="p-4 border-b flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center bg-gradient-to-r from-primary/80 to-accent/60 rounded-t-2xl">
            <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2"><BellIcon className="inline-block w-6 h-6" /> Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs sm:text-sm bg-white/80 text-accent font-semibold px-3 py-1 rounded-full shadow hover:bg-accent hover:text-white focus:outline-none focus:ring-2 focus:ring-accent/60 transition-all"
                aria-label="Mark all as read"
              >
                Mark all as read
              </button>
            )}
          </div>
          <NotificationCategoryTabs categories={categories} activeCategory={activeCategory} onChange={onCategoryChange} />
          <NotificationList notifications={notifications} onNotificationClick={onNotificationClick} onDelete={onDelete} />
          <div className="p-3 border-t flex justify-center items-center gap-2 bg-white/70 rounded-b-2xl">
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-1 text-sm text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent rounded px-3 py-1 font-medium transition-all"
              aria-label="Notification Settings"
            >
              <Cog6ToothIcon className="inline-block w-5 h-5" /> Notification Settings
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
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
      const response = await NotificationsApi.getNotifications();
      setNotifications(response.notifications);
      setUnreadCount(response.unread_count);
    } catch (error) {
      // Optionally show a toast or error boundary
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
      await NotificationsApi.markAsRead(notificationId);
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
      await NotificationsApi.markAllAsRead();
      fetchNotifications();
    } catch {}
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (e, notificationId) => {
    e.stopPropagation();
    try {
      await NotificationsApi.deleteNotification(notificationId);
      fetchNotifications();
    } catch {}
  }, [fetchNotifications]);

  const handleSettingsClick = useCallback(() => {
    setIsOpen(false);
    navigate('/notifications/preferences');
  }, [navigate]);

  return (
    <div className="relative z-50" ref={notificationRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="relative p-2 bg-white/80 hover:bg-accent/10 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
        aria-label="Notifications"
        tabIndex={0}
      >
        <BellIcon className="w-7 h-7 text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-accent text-white rounded-full w-6 h-6 text-xs flex items-center justify-center font-bold border-2 border-white shadow-md animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      <div className="fixed inset-0 z-40 md:hidden" style={{ display: isOpen ? 'block' : 'none' }} onClick={() => setIsOpen(false)} />
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
