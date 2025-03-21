import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LichessPgnViewer from '../components/LichessPgnViewer';
import ApiService from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import '../styles/chess-viewer-overrides.css';

const PGNViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pgn, setPgn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPGN = async () => {
      try {
        // First try to get from sessionStorage (if opened from the PGN Database)
        const storedPGN = sessionStorage.getItem('viewPGN');
        if (storedPGN) {
          const parsedPGN = JSON.parse(storedPGN);
          if (parsedPGN.id.toString() === id.toString()) {
            setPgn(parsedPGN);
            setLoading(false);
            return;
          }
        }
        
        // Otherwise fetch from API
        const response = await ApiService.getPGNById(id);
        if (response.success) {
          setPgn(response.pgn);
        } else {
          throw new Error(response.message || 'Failed to load PGN');
        }
      } catch (error) {
        console.error('Error fetching PGN:', error);
        setError(error.message || 'Failed to load PGN');
      } finally {
        setLoading(false);
      }
    };

    fetchPGN();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] pt-20 flex justify-center">
        <div className="text-[#200e4a] text-xl">Loading PGN viewer...</div>
      </div>
    );
  }

  if (error || !pgn) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] pt-20 p-6 flex flex-col items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl w-full mb-4">
          {error || 'PGN not found'}
        </div>
        <button
          onClick={handleBack}
          className="bg-[#461fa3] text-white px-4 py-2 rounded-md hover:bg-[#7646eb]"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1f9] pt-16 sm:pt-20 px-2 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <div className="mb-3 sm:mb-0">
            <h1 className="text-xl sm:text-3xl font-bold text-[#200e4a]">{pgn.title}</h1>
            {pgn.description && (
              <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">{pgn.description}</p>
            )}
          </div>
          <button
            onClick={handleBack}
            className="bg-gray-100 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-gray-200 text-sm sm:text-base"
          >
            Back
          </button>
        </div>

        {/* Adaptive height based on screen size */}
        <div className="h-[50vh] sm:h-[65vh] border border-gray-200 rounded-lg">
          <LichessPgnViewer
            pgn={pgn.pgn_content}
            containerClassName="chess-viewer-container"
            options={{
              showPlayers: 'auto',
              showClocks: true,
              showMoves: 'auto',
              showControls: true,
              scrollToMove: true,
              keyboardToMove: true,
              boardTheme: 'blue',
              pieceSet: 'cburnett',
              showCoords: true,
              drawArrows: true,
              viewOnly: true,
              resizable: true,
              chessground: {
                animation: { duration: 250 },
                highlight: { lastMove: true, check: true },
                movable: { free: false },
                responsive: true,
              },
              menu: {
                getPgn: { enabled: true },
                practiceWithComputer: { enabled: true },
                analysisBoard: { enabled: true },
              }
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 sm:mt-6">
          <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-0">
            <p><span className="font-semibold">Category:</span> {pgn.category}</p>
            <p><span className="font-semibold">Created:</span> {new Date(pgn.created_at).toLocaleDateString()}</p>
            {pgn.shared_by && (
              <p><span className="font-semibold">Shared by:</span> {pgn.shared_by}</p>
            )}
            <p><span className="font-semibold">Viewing as:</span> {user?.full_name || user?.email}</p>
          </div>
          <div className="self-end sm:self-auto">
            <a 
              href={`data:text/plain;charset=utf-8,${encodeURIComponent(pgn.pgn_content)}`}
              download={`${pgn.title}.pgn`}
              className="px-3 py-1 sm:px-4 sm:py-2 bg-[#461fa3] text-white text-sm sm:text-base rounded hover:bg-[#7646eb]"
            >
              Download PGN
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGNViewer;