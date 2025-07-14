
import React, { useMemo } from 'react';
import VideoEmbed from './VideoEmbed';

// Pure bookmark button for single responsibility
const BookmarkButton = React.memo(function BookmarkButton({ isBookmarked, onClick }) {
  return (
    <button
      type="button"
      aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      tabIndex={0}
      onClick={onClick}
      className={[
        'rounded-full p-2 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-accent',
        isBookmarked
          ? 'text-yellow-400 bg-white/10 hover:bg-yellow-100/20'
          : 'text-white hover:text-yellow-400 hover:bg-white/10',
        'active:scale-95',
      ].join(' ')}
      title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {isBookmarked ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
 * ResourceCard: Beautiful, responsive, single-responsibility resource card
 * - Icon, title, bookmark, description, badges, author, date
 * - Responsive, color tokens, accessible, mobile friendly
 */
const ResourceCard = React.memo(function ResourceCard({ resource, onBookmarkToggle, onResourceClick }) {
  // Memoize icon and date for performance
  const icon = useMemo(() => getResourceIcon(resource.type), [resource.type]);
  const dateStr = useMemo(() => resource.created_at ? new Date(resource.created_at).toLocaleDateString() : '', [resource.created_at]);

  return (
    <article
      className="bg-background-light dark:bg-background-dark rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 group focus-within:ring-2 focus-within:ring-accent border border-gray-light flex flex-col h-full animate-fade-in"
      tabIndex={0}
      role="group"
      aria-label={resource.title}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onResourceClick(resource);
      }}
    >
      {/* Header */}
      <header className="p-4 bg-primary text-white flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl md:text-3xl flex-shrink-0" aria-hidden>{icon}</span>
          <h3 className="text-lg font-semibold truncate" title={resource.title}>{resource.title}</h3>
        </div>
        <BookmarkButton
          isBookmarked={!!resource.is_bookmarked}
          onClick={e => {
            e.stopPropagation();
            onBookmarkToggle(resource);
          }}
        />
      </header>
      {/* Main content */}
      <button
        type="button"
        className="p-6 text-left w-full focus:outline-none flex-1 flex flex-col"
        onClick={() => onResourceClick(resource)}
        aria-label={`Open resource: ${resource.title}`}
      >
        <p className="text-gray-dark mb-4 line-clamp-3 min-h-[48px]">{resource.description}</p>
        {resource.type === 'video' && resource.url && (
          <div className="mb-4 rounded-lg overflow-hidden border border-gray-light">
            <VideoEmbed url={resource.url} />
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {resource.category && (
            <span className="bg-secondary text-white px-2 py-1 rounded-full text-xs font-medium" title={resource.category}>
              {resource.category}
            </span>
          )}
          {resource.difficulty && (
            <span className="bg-accent text-white font-semibold text-xs px-2 py-0.5 rounded-full" title={resource.difficulty}>
              {resource.difficulty}
            </span>
          )}
          {resource.downloads > 0 && (
            <span className="bg-gray-light text-primary font-medium px-2 py-1 rounded-full text-xs" title="Downloads">
              {resource.downloads} downloads
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-dark/80 mt-auto">
          <span title={resource.author_name}>By {resource.author_name}</span>
          <span>{dateStr}</span>
        </div>
      </button>
    </article>
  );
});

export default ResourceCard;
