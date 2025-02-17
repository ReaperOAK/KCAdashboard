import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const roleBasedLinks = {
    admin: [
      { label: 'Users', path: '/admin/users', icon: '👥' },
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
    <div className="fixed left-0 top-16 h-full w-64 bg-[#200e4a] text-white p-4">
      <div className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-[#461fa3] transition-colors ${
              location.pathname === link.path ? 'bg-[#461fa3]' : ''
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
