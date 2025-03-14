import React, { useState } from 'react';

const InteractiveBoardPage = () => {
    const [boardType, setBoardType] = useState('play');
    const [opponent, setOpponent] = useState('computer');
    const [timeControl, setTimeControl] = useState('10+0');
    const [boardUrl, setBoardUrl] = useState('');

    const generateLichessBoardUrl = () => {
        let url = '';
        
        switch (boardType) {
            case 'play':
                if (opponent === 'computer') {
                    url = `https://lichess.org/embed/ai?color=white&level=3`;
                } else if (opponent === 'friend') {
                    url = `https://lichess.org/embed?color=white`;
                } else { // Random player
                    const timeparts = timeControl.split('+');
                    const minutes = timeparts[0];
                    const increment = timeparts[1] || '0';
                    url = `https://lichess.org/embed/pool/${minutes}+${increment}?color=random`;
                }
                break;
            case 'analysis':
                url = 'https://lichess.org/embed/analysis';
                break;
            case 'puzzle':
                url = 'https://lichess.org/training/frame';
                break;
            default:
                url = 'https://lichess.org/embed';
        }
        
        setBoardUrl(url);
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Interactive Chess Board</h1>
                
                <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-wrap gap-4 mb-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Board Type</label>
                            <div className="flex space-x-4">
                                <button 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${boardType === 'play' 
                                            ? 'bg-[#461fa3] text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => setBoardType('play')}
                                >
                                    Play
                                </button>
                                <button 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${boardType === 'analysis' 
                                            ? 'bg-[#461fa3] text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => setBoardType('analysis')}
                                >
                                    Analysis
                                </button>
                                <button 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                        ${boardType === 'puzzle' 
                                            ? 'bg-[#461fa3] text-white' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    onClick={() => setBoardType('puzzle')}
                                >
                                    Puzzles
                                </button>
                            </div>
                        </div>

                        {boardType === 'play' && (
                            <>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Opponent</label>
                                    <div className="flex space-x-4">
                                        <button 
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${opponent === 'computer' 
                                                    ? 'bg-[#461fa3] text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            onClick={() => setOpponent('computer')}
                                        >
                                            Computer
                                        </button>
                                        <button 
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${opponent === 'friend' 
                                                    ? 'bg-[#461fa3] text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            onClick={() => setOpponent('friend')}
                                        >
                                            Friend
                                        </button>
                                        <button 
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                ${opponent === 'random' 
                                                    ? 'bg-[#461fa3] text-white' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            onClick={() => setOpponent('random')}
                                        >
                                            Random Player
                                        </button>
                                    </div>
                                </div>

                                {opponent === 'random' && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Time Control</label>
                                        <div className="flex space-x-4">
                                            <button 
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                    ${timeControl === '3+0' 
                                                        ? 'bg-[#461fa3] text-white' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => setTimeControl('3+0')}
                                            >
                                                3 min
                                            </button>
                                            <button 
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                    ${timeControl === '5+0' 
                                                        ? 'bg-[#461fa3] text-white' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => setTimeControl('5+0')}
                                            >
                                                5 min
                                            </button>
                                            <button 
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                                    ${timeControl === '10+0' 
                                                        ? 'bg-[#461fa3] text-white' 
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                onClick={() => setTimeControl('10+0')}
                                            >
                                                10 min
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <button 
                        onClick={generateLichessBoardUrl}
                        className="px-6 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                    >
                        Load Board
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    {boardUrl ? (
                        <div className="aspect-w-1 aspect-h-1 w-full max-w-3xl mx-auto">
                            <iframe 
                                src={boardUrl}
                                title="Lichess Chess Board"
                                className="w-full h-[600px]"
                                allowTransparency="true"
                                frameBorder="0"
                            ></iframe>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-[600px] bg-gray-100 rounded-lg">
                            <div className="text-center">
                                <p className="text-lg text-gray-600 mb-4">Configure your chess board and click "Load Board"</p>
                                <span className="text-5xl">♟️</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InteractiveBoardPage;
