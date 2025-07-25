import React, { useState } from 'react';
import { EyeIcon, ShareIcon, CalendarIcon, UserIcon, DocumentIcon, TagIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import CreateQuizModal from './CreateQuizModal';

// Utility functions
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const GameCard = ({ game, onView, onShare, glass = "bg-white", cardShadow = "shadow-md hover:shadow-xl", isSelectable = false, isSelected = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateQuizModal, setShowCreateQuizModal] = useState(false);
  
  const canCreateQuiz = user && (user.role === 'teacher' || user.role === 'admin');
  
  // Determine if user can share this PGN
  const canShare = user && (user.role === 'teacher' || user.role === 'admin') && (
    // Can share if it's public, or if user owns it, or if user is admin
    game.is_public || 
    game.teacher_id === user.id || 
    user.role === 'admin'
  );

  const handleCreateQuiz = (e) => {
    e.stopPropagation();
    setShowCreateQuizModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateQuizModal(false);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (onShare) {
      onShare();
    }
  };
  return (
    <section
      className={`relative ${glass} ${cardShadow} border ${isSelected ? 'border-accent border-2' : 'border-gray-light'} rounded-xl p-5 cursor-pointer group transition-all duration-200 min-h-[180px] flex flex-col justify-between ${isSelected ? 'bg-accent/5' : ''}`}
      tabIndex={0}
      role="button"
      aria-label={`${isSelectable ? 'Select' : 'View'} game: ${game.title}`}
      onClick={() => isSelectable ? onView() : navigate(`/chess/pgn/${game.id}`)}
      onKeyDown={(e) => { 
        if (e.key === 'Enter' || e.key === ' ') {
          if (isSelectable) {
            onView();
          } else {
            navigate(`/chess/pgn/${game.id}`);
          }
        }
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-primary line-clamp-2 group-hover:text-accent transition-colors duration-200">{game.title}</h3>
        <div className="flex space-x-1 ml-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); window.open(`/chess/pgn/${game.id}`, '_blank'); }}
            className="p-2 rounded-full bg-accent/10 text-accent hover:bg-accent/20 hover:text-accent-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="View"
            aria-label={`View game: ${game.title}`}
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          {canShare && (
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
              title="Share with users"
              aria-label={`Share game: ${game.title}`}
            >
              <ShareIcon className="w-5 h-5" />
            </button>
          )}
          {canCreateQuiz && (
            <button
              type="button"
              onClick={handleCreateQuiz}
              className="p-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              title="Create Quiz"
              aria-label={`Create quiz from: ${game.title}`}
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {game.description && (
        <p className="text-base text-gray-dark mb-2 line-clamp-2 italic">{game.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
          <TagIcon className="w-4 h-4 mr-1" />
          {game.category}
        </span>
        {game.is_public && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success text-white">Public</span>
        )}
        {game.metadata?.totalGames > 1 && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-secondary text-white">{game.metadata.totalGames} games</span>
        )}
      </div>
      <div className="flex justify-between items-center text-xs text-gray-dark mt-auto pt-2 border-t border-gray-light">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 mr-1" />
            {game.teacher_name || 'Unknown'}
          </div>
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-1" />
            {formatDate(game.created_at)}
          </div>
        </div>
        <div className="flex items-center">
          <DocumentIcon className="w-4 h-4 mr-1" />
          {formatFileSize(game.content_size)}
        </div>
      </div>
      {showCreateQuizModal && (
        <CreateQuizModal 
          isOpen={showCreateQuizModal}
          onClose={handleCloseModal}
          pgnGame={game}
        />
      )}
    </section>
  );
};

export default GameCard;
