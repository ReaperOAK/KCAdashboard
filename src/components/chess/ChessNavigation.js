
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/chess/play', name: 'Play Chess', icon: 'chess-knight' },
  { path: '/chess/board', name: 'Analysis Board', icon: 'chess-board' },
  { path: '/chess/games', name: 'Game Library', icon: 'trophy' },
];

const getNavItemClass = (isActive) =>
  [
    'flex items-center gap-2 px-3 py-2 rounded-xl text-base font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    isActive
      ? 'bg-accent text-white shadow-md border border-accent'
      : 'text-primary hover:bg-background-light hover:text-accent border border-transparent',
  ].join(' ');

const ChessNavigation = React.memo(() => {
  const location = useLocation();
  const navItems = useMemo(() => NAV_ITEMS, []);

  // Accessibility: nav has aria-label, each link has aria-current if active
  return (
    <div className="mb-6 w-full">
      <nav className="flex flex-wrap gap-3 p-3 bg-background-light dark:bg-background-dark rounded-2xl shadow-md justify-center md:justify-start" aria-label="Chess navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={getNavItemClass(isActive)}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              {/* Use Lucide icons if available, fallback to FontAwesome */}
              <span className="inline-flex items-center justify-center w-6 h-6">
                <i className={`fas fa-${item.icon} text-lg`} aria-hidden="true"></i>
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
});

export { ChessNavigation };
export default ChessNavigation;
