import React from 'react';
import ChessNavigation from './ChessNavigation';

const HeaderBar = React.memo(function HeaderBar({ title }) {
  return (
    <header
      className="bg-background-light dark:bg-background-dark border-b border-gray-light shadow-sm rounded-t-xl px-4 py-4 sm:px-6 sm:py-5 mb-4 sm:mb-5 flex flex-col gap-2"
      role="banner"
      aria-label="Page header"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-primary leading-tight mb-1" tabIndex={0} aria-label={title}>{title}</h1>
      <ChessNavigation />
    </header>
  );
});

export default HeaderBar;
