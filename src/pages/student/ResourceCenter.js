import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';

const ResourceCenter = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');

    const categories = [
        { id: 'all', label: 'All Resources' },
        { id: 'openings', label: 'Openings' },
        { id: 'middlegame', label: 'Middlegame' },
        { id: 'endgame', label: 'Endgame' },
        { id: 'tactics', label: 'Tactics' },
        { id: 'strategy', label: 'Strategy' }
    ];

    const fetchResources = useCallback(async () => {
        try {
            const endpoint = activeCategory === 'all' 
                ? '/resources/get-all.php'
                : `/resources/get-by-category.php?category=${activeCategory}`;
            
            const response = await ApiService.get(endpoint);
            setResources(response.resources);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch resources');
            setLoading(false);
        }
    }, [activeCategory]);

    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    const getResourceIcon = (type) => {
        switch(type) {
            case 'pgn': return '♟';
            case 'pdf': return '📄';
            case 'video': return '🎥';
            case 'link': return '🔗';
            default: return '📁';
        }
    };

    const handleResourceClick = async (resource) => {
        try {
            await ApiService.post('/resources/log-access.php', { resource_id: resource.id });
            window.open(resource.url, '_blank');
        } catch (error) {
            console.error('Failed to log resource access:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <h1 className="text-3xl font-bold text-[#200e4a] mb-6">Resource Center</h1>
                
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

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource) => (
                            <div
                                key={resource.id}
                                onClick={() => handleResourceClick(resource)}
                                className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start">
                                    <span className="text-2xl mr-4">{getResourceIcon(resource.type)}</span>
                                    <div>
                                        <h3 className="text-lg font-semibold text-[#461fa3] mb-2">{resource.title}</h3>
                                        <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className="mr-4">By {resource.author_name}</span>
                                            <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceCenter;
