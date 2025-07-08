// Resource management endpoints
import { get, post, postFormData } from './utils';

export const ResourcesApi = {
  getResourceFileBlob : async (resourceId, token = null) => {
  const url = `/api/endpoints/resources/download.php?id=${resourceId}&view=1`;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch file');
  return await res.blob();
},
  getResources: (category = null) => {
    const endpoint = category && category !== 'all'
      ? `/resources/get-by-category.php?category=${category}`
      : '/resources/get-all.php';
    return get(endpoint);
  },
  getFeaturedResources: () => get('/resources/get-featured.php'),
  searchResources: (query, filters = {}) => {
    let endpoint = `/resources/search.php?q=${encodeURIComponent(query)}`;
    Object.entries(filters).forEach(([key, value]) => {
      if (value) endpoint += `&${key}=${encodeURIComponent(value)}`;
    });
    return get(endpoint);
  },
  uploadResource: (formData) => postFormData('/resources/upload.php', formData),
  bookmarkResource: (resourceId) => post('/resources/bookmark.php', { resource_id: resourceId }),
  unbookmarkResource: (resourceId) => post('/resources/unbookmark.php', { resource_id: resourceId }),
  getUserBookmarks: () => get('/resources/get-bookmarks.php'),
  getResourceDownloadUrl: (resourceId) => `${process.env.NODE_ENV === 'development' ? 'https://dashboard.kolkatachessacademy.in/api/endpoints' : 'https://dashboard.kolkatachessacademy.in/api/endpoints'}/resources/download.php?id=${resourceId}`,
};
