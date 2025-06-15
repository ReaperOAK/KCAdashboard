import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ChessNavigation.css';

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
    },    {
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
    <div className="chess-navigation">
      <nav className="chess-nav-container">
        {navItems.map(item => (
          <Link 
            key={item.path}
            to={item.path}
            className={`chess-nav-item ${location.pathname === item.path ? 'active' : ''}`}
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
