import React from 'react';

const PracticeCard = React.memo(({ position, onSelect }) => (
  <button
    type="button"
    className="bg-background-light rounded-lg overflow-hidden shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent text-left"
    onClick={() => onSelect(position)}
    aria-label={`Practice position: ${position.title}`}
  >
    <div className="h-36 bg-background-light flex items-center justify-center border-b border-gray-light">
      {position.preview_url ? (
        <img
          src={position.preview_url}
          alt="Practice position preview"
          className="w-28 h-28 object-contain border border-gray-light rounded"
        />
      ) : (
        <div className="w-28 h-28 bg-gray-light border border-gray-light rounded" aria-hidden="true" />
      )}
    </div>
    <div className="p-4">
      <h3 className="text-lg font-semibold text-primary mb-2">{position.title}</h3>
      <p className="text-gray-dark text-sm mb-3 line-clamp-2">{position.description}</p>
      <div className="flex justify-between items-center mb-2">
        <span className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium capitalize">{position.type}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${
          position.difficulty === 'beginner' ? 'bg-success/10 text-success' :
          position.difficulty === 'intermediate' ? 'bg-warning/10 text-warning' :
          'bg-error/10 text-error'
        }`}>
          {position.difficulty}
        </span>
      </div>
      <div className="text-xs text-gray-dark">By {position.creator.name}</div>
    </div>
  </button>
));

export default PracticeCard;
