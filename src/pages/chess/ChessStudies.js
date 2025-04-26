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

  useEffect(() => {
    fetchStudies();
  }, []);

  const fetchStudies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const myStudiesResponse = await ApiService.getChessStudies();
      if (myStudiesResponse && myStudiesResponse.studies) {
        setStudies(myStudiesResponse.studies);
      }
      
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

  const handleCreateStudy = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const response = await ApiService.createChessStudy(newStudy);
      
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

  const handleSaveStudy = async (updatedPosition) => {
    if (!activeStudy) return;
    
    try {
      setIsSaving(true);
      const updatedStudy = {
        ...activeStudy,
        position: updatedPosition
      };
      
      await ApiService.updateChessStudy(activeStudy.id, updatedStudy);
      
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

  const loadUsersForSharing = async () => {
    try {
      const response = await ApiService.get('/users/get-shareable-users.php');
      setAvailableUsers(response.users || []);
    } catch (err) {
      setError('Failed to load users: ' + err.message);
    }
  };

  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const renderCreateForm = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Create New Study</h2>
          <form onSubmit={handleCreateStudy}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Title</label>
              <input 
                type="text" 
                id="title" 
                value={newStudy.title}
                onChange={(e) => setNewStudy({...newStudy, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea 
                id="description" 
                value={newStudy.description}
                onChange={(e) => setNewStudy({...newStudy, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="category" className="block text-gray-700 font-medium mb-2">Category</label>
              <select 
                id="category" 
                value={newStudy.category}
                onChange={(e) => setNewStudy({...newStudy, category: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="opening">Opening</option>
                <option value="middlegame">Middlegame</option>
                <option value="endgame">Endgame</option>
                <option value="tactics">Tactics</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            
            <div className="mb-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={newStudy.isPublic}
                  onChange={(e) => setNewStudy({...newStudy, isPublic: e.target.checked})}
                  className="text-indigo-600 rounded"
                />
                <span className="text-gray-700">Make this study public</span>
              </label>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
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

  const renderShareDialog = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xl">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Share Study</h2>
          <p className="mb-4">Select users to share "{activeStudy.title}" with:</p>
          
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-2 mb-6">
            {availableUsers.length === 0 ? (
              <p className="text-gray-500 p-2">No users available for sharing.</p>
            ) : (
              availableUsers.map(user => (
                <div key={user.id} className="p-2 hover:bg-gray-50">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="text-indigo-600 rounded"
                    />
                    <span>{user.name} <span className="text-sm text-gray-500">({user.role})</span></span>
                  </label>
                </div>
              ))
            )}
          </div>
          
          <div className="flex justify-end space-x-4">
            <button 
              type="button" 
              onClick={() => setShareMode(false)} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleShareStudy} 
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isSaving || selectedUsers.length === 0}
            >
              {isSaving ? 'Sharing...' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderStudyDetail = () => {
    if (!activeStudy) return null;
    
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">{activeStudy.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {activeStudy.owner.id !== user.id && <span>by {activeStudy.owner.name}</span>}
              <span>Created: {formatDate(activeStudy.created_at)}</span>
              <span>Last updated: {formatDate(activeStudy.updated_at)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                activeStudy.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {activeStudy.is_public ? 'Public' : 'Private'}
              </span>
            </div>
            <p className="mt-2 text-gray-700">{activeStudy.description}</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setActiveStudy(null)} 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Back to Studies
            </button>
            {activeStudy.owner.id === user.id && (
              <button 
                onClick={() => {
                  loadUsersForSharing();
                  setShareMode(true);
                }} 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Share Study
              </button>
            )}
          </div>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-3xl bg-white p-4 rounded-lg shadow-md">
            <ChessBoard 
              position={activeStudy.position}
              allowMoves={true}
              showHistory={true}
              showAnalysis={true}
              onMove={(move, fen) => handleSaveStudy(fen)}
              width={600}
            />
            
            {isSaving && (
              <div className="text-center mt-4 text-indigo-700">
                Saving changes...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (activeStudy) return (
    <>
      {renderStudyDetail()}
      {shareMode && renderShareDialog()}
    </>
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-indigo-900">Chess Studies</h1>
        <button 
          onClick={() => setIsCreating(true)} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Create New Study
        </button>
      </header>
      
      <ChessNavigation />
      
      <div className="bg-indigo-50 p-4 rounded-lg mb-6">
        <p className="text-indigo-800">Create and analyze chess positions, store your opening repertoire, or study endgame principles.</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-2/3">
          <input
            type="text"
            placeholder="Search studies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="w-full md:w-1/3">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="flex justify-center items-center h-64 text-indigo-700">Loading studies...</div>
      ) : error ? (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-indigo-900 pb-2 border-b border-indigo-100 mb-4">Your Studies</h2>
            {filteredStudies.length === 0 ? (
              <div className="bg-indigo-50 rounded-lg p-8 text-center">
                <p className="text-indigo-800 mb-4">You haven't created any studies yet.</p>
                <button 
                  onClick={() => setIsCreating(true)} 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create your first study
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudies.map(study => (
                  <div key={study.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
                    onClick={() => handleOpenStudy(study)}>
                    <div className="h-36 bg-indigo-50 flex items-center justify-center">
                      <div className="w-28 h-28 bg-center bg-no-repeat bg-contain border border-gray-300" 
                        style={{ 
                          backgroundImage: study.preview_url 
                            ? `url(${study.preview_url})` 
                            : `url(/img/mini-boards/${study.category}.png)` 
                        }}></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-indigo-800 mb-2">{study.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{study.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full capitalize">{study.category}</span>
                        <span>{formatDate(study.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {filteredSharedStudies.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-indigo-900 pb-2 border-b border-indigo-100 mb-4">Shared With You</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSharedStudies.map(study => (
                  <div key={study.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer" 
                    onClick={() => handleOpenStudy(study)}>
                    <div className="h-36 bg-indigo-50 flex items-center justify-center">
                      <div className="w-28 h-28 bg-center bg-no-repeat bg-contain border border-gray-300" 
                        style={{ 
                          backgroundImage: study.preview_url 
                            ? `url(${study.preview_url})` 
                            : `url(/img/mini-boards/${study.category}.png)` 
                        }}></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-indigo-800 mb-2">{study.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{study.description}</p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>By {study.owner.name}</span>
                        <span>{formatDate(study.updated_at)}</span>
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
