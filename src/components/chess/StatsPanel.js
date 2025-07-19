import React from 'react';

const StatsPanel = ({ playerStats }) => (
  <div className="max-w-4xl mx-auto">
    <h2 className="text-3xl font-semibold text-primary text-center mb-8 flex items-center justify-center gap-2">
      {/* Lucide icon: BarChart2 */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12v8M9 8v12M15 4v16M21 16v4" /></svg>
      Your Chess Statistics
    </h2>
    {!playerStats ? (
      <div className="text-center py-10">
        <div className="text-primary font-bold text-xl mb-4 flex items-center justify-center gap-2">
          {/* Lucide icon: Loader2 (spinner) */}
          <svg className="animate-spin h-5 w-5 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
          Loading your stats...
        </div>
        <p className="text-gray-dark">If this is your first time, your stats will appear after playing your first game.</p>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 text-center shadow-md border border-gray-light transition-all duration-200 flex flex-col items-center gap-2">
            {/* Lucide icon: Award */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.21 13.89l-2.39 2.39a2 2 0 002.83 2.83l2.39-2.39" /></svg>
            <div className="text-3xl font-bold text-primary mb-1">{playerStats.rating || 1200}</div>
            <div className="text-text-dark text-sm">Rating</div>
          </div>
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 text-center shadow-md border border-gray-light transition-all duration-200 flex flex-col items-center gap-2">
            {/* Lucide icon: Chess */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 19h12M6 17V7a6 6 0 1112 0v10" /></svg>
            <div className="text-3xl font-bold text-primary mb-1">{playerStats.games_played || 0}</div>
            <div className="text-text-dark text-sm">Games Played</div>
          </div>
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 text-center shadow-md border border-gray-light transition-all duration-200 flex flex-col items-center gap-2">
            {/* Lucide icon: Percent */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="7" cy="17" r="2" /><circle cx="17" cy="7" r="2" /><line x1="7" y1="17" x2="17" y2="7" stroke="currentColor" strokeWidth="2" /></svg>
            <div className="text-3xl font-bold text-primary mb-1">{playerStats.win_rate || 0}%</div>
            <div className="text-text-dark text-sm">Win Rate</div>
          </div>
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 text-center shadow-md border border-gray-light transition-all duration-200 flex flex-col items-center gap-2">
            {/* Lucide icon: Hash */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="4" y1="9" x2="20" y2="9" stroke="currentColor" strokeWidth="2" /><line x1="4" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="2" /><line x1="10" y1="3" x2="8" y2="21" stroke="currentColor" strokeWidth="2" /><line x1="16" y1="3" x2="14" y2="21" stroke="currentColor" strokeWidth="2" /></svg>
            <div className="text-3xl font-bold text-primary mb-1">{playerStats.rank || 'N/A'}</div>
            <div className="text-text-dark text-sm">Rank</div>
          </div>
        </div>
        <div className="flex flex-row xs:flex-col justify-between bg-gray-light rounded-xl p-5 mb-10 shadow-md border border-gray-light gap-4 xs:gap-0 transition-all duration-200">
          <div className="flex flex-col items-center flex-1 gap-1">
            {/* Lucide icon: Trophy */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4M7 10a5 5 0 0010 0V5H7v5z" /></svg>
            <div className="text-2xl font-bold text-success">{playerStats.games_won || 0}</div>
            <div className="text-text-dark text-sm">Wins</div>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            {/* Lucide icon: MinusCircle */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" /></svg>
            <div className="text-2xl font-bold text-warning">{playerStats.games_drawn || 0}</div>
            <div className="text-text-dark text-sm">Draws</div>
          </div>
          <div className="flex flex-col items-center flex-1 gap-1">
            {/* Lucide icon: XCircle */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-error mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" /><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" /></svg>
            <div className="text-2xl font-bold text-error">{playerStats.games_lost || 0}</div>
            <div className="text-text-dark text-sm">Losses</div>
          </div>
        </div>
        {playerStats.recent_games && playerStats.recent_games.length > 0 ? (
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-5 shadow-md border border-gray-light transition-all duration-200">
            <h3 className="text-xl font-semibold text-primary mb-4 border-b border-gray-light pb-2 flex items-center gap-2">
              {/* Lucide icon: History */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3v6h6M21 21v-6h-6" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.51 9a9 9 0 0114.13-3.36L21 10M3 14l3.36 3.36A9 9 0 0021 14" /></svg>
              Recent Games
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label="Recent games">
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
                    <tr key={index} className="border-b border-gray-light transition-all duration-200 hover:bg-gray-light/30">
                      <td className="p-3 text-text-dark">{game.opponent_name}</td>
                      <td className={`p-3 font-bold flex items-center gap-1 ${
                        game.result === 'win' ? 'text-success' :
                        game.result === 'loss' ? 'text-error' :
                        game.result === 'draw' ? 'text-warning' : 'text-accent'
                      }`}>
                        {game.result === 'win' ? (
                          <>
                            {/* Lucide icon: Trophy */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M12 17v4M7 10a5 5 0 0010 0V5H7v5z" /></svg>
                            Won
                          </>
                        ) : game.result === 'loss' ? (
                          <>
                            {/* Lucide icon: XCircle */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2" /><line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2" /></svg>
                            Lost
                          </>
                        ) : game.result === 'draw' ? (
                          <>
                            {/* Lucide icon: MinusCircle */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" /></svg>
                            Draw
                          </>
                        ) : (
                          <>
                            {/* Lucide icon: Clock */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" /></svg>
                            Active
                          </>
                        )}
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
          <div className="bg-background-light dark:bg-background-dark rounded-xl p-10 shadow-md border border-gray-light text-center transition-all duration-200">
            <p className="text-text-dark mb-4 flex items-center justify-center gap-2">
              {/* Lucide icon: Info */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16v-4m0-4h.01" /></svg>
              No recent games found.
            </p>
            <p className="text-sm text-gray-dark">Start playing to see your game history!</p>
          </div>
        )}
      </>
    )}
  </div>
);

export default StatsPanel;
