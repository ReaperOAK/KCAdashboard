import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import ChessBoard from '../../components/chess/ChessBoard';
import './ChessStudies.css';

const ChessStudies = () => {
  const { user } = useAuth();
  const [studies, setStudies] = useState([]);
  const [sharedStudies, setSharedStudies] = useState([]);
  const [activeStudy, setActiveStudy] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  const [newStudy, setNewStudy] = useState({
    title: '',
    description: '',
    category: 'opening',
    isPublic: false,
    position: 'start'
  });

  // Fetch studies when component mounts
  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        
        // Mock data for now
        const mockStudies = [
          {
            id: 1,
            title: 'Sicilian Defense Main Line',
            description: 'Analysis of the main line of the Sicilian Defense',
            category: 'opening',
            position: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
            owner: {
              id: user.id,
              name: user.full_name
            },
            created_at: '2023-09-15T14:30:00Z',
            updated_at: '2023-09-20T10:15:00Z',
            is_public: true
          },
          {
            id: 2,
            title: 'Queen\'s Gambit Accepted',
            description: 'Study of accepting the Queen\'s Gambit',
            category: 'opening',
            position: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2',
            owner: {
              id: user.id,
              name: user.full_name
            },
            created_at: '2023-10-05T09:20:00Z',
            updated_at: '2023-10-05T09:20:00Z',
            is_public: false
          },
          {
            id: 3,
            title: 'Rook Endgame Principles',
            description: 'Common principles in rook endgames',
            category: 'endgame',
            position: '8/8/8/8/8/4k3/4p3/4K2R w K - 0 1',
            owner: {
              id: user.id,
              name: user.full_name
            },
            created_at: '2023-10-12T16:45:00Z',
            updated_at: '2023-10-14T11:30:00Z',
            is_public: true
          }
        ];
        
        const mockSharedStudies = [
          {
            id: 4,
            title: 'Knight vs Bishop Endgame',
            description: 'Analysis of knight versus bishop endgames',
            category: 'endgame',
            position: '8/8/8/2k5/8/2N5/8/2K5 w - - 0 1',
            owner: {
              id: 201,
              name: 'Coach Michael'
            },
            created_at: '2023-09-30T08:15:00Z',
            updated_at: '2023-10-01T14:20:00Z',
            is_public: false,
            shared_by: 'Coach Michael'
          }
        ];
        
        setStudies(mockStudies);
        setSharedStudies(mockSharedStudies);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching studies:', error);
        setLoading(false);
      }
    };
    
    fetchStudies();
  }, [user.id, user.full_name]);

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
  const handleCreateStudy = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call
    const newStudyWithId = {
      ...newStudy,
      id: Date.now(), // Use timestamp as temporary ID
      owner: {
        id: user.id,
        name: user.full_name
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setStudies([newStudyWithId, ...studies]);
    setIsCreating(false);
    setNewStudy({
      title: '',
      description: '',
      category: 'opening',
      isPublic: false,
      position: 'start'
    });
  };

  // Handle opening a study
  const handleOpenStudy = (study) => {
    setActiveStudy(study);
  };

  // Handle saving changes to a study
  const handleSaveStudy = (updatedPosition) => {
    if (!activeStudy) return;
    
    const updatedStudy = {
      ...activeStudy,
      position: updatedPosition,
      updated_at: new Date().toISOString()
    };
    
    // Update the study in the list
    setStudies(studies.map(study => 
      study.id === activeStudy.id ? updatedStudy : study
    ));
    
    setActiveStudy(updatedStudy);
    
    // In a real app, this would include an API call to save changes
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
              <button type="button" onClick={() => setIsCreating(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="create-btn">
                Create Study
              </button>
            </div>
          </form>
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
          <button onClick={() => setActiveStudy(null)} className="close-btn">
            &times;
          </button>
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
        </div>
      </div>
    );
  };

  // If viewing a study, show that view
  if (activeStudy) return renderStudyDetail();
  
  // Main studies listing view
  return (
    <div className="chess-studies-container">
      <header className="studies-header">
        <h1>Chess Studies</h1>
        <button onClick={() => setIsCreating(true)} className="create-study-btn">
          Create New Study
        </button>
      </header>
      
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
                      <div className="mini-board" style={{ backgroundImage: `url(/img/mini-boards/${study.category}.png)` }}></div>
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
                      <div className="mini-board" style={{ backgroundImage: `url(/img/mini-boards/${study.category}.png)` }}></div>
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
