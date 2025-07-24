
import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from './NotificationBell';
import { Bars3Icon, ArrowRightOnRectangleIcon, UserCircleIcon, TrophyIcon, Squares2X2Icon, ChartBarIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// --- UI/UX: Extracted dropdown for single responsibility ---
const UserDropdown = React.memo(function UserDropdown({ user, onLogout, open, setOpen, anchorRef }) {
  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e) {
      if (anchorRef.current && !anchorRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, setOpen, anchorRef]);
  return open ? (
    <div className="absolute right-0 top-12 bg-white/95 dark:bg-background-dark/95 backdrop-blur-md text-primary rounded-lg shadow-xl py-2 w-48 z-50 border border-gray-light animate-fadeIn">
      <div className="px-4 py-2 text-xs text-gray-500">Signed in as</div>
      <div className="px-4 py-1 font-semibold truncate" title={user?.full_name}>{user?.full_name}</div>
      <div className="px-4 py-1 text-xs text-gray-400 capitalize">{user?.role}</div>
      <hr className="my-1 border-gray-light" />
      <Link to="/profile" className="block px-4 py-2 hover:bg-background-light dark:hover:bg-background-dark rounded transition-colors focus:outline-none focus:bg-accent/10" tabIndex={0}>Profile</Link>
      <button onClick={onLogout} className="block w-full text-left px-4 py-2 hover:bg-error/10 text-error rounded transition-colors focus:outline-none focus:bg-error/20" tabIndex={0}>Logout</button>
    </div>
  ) : null;
});

// Hamburger button for mobile sidebar
const HamburgerButton = React.memo(function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden mr-2 text-white focus:outline-none focus:ring-2 focus:ring-accent rounded transition-colors hover:bg-secondary/80 active:bg-accent/80"
      aria-label="Open sidebar menu"
      tabIndex={0}
      type="button"
    >
      <Bars3Icon className="w-7 h-7" />
    </button>
  );
});

// Navbar links (desktop only)
const NavbarLinks = React.memo(function NavbarLinks({ chessLinks }) {
  if (!chessLinks?.length) return null;
  return (
    <nav aria-label="Chess navigation" className="hidden lg:flex ml-10 items-center">
      <ul className="flex items-center space-x-2 ml-6 pl-4 border-accent/30">
        {chessLinks.map((cl) => {
          const Icon = cl.icon;
          return (
            <li key={cl.path}>
              <Link
                to={cl.path}
                className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent transition-all font-medium text-text-light bg-transparent active:bg-accent/70"
                tabIndex={0}
              >
                {Icon && <Icon className="w-5 h-5 mr-1 text-accent" />}
                <span className='text-white'>{cl.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

// User section (avatar, notification, menu)
const UserSection = React.memo(function UserSection({ user, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const anchorRef = useRef();
  // Keyboard accessibility: close on Esc
  useEffect(() => {
    if (!dropdownOpen) return;
    function handle(e) {
      if (e.key === 'Escape') setDropdownOpen(false);
    }
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [dropdownOpen]);
  return (
    <div className="relative flex items-center space-x-2">
      <NotificationBell />
      <button
        ref={anchorRef}
        className="flex items-center space-x-2 px-2 py-1 rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-accent transition-colors bg-background-dark/10"
        aria-label="User menu"
        aria-haspopup="true"
        aria-expanded={dropdownOpen}
        onClick={() => setDropdownOpen((v) => !v)}
        tabIndex={0}
        type="button"
      >
        <UserCircleIcon className="w-7 h-7 text-primary" />
        <span className="hidden sm:inline text-text-light font-medium max-w-[120px] truncate" title={user?.full_name}>{user?.full_name}</span>
      </button>
      <button
        onClick={onLogout}
        className="ml-2 px-2 py-1 rounded bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent text-white transition-colors"
        aria-label="Logout"
        tabIndex={0}
        type="button"
      >
        <ArrowRightOnRectangleIcon className="w-6 h-6" />
      </button>
      <UserDropdown user={user} onLogout={onLogout} open={dropdownOpen} setOpen={setDropdownOpen} anchorRef={anchorRef} />
    </div>
  );
});


// TopNavbar: only logo, hamburger, and user section. All nav links move to sidebar for mobile.

// Chess Platform links (shared with Sidebar)
const CHESS_LINKS = [
  { label: 'Play Chess', path: '/chess/play', icon: TrophyIcon },
  { label: 'Interactive Board', path: '/chess/board', icon: Squares2X2Icon },
  { label: 'Game Area', path: '/chess/games', icon: ChartBarIcon },
  { label: 'PGN Management', path: '/chess/pgn-management', icon: BookOpenIcon }
];

function TopNavbar({ toggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Only show chess links on desktop
  const chessLinks = useMemo(() => CHESS_LINKS, []);
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);
  return (
    <header className="sticky top-0 w-full h-16 flex items-center justify-between px-2 sm:px-4 bg-gradient-to-r from-primary to-accent shadow-lg z-50 transition-all">
      <div className="flex items-center min-w-0">
        <HamburgerButton onClick={toggleSidebar} />
        <Link to="/" className="flex items-center gap-2 min-w-0 group" tabIndex={0} aria-label="Go to dashboard home">
          <img src="/kca.ico" alt="KCA Logo" className="h-9 w-9 rounded shadow-md group-hover:scale-105 transition-transform" />
          <span className="hidden sm:inline text-xl font-bold text-white tracking-wide drop-shadow max-w-[160px] truncate">Kolkata Chess Academy</span>
        </Link>
      </div>
      <NavbarLinks chessLinks={chessLinks} />
      <UserSection user={user} onLogout={handleLogout} />
    </header>
  );
}

export default React.memo(TopNavbar);
