import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const ResourceCenter = () => {
    const { user } = useAuth();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [uploadFormData, setUploadFormData] = useState({
        title: '',
        description: '',
        category: 'openings',
        type: 'link',
        url: '',
        tags: '',
        difficulty: 'beginner'
    });
    const [uploadFile, setUploadFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
    const [featuredResources, setFeaturedResources] = useState([]);

    const categories = [
        { id: 'all', label: 'All Resources' },
        { id: 'openings', label: 'Openings' },
        { id: 'middlegame', label: 'Middlegame' },
        { id: 'endgame', label: 'Endgame' },
        { id: 'tactics', label: 'Tactics' },
        { id: 'strategy', label: 'Strategy' }
    ];

    const resourceTypes = [
        { id: 'pgn', label: 'PGN File' },
        { id: 'pdf', label: 'PDF Document' },
        { id: 'video', label: 'Video Link' },
        { id: 'link', label: 'External Link' }
    ];

    const difficultyLevels = [
        { id: 'beginner', label: 'Beginner' },
        { id: 'intermediate', label: 'Intermediate' },
        { id: 'advanced', label: 'Advanced' }
    ];

    const fetchResources = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            let response;
            
            if (showBookmarksOnly) {
                response = await ApiService.getUserBookmarks();
                setResources(response.resources || []);
            } else if (searchTerm.trim()) {
                response = await ApiService.searchResources(searchTerm, {
                    category: activeCategory !== 'all' ? activeCategory : null
                });
                setResources(response.resources || []);
            } else {
                response = await ApiService.getResources(activeCategory);
                setResources(response.resources || []);
            }
            
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch resources: ' + error.message);
            setLoading(false);
        }
    }, [activeCategory, searchTerm, showBookmarksOnly]);

    const fetchFeatured = useCallback(async () => {
        try {
            const response = await ApiService.getFeaturedResources();
            setFeaturedResources(response.resources || []);
        } catch (error) {
            console.error('Failed to fetch featured resources:', error);
        }
    }, []);

    useEffect(() => {
        fetchResources();
        fetchFeatured();
    }, [fetchResources, fetchFeatured]);

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

    const handleSearch = (event) => {
        event.preventDefault();
        fetchResources();
    };

    const handleBookmarkToggle = async (resource) => {
        try {
            if (resource.is_bookmarked) {
                await ApiService.unbookmarkResource(resource.id);
            } else {
                await ApiService.bookmarkResource(resource.id);
            }
            
            // Update resource in the list
            const updatedResources = resources.map(item => 
                item.id === resource.id 
                    ? { ...item, is_bookmarked: !item.is_bookmarked } 
                    : item
            );
            setResources(updatedResources);
            
            // Also update in featured if needed
            const updatedFeatured = featuredResources.map(item => 
                item.id === resource.id 
                    ? { ...item, is_bookmarked: !item.is_bookmarked } 
                    : item
            );
            setFeaturedResources(updatedFeatured);
            
        } catch (error) {
            console.error('Failed to toggle bookmark:', error);
        }
    };

    const handleUploadChange = (e) => {
        const { name, value } = e.target;
        setUploadFormData({
            ...uploadFormData,
            [name]: value
        });
    };

    const handleFileChange = (e) => {
        setUploadFile(e.target.files[0]);
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setUploading(true);
            setUploadError(null);
            
            const formData = new FormData();
            
            // Add form fields to FormData
            Object.entries(uploadFormData).forEach(([key, value]) => {
                formData.append(key, value);
            });
            
            // Add file if present
            if (uploadFile) {
                formData.append('file', uploadFile);
            }
            
            // Upload the resource
            await ApiService.uploadResource(formData);
            
            // Reset form and fetch updated resources
            setUploadFormData({
                title: '',
                description: '',
                category: 'openings',
                type: 'link',
                url: '',
                tags: '',
                difficulty: 'beginner'
            });
            setUploadFile(null);
            setShowUploadForm(false);
            fetchResources();
            
        } catch (error) {
            setUploadError(error.message);
        } finally {
            setUploading(false);
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
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Resource Center</h1>
                    
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                                ${showBookmarksOnly
                                    ? 'bg-[#461fa3] text-white'
                                    : 'bg-white text-[#461fa3] hover:bg-[#461fa3] hover:text-white'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            {showBookmarksOnly ? 'All Resources' : 'Bookmarks'}
                        </button>
                        
                        {user && (user.role === 'teacher' || user.role === 'admin') && (
                            <button
                                onClick={() => setShowUploadForm(!showUploadForm)}
                                className="bg-[#7646eb] hover:bg-[#5a35b5] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                Upload Resource
                            </button>
                        )}
                    </div>
                </div>
                
                {showUploadForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-semibold text-[#200e4a] mb-4">Upload New Resource</h2>
                        
                        <form onSubmit={handleUploadSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={uploadFormData.title}
                                        onChange={handleUploadChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Resource Type</label>
                                    <select
                                        name="type"
                                        value={uploadFormData.type}
                                        onChange={handleUploadChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        {resourceTypes.map(type => (
                                            <option key={type.id} value={type.id}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={uploadFormData.category}
                                        onChange={handleUploadChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        {categories.filter(c => c.id !== 'all').map(category => (
                                            <option key={category.id} value={category.id}>{category.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-gray-700 mb-1">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={uploadFormData.difficulty}
                                        onChange={handleUploadChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    >
                                        {difficultyLevels.map(level => (
                                            <option key={level.id} value={level.id}>{level.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={uploadFormData.description}
                                    onChange={handleUploadChange}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                ></textarea>
                            </div>
                            
                            <div>
                                <label className="block text-gray-700 mb-1">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    name="tags"
                                    value={uploadFormData.tags}
                                    onChange={handleUploadChange}
                                    placeholder="e.g. sicilian, dragon, attack"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            
                            {uploadFormData.type === 'link' || uploadFormData.type === 'video' ? (
                                <div>
                                    <label className="block text-gray-700 mb-1">URL</label>
                                    <input
                                        type="url"
                                        name="url"
                                        value={uploadFormData.url}
                                        onChange={handleUploadChange}
                                        required={uploadFormData.type === 'link' || uploadFormData.type === 'video'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-gray-700 mb-1">File</label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        required={uploadFormData.type !== 'link' && uploadFormData.type !== 'video'}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                    />
                                </div>
                            )}
                            
                            {uploadError && (
                                <div className="text-red-500 text-sm">{uploadError}</div>
                            )}
                            
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadForm(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-md transition-colors hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className={`px-4 py-2 bg-[#461fa3] text-white rounded-md transition-colors ${
                                        uploading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-[#7646eb]'
                                    }`}
                                >
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="mb-6">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search resources..."
                            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#461fa3]"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb] transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>
                
                {!showBookmarksOnly && !searchTerm && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-[#200e4a] mb-4">Featured Resources</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {featuredResources.map((resource) => (
                                <div
                                    key={resource.id}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                >
                                    <div className="p-4 bg-[#200e4a] text-white flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className="text-2xl mr-4">{getResourceIcon(resource.type)}</span>
                                            <h3 className="text-lg font-semibold">{resource.title}</h3>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBookmarkToggle(resource);
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
                                    </div>
                                    
                                    <div className="p-6" onClick={() => handleResourceClick(resource)}>
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
                            ))}
                        </div>
                    </div>
                )}
                
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
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#461fa3] mx-auto"></div>
                        <p className="mt-2 text-[#461fa3]">Loading resources...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : resources.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-xl shadow-lg">
                        <p className="text-lg text-gray-600">
                            {showBookmarksOnly 
                                ? "You haven't bookmarked any resources yet." 
                                : searchTerm 
                                    ? `No resources found matching "${searchTerm}"` 
                                    : "No resources found in this category."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource) => (
                            <div
                                key={resource.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="p-4 bg-[#200e4a] text-white flex justify-between items-center">
                                    <div className="flex items-center">
                                        <span className="text-2xl mr-4">{getResourceIcon(resource.type)}</span>
                                        <h3 className="text-lg font-semibold">{resource.title}</h3>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleBookmarkToggle(resource);
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
                                </div>
                                
                                <div className="p-6" onClick={() => handleResourceClick(resource)}>
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResourceCenter;
