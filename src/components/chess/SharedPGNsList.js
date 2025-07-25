import React, { useState, useEffect } from 'react';
import { ChessApi } from '../../../api/chess';
import { useAuth } from '../../../hooks/useAuth';
import { 
  ShareIcon, 
  EyeIcon, 
  CalendarIcon, 
  UserIcon,
  DocumentIcon,
  TagIcon 
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SharedPGNsList = () => {
  const { user } = useAuth();
  const [sharedPGNs, setSharedPGNs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSharedPGNs();
  }, []);

  const loadSharedPGNs = async () => {
    try {
      setLoading(true);
      const response = await ChessApi.getSharedPGNs();
      if (response.success) {
        setSharedPGNs(response.shared_pgns || []);
      } else {
        throw new Error(response.message || 'Failed to load shared PGNs');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load shared PGNs');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading shared PGNs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadSharedPGNs}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sharedPGNs.length === 0) {
    return (
      <div className="p-8 text-center">
        <ShareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Shared PGNs</h3>
        <p className="text-gray-600">
          You don't have any PGN studies shared with you yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Shared with Me ({sharedPGNs.length})
        </h2>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sharedPGNs.map((pgn) => (
          <div
            key={pgn.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                {pgn.title}
              </h3>
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => window.open(`/chess/pgn/${pgn.id}`, '_blank')}
                  className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                  title="View PGN"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {pgn.description && (
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {pgn.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <TagIcon className="w-3 h-3 mr-1" />
                {pgn.category}
              </span>
              
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                pgn.permission === 'edit' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {pgn.permission === 'edit' ? 'Can Edit' : 'View Only'}
              </span>
              
              {pgn.is_public && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Public
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  <span>Shared by: {pgn.teacher_name}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  <span>Shared: {formatDate(pgn.shared_at)}</span>
                </div>
                <div className="flex items-center">
                  <DocumentIcon className="w-4 h-4 mr-1" />
                  <span>{formatFileSize(pgn.content_size)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedPGNsList;
