
/**
 * PGNGameView
 * Displays a single chess game in PGN format with beautiful, responsive, accessible UI.
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PGNViewer from '../../components/chess/PGNViewer';
import { ChessApi } from '../../api/chess';

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
        const response = await ChessApi.getPGNGame(id);
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

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[40vh] h-[60vh] text-center bg-background-light px-4 transition-all duration-200 border border-gray-light shadow-lg rounded-2xl" aria-live="polite" aria-label="Loading PGN game" role="status">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-accent mb-4" aria-label="Loading" />
        <span className="text-lg text-primary font-semibold">Loading game...</span>
      </section>
    );
  }
  if (error) {
    return (
      <section className="flex flex-col items-center justify-center min-h-[40vh] h-[60vh] text-center bg-background-light px-4 transition-all duration-200 border border-gray-light shadow-lg rounded-2xl" aria-live="polite" aria-label="PGN game error" role="alert">
        <div className="bg-highlight text-white rounded-lg px-6 py-4 shadow max-w-lg w-full text-center text-base font-semibold transition-all duration-200">
          {error}
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-background-light py-8" aria-label="PGN Game Viewer" role="main" tabIndex={0}>
      <section className="w-full max-w-7xl min-w-[320px] mx-auto bg-background-light dark:bg-background-dark border border-gray-light shadow-lg rounded-2xl p-2 sm:p-8 transition-all duration-200">
        <button
          className="mb-4 px-5 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all duration-200 font-semibold"
          onClick={() => navigate('/chess/pgn-management')}
          aria-label="Back to PGN Library"
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
      </section>
    </main>
  );
}
