import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PGNViewer from '../../components/chess/PGNViewer';
import ApiService from '../../utils/api';

export default function PGNGameView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pgn, setPgn] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPGN() {
      setLoading(true);
      setError('');
      try {
        const response = await ApiService.request(`/chess/get-game.php?id=${id}`, 'GET');
        if (response.success && response.data && response.data.pgn_content) {
          setPgn(response.data.pgn_content);
        } else {
          setError('Game not found or PGN missing.');
        }
      } catch (err) {
        setError('Failed to load game.');
      } finally {
        setLoading(false);
      }
    }
    fetchPGN();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-lg">Loading game...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-background-light py-8">
      <div className="w-full max-w-7xl min-w-[320px] mx-auto bg-white shadow-lg rounded-lg p-2 sm:p-8">
        <button
          className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-semibold"
          onClick={() => navigate('/chess/pgn-management')}
        >
          ← Back to Library
        </button>
        <PGNViewer
          initialPgn={pgn}
          width={550}
          height={550}
          showControls
          showHeaders
          showMoveList
          theme="light"
          className="w-full mx-auto"
        />
      </div>
    </div>
  );
}
