
import React, { useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';

const HamburgerButton = React.memo(function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden mr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent rounded"
      aria-label="Open sidebar menu"
      tabIndex={0}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
});

const NavbarLinks = React.memo(function NavbarLinks({ links }) {
  return (
    <div className="hidden lg:flex ml-10 space-x-4">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="px-3 py-2 rounded-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
});

const UserSection = React.memo(function UserSection({ user, onLogout }) {
  return (
    <div className="flex items-center space-x-4">
      <NotificationBell />
      <span className="hidden sm:inline text-text-white" aria-label="User name">{user?.full_name}</span>
      <button
        onClick={onLogout}
        className="px-3 py-2 rounded-md bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent text-white font-medium"
        aria-label="Logout"
      >
        Logout
      </button>
    </div>
  );
});

function TopNavbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const commonLinks = useMemo(() => [
    { label: 'Dashboard', path: `/${user?.role}-dashboard` },
    { label: 'Profile', path: '/profile' }
  ], [user?.role]);

  return (
    <nav className="bg-primary text-white fixed w-full z-40 shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <HamburgerButton onClick={toggleSidebar} />
            <Link to="/" className="text-xl font-bold ml-1 focus:outline-none focus:ring-2 focus:ring-accent rounded" aria-label="Go to dashboard home">
              Dashboard
            </Link>
            <NavbarLinks links={commonLinks} />
          </div>
          <UserSection user={user} onLogout={handleLogout} />
        </div>
      </div>
    </nav>
  );
}

export default React.memo(TopNavbar);
