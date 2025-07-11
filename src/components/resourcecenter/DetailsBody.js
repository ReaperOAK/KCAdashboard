import React from 'react';
import VideoEmbed from './VideoEmbed';

const DetailsBody = React.memo(function DetailsBody({ resource, onDownload }) {
  return (
    <div className="p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-background-light p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">{resource.description}</p>
          </div>
          {resource.type === 'video' && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Video Preview</h2>
              <VideoEmbed url={resource.url} />
            </div>
          )}
          {resource.tags && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-primary mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {resource.tags.split(',').map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-text-light text-secondary rounded-full text-sm font-medium"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div>
          <div className="bg-background-light p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-primary mb-4">Resource Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Resource Type</p>
                <p className="font-medium">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="font-medium">{resource.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Difficulty Level</p>
                <p className="font-medium">{resource.difficulty}</p>
              </div>
              {resource.downloads > 0 && (
                <div>
                  <p className="text-sm text-gray-500">Downloads</p>
                  <p className="font-medium">{resource.downloads}</p>
                </div>
              )}
              {resource.file_size && (
                <div>
                  <p className="text-sm text-gray-500">File Size</p>
                  <p className="font-medium">{Math.round(resource.file_size / 1024)} KB</p>
                </div>
              )}
              <button
                onClick={onDownload}
                className="mt-4 w-full px-4 py-3 bg-secondary text-white rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-2"
                aria-label={resource.type === 'link' ? 'Open Link' : `Download ${resource.type.toUpperCase()}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3.293-7.707a1 1 0 0 1 1.414 0L9 10.586V3a1 1 0 1 1 2 0v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                </svg>
                {resource.type === 'link' ? 'Open Link' : `Download ${resource.type.toUpperCase()}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default DetailsBody;
