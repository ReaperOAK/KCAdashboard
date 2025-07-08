
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ClassroomApi } from '../../api/classroom';
import UploadUtils from '../../utils/uploadUtils';

// --- Loading Skeleton ---
const MaterialsLoadingSkeleton = React.memo(() => (
  <div className="flex justify-center items-center p-8" aria-busy="true" aria-label="Loading materials">
    <div className="h-6 w-1/3 bg-gray-light rounded animate-pulse" />
  </div>
));

// --- Error Alert ---
const MaterialsErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border border-red-800 text-white rounded-lg px-4 py-3 mb-4" role="alert">
    <span className="font-semibold">Error:</span> {message}
  </div>
));

const MaterialCard = React.memo(function MaterialCard({ material, onOpen, getFileIcon }) {
  return (
    <button
      type="button"
      key={material.id}
      className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer text-left w-full focus:outline-none focus:ring-2 focus:ring-accent"
      onClick={() => onOpen(material)}
      aria-label={`Open material: ${material.title}`}
    >
      <div className="flex flex-col sm:flex-row items-start mb-4 gap-3 sm:gap-0">
        <div className="bg-background-light p-4 rounded-lg sm:mr-4 mb-3 sm:mb-0 flex-shrink-0">
          <i className={`${getFileIcon(material.type)} text-secondary text-xl`} aria-hidden="true"></i>
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-primary mb-1">{material.title}</h3>
          <p className="text-xs sm:text-sm text-gray-dark">{material.type.charAt(0).toUpperCase() + material.type.slice(1)}</p>
        </div>
      </div>
      <div className="text-xs text-gray-dark flex flex-col sm:flex-row justify-between gap-1 sm:gap-0">
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
      <div className="bg-background-light p-4 sm:p-6 text-center rounded-lg">
        <p className="text-gray-dark text-sm sm:text-base">No materials have been added to this classroom yet.</p>
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
