import React from 'react';

const getResourceIcon = (type) => {
  switch (type) {
    case 'pgn': return '♟';
    case 'pdf': return '📄';
    case 'video': return '🎥';
    case 'link': return '🔗';
    default: return '📁';
  }
};

const DetailsHeader = React.memo(function DetailsHeader({ resource, onBookmarkToggle }) {
  return (
    <div className="p-6 bg-primary text-white flex justify-between items-center">
      <div className="flex items-center">
        <span className="text-3xl mr-4" aria-hidden>{getResourceIcon(resource.type)}</span>
        <div>
          <h1 className="text-2xl font-bold">{resource.title}</h1>
          <p className="text-sm opacity-80">Added by {resource.author_name} on {new Date(resource.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onBookmarkToggle}
          className="text-white hover:text-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-300 rounded"
          aria-label={resource.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
        >
          {resource.is_bookmarked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
});

export default DetailsHeader;
