
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Bars3Icon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Hamburger button for mobile sidebar
const HamburgerButton = React.memo(function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden mr-2 text-white focus:outline-none focus:ring-2 focus:ring-accent rounded transition-colors hover:bg-secondary/80"
      aria-label="Open sidebar menu"
      tabIndex={0}
    >
      <Bars3Icon className="w-7 h-7" />
    </button>
  );
});

// Navbar links (desktop only)
const NavbarLinks = React.memo(function NavbarLinks({ links }) {
  if (!links || links.length === 0) return null;
  return (
    <div className="hidden lg:flex ml-10 space-x-2">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="px-3 py-2 rounded-md hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent transition-colors font-medium text-white"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
});

// User section (avatar, notification, menu)
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
        <div className="absolute right-0 top-12 bg-white/90 backdrop-blur-md text-primary rounded shadow-lg py-2 w-44 z-50 animate-fade-in border border-gray-100">
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


// TopNavbar: only logo, hamburger, and user section. All nav links move to sidebar for mobile.
function TopNavbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Only show nav links on desktop
  const navLinks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin-dashboard' },
        { label: 'Users', path: '/admin/users' },
        { label: 'Batches', path: '/admin/batches' },
        { label: 'Tournaments', path: '/admin/tournaments' },
        { label: 'Quizzes', path: '/admin/quizzes' },
        { label: 'Analytics', path: '/admin/analytics' },
        { label: 'Support', path: '/admin/support' },
      ];
    }
    if (user.role === 'teacher') {
      return [
        { label: 'Dashboard', path: '/teacher-dashboard' },
        { label: 'Batches', path: '/teacher/batches' },
        { label: 'Analytics', path: '/teacher/analytics' },
        { label: 'Students', path: '/teacher/students' },
        { label: 'Quizzes', path: '/teacher/quizzes' },
        { label: 'Classroom', path: '/teacher/classroom' },
        { label: 'Support', path: '/teacher/support' },
      ];
    }
    if (user.role === 'student') {
      return [
        { label: 'Dashboard', path: '/student-dashboard' },
        { label: 'My Classes', path: '/student/classes' },
        { label: 'Resources', path: '/student/resources' },
        { label: 'Quiz', path: '/student/quiz' },
        { label: 'Tournaments', path: '/student/tournaments' },
        { label: 'Report Cards', path: '/student/report-card' },
        { label: 'Support', path: '/student/support' },
      ];
    }
    return [];
  }, [user]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <nav className="sticky top-0 w-full h-16 flex items-center justify-between px-4 bg-gradient-to-r from-primary to-accent shadow-lg z-50">
      <div className="flex items-center">
        <HamburgerButton onClick={toggleSidebar} />
        <Link to="/" className="flex items-center gap-2">
          <img src="/kca.ico" alt="KCA Logo" className="h-9 w-9 rounded shadow-md" />
          <span className="hidden sm:inline text-xl font-bold text-white tracking-wide drop-shadow">KCA Dashboard</span>
        </Link>
      </div>
      <NavbarLinks links={navLinks} />
      <UserSection user={user} onLogout={handleLogout} />
    </nav>
  );
}

export default React.memo(TopNavbar);
