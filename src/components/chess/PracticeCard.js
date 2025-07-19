import React from 'react';

const PracticeCard = React.memo(({ position, onSelect }) => (
  <button
    type="button"
    className="bg-background-light dark:bg-background-dark border border-gray-light shadow-md rounded-xl overflow-hidden transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left w-full"
    onClick={() => onSelect(position)}
    aria-label={`Practice position: ${position.title}`}
    role="listitem"
  >
    <div className="h-36 bg-background-light dark:bg-background-dark flex items-center justify-center border-b border-gray-light">
      {position.preview_url ? (
        <img
          src={position.preview_url}
          alt="Practice position preview"
          className="w-28 h-28 object-contain border border-gray-light rounded"
        />
      ) : (
        <div className="w-28 h-28 bg-gray-light border border-gray-light rounded flex items-center justify-center" aria-hidden="true">
          {/* Lucide icon: ImageOff */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L3 3m0 0v18h18V3M3 3l7 7m4 4l7 7" /></svg>
        </div>
      )}
    </div>
    <div className="p-4 space-y-2">
      <h3 className="text-lg font-semibold text-primary mb-1 flex items-center gap-2">
        {/* Lucide icon: Target */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>
        {position.title}
      </h3>
      <p className="text-gray-dark text-sm mb-2 line-clamp-2">{position.description}</p>
      <div className="flex flex-wrap gap-2 justify-between items-center mb-2">
        <span className="flex items-center gap-1 px-2 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium capitalize">
          {/* Lucide icon: Puzzle */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1H7a1 1 0 00-1 1v2a1 1 0 001 1h2a1 1 0 011 1v2a1 1 0 01-1 1H7" /></svg>
          {position.type}
        </span>
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${
          position.difficulty === 'beginner' ? 'bg-success/10 text-success' :
          position.difficulty === 'intermediate' ? 'bg-warning/10 text-warning' :
          'bg-error/10 text-error'
        }`}>
          {/* Lucide icon: Star */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
          {position.difficulty}
        </span>
      </div>
      <div className="text-xs text-gray-dark">By {position.creator.name}</div>
    </div>
  </button>
));

export default PracticeCard;
