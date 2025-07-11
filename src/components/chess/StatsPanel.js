import React from 'react';

const StatsPanel = ({ playerStats }) => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl font-semibold text-primary text-center mb-6">Your Chess Statistics</h2>
    {!playerStats ? (
      <div className="text-center py-8">
        <div className="text-primary font-bold text-lg mb-4">Loading your stats...</div>
        <p className="text-gray-dark">If this is your first time, your stats will appear after playing your first game.</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-background-light rounded-lg p-4 text-center shadow-md border border-gray-light">
            <div className="text-3xl font-bold text-primary mb-2">{playerStats.rating || 1200}</div>
            <div className="text-text-dark">Rating</div>
          </div>
          <div className="bg-background-light rounded-lg p-4 text-center shadow-md border border-gray-light">
            <div className="text-3xl font-bold text-primary mb-2">{playerStats.games_played || 0}</div>
            <div className="text-text-dark">Games Played</div>
          </div>
          <div className="bg-background-light rounded-lg p-4 text-center shadow-md border border-gray-light">
            <div className="text-3xl font-bold text-primary mb-2">{playerStats.win_rate || 0}%</div>
            <div className="text-text-dark">Win Rate</div>
          </div>
          <div className="bg-background-light rounded-lg p-4 text-center shadow-md border border-gray-light">
            <div className="text-3xl font-bold text-primary mb-2">{playerStats.rank || 'N/A'}</div>
            <div className="text-text-dark">Rank</div>
          </div>
        </div>
        <div className="flex flex-col xs:flex-row justify-between bg-gray-light rounded-lg p-4 mb-8 shadow-md border border-gray-light gap-4 xs:gap-0">
          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-success mb-1">{playerStats.games_won || 0}</div>
            <div className="text-text-dark">Wins</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-warning mb-1">{playerStats.games_drawn || 0}</div>
            <div className="text-text-dark">Draws</div>
          </div>
          <div className="flex flex-col items-center flex-1">
            <div className="text-2xl font-bold text-error mb-1">{playerStats.games_lost || 0}</div>
            <div className="text-text-dark">Losses</div>
          </div>
        </div>
        {playerStats.recent_games && playerStats.recent_games.length > 0 ? (
          <div className="bg-background-light rounded-lg p-4 shadow-md border border-gray-light">
            <h3 className="text-xl font-semibold text-primary mb-4 border-b border-gray-light pb-2">Recent Games</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-light">
                    <th className="text-left p-3 text-primary">Opponent</th>
                    <th className="text-left p-3 text-primary">Result</th>
                    <th className="text-left p-3 text-primary">Color</th>
                    <th className="text-left p-3 text-primary">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {playerStats.recent_games.map((game, index) => (
                    <tr key={index} className="border-b border-gray-light">
                      <td className="p-3 text-text-dark">{game.opponent_name}</td>
                      <td className={`p-3 font-bold ${
                        game.result === 'win' ? 'text-success' :
                        game.result === 'loss' ? 'text-error' :
                        game.result === 'draw' ? 'text-warning' : 'text-accent'
                      }`}>
                        {game.result === 'win' ? 'Won' :
                         game.result === 'loss' ? 'Lost' :
                         game.result === 'draw' ? 'Draw' : 'Active'}
                      </td>
                      <td className="p-3 capitalize text-text-dark">{game.player_color}</td>
                      <td className="p-3 text-text-dark">
                        {new Date(game.last_move_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-background-light rounded-lg p-8 shadow-md border border-gray-light text-center">
            <p className="text-text-dark mb-4">No recent games found.</p>
            <p className="text-sm text-gray-dark">Start playing to see your game history!</p>
          </div>
        )}
      </>
    )}
  </div>
);

export default StatsPanel;
