import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const TopNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const commonLinks = [
    { label: 'Dashboard', path: `/${user?.role}-dashboard` },
    { label: 'Profile', path: '/profile' },
    { label: 'Messages', path: '/messages' }
  ];

  return (
    <nav className="bg-[#200e4a] text-white fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">KCA Dashboard</Link>
            <div className="ml-10 flex space-x-4">
              {commonLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-3 py-2 rounded-md hover:bg-[#461fa3]"
                >
                  {link.label}
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

export default TopNavbar;
