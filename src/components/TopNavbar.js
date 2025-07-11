
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Bars3Icon, ArrowRightOnRectangleIcon, MoonIcon, SunIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const HamburgerButton = React.memo(function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden mr-4 text-white focus:outline-none focus:ring-2 focus:ring-accent rounded"
      aria-label="Open sidebar menu"
      tabIndex={0}
    >
      <Bars3Icon className="w-7 h-7" />
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  return (
    <div className="relative flex items-center space-x-2">
      <NotificationBell />
      <button
        className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent"
        aria-label="User menu"
        onClick={() => setDropdownOpen((v) => !v)}
        tabIndex={0}
      >
        <UserCircleIcon className="w-7 h-7 text-accent" />
        <span className="hidden sm:inline text-white font-medium max-w-[100px] truncate">{user?.full_name}</span>
      </button>
      <button
        onClick={onLogout}
        className="ml-2 px-2 py-1 rounded bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent text-white"
        aria-label="Logout"
        tabIndex={0}
      >
        <ArrowRightOnRectangleIcon className="w-6 h-6" />
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 top-12 bg-white text-primary rounded shadow-lg py-2 w-40 z-50 animate-fade-in">
          <div className="px-4 py-2 text-xs text-gray-500">Signed in as</div>
          <div className="px-4 py-1 font-semibold truncate">{user?.full_name}</div>
          <div className="px-4 py-1 text-xs text-gray-400 capitalize">{user?.role}</div>
          <hr className="my-1" />
          <Link to="/profile" className="block px-4 py-2 hover:bg-background-light rounded transition-colors">Profile</Link>
          <button onClick={onLogout} className="block w-full text-left px-4 py-2 hover:bg-error/10 text-error rounded transition-colors">Logout</button>
        </div>
      )}
    </div>
  );
});


function TopNavbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const handleToggleDark = useCallback(() => {
    setDarkMode((d) => {
      const next = !d;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  }, []);

  const commonLinks = useMemo(() => {
    let supportPath = '/support';
    if (user?.role === 'admin') supportPath = '/admin/support';
    else if (user?.role === 'teacher') supportPath = '/teacher/support';
    else if (user?.role === 'student') supportPath = '/student/support';
    const links = [
      { label: 'Dashboard', path: `/${user?.role}-dashboard` },
      { label: 'Profile', path: '/profile' },
      { label: 'Support / FAQ', path: supportPath }
    ];
    return links;
  }, [user?.role]);

  return (
    <nav className="bg-primary/90 backdrop-blur text-white fixed w-full z-40 shadow-lg transition-all duration-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <HamburgerButton onClick={toggleSidebar} />
            <Link to="/" className="text-xl font-bold ml-1 focus:outline-none focus:ring-2 focus:ring-accent rounded tracking-tight" aria-label="Go to dashboard home">
              Kolkata Chess Academy
            </Link>
            <NavbarLinks links={commonLinks} />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleDark}
              className="p-2 rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <SunIcon className="w-6 h-6 text-accent" /> : <MoonIcon className="w-6 h-6 text-accent" />}
            </button>
            <UserSection user={user} onLogout={handleLogout} />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default React.memo(TopNavbar);
