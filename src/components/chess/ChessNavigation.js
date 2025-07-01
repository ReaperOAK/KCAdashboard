
import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/chess/play', name: 'Play Chess', icon: 'chess-knight' },
  { path: '/chess/board', name: 'Analysis Board', icon: 'chess-board' },
  { path: '/chess/games', name: 'Game Library', icon: 'trophy' },
];

const getNavItemClass = (isActive) =>
  [
    'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
    isActive ? 'bg-primary text-white' : 'text-primary hover:bg-background-light',
  ].join(' ');

const ChessNavigation = React.memo(() => {
  const location = useLocation();
  const navItems = useMemo(() => NAV_ITEMS, []);

  // Accessibility: nav has aria-label, each link has aria-current if active
  return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2 p-4 bg-background-light rounded-lg" aria-label="Chess navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={getNavItemClass(isActive)}
              aria-current={isActive ? 'page' : undefined}
            >
              <i className={`fas fa-${item.icon}`} aria-hidden="true"></i>
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
