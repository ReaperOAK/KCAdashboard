import React from 'react';
import VideoEmbed from './VideoEmbed';

const getResourceIcon = (type) => {
  switch (type) {
    case 'pgn': return '♟';
    case 'pdf': return '📄';
    case 'video': return '🎥';
    case 'link': return '🔗';
    default: return '📁';
  }
};

const ResourceCard = React.memo(function ResourceCard({ resource, onBookmarkToggle, onResourceClick }) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow group focus-within:ring-2 focus-within:ring-accent"
      tabIndex={0}
      role="group"
      aria-label={resource.title}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') onResourceClick(resource);
      }}
    >
      <div className="p-4 bg-primary text-white flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-2xl mr-4" aria-hidden>{getResourceIcon(resource.type)}</span>
          <h3 className="text-lg font-semibold truncate" title={resource.title}>{resource.title}</h3>
        </div>
        <button
          type="button"
          aria-label={resource.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          tabIndex={0}
          onClick={e => {
            e.stopPropagation();
            onBookmarkToggle(resource);
          }}
          className="text-white hover:text-yellow-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          {resource.is_bookmarked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          )}
        </button>
      </div>
      <button
        type="button"
        className="p-6 text-left w-full focus:outline-none"
        onClick={() => onResourceClick(resource)}
        aria-label={`Open resource: ${resource.title}`}
      >
        <p className="text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
        {resource.type === 'video' && (
          <div className="mb-4">
            <VideoEmbed url={resource.url} />
          </div>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-background-light text-secondary rounded-full">
            {resource.category}
          </span>
          <span className="inline-block px-3 py-1 text-xs font-medium bg-background-light text-secondary rounded-full">
            {resource.difficulty}
          </span>
          {resource.downloads > 0 && (
            <span className="inline-block px-3 py-1 text-xs font-medium bg-background-light text-secondary rounded-full">
              {resource.downloads} downloads
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>By {resource.author_name}</span>
          <span>{new Date(resource.created_at).toLocaleDateString()}</span>
        </div>
      </button>
    </div>
  );
});

export default ResourceCard;
