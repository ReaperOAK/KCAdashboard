import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const roleBasedLinks = {
    admin: [
      { label: 'Users', path: '/admin/users', icon: '👥' },
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
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#461fa3] transition-colors ${
                location.pathname === link.path ? 'bg-[#461fa3]' : ''
              }`}
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
            >
              <span className="text-xl">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
