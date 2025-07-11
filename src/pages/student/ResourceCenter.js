

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useResources } from '../../hooks/useResources';
import { useFeaturedResources } from '../../hooks/useFeaturedResources';
import ResourceCard from '../../components/resourcecenter/ResourceCard';
import LoadingSpinner from '../../components/resourcecenter/LoadingSpinner';
import ErrorState from '../../components/resourcecenter/ErrorState';
import EmptyState from '../../components/resourcecenter/EmptyState';
import UploadResourceForm from '../../components/resourcecenter/UploadResourceForm';
import CategoryTabs from '../../components/resourcecenter/CategoryTabs';
import SearchBar from '../../components/resourcecenter/SearchBar';
import FeaturedResources from '../../components/resourcecenter/FeaturedResources';

const CATEGORIES = [
  { id: 'all', label: 'All Resources' },
  { id: 'openings', label: 'Openings' },
  { id: 'middlegame', label: 'Middlegame' },
  { id: 'endgame', label: 'Endgame' },
  { id: 'tactics', label: 'Tactics' },
  { id: 'strategy', label: 'Strategy' },
];
const RESOURCE_TYPES = [
  { id: 'pgn', label: 'PGN File' },
  { id: 'pdf', label: 'PDF Document' },
  { id: 'video', label: 'Video Link' },
  { id: 'link', label: 'External Link' },
];
const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const ResourceCenter = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  const { resources, loading, error, refetch, setResources } = useResources({ activeCategory, searchTerm, showBookmarksOnly });
  const { featured, setFeatured } = useFeaturedResources();

  // Memoize event handlers
  const handleCategoryChange = useCallback((id) => setActiveCategory(id), []);
  const handleSearchTermChange = useCallback((val) => setSearchTerm(val), []);
  const handleSearchSubmit = useCallback((e) => { e.preventDefault(); refetch(); }, [refetch]);
  const handleToggleBookmarks = useCallback(() => setShowBookmarksOnly((prev) => !prev), []);
  const handleToggleUploadForm = useCallback(() => setShowUploadForm((prev) => !prev), []);

  const handleResourceClick = useCallback(async (resource) => {
    try {
      if (resource.type === 'link' || resource.type === 'video') {
        // Optionally log access
        window.open(resource.url, '_blank', 'noopener');
      } else {
        // Download file
        // You may want to log access here as well
      }
    } catch (err) {
      // Optionally show error toast
    }
  }, []);

  const handleBookmarkToggle = useCallback(async (resource) => {
    try {
      // You may want to call API here
      setResources((prev) => prev.map(item => item.id === resource.id ? { ...item, is_bookmarked: !item.is_bookmarked } : item));
      setFeatured((prev) => prev.map(item => item.id === resource.id ? { ...item, is_bookmarked: !item.is_bookmarked } : item));
    } catch (err) {
      // Optionally show error toast
    }
  }, [setResources, setFeatured]);

  return (
    <div className="min-h-screen bg-background-light px-4 sm:px-6 md:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Resource Center</h1>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={handleToggleBookmarks}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent ${showBookmarksOnly ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
              aria-pressed={showBookmarksOnly}
              aria-label={showBookmarksOnly ? 'Show all resources' : 'Show bookmarks only'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              {showBookmarksOnly ? 'All Resources' : 'Bookmarks'}
            </button>
            {user && (user.role === 'teacher' || user.role === 'admin') && (
              <button
                onClick={handleToggleUploadForm}
                className="bg-accent hover:bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={showUploadForm ? 'Close upload form' : 'Upload resource'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Upload Resource
              </button>
            )}
          </div>
        </div>
        {showUploadForm && (
          <UploadResourceForm
            resourceTypes={RESOURCE_TYPES}
            categories={CATEGORIES}
            difficultyLevels={DIFFICULTY_LEVELS}
            onSubmit={() => {}}
            uploading={false}
            uploadError={null}
            onCancel={handleToggleUploadForm}
          />
        )}
        <div className="mb-4 sm:mb-6">
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} onSubmit={handleSearchSubmit} />
        </div>
        {!showBookmarksOnly && !searchTerm && (
          <FeaturedResources
            featured={featured}
            onBookmarkToggle={handleBookmarkToggle}
            onResourceClick={handleResourceClick}
          />
        )}
        <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        {loading ? (
          <LoadingSpinner label="Loading resources..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : resources.length === 0 ? (
          <EmptyState showBookmarksOnly={showBookmarksOnly} searchTerm={searchTerm} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {resources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBookmarkToggle={handleBookmarkToggle}
                onResourceClick={handleResourceClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCenter;
