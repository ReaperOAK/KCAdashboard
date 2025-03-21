import React from 'react';
import ApiService from '../utils/api';

const ResourcePreview = ({ resource, onBookmarkToggle }) => {
    const getResourceIcon = (type) => {
        switch(type) {
            case 'pgn': return '♟';
            case 'pdf': return '📄';
            case 'video': return '🎥';
            case 'link': return '🔗';
            default: return '📁';
        }
    };

    const handleResourceClick = async () => {
        try {
            if (resource.type === 'link' || resource.type === 'video') {
                // For external links, just log access and open URL
                await ApiService.post('/resources/log-access.php', { resource_id: resource.id });
                window.open(resource.url, '_blank');
            } else {
                // For downloadable files, redirect to download endpoint
                window.open(ApiService.getResourceDownloadUrl(resource.id), '_blank');
            }
        } catch (error) {
            console.error('Failed to access resource:', error);
        }
    };

    // Video embedding component
    const VideoEmbed = ({ url }) => {
        // Extract video ID from YouTube links
        let videoId = '';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
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

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="p-4 bg-[#200e4a] text-white flex justify-between items-center">
                <div className="flex items-center">
                    <span className="text-2xl mr-4">{getResourceIcon(resource.type)}</span>
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                </div>
                {onBookmarkToggle && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onBookmarkToggle(resource);
                        }}
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
                )}
            </div>
            
            <div className="p-6 cursor-pointer" onClick={handleResourceClick}>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                
                {resource.type === 'video' && (
                    <div className="mb-4">
                        <VideoEmbed url={resource.url} />
                    </div>
                )}
                
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-[#f3f1f9] text-[#461fa3] rounded-full">
                        {resource.category}
                    </span>
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-[#f3f1f9] text-[#461fa3] rounded-full">
                        {resource.difficulty}
                    </span>
                    {resource.downloads > 0 && (
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-[#f3f1f9] text-[#461fa3] rounded-full">
                            {resource.downloads} downloads
                        </span>
                    )}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {resource.author_name}</span>
                    <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default ResourcePreview;
