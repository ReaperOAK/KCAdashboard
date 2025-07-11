
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResourcesApi } from '../../api/resources';
import { useAuth } from '../../hooks/useAuth';
import DetailsHeader from '../../components/resourcecenter/DetailsHeader';
import DetailsBody from '../../components/resourcecenter/DetailsBody';
import LoadingSpinner from '../../components/resourcecenter/LoadingSpinner';
import ResourceDetailsErrorState from '../../components/resourcecenter/ResourceDetailsErrorState';
import ResourceDetailsEmptyState from '../../components/resourcecenter/ResourceDetailsEmptyState';

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
        const response = await ResourcesApi.getById(id);
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
        await ResourcesApi.unbookmarkResource(resource.id);
      } else {
        await ResourcesApi.bookmarkResource(resource.id);
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
        await ResourcesApi.logResourceAccess(resource.id);
        window.open(resource.url, '_blank', 'noopener');
      } else {
        window.open(ResourcesApi.getResourceDownloadUrl(resource.id), '_blank', 'noopener');
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
        <LoadingSpinner label="Loading resource details..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <ResourceDetailsErrorState message={error} onBack={handleBack} />
      </div>
    );
  }
  if (!resource) {
    return (
      <div className="min-h-screen bg-background-light p-8">
        <ResourceDetailsEmptyState onBack={handleBack} />
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
        <DetailsHeader resource={resource} onBookmarkToggle={handleBookmarkToggle} />
        <DetailsBody resource={resource} onDownload={handleDownload} />
      </div>
      {user && resource && resource.created_by === user.id && (
        <div className="mt-4 text-sm text-gray-500">You are the owner of this resource</div>
      )}
    </div>
  );
}
