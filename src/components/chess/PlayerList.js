
import React, { useState, useCallback, useMemo } from 'react';

// Action Button (memoized)
const ActionButton = React.memo(function ActionButton({ label, onClick, className, ariaLabel, type = 'button' }) {
  return (
    <button
      type={type}
      className={`px-3 py-1 rounded text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors ${className}`}
      onClick={onClick}
      aria-label={ariaLabel || label}
    >
      {label}
    </button>
  );
});

// Player Card (memoized)
const PlayerCard = React.memo(function PlayerCard({ player, isCurrentUser, onSelect, onChallenge }) {
  const handleCardClick = useCallback(() => {
    if (!isCurrentUser) onSelect(player);
  }, [isCurrentUser, onSelect, player]);

  const handleChallengeClick = useCallback(
    (e) => {
      e.stopPropagation();
      onChallenge(player);
    },
    [onChallenge, player]
  );

  return (
    <div
      className={`bg-white rounded-lg p-4 border-2 transition-all duration-200 cursor-pointer ${
        isCurrentUser
          ? 'border-primary bg-background-light cursor-default'
          : 'border-gray-light hover:border-primary hover:shadow-md'
      }`}
      onClick={handleCardClick}
      role="button"
      tabIndex={isCurrentUser ? -1 : 0}
      aria-disabled={isCurrentUser}
      aria-label={isCurrentUser ? `${player.name} (You)` : `Challenge ${player.name}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" aria-label="Online"></span>
          <span className="text-sm text-gray-dark">Online</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="font-semibold text-primary">{player.name}{isCurrentUser && ' (You)'}</div>
        <div className="text-sm text-gray-dark">Rating: {player.rating}</div>
      </div>
      {!isCurrentUser && (
        <ActionButton
          label="Challenge"
          onClick={handleChallengeClick}
          className="w-full mt-3 bg-accent text-white hover:bg-secondary"
          ariaLabel={`Challenge ${player.name}`}
        />
      )}
    </div>
  );
});

// Challenge Modal (memoized)
const ChallengeModal = React.memo(function ChallengeModal({ player, options, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-label={`Challenge ${player.name}`}> 
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">Challenge {player.name}</h3>
          <ActionButton
            label="Close"
            onClick={onClose}
            className="text-gray-dark hover:text-primary text-2xl px-2 py-0 bg-transparent"
            ariaLabel="Close challenge modal"
          >×</ActionButton>
        </div>
        <form
          className="space-y-4"
          onSubmit={e => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div>
            <label className="block text-sm font-medium text-gray-dark mb-2">Play as:</label>
            <div className="flex gap-4">
              {['white', 'black', 'random'].map(color => (
                <label key={color} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    checked={options.color === color}
                    onChange={onChange}
                    className="w-4 h-4 text-accent focus:ring-accent"
                  />
                  <span className="text-gray-dark capitalize">{color}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-dark mb-2">Time Control:</label>
            <select
              name="timeControl"
              value={options.timeControl}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-light rounded-md focus:ring-accent focus:border-accent"
            >
              <option value="5+0">5 minutes</option>
              <option value="10+0">10 minutes</option>
              <option value="15+0">15 minutes</option>
              <option value="30+0">30 minutes</option>
              <option value="1+0">1 minute (Bullet)</option>
              <option value="3+0">3 minutes (Blitz)</option>
              <option value="10+5">10 minutes + 5 seconds</option>
              <option value="15+10">15 minutes + 10 seconds</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <ActionButton
              label="Cancel"
              onClick={onClose}
              className="px-4 py-2 text-gray-dark hover:text-primary bg-transparent"
              ariaLabel="Cancel challenge"
            />
            <ActionButton
              label="Send Challenge"
              type="submit"
              onClick={onSubmit}
              className="px-4 py-2 bg-accent text-white rounded hover:bg-secondary"
              ariaLabel={`Send challenge to ${player.name}`}
            />
          </div>
        </form>
      </div>
    </div>
  );
});

// Main PlayerList
export const PlayerList = React.memo(function PlayerList({ players, currentUser, onChallenge, onRefresh }) {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [challengeOptions, setChallengeOptions] = useState({ color: 'random', timeControl: '10+0' });

  // Memoize player list for performance
  const playerCards = useMemo(() =>
    players.map(player => (
      <PlayerCard
        key={player.id}
        player={player}
        isCurrentUser={player.id === currentUser?.id}
        onSelect={setSelectedPlayer}
        onChallenge={setSelectedPlayer}
      />
    )), [players, currentUser]
  );

  // Handlers
  const handleOptionChange = useCallback((e) => {
    const { name, value } = e.target;
    setChallengeOptions(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPlayer(null);
  }, []);

  const handleSubmitChallenge = useCallback(() => {
    if (!selectedPlayer) return;
    onChallenge(selectedPlayer.id, challengeOptions.color, challengeOptions.timeControl);
    setSelectedPlayer(null);
  }, [selectedPlayer, challengeOptions, onChallenge]);

  return (
    <section className="space-y-4" aria-label="Online Players">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">Online Players</h3>
        <ActionButton
          label="Refresh"
          onClick={onRefresh}
          className="bg-accent text-white hover:bg-secondary"
          ariaLabel="Refresh player list"
        />
      </div>
      {players.length === 0 ? (
        <div className="bg-background-light p-6 rounded-lg text-center">
          <p className="text-gray-dark">No players are currently online. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {playerCards}
        </div>
      )}
      {selectedPlayer && (
        <ChallengeModal
          player={selectedPlayer}
          options={challengeOptions}
          onChange={handleOptionChange}
          onClose={handleCloseModal}
          onSubmit={handleSubmitChallenge}
        />
      )}
    </section>
  );
});

export default PlayerList;