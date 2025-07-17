
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
      <section className="min-h-screen flex items-center justify-center bg-background-light px-4 py-12">
        <LoadingSpinner label="Loading resource details..." />
      </section>
    );
  }
  if (error) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background-light px-4 py-12">
        <ResourceDetailsErrorState message={error} onBack={handleBack} />
      </section>
    );
  }
  if (!resource) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-background-light px-4 py-12">
        <ResourceDetailsEmptyState onBack={handleBack} />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background-light flex flex-col items-center px-2 sm:px-4 md:px-8 py-8">
      <div className="w-full max-w-3xl">
        <button
          onClick={handleBack}
          className="group flex items-center gap-2 text-secondary hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1 mb-6"
          aria-label="Back to Resources"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Back to Resources</span>
        </button>
        <div className="bg-white dark:bg-background-dark border border-gray-light shadow-lg rounded-2xl overflow-hidden transition-all duration-200">
          <DetailsHeader resource={resource} onBookmarkToggle={handleBookmarkToggle} />
          <DetailsBody resource={resource} onDownload={handleDownload} />
        </div>
        {user && resource && resource.created_by === user.id && (
          <div className="mt-4 text-sm text-primary font-medium flex items-center gap-2" aria-label="Resource owner info">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            You are the owner of this resource
          </div>
        )}
      </div>
    </section>
  );
}
