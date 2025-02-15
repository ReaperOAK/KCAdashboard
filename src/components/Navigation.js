import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigationItems = {
    admin: [
      { label: 'Dashboard', path: '/admin-dashboard' },
      { label: 'Users', path: '/admin/users' },
      { label: 'Reports', path: '/admin/reports' }
    ],
    teacher: [
      { label: 'Dashboard', path: '/teacher-dashboard' },
      { label: 'Batches', path: '/teacher/batches' },
      { label: 'My Classes', path: '/teacher/classes' },
      { label: 'Students', path: '/teacher/students' }
    ],
    student: [
      { label: 'Dashboard', path: '/student-dashboard' },
      { label: 'My Classes', path: '/student/classes' },
      { label: 'Resources', path: '/student/resources' },
      { label: 'Quiz', path: '/student/quiz' },
      { label: 'Tournaments', path: '/student/tournaments' },
      { label: 'Games', path: '/student/games' },
      { label: 'Classroom', path: '/student/classroom' }
    ]
  };

  const items = navigationItems[user?.role] || [];

  return (
    <nav className="bg-[#200e4a] text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">KCA Dashboard</Link>
            <div className="ml-10 flex space-x-4">
              {items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="px-3 py-2 rounded-md hover:bg-[#461fa3]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <span>{user?.full_name}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-[#461fa3] hover:bg-[#7646eb]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
