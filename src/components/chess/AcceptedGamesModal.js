import React from 'react';
import Modal from '../common/Modal';

const AcceptedGamesModal = ({ games, onJoin, onResign, onClose }) => {
  return (
    <Modal title="Accepted Chess Games" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-gray-700 mb-2">One or more of your challenges have been accepted! Would you like to join any of these games?</p>
        <ul className="divide-y divide-gray-200">
          {games.map((game) => (
            <li key={game.gameId} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-semibold text-purple-900">Opponent: {game.recipient?.name || game.challenger?.name || 'Unknown'}</div>
                <div className="text-sm text-gray-600">Time Control: {game.time_control}</div>
                <div className="text-xs text-gray-500">Color: {game.color}</div>
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  onClick={() => onJoin(game.gameId)}
                >
                  Join
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to resign and end this game for both players?')) {
                      await onResign(game.gameId);
                    }
                  }}
                >
                  Resign
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
};

export default AcceptedGamesModal;
