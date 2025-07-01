
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

// --- Utility: Resource Icon ---
const getResourceIcon = (type) => {
  switch (type) {
    case 'pgn': return '♟';
    case 'pdf': return '📄';
    case 'video': return '🎥';
    case 'link': return '🔗';
    default: return '📁';
  }
};

// --- Video Embed (Memoized) ---
const VideoEmbed = React.memo(function VideoEmbed({ url }) {
  let videoId = '';
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // eslint-disable-next-line no-useless-escape
    const regex = /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    videoId = match ? match[1] : '';
  }
  if (videoId) {
    return (
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full rounded-lg"
        ></iframe>
      </div>
    );
  }
  return <p className="text-gray-500">Video preview not available</p>;
});

// --- Loading Spinner ---
const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading resource details...' }) {
  return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto" />
      <p className="mt-2 text-secondary">{label}</p>
    </div>
  );
});

// --- Error State ---
const ErrorState = React.memo(function ErrorState({ message, onBack }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
      {message}
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
        aria-label="Back to Resources"
      >
        Back to Resources
      </button>
    </div>
  );
});

// --- Empty State ---
const EmptyState = React.memo(function EmptyState({ onBack }) {
  return (
    <div className="text-center py-8 bg-white rounded-xl shadow-lg">
      <p className="text-lg text-gray-600">Resource not found</p>
      <button
        onClick={onBack}
        className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
        aria-label="Back to Resources"
      >
        Back to Resources
      </button>
    </div>
  );
});

// --- Details Header ---
const DetailsHeader = React.memo(function DetailsHeader({ resource, onBack, onBookmarkToggle }) {
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

// --- Details Body ---
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

// --- Main Component ---
export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch resource details
  useEffect(() => {
    let isMounted = true;
    const fetchResourceDetails = async () => {
      try {
        const response = await ApiService.get(`/resources/get-by-id.php?id=${id}`);
        if (isMounted) {
          if (response.resource) {
            setResource(response.resource);
            setError(null);
          } else {
            setError('Resource not found');
          }
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load resource details: ' + err.message);
          setLoading(false);
        }
      }
    };
    fetchResourceDetails();
    return () => { isMounted = false; };
  }, [id]);

  // Handlers
  const handleBookmarkToggle = useCallback(async () => {
    if (!resource) return;
    try {
      if (resource.is_bookmarked) {
        await ApiService.unbookmarkResource(resource.id);
      } else {
        await ApiService.bookmarkResource(resource.id);
      }
      setResource(r => r ? { ...r, is_bookmarked: !r.is_bookmarked } : r);
    } catch (err) {
      // Optionally show error toast
    }
  }, [resource]);

  const handleDownload = useCallback(async () => {
    if (!resource) return;
    try {
      if (resource.type === 'link' || resource.type === 'video') {
        await ApiService.post('/resources/log-access.php', { resource_id: resource.id });
        window.open(resource.url, '_blank', 'noopener');
      } else {
        window.open(ApiService.getResourceDownloadUrl(resource.id), '_blank', 'noopener');
      }
    } catch (err) {
      // Optionally show error toast
    }
  }, [resource]);

  const handleBack = useCallback(() => {
    navigate('/student/resources');
  }, [navigate]);

  // --- Render ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <LoadingSpinner />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <ErrorState message={error} onBack={handleBack} />
      </div>
    );
  }
  if (!resource) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <EmptyState onBack={handleBack} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <button
          onClick={handleBack}
          className="flex items-center text-secondary hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded"
          aria-label="Back to Resources"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
          </svg>
          Back to Resources
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <DetailsHeader resource={resource} onBack={handleBack} onBookmarkToggle={handleBookmarkToggle} />
        <DetailsBody resource={resource} onDownload={handleDownload} />
      </div>
      {user && resource && resource.created_by === user.id && (
        <div className="mt-4 text-sm text-gray-500">You are the owner of this resource</div>
      )}
    </div>
  );
}
