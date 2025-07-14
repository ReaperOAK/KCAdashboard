
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClassroomApi } from '../../api/classroom';
import UploadUtils from '../../utils/uploadUtils';


// --- Loading Skeleton ---
const MaterialsLoadingSkeleton = React.memo(() => (
  <div
    className="flex flex-col items-center justify-center py-10 animate-pulse"
    aria-busy="true"
    aria-label="Loading materials"
  >
    <div className="h-7 w-2/3 max-w-xs bg-gray-light dark:bg-gray-700 rounded mb-4 transition-all duration-300" style={{ minWidth: 120 }} />
    <div className="h-4 w-1/2 max-w-sm bg-gray-light dark:bg-gray-700 rounded transition-all duration-300" style={{ minWidth: 80 }} />
    <span className="sr-only">Loading...</span>
  </div>
));

// --- Error Alert ---
const MaterialsErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border border-red-800 text-white rounded-lg px-4 py-3 mb-4 flex items-center gap-2 " role="alert" aria-live="assertive">
    <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
    <span className="font-semibold">Error:</span> {message}
  </div>
));

// --- Material Card ---
const MaterialCard = React.memo(function MaterialCard({ material, onOpen, getFileIcon }) {
  return (
    <button
      type="button"
      key={material.id}
      className="bg-background-light dark:bg-background-dark border border-gray-light dark:border-gray-dark shadow-md hover:shadow-lg hover:border-accent transition-all cursor-pointer text-left w-full rounded-xl p-5 focus:outline-none focus:ring-2 focus:ring-accent group"
      onClick={() => onOpen(material)}
      aria-label={`Open material: ${material.title}`}
    >
      <div className="flex flex-col sm:flex-row items-start mb-4 gap-3 sm:gap-0">
        <div className="bg-gray-light dark:bg-gray-dark p-4 rounded-lg sm:mr-4 mb-3 sm:mb-0 flex-shrink-0 flex items-center justify-center transition-all group-hover:bg-accent">
          <i className={`${getFileIcon(material.type)} text-secondary dark:text-accent text-2xl`} aria-hidden="true"></i>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-primary dark:text-text-light mb-1 line-clamp-2">{material.title}</h3>
          <p className="text-xs sm:text-sm text-gray-dark dark:text-gray-light">{material.type.charAt(0).toUpperCase() + material.type.slice(1)}</p>
        </div>
      </div>
      <div className="text-xs text-gray-dark dark:text-gray-light flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
        <span>Added by: {material.created_by_name}</span>
        <span>{material.created_at_formatted}</span>
      </div>
    </button>
  );
});

function MaterialsView({ classroomId, refreshTrigger = 0 }) {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchMaterials() {
      try {
        setLoading(true);
        setError(null);
        const response = await ClassroomApi.getClassroomMaterials(classroomId);
        if (!isMounted) return;
        if (response.success) {
          setMaterials(response.materials);
        } else {
          setError(response.message || 'Failed to fetch materials');
        }
      } catch (err) {
        if (isMounted) setError('Error loading materials: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (classroomId) fetchMaterials();
    return () => { isMounted = false; };
  }, [classroomId, refreshTrigger]);

  // Memoized icon getter
  const getFileIcon = useCallback((type) => {
    switch (type) {
      case 'document': return 'far fa-file-alt';
      case 'video': return 'far fa-file-video';
      case 'assignment': return 'far fa-clipboard';
      default: return 'far fa-file';
    }
  }, []);

  // Memoized open handler
  const handleOpenResource = useCallback((material) => {
    if (material.type === 'video') {
      window.open(material.url, '_blank');
    } else if (material.url && (material.url.startsWith('http://') || material.url.startsWith('https://'))) {
      window.open(material.url, '_blank');
    } else {
      window.open(UploadUtils.getMaterialUrl(material.url), '_blank');
    }
  }, []);

  // Memoize material cards
  const materialCards = useMemo(() => materials.map(material => (
    <MaterialCard key={material.id} material={material} onOpen={handleOpenResource} getFileIcon={getFileIcon} />
  )), [materials, handleOpenResource, getFileIcon]);

  if (loading) return <MaterialsLoadingSkeleton />;
  if (error) return <MaterialsErrorAlert message={error} />;
  if (materials.length === 0) {
    return (
      <div className="bg-background-light dark:bg-background-dark border border-gray-light dark:border-gray-dark p-6 sm:p-8 text-center rounded-xl shadow-md ">
        <p className="text-gray-dark dark:text-gray-light text-sm sm:text-base">No materials have been added to this classroom yet.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {materialCards}
    </div>
  );
}

export default React.memo(MaterialsView);
