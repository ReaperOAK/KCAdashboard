import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, TrophyIcon, BookOpenIcon, UsersIcon, Cog6ToothIcon, ChartBarIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, AcademicCapIcon, Squares2X2Icon } from '@heroicons/react/24/outline';

const SIDEBAR_LINKS = {
  admin: [
    { label: 'Dashboard', path: '/admin-dashboard', icon: ChartBarIcon },
    {
      label: 'Users',
      icon: UsersIcon,
      path: '/admin/users',
      subItems: [
        { label: 'All Users', path: '/admin/users' },
        { label: 'Activity Logs', path: '/admin/users/activity' }
      ]
    },
    { label: 'Batches', path: '/admin/batches', icon: AcademicCapIcon },
    {
      label: 'Attendance',
      icon: ClipboardDocumentListIcon,
      path: '/admin/attendance',
      subItems: [
        { label: 'Overview', path: '/admin/attendance' },
        { label: 'Student Records', path: '/admin/students/attendance' },
        { label: 'Settings', path: '/admin/attendance-settings' }
      ]
    },
    { label: 'Tournaments', path: '/admin/tournaments', icon: TrophyIcon },
    { label: 'Quizzes', path: '/admin/quizzes', icon: ClipboardDocumentListIcon },
    { label: 'Analytics', path: '/admin/analytics', icon: ChartBarIcon },
    { label: 'Support', path: '/admin/support', icon: ChatBubbleLeftRightIcon },
    { label: 'Settings', path: '/admin/settings', icon: Cog6ToothIcon },
    ],
  teacher: [
    { label: 'Dashboard', path: '/teacher-dashboard', icon: ChartBarIcon },
    { label: 'Batches', path: '/teacher/batches', icon: AcademicCapIcon },
    { label: 'Analytics', path: '/teacher/analytics', icon: ChartBarIcon },
    { label: 'Students', path: '/teacher/students', icon: UsersIcon },
    { label: 'Quizzes', path: '/teacher/quizzes', icon: ClipboardDocumentListIcon },
    { label: 'Classroom', path: '/teacher/classroom', icon: Squares2X2Icon },
    { label: 'Support', path: '/teacher/support', icon: ChatBubbleLeftRightIcon },
  ],
  student: [
    { label: 'Dashboard', path: '/student-dashboard', icon: ChartBarIcon },
    { label: 'My Classes', path: '/student/classes', icon: AcademicCapIcon },
    { label: 'Resources', path: '/student/resources', icon: BookOpenIcon },
    { label: 'Quiz', path: '/student/quiz', icon: ClipboardDocumentListIcon },
    { label: 'Tournaments', path: '/student/tournaments', icon: TrophyIcon },
    { label: 'Report Cards', path: '/student/report-card', icon: ChartBarIcon },
    { label: 'Feedback & Grading', path: '/student/feedback-history', icon: ChatBubbleLeftRightIcon },
    { label: 'Support', path: '/student/support', icon: ChatBubbleLeftRightIcon },
  ]
};

const CHESS_LINKS = [
  { label: 'Play Chess', path: '/chess/play', icon: TrophyIcon },
  { label: 'Interactive Board', path: '/chess/board', icon: Squares2X2Icon },
  { label: 'Game Area', path: '/chess/games', icon: ChartBarIcon },
  { label: 'PGN Management', path: '/chess/pgn-management', icon: BookOpenIcon }
];

const SidebarLink = React.memo(function SidebarLink({ link, isActive, expanded, onClick, children }) {
  const Icon = link.icon;
  return (
    <div className="space-y-1">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg group hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${isActive ? 'bg-secondary shadow-lg' : ''}`}
        aria-expanded={!!expanded}
        aria-label={link.label}
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" aria-hidden="true" />
          <span className="font-medium tracking-wide">{link.label}</span>
        </div>
        {link.subItems && (
          <ChevronDownIcon className={`w-4 h-4 ml-2 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        )}
      </button>
      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const SidebarSubLinks = React.memo(function SidebarSubLinks({ subItems, activePath, onNavigate }) {
  return (
    <div className="ml-8 space-y-1">
      {subItems.map((subItem) => (
        <button
          key={subItem.path}
          onClick={e => {
            e.stopPropagation();
            onNavigate(subItem.path);
          }}
          className={`block w-full text-left px-4 py-2 rounded-lg hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${activePath === subItem.path ? 'bg-accent text-white shadow' : 'text-white'}`}
          aria-label={subItem.label}
        >
          {subItem.label}
        </button>
      ))}
    </div>
  );
});

const ChessSection = React.memo(function ChessSection({ links, activePath, onNavigate }) {
  return (
    <div className="mt-6">
      <div className="px-4 py-2 text-xs uppercase text-gray-400 font-semibold tracking-wider">Chess Platform</div>
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <div key={link.path} className="space-y-1">
            <button
              onClick={() => onNavigate(link.path)}
              className={`w-full flex items-center px-4 py-3 rounded-lg hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${activePath === link.path ? 'bg-accent text-white shadow' : ''}`}
              aria-label={link.label}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5 text-accent group-hover:text-white transition-colors" aria-hidden="true" />
                <span className="font-medium tracking-wide">{link.label}</span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
});


function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState(null);
  const navigate = useNavigate();

  const links = useMemo(() => SIDEBAR_LINKS[user?.role] || [], [user?.role]);

  // Expand parent if subitem is active
  useEffect(() => {
    const currentPath = location.pathname;
    for (const link of links) {
      if (link.subItems) {
        const matchingSubItem = link.subItems.find(
          subItem => currentPath === subItem.path || currentPath.startsWith(subItem.path + '/')
        );
        if (matchingSubItem) {
          setExpandedItem(link.label);
          break;
        }
      }
    }
  }, [location.pathname, links]);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        toggleSidebar();
      }, 150);
    }
  }, [navigate, toggleSidebar]);

  const handleItemClick = useCallback((item, event) => {
    if (event) event.stopPropagation();
    if (item.subItems) {
      setExpandedItem(expandedItem === item.label ? null : item.label);
    } else {
      handleNavigation(item.path);
    }
  }, [expandedItem, handleNavigation]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sidebar-overlay"
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={toggleSidebar}
            aria-label="Sidebar overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
      <motion.nav
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-primary/80 backdrop-blur-lg text-white transform z-30 w-64 shadow-2xl rounded-tr-3xl rounded-br-3xl border-r border-accent/30 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:z-10 flex flex-col transition-all duration-300`}
        role="navigation"
        aria-label="Sidebar navigation"
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 1024 ? 0 : -256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* No close X button here; hamburger in navbar will turn into X when sidebar is open */}
        {/* Make the scrollable area flex-1 and min-h-0 to allow scrolling when content overflows */}
        <div className="space-y-2 p-4 flex-1 min-h-0 max-h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-light scrollbar-track-background-light">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            const expanded = expandedItem === link.label;
            return (
              <SidebarLink
                key={link.path}
                link={link}
                isActive={isActive}
                expanded={expanded}
                onClick={e => handleItemClick(link, e)}
              >
                {link.subItems && expanded && (
                  <SidebarSubLinks subItems={link.subItems} activePath={location.pathname} onNavigate={handleNavigation} />
                )}
              </SidebarLink>
            );
          })}
          <div className="my-4 border-t border-gray-light" aria-hidden="true"></div>
          <ChessSection links={CHESS_LINKS} activePath={location.pathname} onNavigate={handleNavigation} />
        </div>
      </motion.nav>
    </>
  );
}

export default React.memo(Sidebar);
