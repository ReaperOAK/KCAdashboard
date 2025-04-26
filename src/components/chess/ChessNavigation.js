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
      path: '/chess/studies',
      name: 'Study Collection',
      icon: 'book'
    },
    {
      path: '/chess/board',
      name: 'Analysis Board',
      icon: 'chess-board'
    },
    {
      path: '/chess/simuls',
      name: 'Simuls',
      icon: 'users'
    },
    {
      path: '/chess/games',
      name: 'Game Library',
      icon: 'trophy'
    }
  ];
  
  return (
    <div className="bg-[#f3f1f9] rounded-lg mb-5 p-1">
      <nav className="flex flex-wrap justify-center">
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path}
            className={`flex flex-col sm:flex-row sm:justify-start items-center py-3 px-5 no-underline rounded-md transition-all duration-200 ease-in-out m-1 ${
              location.pathname === item.path 
                ? 'bg-[#461fa3] text-white' 
                : 'text-[#461fa3] hover:bg-[#e3e1f7]'
            }`}
          >
            <i className={`fas fa-${item.icon} text-lg sm:mr-3 mb-1 sm:mb-0`}></i>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default ChessNavigation;
