import React from 'react';
import PGNCard from './PGNCard';

const PGNList = ({ pgns, viewMode, onView, onShare, onDelete }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pgns.map((pgn) => (
        <PGNCard
          key={pgn.id}
          pgn={pgn}
          viewMode={viewMode}
          onView={onView}
          onShare={onShare}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default PGNList;
