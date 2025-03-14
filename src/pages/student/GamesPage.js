import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import ApiService from '../../utils/api';

const GamesPage = () => {
    const navigate = useNavigate();
    const [recentGames, setRecentGames] = useState([]);
    const [savedPositions, setSavedPositions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchGameData = async () => {
            try {
                // In a real app, these would be actual API calls
                // const gamesResponse = await ApiService.get('/games/recent.php');
                // const positionsResponse = await ApiService.get('/games/saved-positions.php');
                
                // setRecentGames(gamesResponse.games || []);
                // setSavedPositions(positionsResponse.positions || []);
                
                // Mock data for development
                setRecentGames([
                    {
                        id: 1,
                        opponent: "Magnus_fan123",
                        date: "2023-11-15",
                        result: "win",
                        time_control: "10+0",
                        moves: 34,
                        pgn: "1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6",
                        lichess_id: "abcd1234"
                    },
                    {
                        id: 2,
                        opponent: "ChessNewbie55",
                        date: "2023-11-14",
                        result: "loss",
                        time_control: "5+3",
                        moves: 42,
                        pgn: "1. d4 Nf6 2. c4 e6 3. Nc3 Bb4 4. e3 O-O 5. Bd3 d5",
                        lichess_id: "efgh5678"
                    },
                    {
                        id: 3,
                        opponent: "Kasparov_Jr",
                        date: "2023-11-13",
                        result: "draw",
                        time_control: "15+10",
                        moves: 65,
                        pgn: "1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O",
                        lichess_id: "ijkl9012"
                    }
                ]);
                
                setSavedPositions([
                    {
                        id: 1,
                        name: "Queen's Gambit - Main Line",
                        fen: "rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2",
                        notes: "Key position in Queen's Gambit"
                    },
                    {
                        id: 2,
                        name: "Sicilian Defense - Dragon Variation",
                        fen: "rnbqkb1r/pp2pp1p/3p1np1/8/3NP3/2N5/PPP2PPP/R1BQKB1R w KQkq - 0 7",
                        notes: "Critical position in the Dragon"
                    }
                ]);
                
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch game data:", error);
                setError("Failed to load chess games. Please try again later.");
                setLoading(false);
            }
        };

        fetchGameData();
    }, []);

    const handleViewGame = (lichessId) => {
        window.open(`https://lichess.org/${lichessId}`, '_blank');
    };

    const handleAnalyzePosition = (fen) => {
        const encodedFen = encodeURIComponent(fen);
        window.open(`https://lichess.org/analysis?fen=${encodedFen}`, '_blank');
    };

    const handlePlayComputer = () => {
        navigate('/student/board');
    };

    const handlePlayOnline = () => {
        window.open('https://lichess.org', '_blank');
    };

    const renderGameResult = (result) => {
        switch (result) {
            case 'win':
                return <span className="text-green-600 font-medium">Win</span>;
            case 'loss':
                return <span className="text-red-600 font-medium">Loss</span>;
            case 'draw':
                return <span className="text-gray-600 font-medium">Draw</span>;
            default:
                return <span>{result}</span>;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading games...</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Game Area</h1>

                {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div 
                        className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center"
                        onClick={handlePlayComputer}
                    >
                        <div className="text-6xl mb-4">🤖</div>
                        <h2 className="text-xl font-semibold text-[#461fa3] mb-2">Play vs Computer</h2>
                        <p className="text-gray-600">Practice your skills against the computer with customizable difficulty</p>
                    </div>
                    
                    <div 
                        className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center"
                        onClick={handlePlayOnline}
                    >
                        <div className="text-6xl mb-4">👥</div>
                        <h2 className="text-xl font-semibold text-[#461fa3] mb-2">Play Online</h2>
                        <p className="text-gray-600">Find opponents and play online rated games on Lichess</p>
                    </div>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-[#200e4a] mb-4">Recent Games</h2>
                    
                    {recentGames.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <p className="text-lg text-gray-600">No recent games found.</p>
                            <p className="text-gray-500 mt-2">Start playing to see your games history here!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opponent</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Control</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moves</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {recentGames.map((game) => (
                                            <tr key={game.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{game.opponent}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{renderGameResult(game.result)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.time_control}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{game.moves}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleViewGame(game.lichess_id)}
                                                        className="text-[#461fa3] hover:text-[#7646eb]"
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-2xl font-semibold text-[#200e4a] mb-4">Saved Positions</h2>
                    
                    {savedPositions.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                            <p className="text-lg text-gray-600">No saved positions found.</p>
                            <p className="text-gray-500 mt-2">Save positions during analysis to access them here!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {savedPositions.map((position) => (
                                <div 
                                    key={position.id} 
                                    className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                                    onClick={() => handleAnalyzePosition(position.fen)}
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-[#461fa3] mb-2">{position.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{position.notes}</p>
                                        <div className="text-sm text-gray-500 truncate">
                                            <span className="font-mono">{position.fen}</span>
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-gray-50 border-t text-center text-[#461fa3] hover:text-[#7646eb]">
                                        Analyze Position
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GamesPage;
