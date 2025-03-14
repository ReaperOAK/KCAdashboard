import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const StudiesPage = () => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All Studies' },
        { id: 'openings', label: 'Openings' },
        { id: 'middlegame', label: 'Middlegame' },
        { id: 'endgame', label: 'Endgame' },
        { id: 'tactics', label: 'Tactics' },
        { id: 'strategy', label: 'Strategy' }
    ];

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                // In a real app, this would be an actual API call
                const response = await ApiService.get(`/studies/get-studies.php?category=${activeCategory}`);
                setStudies(response.studies || []);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch studies:", error);
                setError("Failed to load studies. Please try again later.");
                setLoading(false);
                
                // For development - sample data
                setStudies([
                    {
                        id: 1,
                        title: "Sicilian Defense: Najdorf Variation",
                        description: "Master the intricacies of the Najdorf Variation in the Sicilian Defense.",
                        category: "openings",
                        chapters: 5,
                        author: "Coach Mike",
                        created_at: "2023-10-15",
                        lichess_id: "abc123",
                        thumbnail: "https://lichess1.org/thumbnail/KfQw8Y6x.jpg"
                    },
                    {
                        id: 2,
                        title: "Endgame Techniques: Rook vs Bishop",
                        description: "Advanced techniques for handling rook vs bishop endgames.",
                        category: "endgame",
                        chapters: 3,
                        author: "Coach Lisa",
                        created_at: "2023-11-02",
                        lichess_id: "def456",
                        thumbnail: "https://lichess1.org/thumbnail/MbvA8Jk2.jpg"
                    },
                    {
                        id: 3,
                        title: "Tactical Patterns: Double Attack",
                        description: "Learn to recognize and execute double attack patterns.",
                        category: "tactics",
                        chapters: 7,
                        author: "GM Sarah",
                        created_at: "2023-09-28",
                        lichess_id: "ghi789",
                        thumbnail: "https://lichess1.org/thumbnail/NzQb7Y3x.jpg"
                    }
                ]);
            }
        };

        fetchStudies();
    }, [activeCategory]);

    const openStudy = (lichessId) => {
        window.open(`https://lichess.org/study/${lichessId}`, '_blank');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-center items-center h-64">
                    <div className="text-lg text-gray-600">Loading studies...</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Chess Studies</h1>
                
                <div className="mb-6 flex space-x-4 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeCategory === category.id
                                    ? 'bg-[#461fa3] text-white'
                                    : 'bg-white text-[#461fa3] hover:bg-[#461fa3] hover:text-white'
                                }`}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>

                {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

                {studies.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <p className="text-lg text-gray-600">No studies found in this category.</p>
                        <p className="text-gray-500 mt-2">Try selecting a different category or check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studies.map((study) => (
                            <div 
                                key={study.id} 
                                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                                onClick={() => openStudy(study.lichess_id)}
                            >
                                <div className="h-40 bg-gray-200 relative">
                                    {study.thumbnail && (
                                        <img 
                                            src={study.thumbnail} 
                                            alt={study.title}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                                        <span className="px-2 py-1 rounded text-xs text-white bg-[#461fa3]">
                                            {study.category.charAt(0).toUpperCase() + study.category.slice(1)}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#461fa3] mb-2">{study.title}</h3>
                                    <p className="text-gray-600 mb-4 line-clamp-2">{study.description}</p>
                                    <div className="flex justify-between items-center text-sm text-gray-500">
                                        <span>By {study.author}</span>
                                        <span>{study.chapters} chapters</span>
                                    </div>
                                </div>
                                <div className="px-6 py-3 bg-gray-50 border-t text-center text-[#461fa3] hover:text-[#7646eb]">
                                    Open in Lichess
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudiesPage;
