import { useState, useEffect, useCallback } from 'react';
import { ResourcesApi } from '../api/resources';

export function useResources({ activeCategory, searchTerm, showBookmarksOnly }) {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      let response;
      if (showBookmarksOnly) {
        response = await ResourcesApi.getUserBookmarks();
        setResources(response.resources || []);
      } else if (searchTerm.trim()) {
        response = await ResourcesApi.searchResources(searchTerm, {
          category: activeCategory !== 'all' ? activeCategory : null,
        });
        setResources(response.resources || []);
      } else {
        response = await ResourcesApi.getResources(activeCategory);
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
