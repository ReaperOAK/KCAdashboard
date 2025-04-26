import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import SimulBoard from '../../components/chess/SimulBoard';
import ChessNavigation from '../../components/chess/ChessNavigation';
import ApiService from '../../utils/api';

const SimulGames = () => {
  const { user } = useAuth();
  const [simuls, setSimuls] = useState([]);
  const [activeSimul, setActiveSimul] = useState(null);
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    maxPlayers: 5,
    timeControl: '30+0'
  });
  const [isJoining, setIsJoining] = useState(false);

  const loadSimuls = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getSimulGames();
      if (response.success) {
        setSimuls(response.simuls || []);
      } else {
        setError('Failed to load simultaneous games');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while loading simuls');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshActiveSimul = useCallback(async () => {
    if (!activeSimul) return;
    try {
      const response = await ApiService.getSimulGames();
      if (response.success) {
        setSimuls(response.simuls || []);
        const updatedSimul = response.simuls.find(s => s.id === activeSimul.id);
        if (updatedSimul) {
          setActiveSimul(updatedSimul);
          if (
            activeBoardId &&
            updatedSimul.boards &&
            !updatedSimul.boards.find(b => b.id === activeBoardId)
          ) {
            setActiveBoardId(updatedSimul.boards.length > 0 ? updatedSimul.boards[0].id : null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh simul:', error);
    }
  }, [activeSimul, activeBoardId]);

  useEffect(() => {
    loadSimuls();
    const interval = setInterval(() => {
      if (activeSimul) {
        refreshActiveSimul();
      } else {
        loadSimuls();
      }
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [activeSimul, refreshActiveSimul, loadSimuls]);

  const handleCreateSimul = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await ApiService.createSimulGame(createForm);
      if (response.success) {
        setSimuls([response.simul, ...simuls]);
        setIsCreating(false);
        setCreateForm({
          title: '',
          description: '',
          maxPlayers: 5,
          timeControl: '30+0'
        });
      } else {
        setError('Failed to create simul game');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSimul = simul => {
    setActiveSimul(simul);
    setActiveBoardId(simul.boards && simul.boards.length > 0 ? simul.boards[0].id : null);
  };

  const handleJoinSimul = async simulId => {
    try {
      setLoading(true);
      setIsJoining(true);
      const response = await ApiService.joinSimulGame(simulId);
      if (response.success) {
        const joinedSimul = simuls.find(s => s.id === simulId);
        if (joinedSimul) {
          handleSelectSimul(response.simul || joinedSimul);
        }
      } else {
        setError('Failed to join simul');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
      setIsJoining(false);
    }
  };

  const handleStartSimul = async simulId => {
    try {
      setLoading(true);
      const response = await ApiService.post('/chess/start-simul.php', { simul_id: simulId });
      if (response.success) {
        await refreshActiveSimul();
      } else {
        setError('Failed to start simul');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSimul = async simulId => {
    try {
      setLoading(true);
      const response = await ApiService.post('/chess/end-simul.php', { simul_id: simulId });
      if (response.success) {
        await refreshActiveSimul();
      } else {
        setError('Failed to end simul');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (boardId, move, position) => {
    if (!activeSimul || !boardId) return;
    try {
      await ApiService.makeSimulMove(activeSimul.id, boardId, move, position);
      await refreshActiveSimul();
    } catch (error) {
      console.error('Move error:', error);
      setError('Failed to make move: ' + error.message);
    }
  };

  if (loading && !activeSimul && simuls.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-4">Simultaneous Exhibitions</h1>
        <ChessNavigation />
        <div className="flex justify-center items-center h-64 text-indigo-700">Loading simul games...</div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-4">Create Simultaneous Exhibition</h1>
        <ChessNavigation />
        <div className="flex justify-center">
          <form onSubmit={handleCreateSimul} className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Title</label>
              <input
                type="text"
                value={createForm.title}
                onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                placeholder="e.g., Saturday Simul with Coach Adam"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                value={createForm.description}
                onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Add details about this simul exhibition"
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Max Players</label>
              <input
                type="number"
                min="1"
                max="20"
                value={createForm.maxPlayers}
                onChange={e => setCreateForm({ ...createForm, maxPlayers: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Time Control</label>
              <select
                value={createForm.timeControl}
                onChange={e => setCreateForm({ ...createForm, timeControl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="30+0">30 minutes</option>
                <option value="15+10">15 minutes + 10 seconds</option>
                <option value="10+5">10 minutes + 5 seconds</option>
                <option value="5+3">5 minutes + 3 seconds</option>
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-800"
              >
                Create Simul
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (activeSimul) {
    const isHost = activeSimul.host.id === user.id;
    const boards = activeSimul.boards || [];
    const activeBoard = boards.find(b => b.id === activeBoardId);

    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-indigo-900 mb-2">
          {activeSimul.title || `Simul by ${activeSimul.host.name}`}
        </h1>
        {activeSimul.description && (
          <p className="bg-indigo-50 p-4 rounded-md mb-6 text-indigo-700">{activeSimul.description}</p>
        )}
        <ChessNavigation />
        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="mb-1">
              <strong>Host:</strong> {activeSimul.host.name}
            </p>
            <p className="mb-1">
              <strong>Status:</strong> {activeSimul.status}
            </p>
            <p className="mb-1">
              <strong>Time Control:</strong> {activeSimul.time_control}
            </p>
            <p className="mb-1">
              <strong>Players:</strong> {boards.length}/{activeSimul.max_players}
            </p>
            <div className="mt-4 space-x-3">
              <button
                onClick={() => setActiveSimul(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Back to Simuls
              </button>
              {isHost && activeSimul.status === 'pending' && boards.length > 0 && (
                <button
                  onClick={() => handleStartSimul(activeSimul.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Start Simul
                </button>
              )}
              {isHost && activeSimul.status === 'active' && (
                <button
                  onClick={() => handleEndSimul(activeSimul.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  End Simul
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
            {boards.length > 0 ? (
              <>
                <div className="w-full md:w-1/4 flex md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-2 max-h-[500px]">
                  {boards.map(board => {
                    const isHostTurn = board.turn === 'w';
                    const hasResult = board.result !== null;

                    return (
                      <div
                        key={board.id}
                        className={`p-3 rounded-md cursor-pointer flex-shrink-0 w-[150px] md:w-auto
                          ${board.id === activeBoardId ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'} 
                          ${hasResult ? 'opacity-75' : ''} 
                          ${isHostTurn && !hasResult ? 'border-l-4 border-indigo-500' : ''}
                          ${!isHostTurn && !hasResult ? 'border-l-4 border-green-500' : ''}`}
                        onClick={() => setActiveBoardId(board.id)}
                      >
                        <div>
                          <div className="font-medium truncate">{board.player_name}</div>
                          {hasResult && (
                            <div className="text-sm mt-1">
                              {board.result === '1-0'
                                ? 'Host won'
                                : board.result === '0-1'
                                ? 'Player won'
                                : 'Draw'}
                            </div>
                          )}
                          {!hasResult && (
                            <div className="text-sm mt-1">
                              {isHostTurn ? 'Host to move' : 'Player to move'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="w-full md:w-3/4 bg-white p-4 rounded-md shadow-md">
                  {activeBoard ? (
                    <SimulBoard
                      id={activeBoard.id}
                      position={activeBoard.position}
                      orientation={isHost ? 'white' : 'black'}
                      allowMoves={
                        activeSimul.status === 'active' &&
                        ((isHost && activeBoard.turn === 'w') ||
                          (!isHost && activeBoard.turn === 'b' && activeBoard.player_id === user.id))
                      }
                      onMove={handleMove}
                      opponentName={isHost ? activeBoard.player_name : activeSimul.host.name}
                      width={600}
                      isActive={true}
                      result={activeBoard.result}
                    />
                  ) : (
                    <div className="flex justify-center items-center h-64 text-gray-500">
                      <p>Select a board to view</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full bg-white p-8 rounded-md shadow-md text-center">
                <p className="text-gray-700 mb-4">No players have joined this simul yet.</p>
                {activeSimul.status === 'pending' && !isHost && (
                  <button
                    onClick={() => handleJoinSimul(activeSimul.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                    disabled={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Join This Simul'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">Simultaneous Exhibitions</h1>
      <ChessNavigation />
      {(user.role === 'teacher' || user.role === 'admin') && (
        <div className="mt-6 mb-6">
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Create Simul
          </button>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">{error}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {simuls.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500">
            <p>No simultaneous exhibitions available.</p>
          </div>
        ) : (
          simuls.map(simul => (
            <div
              key={simul.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg text-indigo-800 mb-1">
                  {simul.title || `Simul by ${simul.host.name}`}
                </h3>
                <p className="text-sm text-gray-600 mb-2">Host: {simul.host.name}</p>
                {simul.description && (
                  <p className="text-gray-700 mb-4 text-sm">{simul.description}</p>
                )}
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      simul.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : simul.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {simul.status}
                  </span>
                  <span className="text-xs text-gray-600">
                    {simul.player_count || 0}/{simul.max_players} players
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end space-x-2">
                <button
                  onClick={() => handleSelectSimul(simul)}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                >
                  View
                </button>
                {simul.status === 'pending' && simul.host.id !== user.id && (
                  <button
                    onClick={() => handleJoinSimul(simul.id)}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-green-300"
                    disabled={isJoining}
                  >
                    {isJoining ? 'Joining...' : 'Join'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SimulGames;
