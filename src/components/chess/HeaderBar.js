import React from 'react';
import ChessNavigation from './ChessNavigation';

const HeaderBar = React.memo(function HeaderBar({ title }) {
  return (
    <header className="mb-4 sm:mb-5">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary">{title}</h1>
      <ChessNavigation />
    </header>
  );
});

export default HeaderBar;
