
import React, { useMemo } from 'react';
import VideoEmbed from './VideoEmbed';

// Pure badge for tags (single responsibility)
const TagBadge = React.memo(function TagBadge({ tag }) {
  return (
    <span
      className="px-3 py-1 bg-accent text-white rounded-full text-xs font-semibold shadow-sm transition-all duration-200 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent"
      tabIndex={0}
      aria-label={`Tag: ${tag}`}
    >
      {tag}
    </span>
  );
});

/**
 * DetailsBody: Beautiful, responsive, single-responsibility resource details
 * - Description, video, tags, and details panel
 * - Responsive grid, beautiful color tokens, accessible, empty state handling
 */
const DetailsBody = React.memo(function DetailsBody({ resource, onDownload }) {
  // Memoize tags for performance
  const tagBadges = useMemo(() =>
    resource.tags
      ? resource.tags.split(',').map((tag, idx) => <TagBadge key={idx} tag={tag.trim()} />)
      : null,
    [resource.tags]
  );

  return (
    <section className="p-4 sm:p-6 md:p-8 w-full ">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <article className="bg-background-light dark:bg-background-dark p-6 rounded-2xl shadow-md border border-gray-light">
            <h2 className="text-2xl text-primary font-semibold mb-3">Description</h2>
            <p className="text-text-dark whitespace-pre-line text-base min-h-[48px]">
              {resource.description || <span className="italic text-gray-dark">No description provided.</span>}
            </p>
          </article>
          {resource.type === 'video' && resource.url && (
            <section className="bg-background-light dark:bg-background-dark p-6 rounded-2xl shadow-md border border-gray-light">
              <h2 className="text-2xl text-primary font-semibold mb-3">Video Preview</h2>
              <div className="aspect-video rounded-lg overflow-hidden border border-gray-light">
                <VideoEmbed url={resource.url} />
              </div>
            </section>
          )}
          {tagBadges && tagBadges.length > 0 && (
            <section className="bg-background-light dark:bg-background-dark p-6 rounded-2xl shadow-md border border-gray-light">
              <h2 className="text-2xl text-primary font-semibold mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">{tagBadges}</div>
            </section>
          )}
        </div>
        {/* Details panel */}
        <aside className="bg-background-light dark:bg-background-dark p-6 rounded-2xl shadow-md border border-gray-light flex flex-col justify-between min-h-[320px]">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-dark">Resource Type</p>
              <p className="font-medium text-primary">{resource.type ? resource.type.charAt(0).toUpperCase() + resource.type.slice(1) : <span className="italic text-gray-dark">N/A</span>}</p>
            </div>
            <div>
              <p className="text-sm text-gray-dark">Category</p>
              <p className="font-medium text-primary">{resource.category || <span className="italic text-gray-dark">N/A</span>}</p>
            </div>
            <div>
              <p className="text-sm text-gray-dark">Difficulty Level</p>
              <p className="font-medium text-primary">{resource.difficulty || <span className="italic text-gray-dark">N/A</span>}</p>
            </div>
            {resource.downloads > 0 && (
              <div>
                <p className="text-sm text-gray-dark">Downloads</p>
                <p className="font-medium text-primary">{resource.downloads}</p>
              </div>
            )}
            {resource.file_size && (
              <div>
                <p className="text-sm text-gray-dark">File Size</p>
                <p className="font-medium text-primary">{Math.round(resource.file_size / 1024)} KB</p>
              </div>
            )}
          </div>
          <button
            onClick={onDownload}
            className="mt-6 w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-accent focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 flex items-center justify-center gap-2 text-base font-semibold shadow-md disabled:bg-gray-light disabled:text-gray-dark disabled:cursor-not-allowed"
            aria-label={resource.type === 'link' ? 'Open Link' : `Download ${resource.type ? resource.type.toUpperCase() : 'Resource'}`}
            disabled={resource.disabled}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path fillRule="evenodd" d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3.293-7.707a1 1 0 0 1 1.414 0L9 10.586V3a1 1 0 1 1 2 0v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
            </svg>
            {resource.type === 'link' ? 'Open Link' : `Download ${resource.type ? resource.type.toUpperCase() : ''}`}
          </button>
        </aside>
      </div>
    </section>
  );
});

export default DetailsBody;
