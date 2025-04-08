import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState(null);
  const navigate = useNavigate();

  // Use useMemo to prevent roleBasedLinks recreation on each render
  const roleBasedLinks = useMemo(() => ({
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
      { label: 'Analytics', path: '/admin/analytics', icon: '📊' },
      { label: 'Support', path: '/admin/support', icon: '💬' },
      { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
    ],
    teacher: [
      { label: 'Batches', path: '/teacher/batches', icon: '👨‍👧‍👦' },
      { label: 'Analytics', path: '/teacher/analytics', icon: '📊' },
      { label: 'Grading', path: '/teacher/grading', icon: '📝' },
      { label: 'Quizzes', path: '/teacher/quizzes', icon: '📋' },
      { label: 'PGN Database', path: '/teacher/pgn', icon: '♟️' },
      { label: 'Classroom', path: '/teacher/classroom', icon: '🏫' }
    ],
    student: [
      { label: 'My Classes', path: '/student/classes', icon: '📚' },
      { label: 'Resources', path: '/student/resources', icon: '📖' },
      { label: 'Quiz', path: '/student/quiz', icon: '✏️' },
      { label: 'Tournaments', path: '/student/tournaments', icon: '🏆' },
      { label: 'Games', path: '/student/games', icon: '♟️' }
    ]
  }), []); // Empty dependency array since this object is static

  // Common chess links available to all roles
  const chessLinks = [
    { label: 'Simul Games', path: '/chess/simul', icon: '♟️' },
    { label: 'Chess Studies', path: '/chess/studies', icon: '📚' },
    { label: 'Interactive Board', path: '/chess/board', icon: '🎮' },
    { label: 'Game Area', path: '/chess/games', icon: '🏆' }
  ];

  // Add effect to update active menu item based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const allLinks = roleBasedLinks[user?.role] || [];
    for (const link of allLinks) {
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
  }, [location.pathname, user?.role, roleBasedLinks]);

  const links = roleBasedLinks[user?.role] || [];

  const handleItemClick = (item, event) => {
    if (event) {
      event.stopPropagation();
    }
    if (item.subItems) {
      setExpandedItem(expandedItem === item.label ? null : item.label);
    } else {
      handleNavigation(item.path);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        toggleSidebar();
      }, 150);
    }
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className={`
        fixed left-0 top-16 h-full bg-[#200e4a] text-white 
        transform transition-all duration-300 ease-in-out z-30
        w-64 shadow-xl ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        lg:z-10
      `}>
        <div className="flex justify-end p-4 lg:hidden">
          <button onClick={toggleSidebar} className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-2 p-4">
          {links.map((link) => (
            <div key={link.path} className="space-y-1">
              <button
                onClick={(e) => handleItemClick(link, e)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-[#461fa3] transition-colors ${
                  location.pathname.startsWith(link.path) ? 'bg-[#461fa3]' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </div>
                {link.subItems && (
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      expandedItem === link.label ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {link.subItems && expandedItem === link.label && (
                <div className="ml-8 space-y-1">
                  {link.subItems.map((subItem) => (
                    <button
                      key={subItem.path}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigation(subItem.path);
                      }}
                      className={`block w-full text-left px-4 py-2 rounded-lg hover:bg-[#461fa3] transition-colors ${
                        location.pathname === subItem.path ? 'bg-[#461fa3]' : ''
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-6">
            <div className="px-4 py-2 text-xs uppercase text-gray-400 font-semibold">
              Chess Platform
            </div>
            {chessLinks.map((link) => (
              <div key={link.path} className="space-y-1">
                <button
                  onClick={() => handleNavigation(link.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg hover:bg-[#461fa3] transition-colors ${
                    location.pathname === link.path ? 'bg-[#461fa3]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{link.icon}</span>
                    <span>{link.label}</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
