
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

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
const LoadingSpinner = React.memo(function LoadingSpinner({ label = 'Loading resources...' }) {
  return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto" />
      <p className="mt-2 text-secondary">{label}</p>
    </div>
  );
});

// --- Error State ---
const ErrorState = React.memo(function ErrorState({ message }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
      {message}
    </div>
  );
});

// --- Empty State ---
const EmptyState = React.memo(function EmptyState({ showBookmarksOnly, searchTerm }) {
  return (
    <div className="text-center py-8 bg-white rounded-xl shadow-lg">
      <p className="text-lg text-gray-600">
        {showBookmarksOnly
          ? "You haven't bookmarked any resources yet."
          : searchTerm
            ? `No resources found matching "${searchTerm}"`
            : "No resources found in this category."}
      </p>
    </div>
  );
});

// --- Resource Card (Memoized) ---
const ResourceCard = React.memo(function ResourceCard({ resource, onBookmarkToggle, onResourceClick }) {
  // Accessibility: Card is a button for keyboard navigation
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


const UploadResourceForm = React.memo(function UploadResourceForm({
  resourceTypes,
  categories,
  difficultyLevels,
  onSubmit,
  uploading,
  uploadError,
  onCancel,
}) {
  const initialValues = useMemo(() => ({
    title: '',
    description: '',
    category: 'openings',
    type: 'link',
    url: '',
    tags: '',
    difficulty: 'beginner',
    file: null,
  }), []);

  const validationSchema = useMemo(() => Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    category: Yup.string().required('Category is required'),
    type: Yup.string().required('Type is required'),
    url: Yup.string().when('type', {
      is: (val) => val === 'link' || val === 'video',
      then: Yup.string().url('Must be a valid URL').required('URL is required'),
      otherwise: Yup.string(),
    }),
    tags: Yup.string(),
    difficulty: Yup.string().required('Difficulty is required'),
    file: Yup.mixed().when('type', {
      is: (val) => val !== 'link' && val !== 'video',
      then: Yup.mixed().required('File is required'),
      otherwise: Yup.mixed(),
    }),
  }), []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-semibold text-primary mb-4">Upload New Resource</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-4" aria-label="Upload Resource Form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="title">Title</label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  aria-required="true"
                />
                <ErrorMessage name="title" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="type">Resource Type</label>
                <Field
                  as="select"
                  id="type"
                  name="type"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {resourceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="type" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="category">Category</label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="category" component="div" className="text-red-500 text-xs mt-1" />
              </div>
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="difficulty">Difficulty</label>
                <Field
                  as="select"
                  id="difficulty"
                  name="difficulty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="difficulty" component="div" className="text-red-500 text-xs mt-1" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="description">Description</label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <ErrorMessage name="description" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            <div>
              <label className="block text-gray-700 mb-1" htmlFor="tags">Tags (comma separated)</label>
              <Field
                id="tags"
                name="tags"
                type="text"
                placeholder="e.g. sicilian, dragon, attack"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <ErrorMessage name="tags" component="div" className="text-red-500 text-xs mt-1" />
            </div>
            {values.type === 'link' || values.type === 'video' ? (
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="url">URL</label>
                <Field
                  id="url"
                  name="url"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={values.type === 'link' || values.type === 'video'}
                  aria-required={values.type === 'link' || values.type === 'video'}
                />
                <ErrorMessage name="url" component="div" className="text-red-500 text-xs mt-1" />
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="file">File</label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required={values.type !== 'link' && values.type !== 'video'}
                  aria-required={values.type !== 'link' && values.type !== 'video'}
                  onChange={e => setFieldValue('file', e.currentTarget.files[0])}
                />
                <ErrorMessage name="file" component="div" className="text-red-500 text-xs mt-1" />
              </div>
            )}
            {uploadError && (
              <div className="text-red-500 text-sm">{uploadError}</div>
            )}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md transition-colors hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className={`px-4 py-2 bg-secondary text-white rounded-md transition-colors ${uploading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-accent'}`}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
});

// --- Category Tabs (Memoized) ---
const CategoryTabs = React.memo(function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
  return (
    <div className="mb-6 flex space-x-4 overflow-x-auto pb-2" role="tablist" aria-label="Resource categories">
      {categories.map(category => (
        <button
          key={category.id}
          type="button"
          role="tab"
          aria-selected={activeCategory === category.id}
          tabIndex={activeCategory === category.id ? 0 : -1}
          onClick={() => onCategoryChange(category.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${activeCategory === category.id ? 'bg-secondary text-white' : 'bg-white text-secondary hover:bg-secondary hover:text-white'}`}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
});

// --- Search Bar (Memoized) ---
const SearchBar = React.memo(function SearchBar({ searchTerm, onSearchTermChange, onSearch }) {
  return (
    <form onSubmit={onSearch} className="flex gap-2 mb-6" role="search" aria-label="Search resources">
      <input
        type="text"
        value={searchTerm}
        onChange={e => onSearchTermChange(e.target.value)}
        placeholder="Search resources..."
        className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-secondary"
        aria-label="Search resources"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent transition-colors"
        aria-label="Search"
      >
        Search
      </button>
    </form>
  );
});

// --- Featured Resources (Memoized) ---
const FeaturedResources = React.memo(function FeaturedResources({ featuredResources, onBookmarkToggle, onResourceClick }) {
  if (!Array.isArray(featuredResources) || featuredResources.length === 0) return null;
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold text-primary mb-4">Featured Resources</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {featuredResources.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onBookmarkToggle={onBookmarkToggle}
            onResourceClick={onResourceClick}
          />
        ))}
      </div>
    </div>
  );
});



// --- Constants ---
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

// --- Utility Hooks ---
function useResources({ activeCategory, searchTerm, showBookmarksOnly }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (showBookmarksOnly) {
        response = await ApiService.getUserBookmarks();
        setResources(response.resources || []);
      } else if (searchTerm.trim()) {
        response = await ApiService.searchResources(searchTerm, {
          category: activeCategory !== 'all' ? activeCategory : null,
        });
        setResources(response.resources || []);
      } else {
        response = await ApiService.getResources(activeCategory);
        setResources(response.resources || []);
      }
    } catch (err) {
      setError('Failed to fetch resources: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchTerm, showBookmarksOnly]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return { resources, loading, error, refetch: fetchResources, setResources };
}

function useFeaturedResources() {
  const [featured, setFeatured] = useState([]);
  const fetchFeatured = useCallback(async () => {
    try {
      const response = await ApiService.getFeaturedResources();
      setFeatured(response.resources || []);
    } catch (err) {
      // Silent fail for featured
    }
  }, []);
  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);
  return { featured, setFeatured };
}

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
  const handleSearchTermChange = useCallback((e) => setSearchTerm(e.target.value), []);
  const handleSearchSubmit = useCallback((e) => { e.preventDefault(); refetch(); }, [refetch]);
  const handleToggleBookmarks = useCallback(() => setShowBookmarksOnly((prev) => !prev), []);
  const handleToggleUploadForm = useCallback(() => setShowUploadForm((prev) => !prev), []);

  const handleResourceClick = useCallback(async (resource) => {
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
  }, []);

  const handleBookmarkToggle = useCallback(async (resource) => {
    try {
      if (resource.is_bookmarked) {
        await ApiService.unbookmarkResource(resource.id);
      } else {
        await ApiService.bookmarkResource(resource.id);
      }
      // Update resource in the list
      setResources((prev) => prev.map(item => item.id === resource.id ? { ...item, is_bookmarked: !item.is_bookmarked } : item));
      setFeatured((prev) => prev.map(item => item.id === resource.id ? { ...item, is_bookmarked: !item.is_bookmarked } : item));
    } catch (err) {
      // Optionally show error toast
    }
  }, [setResources, setFeatured]);

  // --- Render ---
  return (
    <div className="min-h-screen bg-background-light">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Resource Center</h1>
          <div className="flex items-center space-x-4">
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
            onClose={handleToggleUploadForm}
            onSuccess={() => { handleToggleUploadForm(); refetch(); }}
            resourceTypes={RESOURCE_TYPES}
            categories={CATEGORIES}
            difficultyLevels={DIFFICULTY_LEVELS}
          />
        )}
        <div className="mb-6">
          <SearchBar value={searchTerm} onChange={handleSearchTermChange} onSubmit={handleSearchSubmit} />
        </div>
        {!showBookmarksOnly && !searchTerm && (
          <FeaturedResources
            featured={featured}
            onBookmarkToggle={handleBookmarkToggle}
            onResourceClick={handleResourceClick}
          />
        )}
        <CategoryTabs categories={CATEGORIES} activeCategory={activeCategory} onChange={handleCategoryChange} />
        {loading ? (
          <LoadingSpinner label="Loading resources..." />
        ) : error ? (
          <ErrorState message={error} />
        ) : resources.length === 0 ? (
          <EmptyState showBookmarksOnly={showBookmarksOnly} searchTerm={searchTerm} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map(resource => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onBookmarkToggle={handleBookmarkToggle}
                onClick={handleResourceClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourceCenter;
