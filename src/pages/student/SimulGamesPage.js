import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const SimulGamesPage = () => {
    const [simulEvents, setSimulEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch simul events from API or Lichess
        const fetchSimulEvents = async () => {
            try {
                // This would be replaced with an actual API call to your backend
                // or directly to Lichess API if you handle authentication client-side
                const response = await ApiService.get('/simul/upcoming.php');
                setSimulEvents(response.simuls || []);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch simul events:", error);
                setError("Failed to load simul events. Please try again later.");
                setLoading(false);
                
                // For development - sample data
                setSimulEvents([
                    {
                        id: "sim123",
                        name: "GM Sarah's Simultaneous Exhibition",
                        host: "GM Sarah",
                        date: new Date(Date.now() + 86400000).toISOString(),
                        participants: 12,
                        maxParticipants: 20,
                        status: "upcoming",
                        lichessUrl: "https://lichess.org/simul/sim123"
                    },
                    {
                        id: "sim456",
                        name: "IM John's Weekly Simul",
                        host: "IM John",
                        date: new Date(Date.now() + 172800000).toISOString(),
                        participants: 8,
                        maxParticipants: 15,
                        status: "upcoming",
                        lichessUrl: "https://lichess.org/simul/sim456"
                    }
                ]);
            }
        };

        fetchSimulEvents();
    }, []);

    const handleRegister = async (simulId) => {
        try {
            await ApiService.post('/simul/register.php', { simul_id: simulId });
            // Refresh the list
            const response = await ApiService.get('/simul/upcoming.php');
            setSimulEvents(response.simuls);
        } catch (error) {
            setError("Failed to register for the simul. Please try again.");
        }
    };

    const handleJoin = (lichessUrl) => {
        window.open(lichessUrl, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading simul events...</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Simultaneous Exhibition Games</h1>
                </div>

                {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-[#461fa3] mb-4">About Simul Games</h2>
                    <p className="text-gray-700 mb-4">
                        In a simultaneous exhibition, a strong player (often a Grandmaster or titled player) 
                        plays multiple games against different players at the same time, moving from board to board.
                        This is an excellent opportunity to test your skills and learn from experienced players.
                    </p>
                    <div className="flex items-center p-4 bg-[#f3f1f9] rounded-lg">
                        <div className="text-2xl mr-4">💡</div>
                        <p className="text-gray-700">
                            When you register for a simul, make sure to be online at least 10 minutes before 
                            the scheduled start time. You'll need a Lichess.org account to participate.
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-semibold text-[#200e4a] mb-4">Upcoming Events</h2>
                
                {simulEvents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-lg text-gray-600">No upcoming simul events at the moment.</p>
                        <p className="text-gray-500 mt-2">Check back soon or ask your teacher about upcoming opportunities.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {simulEvents.map((simul) => (
                            <div key={simul.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#461fa3] mb-2">{simul.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p><span className="font-semibold">Host:</span> {simul.host}</p>
                                        <p><span className="font-semibold">Date:</span> {new Date(simul.date).toLocaleString()}</p>
                                        <p><span className="font-semibold">Participants:</span> {simul.participants}/{simul.maxParticipants}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t">
                                    {simul.status === 'upcoming' ? (
                                        <button
                                            onClick={() => handleRegister(simul.id)}
                                            className="w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                        >
                                            Register
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(simul.lichessUrl)}
                                            className="w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                        >
                                            Join on Lichess
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SimulGamesPage;
