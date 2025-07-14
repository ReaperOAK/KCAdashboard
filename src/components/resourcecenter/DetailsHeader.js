
import React, { useMemo } from 'react';

// Pure bookmark button for single responsibility
const BookmarkButton = React.memo(function BookmarkButton({ isBookmarked, onClick }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-full p-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent',
        isBookmarked
          ? 'text-yellow-400 bg-white/10 hover:bg-yellow-100/20'
          : 'text-white hover:text-yellow-400 hover:bg-white/10',
        'active:scale-95',
      ].join(' ')}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      tabIndex={0}
    >
      {isBookmarked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
});

// Memoized icon for resource type
const getResourceIcon = (type) => {
  switch (type) {
    case 'pgn': return '♟';
    case 'pdf': return '📄';
    case 'video': return '🎥';
    case 'link': return '🔗';
    default: return '📁';
  }
};

/**
 * DetailsHeader: Beautiful, responsive, single-responsibility resource header
 * - Icon, title, author, date, and bookmark button
 * - Responsive flex, color tokens, accessible, mobile friendly
 */
const DetailsHeader = React.memo(function DetailsHeader({ resource, onBookmarkToggle }) {
  // Memoize icon and date for performance
  const icon = useMemo(() => getResourceIcon(resource.type), [resource.type]);
  const dateStr = useMemo(() => resource.created_at ? new Date(resource.created_at).toLocaleDateString() : '', [resource.created_at]);

  return (
    <header className="px-4 py-4 sm:px-6 sm:py-6 bg-primary text-white rounded-t-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 shadow-md border-b border-gray-dark ">
      <div className="flex items-center gap-4 min-w-0">
        <span className="text-3xl sm:text-4xl md:text-5xl flex-shrink-0" aria-hidden>{icon}</span>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold truncate" title={resource.title}>{resource.title}</h1>
          <p className="text-sm text-text-light/80 mt-1 truncate" title={resource.author_name}>
            Added by <span className="font-medium">{resource.author_name}</span>
            {dateStr && <span> on {dateStr}</span>}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <BookmarkButton isBookmarked={!!resource.is_bookmarked} onClick={onBookmarkToggle} />
      </div>
    </header>
  );
});

export default DetailsHeader;
