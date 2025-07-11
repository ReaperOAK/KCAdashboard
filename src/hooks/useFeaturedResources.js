import { useState, useEffect, useCallback } from 'react';
import { ResourcesApi } from '../api/resources';

export function useFeaturedResources() {
  const [featured, setFeatured] = useState([]);
  const fetchFeatured = useCallback(async () => {
    try {
      const response = await ResourcesApi.getFeaturedResources();
      setFeatured(response.resources || []);
    } catch (err) {
      // Silent fail for featured
    }
  }, []);
  useEffect(() => { fetchFeatured(); }, [fetchFeatured]);
  return { featured, setFeatured };
}
