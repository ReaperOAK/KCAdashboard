import React, { useState, useEffect } from 'react';
import { XMarkIcon, ShareIcon, UserIcon, CheckIcon, AcademicCapIcon, UsersIcon } from '@heroicons/react/24/outline';
import { ChessApi } from '../../../api/chess';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';

const PGNShareModal = ({ isOpen, onClose, pgn, onShareComplete }) => {
  const { user } = useAuth();
  const [shareableEntities, setShareableEntities] = useState({ teachers: [], batches: [], students: [] });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);
  const [fetchingEntities, setFetchingEntities] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'batches'

  // Check if current user can share PGNs
  const canShare = user && (user.role === 'teacher' || user.role === 'admin');

  useEffect(() => {
    if (isOpen && canShare) {
      fetchShareableEntities();
    }
  }, [isOpen, canShare]);

  const fetchShareableEntities = async () => {
    try {
      setFetchingEntities(true);
      const response = await ChessApi.getShareableEntities();
      if (response.success) {
        setShareableEntities({
          teachers: response.teachers || [],
          batches: response.batches || [],
          students: response.students || []
        });
      } else {
        throw new Error(response.message || 'Failed to fetch shareable entities');
      }
    } catch (error) {
      console.error('Error fetching shareable entities:', error);
      toast.error('Failed to load entities for sharing');
    } finally {
      setFetchingEntities(false);
    }
  };

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBatchToggle = (batchId) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const getFilteredUsers = () => {
    const allUsers = [...shareableEntities.teachers, ...shareableEntities.students];
    if (!searchTerm.trim()) return allUsers;
    
    const term = searchTerm.toLowerCase();
    return allUsers.filter(user => 
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.batches && user.batches.toLowerCase().includes(term))
    );
  };

  const getFilteredBatches = () => {
    if (!searchTerm.trim()) return shareableEntities.batches;
    
    const term = searchTerm.toLowerCase();
    return shareableEntities.batches.filter(batch => 
      batch.name.toLowerCase().includes(term) ||
      batch.teacher_name.toLowerCase().includes(term) ||
      batch.level.toLowerCase().includes(term)
    );
  };

  const handleSelectAllUsers = () => {
    const filteredUsers = getFilteredUsers();
    const allSelected = filteredUsers.every(user => selectedUsers.includes(user.id));
    
    if (allSelected) {
      // Deselect all filtered users
      setSelectedUsers(prev => prev.filter(id => !filteredUsers.some(user => user.id === id)));
    } else {
      // Select all filtered users
      const newSelections = filteredUsers.map(user => user.id);
      setSelectedUsers(prev => [...new Set([...prev, ...newSelections])]);
    }
  };

  const handleSelectAllBatches = () => {
    const filteredBatches = getFilteredBatches();
    const allSelected = filteredBatches.every(batch => selectedBatches.includes(batch.id));
    
    if (allSelected) {
      // Deselect all filtered batches
      setSelectedBatches(prev => prev.filter(id => !filteredBatches.some(batch => batch.id === id)));
    } else {
      // Select all filtered batches
      const newSelections = filteredBatches.map(batch => batch.id);
      setSelectedBatches(prev => [...new Set([...prev, ...newSelections])]);
    }
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0 && selectedBatches.length === 0) {
      toast.error('Please select at least one user or batch to share with');
      return;
    }

    try {
      setLoading(true);
      const response = await ChessApi.sharePGN(pgn.id, selectedUsers, selectedBatches, permission);
      
      if (response.success) {
        toast.success(response.message || 'PGN study shared successfully!');
        if (onShareComplete) {
          onShareComplete(pgn.id, selectedUsers, selectedBatches, permission);
        }
        onClose();
        resetForm();
      } else {
        throw new Error(response.message || 'Failed to share PGN study');
      }
    } catch (error) {
      console.error('Error sharing PGN:', error);
      toast.error(error.message || 'Failed to share PGN study');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedUsers([]);
    setSelectedBatches([]);
    setPermission('view');
    setSearchTerm('');
    setActiveTab('users');
  };

  if (!isOpen) return null;

  if (!canShare) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Sharing Not Allowed
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="text-center py-8">
            <ShareIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Only teachers and administrators can share PGN studies. Students cannot share content.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = selectedUsers.length + selectedBatches.length;
  const filteredUsers = getFilteredUsers();
  const filteredBatches = getFilteredBatches();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShareIcon className="h-5 w-5 text-blue-600" />
              Share PGN Study
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {pgn?.title || 'Untitled Study'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Permission Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Permission Level
            </label>
            <select
              value={permission}
              onChange={(e) => setPermission(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="view">View Only</option>
              <option value="edit">View & Edit</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="mb-4">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <UserIcon className="h-4 w-4 inline mr-2" />
                Individual Users ({selectedUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('batches')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'batches'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <AcademicCapIcon className="h-4 w-4 inline mr-2" />
                Batches ({selectedBatches.length})
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder={activeTab === 'users' ? "Search users by name, email, or batch..." : "Search batches by name, teacher, or level..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Selection Controls */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={activeTab === 'users' ? handleSelectAllUsers : handleSelectAllBatches}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              disabled={activeTab === 'users' ? filteredUsers.length === 0 : filteredBatches.length === 0}
            >
              {activeTab === 'users' 
                ? (filteredUsers.every(user => selectedUsers.includes(user.id)) ? 'Deselect All' : 'Select All')
                : (filteredBatches.every(batch => selectedBatches.includes(batch.id)) ? 'Deselect All' : 'Select All')
              }
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>

          {/* Content List */}
          <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-md">
            {fetchingEntities ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-300 mt-2">Loading...</p>
              </div>
            ) : activeTab === 'users' ? (
              // Users Tab
              filteredUsers.length === 0 ? (
                <div className="p-8 text-center">
                  <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchTerm ? 'No users found matching your search' : 'No users available for sharing'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                            {user.batches && user.batches !== 'No active batches' && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Batches: {user.batches}
                              </p>
                            )}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.type === 'teacher' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {user.type}
                          </span>
                        </div>
                      </div>
                      {selectedUsers.includes(user.id) && (
                        <CheckIcon className="h-4 w-4 text-blue-600 ml-2" />
                      )}
                    </label>
                  ))}
                </div>
              )
            ) : (
              // Batches Tab
              filteredBatches.length === 0 ? (
                <div className="p-8 text-center">
                  <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 dark:text-gray-300">
                    {searchTerm ? 'No batches found matching your search' : 'No batches available for sharing'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {filteredBatches.map((batch) => (
                    <label
                      key={batch.id}
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBatches.includes(batch.id)}
                        onChange={() => handleBatchToggle(batch.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {batch.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Teacher: {batch.teacher_name} • Level: {batch.level}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              <UsersIcon className="h-3 w-3 inline mr-1" />
                              {batch.student_count} student{batch.student_count !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              batch.level === 'beginner' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : batch.level === 'intermediate'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {batch.level}
                            </span>
                            {batch.is_own_batch && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Your batch
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {selectedBatches.includes(batch.id) && (
                        <CheckIcon className="h-4 w-4 text-blue-600 ml-2" />
                      )}
                    </label>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading || selectedCount === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sharing...
              </>
            ) : (
              <>
                <ShareIcon className="h-4 w-4" />
                Share with {selectedCount} item{selectedCount !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PGNShareModal;
