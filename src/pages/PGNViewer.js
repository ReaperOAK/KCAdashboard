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
      <div className="min-h-screen bg-[#f3f1f9] pt-20 flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-12 w-12 bg-[#461fa3] rounded-full mb-4"></div>
            <div className="text-[#200e4a] text-xl font-semibold">Loading PGN viewer...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !pgn) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] pt-20 p-6 flex flex-col items-center">
        <div className="bg-red-100 border-l-4 border-[#af0505] text-[#af0505] p-4 rounded max-w-2xl w-full mb-4">
          <p className="font-bold">Error</p>
          <p>{error || 'PGN not found'}</p>
        </div>
        <button
          onClick={handleBack}
          className="bg-[#461fa3] text-white px-4 py-2 rounded-md hover:bg-[#7646eb] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f1f9] pt-16 sm:pt-20 px-2 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#200e4a] text-white p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">{pgn.title}</h1>
              {pgn.description && (
                <p className="text-sm sm:text-base text-[#e3e1f7] mt-1 sm:mt-2">{pgn.description}</p>
              )}
            </div>
            <button
              onClick={handleBack}
              className="mt-4 sm:mt-0 bg-[#461fa3] text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-[#7646eb] transition-colors text-sm sm:text-base flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414l4-4a1 1 0 0 1 1.414 1.414L7.414 9H15a1 1 0 1 1 0 2H7.414l2.293 2.293a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>
        </div>

        {/* Responsive height container - shorter on mobile, taller on larger screens */}
        <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] border-t border-[#c2c1d3]">
          <LichessPgnViewer
            pgn={pgn.pgn_content}
            containerClassName="chess-viewer-container"
            options={{
              showPlayers: 'auto',
              showClocks: true,
              showMoves: 'right', // Force right side layout
              showControls: true,
              scrollToMove: true,
              keyboardToMove: true,
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

        <div className="p-4 sm:p-6 bg-white border-t border-[#c2c1d3]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="text-xs sm:text-sm text-[#270185] mb-3 sm:mb-0 grid grid-cols-2 sm:flex sm:space-x-6">
              <p className="mb-1 sm:mb-0"><span className="font-semibold">Category:</span> {pgn.category}</p>
              <p className="mb-1 sm:mb-0"><span className="font-semibold">Created:</span> {new Date(pgn.created_at).toLocaleDateString()}</p>
              {pgn.shared_by && (
                <p className="mb-1 sm:mb-0"><span className="font-semibold">Shared by:</span> {pgn.shared_by}</p>
              )}
              <p className="mb-1 sm:mb-0"><span className="font-semibold">Viewing as:</span> {user?.full_name || user?.email}</p>
            </div>
            <div className="self-end sm:self-auto">
              <a 
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(pgn.pgn_content)}`}
                download={`${pgn.title}.pgn`}
                className="px-3 py-1 sm:px-4 sm:py-2 bg-[#461fa3] text-white text-sm sm:text-base rounded hover:bg-[#7646eb] transition-colors inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3.293-7.707a1 1 0 0 1 1.414 0L9 10.586V3a1 1 0 1 1 2 0v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                </svg>
                Download PGN
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PGNViewer;