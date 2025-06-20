import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';

const ChessStudies = () => {
  const { user } = useAuth();
  const [studies, setStudies] = useState([]);
  const [sharedStudies, setSharedStudies] = useState([]);
  const [activeStudy, setActiveStudy] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [isSaving, setIsSaving] = useState(false);
  const [shareMode, setShareMode] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    category: 'opening',
    isPublic: false,
    position: 'start'
  });

  // Fetch studies when component mounts
  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch your studies
      const myStudiesResponse = await ApiService.getChessStudies();
      if (myStudiesResponse && myStudiesResponse.studies) {
        setStudies(myStudiesResponse.studies);
      }
      
      // Fetch studies shared with you
      const sharedStudiesResponse = await ApiService.getSharedChessStudies();
      if (sharedStudiesResponse && sharedStudiesResponse.studies) {
        setSharedStudies(sharedStudiesResponse.studies);
      }
    } catch (err) {
      console.error('Error fetching studies:', err);
      setError('Failed to load studies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter studies based on search and category filter
  const filteredStudies = studies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         study.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || study.category === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  const filteredSharedStudies = sharedStudies.filter(study => {
    const matchesSearch = study.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         study.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || study.category === filter;
    
    return matchesSearch && matchesFilter;
  });

  // Handle creating a new study
  const handleCreateStudy = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const response = await ApiService.createChessStudy(newStudy);
      
      // Add the new study to the list
      if (response && response.study) {
        setStudies([response.study, ...studies]);
        setIsCreating(false);
        setNewStudy({
          title: '',
          description: '',
          category: 'opening',
          isPublic: false,
          position: 'start'
        });
      }
    } catch (err) {
      setError('Failed to create study: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle opening a study
  const handleOpenStudy = async (study) => {
    try {
      setLoading(true);
      const response = await ApiService.getStudyDetails(study.id);
      
      if (response && response.study) {
        setActiveStudy(response.study);
      } else {
        throw new Error('Study not found');
      }
    } catch (err) {
      setError('Failed to open study: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving changes to a study
  const handleSaveStudy = async (updatedPosition) => {
    if (!activeStudy) return;
    
    try {
      setIsSaving(true);
      const updatedStudy = {
        ...activeStudy,
        position: updatedPosition
      };
      
      await ApiService.updateChessStudy(activeStudy.id, updatedStudy);
      
      // Update the study in the list
      setStudies(studies.map(study => 
        study.id === activeStudy.id ? updatedStudy : study
      ));
      
      setActiveStudy(updatedStudy);
    } catch (err) {
      setError('Failed to save study: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle sharing a study
  const handleShareStudy = async () => {
    if (!activeStudy || selectedUsers.length === 0) return;
    
    try {
      setIsSaving(true);
      await ApiService.shareChessStudy(activeStudy.id, selectedUsers);
      setShareMode(false);
      setSelectedUsers([]);
    } catch (err) {
      setError('Failed to share study: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };
  // Load available users for sharing
  const loadUsersForSharing = async () => {
    try {
      // Get users that can be shared with
      const response = await ApiService.getShareableUsers();
      setAvailableUsers(response.users || []);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    }
  };

  // Toggle user selection for sharing
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  // Render create study form
  const renderCreateForm = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-purple-900 mb-4">Create New Study</h2>
          <form onSubmit={handleCreateStudy}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input 
                type="text" 
                id="title" 
                value={newStudy.title}
                onChange={(e) => setNewStudy({...newStudy, title: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                id="description" 
                value={newStudy.description}
                onChange={(e) => setNewStudy({...newStudy, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                id="category" 
                value={newStudy.category}
                onChange={(e) => setNewStudy({...newStudy, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="opening">Opening</option>
                <option value="middlegame">Middlegame</option>
                <option value="endgame">Endgame</option>
                <option value="tactics">Tactics</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newStudy.isPublic}
                  onChange={(e) => setNewStudy({...newStudy, isPublic: e.target.checked})}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-gray-700">Make this study public</span>
              </label>
            </div>
            
            <div className="flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)} 
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors disabled:opacity-50"
                disabled={isSaving}
              >
                {isSaving ? 'Creating...' : 'Create Study'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
  // Render share dialog
  const renderShareDialog = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h2 className="text-xl font-bold text-purple-900 mb-4">Share Study</h2>
          <p className="text-gray-600 mb-4">Select users to share "{activeStudy.title}" with:</p>
          
          <div className="max-h-64 overflow-y-auto mb-6">
            {availableUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No users available for sharing.</p>
            ) : (
              availableUsers.map(user => (
                <div key={user.id} className="flex items-center py-2 border-b border-gray-100 last:border-b-0">
                  <label className="flex items-center gap-2 cursor-pointer w-full">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{user.name} ({user.role})</span>
                  </label>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setShareMode(false)} 
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleShareStudy} 
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors disabled:opacity-50"
              disabled={isSaving || selectedUsers.length === 0}
            >
              {isSaving ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  // Render study detail view
  const renderStudyDetail = () => {
    if (!activeStudy) return null;
    
    return (
      <div className="max-w-6xl mx-auto px-5 pb-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-purple-900 mb-2">{activeStudy.title}</h2>
            <div className="text-sm text-gray-600 space-x-4 mb-3">
              {activeStudy.owner.id !== user.id && <span>by {activeStudy.owner.name}</span>}
              <span>Created: {formatDate(activeStudy.created_at)}</span>
              <span>Last updated: {formatDate(activeStudy.updated_at)}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                activeStudy.is_public 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {activeStudy.is_public ? 'Public' : 'Private'}
              </span>
            </div>
            <p className="text-gray-700">{activeStudy.description}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActiveStudy(null)} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">
              Back to Studies
            </button>
            {activeStudy.owner.id === user.id && (
              <button 
                onClick={() => {
                  loadUsersForSharing();
                  setShareMode(true);
                }} 
                className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition-colors"
              >
                Share Study
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <ChessBoard 
            position={activeStudy.position}
            allowMoves={true}
            showHistory={true}
            showAnalysis={true}
            onMove={(move, fen) => handleSaveStudy(fen)}
            width={600}
          />
        </div>
          
        {isSaving && (
          <div className="text-center mt-4 text-purple-700 font-medium">
            Saving changes...
          </div>
        )}
      </div>
    );
  };

  // If viewing a study, show that view
  if (activeStudy) return (
    <>
      {renderStudyDetail()}
      {shareMode && renderShareDialog()}
    </>
  );
    // Main studies listing view
  return (
    <div className="max-w-6xl mx-auto px-5 pb-10">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-purple-900 m-0">Chess Studies</h1>
        <button onClick={() => setIsCreating(true)} className="bg-purple-700 text-white px-4 py-2 border-none rounded cursor-pointer text-base transition-colors hover:bg-purple-800">
          Create New Study
        </button>
      </header>
        <ChessNavigation />
      
      <div className="bg-purple-50 p-4 rounded-lg mb-6">
        <p className="text-purple-700 m-0">Create and analyze chess positions, store your opening repertoire, or study endgame principles.</p>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex-1 min-w-48">
          <input
            type="text"
            placeholder="Search studies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-base"
          />
        </div>
        
        <div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-base bg-white min-w-36"
          >
            <option value="all">All Categories</option>
            <option value="opening">Openings</option>
            <option value="middlegame">Middlegame</option>
            <option value="endgame">Endgame</option>
            <option value="tactics">Tactics</option>
            <option value="strategy">Strategy</option>
          </select>
        </div>
      </div>
        {loading ? (
        <div className="text-center py-8 text-purple-700 font-bold">Loading studies...</div>
      ) : error ? (
        <div className="text-center py-8 text-red-600 font-bold bg-red-50 rounded-lg p-4">{error}</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-bold text-purple-900 border-b-2 border-purple-50 pb-2 mb-4">Your Studies</h2>
            {filteredStudies.length === 0 ? (
              <div className="bg-purple-50 p-8 rounded-lg text-center">
                <p className="text-gray-700 mb-4">You haven't created any studies yet.</p>
                <button onClick={() => setIsCreating(true)} className="bg-purple-700 text-white px-4 py-2 border-none rounded cursor-pointer text-base hover:bg-purple-800 transition-colors">
                  Create your first study
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredStudies.map(study => (
                  <div key={study.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl" onClick={() => handleOpenStudy(study)}>
                    <div className="h-36 bg-purple-50 flex items-center justify-center border-b border-gray-200">
                      <div className="w-30 h-30 bg-gray-200 bg-contain bg-center bg-no-repeat border border-gray-300" 
                        style={{ 
                          backgroundImage: study.preview_url 
                            ? `url(${study.preview_url})` 
                            : `url(/img/mini-boards/${study.category}.png)` 
                        }}
                      ></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-purple-700 mb-2">{study.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        display: '-webkit-box'
                      }}>{study.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-medium capitalize">{study.category}</span>
                        <span className="text-gray-500">{formatDate(study.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {filteredSharedStudies.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-purple-900 border-b-2 border-purple-50 pb-2 mb-4">Shared With You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredSharedStudies.map(study => (
                  <div key={study.id} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 hover:shadow-xl" onClick={() => handleOpenStudy(study)}>
                    <div className="h-36 bg-purple-50 flex items-center justify-center border-b border-gray-200">
                      <div className="w-30 h-30 bg-gray-200 bg-contain bg-center bg-no-repeat border border-gray-300" 
                        style={{ 
                          backgroundImage: study.preview_url 
                            ? `url(${study.preview_url})` 
                            : `url(/img/mini-boards/${study.category}.png)` 
                        }}
                      ></div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-purple-700 mb-2">{study.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        display: '-webkit-box'
                      }}>{study.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">By {study.owner.name}</span>
                        <span className="text-gray-500">{formatDate(study.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      
      {isCreating && renderCreateForm()}
    </div>
  );
};

export default ChessStudies;
