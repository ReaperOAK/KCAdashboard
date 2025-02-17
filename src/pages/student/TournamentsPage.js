import React, { useState, useEffect } from 'react';
import TopNavbar from '../../components/TopNavbar';
import Sidebar from '../../components/Sidebar';
import ApiService from '../../utils/api';

const TournamentsPage = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'All Tournaments' },
        { id: 'upcoming', label: 'Upcoming' },
        { id: 'ongoing', label: 'Ongoing' },
        { id: 'completed', label: 'Completed' }
    ];

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const endpoint = activeFilter === 'all' 
                    ? '/tournaments/get-all.php'
                    : `/tournaments/get-by-status.php?status=${activeFilter}`;
                
                const response = await ApiService.get(endpoint);
                setTournaments(response.tournaments);
                setLoading(false);
            } catch (error) {
                setError('Failed to fetch tournaments');
                setLoading(false);
            }
        };

        fetchTournaments();
    }, [activeFilter]);

    const handleRegister = async (tournamentId) => {
        try {
            await ApiService.post('/tournaments/register.php', { tournament_id: tournamentId });
            // Refresh tournaments list
            const response = await ApiService.get('/tournaments/get-all.php');
            setTournaments(response.tournaments);
        } catch (error) {
            setError('Failed to register for tournament');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <TopNavbar />
      <Sidebar />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Chess Tournaments</h1>
                    <div className="flex space-x-4">
                        {filters.map(filter => (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                    ${activeFilter === filter.id
                                        ? 'bg-[#461fa3] text-white'
                                        : 'bg-white text-[#461fa3] hover:bg-[#461fa3] hover:text-white'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament) => (
                            <div
                                key={tournament.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-semibold text-[#461fa3]">
                                            {tournament.title}
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs
                                            ${tournament.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                            tournament.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'}`}
                                        >
                                            {tournament.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-4">{tournament.description}</p>
                                    <div className="space-y-2 text-sm text-gray-500">
                                        <p>📅 {new Date(tournament.date_time).toLocaleString()}</p>
                                        <p>📍 {tournament.location || 'Online'}</p>
                                        <p>💰 Entry Fee: ₹{tournament.entry_fee || 'Free'}</p>
                                        <p>🏆 Prize Pool: ₹{tournament.prize_pool}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t">
                                    {tournament.status === 'upcoming' && (
                                        <button 
                                            onClick={() => handleRegister(tournament.id)}
                                            className="w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                        >
                                            Register Now
                                        </button>
                                    )}
                                    {tournament.status === 'ongoing' && tournament.type === 'online' && (
                                        <a 
                                            href={`https://lichess.org/tournament/${tournament.lichess_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                        >
                                            Join Tournament
                                        </a>
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

export default TournamentsPage;
