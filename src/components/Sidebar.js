import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedItem, setExpandedItem] = useState(null);

  const roleBasedLinks = {
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
      { label: 'Attendance', path: '/admin/attendance', icon: '📋' },
      { label: 'Analytics', path: '/admin/analytics', icon: '📊' },
      { label: 'Support', path: '/admin/support', icon: '💬' },
      { label: 'Settings', path: '/admin/settings', icon: '⚙️' }
    ],
    teacher: [
      { label: 'Batches', path: '/teacher/batches', icon: '👨‍👧‍👦' },
      { label: 'Analytics', path: '/teacher/analytics', icon: '📊' },
      { label: 'Grading', path: '/teacher/grading', icon: '📝' },
      { label: 'PGN Database', path: '/teacher/pgn', icon: '♟️' },
      { label: 'Classroom', path: '/teacher/classroom', icon: '🏫' },
      { label: 'Students', path: '/teacher/students', icon: '👨‍🎓' }
    ],
    student: [
      { label: 'My Classes', path: '/student/classes', icon: '📚' },
      { label: 'Resources', path: '/student/resources', icon: '📖' },
      { label: 'Quiz', path: '/student/quiz', icon: '✏️' },
      { label: 'Tournaments', path: '/student/tournaments', icon: '🏆' },
      { label: 'Games', path: '/student/games', icon: '♟️' },
      { label: 'Classroom', path: '/student/classroom', icon: '🏫' }
    ]
  };

  const links = roleBasedLinks[user?.role] || [];

  const handleItemClick = (item) => {
    if (item.subItems) {
      setExpandedItem(expandedItem === item.label ? null : item.label);
    } else {
      window.innerWidth < 1024 && toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-full bg-[#200e4a] text-white 
        transform transition-transform duration-300 ease-in-out z-30
        w-64 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
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
                onClick={() => handleItemClick(link)}
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

              {/* Submenu */}
              {link.subItems && expandedItem === link.label && (
                <div className="ml-8 space-y-1">
                  {link.subItems.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-4 py-2 rounded-lg hover:bg-[#461fa3] transition-colors ${
                        location.pathname === subItem.path ? 'bg-[#461fa3]' : ''
                      }`}
                      onClick={() => window.innerWidth < 1024 && toggleSidebar()}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
