import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ChessBoard from '../../components/chess/ChessBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';
import './ChessStudies.css';

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
      // In a real app, this would call an API to get users you can share with
      const response = await ApiService.get('/users/get-shareable-users.php');
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
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Create New Study</h2>
          <form onSubmit={handleCreateStudy}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input 
                type="text" 
                id="title" 
                value={newStudy.title}
                onChange={(e) => setNewStudy({...newStudy, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description" 
                value={newStudy.description}
                onChange={(e) => setNewStudy({...newStudy, description: e.target.value})}
                rows="3"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select 
                id="category" 
                value={newStudy.category}
                onChange={(e) => setNewStudy({...newStudy, category: e.target.value})}
              >
                <option value="opening">Opening</option>
                <option value="middlegame">Middlegame</option>
                <option value="endgame">Endgame</option>
                <option value="tactics">Tactics</option>
                <option value="strategy">Strategy</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={newStudy.isPublic}
                  onChange={(e) => setNewStudy({...newStudy, isPublic: e.target.checked})}
                />
                Make this study public
              </label>
            </div>
            
            <div className="modal-actions">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)} 
                className="cancel-btn"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="create-btn"
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
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Share Study</h2>
          <p>Select users to share "{activeStudy.title}" with:</p>
          
          <div className="user-list">
            {availableUsers.length === 0 ? (
              <p>No users available for sharing.</p>
            ) : (
              availableUsers.map(user => (
                <div key={user.id} className="user-item">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                    {user.name} ({user.role})
                  </label>
                </div>
              ))
            )}
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              onClick={() => setShareMode(false)} 
              className="cancel-btn"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="button" 
              onClick={handleShareStudy} 
              className="share-btn"
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
      <div className="study-detail-container">
        <div className="study-header">
          <div>
            <h2>{activeStudy.title}</h2>
            <p className="study-meta">
              {activeStudy.owner.id !== user.id && <span>by {activeStudy.owner.name}</span>}
              <span>Created: {formatDate(activeStudy.created_at)}</span>
              <span>Last updated: {formatDate(activeStudy.updated_at)}</span>
              <span className={`study-visibility ${activeStudy.is_public ? 'public' : 'private'}`}>
                {activeStudy.is_public ? 'Public' : 'Private'}
              </span>
            </p>
            <p className="study-description">{activeStudy.description}</p>
          </div>
          <div className="study-actions">
            <button onClick={() => setActiveStudy(null)} className="close-btn">
              Back to Studies
            </button>
            {activeStudy.owner.id === user.id && (
              <button 
                onClick={() => {
                  loadUsersForSharing();
                  setShareMode(true);
                }} 
                className="share-btn"
              >
                Share Study
              </button>
            )}
          </div>
        </div>
        
        <div className="study-board-container">
          <ChessBoard 
            position={activeStudy.position}
            allowMoves={true}
            showHistory={true}
            showAnalysis={true}
            onMove={(move, fen) => handleSaveStudy(fen)}
            width={600}
          />
          
          {isSaving && (
            <div className="saving-indicator">
              Saving changes...
            </div>
          )}
        </div>
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
    <div className="chess-studies-container">
      <header className="studies-header">
        <h1>Chess Studies</h1>
        <button onClick={() => setIsCreating(true)} className="create-study-btn">
          Create New Study
        </button>
      </header>
      
      <ChessNavigation />
      
      <div className="studies-description">
        <p>Create and analyze chess positions, store your opening repertoire, or study endgame principles.</p>
      </div>
      
      <div className="studies-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search studies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
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
        <div className="loading">Loading studies...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <section className="studies-section">
            <h2>Your Studies</h2>
            {filteredStudies.length === 0 ? (
              <div className="no-studies">
                <p>You haven't created any studies yet.</p>
                <button onClick={() => setIsCreating(true)} className="create-first-study-btn">
                  Create your first study
                </button>
              </div>
            ) : (
              <div className="studies-grid">
                {filteredStudies.map(study => (
                  <div key={study.id} className="study-card" onClick={() => handleOpenStudy(study)}>
                    <div className="study-card-preview">
                      <div className="mini-board" 
                        style={{ 
                          backgroundImage: study.preview_url 
                            ? `url(${study.preview_url})` 
                            : `url(/img/mini-boards/${study.category}.png)` 
                        }}
                      ></div>
                    </div>
                    <div className="study-card-content">
                      <h3>{study.title}</h3>
                      <p className="study-card-description">{study.description}</p>
                      <div className="study-card-footer">
                        <span className="study-category">{study.category}</span>
                        <span className="study-date">{formatDate(study.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          
          {filteredSharedStudies.length > 0 && (
            <section className="studies-section">
              <h2>Shared With You</h2>
              <div className="studies-grid">
                {filteredSharedStudies.map(study => (
                  <div key={study.id} className="study-card" onClick={() => handleOpenStudy(study)}>
                    <div className="study-card-preview">
                      <div className="mini-board" 
                        style={{ 
                          backgroundImage: study.preview_url 
                            ? `url(${study.preview_url})` 
                            : `url(/img/mini-boards/${study.category}.png)` 
                        }}
                      ></div>
                    </div>
                    <div className="study-card-content">
                      <h3>{study.title}</h3>
                      <p className="study-card-description">{study.description}</p>
                      <div className="study-card-footer">
                        <span className="study-owner">By {study.owner.name}</span>
                        <span className="study-date">{formatDate(study.updated_at)}</span>
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
