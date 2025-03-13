import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const MaterialsView = ({ classroomId, refreshTrigger = 0 }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await ApiService.get(`/classroom/get-materials.php?classroom_id=${classroomId}`);
        
        if (response.success) {
          setMaterials(response.materials);
        } else {
          setError(response.message || 'Failed to fetch materials');
        }
      } catch (err) {
        setError('Error loading materials: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (classroomId) {
      fetchMaterials();
    }
  }, [classroomId, refreshTrigger]);
  
  const getFileIcon = (type) => {
    switch (type) {
      case 'document':
        return 'far fa-file-alt';
      case 'video':
        return 'far fa-file-video';
      case 'assignment':
        return 'far fa-clipboard';
      default:
        return 'far fa-file';
    }
  };
  
  const handleOpenResource = (material) => {
    if (material.type === 'video') {
      window.open(material.url, '_blank');
    } else {
      // For documents and other file types, open in new window
      window.open(`${ApiService.API_URL}/uploads/${material.url}`, '_blank');
    }
  };
  
  if (loading) {
    return <div className="flex justify-center items-center p-8">Loading materials...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    );
  }
  
  if (materials.length === 0) {
    return (
      <div className="bg-gray-50 p-6 text-center rounded-lg">
        <p className="text-gray-500">No materials have been added to this classroom yet.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {materials.map((material) => (
        <div 
          key={material.id} 
          className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
          onClick={() => handleOpenResource(material)}
        >
          <div className="flex items-start mb-4">
            <div className="bg-[#f3f1f9] p-4 rounded-lg mr-4">
              <i className={`${getFileIcon(material.type)} text-[#461fa3] text-xl`} aria-hidden="true"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#200e4a] mb-1">
                {material.title}
              </h3>
              <p className="text-sm text-gray-500">
                {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
              </p>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Added by: {material.created_by_name}</span>
            <span>{material.created_at_formatted}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialsView;
