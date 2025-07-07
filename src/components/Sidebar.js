import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const SIDEBAR_LINKS = {
  admin: [
    {
      label: 'Users',
      icon: '👥',
      path: '/admin/users',
      subItems: [
        { label: 'All Users', path: '/admin/users' },
        { label: 'Activity Logs', path: '/admin/users/activity' }
      ]
    },
    { label: 'Batches', path: '/admin/batches', icon: '📚' },
    {
      label: 'Attendance',
      icon: '📋',
      path: '/admin/attendance',
      subItems: [
        { label: 'Overview', path: '/admin/attendance' },
        { label: 'Student Records', path: '/admin/students/attendance' },
        { label: 'Settings', path: '/admin/attendance-settings' }
      ]
    },
    { label: 'Tournaments', path: '/admin/tournaments', icon: '🏆' },
    { label: 'Quizzes', path: '/admin/quizzes', icon: '📋' },
    { label: 'Analytics', path: '/admin/analytics', icon: '📊' },
    { label: 'Support', path: '/admin/support', icon: '💬' },
    { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
  ],
  teacher: [
    { label: 'Batches', path: '/teacher/batches', icon: '👨‍👧‍👦' },
    { label: 'Analytics', path: '/teacher/analytics', icon: '📊' },
    { label: 'Students', path: '/teacher/students', icon: '🧑‍🎓' },
    { label: 'Quizzes', path: '/teacher/quizzes', icon: '📋' },
    { label: 'Classroom', path: '/teacher/classroom', icon: '🏫' }
  ],
  student: [
    { label: 'My Classes', path: '/student/classes', icon: '📚' },
    { label: 'Resources', path: '/student/resources', icon: '📖' },
    { label: 'Quiz', path: '/student/quiz', icon: '✏️' },
    { label: 'Tournaments', path: '/student/tournaments', icon: '🏆' },
    { label: 'Report Cards', path: '/student/report-card', icon: '📄' },
    { label: 'Feedback & Grading', path: '/student/feedback-history', icon: '📝' }
  ]
};

const CHESS_LINKS = [
  { label: 'Play Chess', path: '/chess/play', icon: '♟️' },
  { label: 'Interactive Board', path: '/chess/board', icon: '🎮' },
  { label: 'Game Area', path: '/chess/games', icon: '🏆' },
  { label: 'PGN Management', path: '/chess/pgn-management', icon: '📁' }
];

const SidebarLink = React.memo(function SidebarLink({ link, isActive, expanded, onClick, children }) {
  return (
    <div className="space-y-1">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${isActive ? 'bg-secondary' : ''}`}
        aria-expanded={!!expanded}
        aria-label={link.label}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xl" aria-hidden="true">{link.icon}</span>
          <span>{link.label}</span>
        </div>
        {link.subItems && (
          <svg
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>
      {children}
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
          className={`block w-full text-left px-4 py-2 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${activePath === subItem.path ? 'bg-secondary' : ''}`}
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
      <div className="px-4 py-2 text-xs uppercase text-gray-400 font-semibold">Chess Platform</div>
      {links.map((link) => (
        <div key={link.path} className="space-y-1">
          <button
            onClick={() => onNavigate(link.path)}
            className={`w-full flex items-center px-4 py-3 rounded-lg hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent ${activePath === link.path ? 'bg-secondary' : ''}`}
            aria-label={link.label}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl" aria-hidden="true">{link.icon}</span>
              <span>{link.label}</span>
            </div>
          </button>
        </div>
      ))}
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
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
          aria-label="Sidebar overlay"
        />
      )}
      <div
        className={`fixed left-0 top-16 h-full bg-primary text-white transform transition-all duration-300 ease-in-out z-30 w-64 shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} lg:z-10 flex flex-col`}
        role="navigation"
        aria-label="Sidebar navigation"
      >
        <div className="flex justify-end p-4 lg:hidden">
          <button onClick={toggleSidebar} className="text-white focus:outline-none focus:ring-2 focus:ring-accent rounded" aria-label="Close sidebar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Make the scrollable area flex-1 and min-h-0 to allow scrolling when content overflows */}
        <div className="space-y-2 p-4 flex-1 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
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
          <ChessSection links={CHESS_LINKS} activePath={location.pathname} onNavigate={handleNavigation} />
        </div>
      </div>
    </>
  );
}

export default React.memo(Sidebar);
