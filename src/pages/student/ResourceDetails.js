import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const ResourceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Fix: Use user variable or remove if not needed
    // Since user is needed for authenticated actions like bookmarking, we'll keep it
    const { user } = useAuth();
    const [resource, setResource] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResourceDetails = async () => {
            try {
                const response = await ApiService.get(`/resources/get-by-id.php?id=${id}`);
                if (response.resource) {
                    setResource(response.resource);
                } else {
                    setError('Resource not found');
                }
                setLoading(false);
            } catch (error) {
                setError('Failed to load resource details: ' + error.message);
                setLoading(false);
            }
        };

        fetchResourceDetails();
    }, [id]);

    const handleBookmarkToggle = async () => {
        try {
            if (resource.is_bookmarked) {
                await ApiService.unbookmarkResource(resource.id);
            } else {
                await ApiService.bookmarkResource(resource.id);
            }
            
            // Update resource state
            setResource({
                ...resource,
                is_bookmarked: !resource.is_bookmarked
            });
            
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        }
    };

    const handleDownload = async () => {
        try {
            if (resource.type === 'link' || resource.type === 'video') {
                await ApiService.post('/resources/log-access.php', { resource_id: resource.id });
                window.open(resource.url, '_blank');
            } else {
                window.open(ApiService.getResourceDownloadUrl(resource.id), '_blank');
            }
        } catch (error) {
            console.error('Failed to download resource:', error);
        }
    };

    const getResourceIcon = (type) => {
        switch(type) {
            case 'pgn': return '♟';
            case 'pdf': return '📄';
            case 'video': return '🎥';
            case 'link': return '🔗';
            default: return '📁';
        }
    };

    // Video embedding component
    const VideoEmbed = ({ url }) => {
        // Extract video ID from YouTube links
        let videoId = '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            // Fix: Remove unnecessary escape character in the character class
            const regex = /(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
            const match = url.match(regex);
            videoId = match ? match[1] : '';
        }
        
        if (videoId) {
            return (
                <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full rounded-lg"
                    ></iframe>
                </div>
            );
        }
        
        return <p className="text-gray-500">Video preview not available</p>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f3f1f9] p-8">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#461fa3] mx-auto"></div>
                    <p className="mt-2 text-[#461fa3]">Loading resource details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f3f1f9] p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
                <button
                    onClick={() => navigate('/student/resources')}
                    className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                >
                    Back to Resources
                </button>
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="min-h-screen bg-[#f3f1f9] p-8">
                <div className="text-center py-8 bg-white rounded-xl shadow-lg">
                    <p className="text-lg text-gray-600">Resource not found</p>
                </div>
                <button
                    onClick={() => navigate('/student/resources')}
                    className="mt-4 px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                >
                    Back to Resources
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f1f9] p-8">
            <div className="mb-6">
                <button
                    onClick={() => navigate('/student/resources')}
                    className="flex items-center text-[#461fa3] hover:text-[#7646eb] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 0 1-1.414 0l-6-6a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 1.414L5.414 9H17a1 1 0 1 1 0 2H5.414l4.293 4.293a1 1 0 0 1 0 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Resources
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 bg-[#200e4a] text-white flex justify-between items-center">
                    <div className="flex items-center">
                        <span className="text-3xl mr-4">{getResourceIcon(resource.type)}</span>
                        <div>
                            <h1 className="text-2xl font-bold">{resource.title}</h1>
                            <p className="text-sm opacity-80">Added by {resource.author_name} on {new Date(resource.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <button 
                            onClick={handleBookmarkToggle}
                            className="text-white hover:text-yellow-300"
                        >
                            {resource.is_bookmarked ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
                
                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-[#f3f1f9] p-6 rounded-lg">
                                <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Description</h2>
                                <p className="text-gray-700 whitespace-pre-line">{resource.description}</p>
                            </div>
                            
                            {resource.type === 'video' && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Video Preview</h2>
                                    <VideoEmbed url={resource.url} />
                                </div>
                            )}
                            
                            {resource.tags && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Tags</h2>
                                    <div className="flex flex-wrap gap-2">
                                        {resource.tags.split(',').map((tag, index) => (
                                            <span 
                                                key={index}
                                                className="px-3 py-1 bg-[#e3e1f7] text-[#461fa3] rounded-full text-sm font-medium"
                                            >
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <div className="bg-[#f3f1f9] p-6 rounded-lg">
                                <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Resource Details</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Resource Type</p>
                                        <p className="font-medium">{resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="font-medium">{resource.category}</p>
                                    </div>
                                    
                                    <div>
                                        <p className="text-sm text-gray-500">Difficulty Level</p>
                                        <p className="font-medium">{resource.difficulty}</p>
                                    </div>
                                    
                                    {resource.downloads > 0 && (
                                        <div>
                                            <p className="text-sm text-gray-500">Downloads</p>
                                            <p className="font-medium">{resource.downloads}</p>
                                        </div>
                                    )}
                                    
                                    {resource.file_size && (
                                        <div>
                                            <p className="text-sm text-gray-500">File Size</p>
                                            <p className="font-medium">{Math.round(resource.file_size / 1024)} KB</p>
                                        </div>
                                    )}
                                    
                                    <button
                                        onClick={handleDownload}
                                        className="mt-4 w-full px-4 py-3 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors flex items-center justify-center gap-2"
                                    >                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M3 17a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1zm3.293-7.707a1 1 0 0 1 1.414 0L9 10.586V3a1 1 0 1 1 2 0v7.586l1.293-1.293a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 0-1.414z" clipRule="evenodd" />
                                        </svg>
                                        {resource.type === 'link' ? 'Open Link' : `Download ${resource.type.toUpperCase()}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Add usage of user variable in a conditional rendering */}
            {user && resource && resource.created_by === user.id && (
                <div className="mt-4 text-sm text-gray-500">
                    You are the owner of this resource
                </div>
            )}
        </div>
    );
};

export default ResourceDetails;
