import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ChessNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/chess/play',
      name: 'Play Chess',
      icon: 'chess-knight'
    },
    {
      path: '/chess/board',
      name: 'Analysis Board',
      icon: 'chess-board'
    },
    {
      path: '/chess/games',
      name: 'Game Library',
      icon: 'trophy'
    }
  ];
    return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-lg">
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
              location.pathname === item.path 
                ? 'bg-purple-700 text-white' 
                : 'text-purple-700 hover:bg-purple-100'
            }`}
          >
            <i className={`fas fa-${item.icon}`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ChessNavigation;
