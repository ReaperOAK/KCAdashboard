import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const TopNavbar = ({ toggleSidebar }) => {
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
    <nav className="bg-[#200e4a] text-white fixed w-full z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger Menu for Mobile */}
            <button 
              onClick={toggleSidebar}
              className="lg:hidden mr-4 text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="text-xl font-bold">KCA Dashboard</Link>
            
            {/* Common Links - Hidden on Mobile */}
            <div className="hidden lg:flex ml-10 space-x-4">
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
            <span className="hidden sm:inline">{user?.full_name}</span>
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
