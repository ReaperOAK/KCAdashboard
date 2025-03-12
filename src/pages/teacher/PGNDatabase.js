import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import PGNList from '../../components/PGNDatabase/PGNList';
import UploadModal from '../../components/PGNDatabase/UploadModal';
import ShareModal from '../../components/PGNDatabase/ShareModal';
// We're not using ViewerModal anymore since we're navigating to a page

const PGNDatabase = () => {
    const navigate = useNavigate();
    const [pgns, setPgns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // Remove ViewerModal state
    // const [showViewerModal, setShowViewerModal] = useState(false);
    // const [selectedPGN, setSelectedPGN] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: 'opening',
        pgn_content: '',
        is_public: false
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [viewMode, setViewMode] = useState('own'); // 'own' or 'shared'
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [teacherList, setTeacherList] = useState([]);
    const [selectedPGNForShare, setSelectedPGNForShare] = useState(null);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    const [sharePermission, setSharePermission] = useState('view');

    // Add function to navigate to PGN viewer page
    const navigateToPGNViewer = (pgn) => {
        // Store PGN data in sessionStorage for retrieval on the viewer page
        sessionStorage.setItem('viewPGN', JSON.stringify(pgn));
        // Navigate to the dedicated viewer page with the PGN ID
        navigate(`/pgn-viewer/${pgn.id}`);
    };

    const fetchPGNs = useCallback(async () => {
        try {
            setLoading(true);
            const response = await ApiService.getTeacherPGNs(viewMode === 'shared' ? 'shared' : 'own');
            setPgns(response.pgns || []);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch PGNs');
            setLoading(false);
        }
    }, [viewMode]);

    const fetchTeachers = useCallback(async () => {
        try {
            const response = await ApiService.getTeachers();
            setTeacherList(response.teachers || []);
        } catch (error) {
            const response = await ApiService.getTeachers();
            setTeacherList(response.teachers || []);
            console.error('Failed to fetch teachers:', error);
        } 
    }, []);

    useEffect(() => {
        fetchPGNs();
    }, [fetchPGNs]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Read file content
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadForm(prev => ({
                    ...prev,
                    pgn_content: e.target.result
                }));
            };
            reader.readAsText(file);
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            
            // Basic client-side validation
            if (!uploadForm.title.trim()) {
                setError('Title is required');
                setLoading(false);
                return;
            }
            
            if (!uploadForm.pgn_content.trim()) {
                setError('PGN content is required');
                setLoading(false);
                return;
            }
            
            // Create form data with very simple structure
            const formData = new FormData();
            
            // Manually serialize the JSON to ensure consistency
            const jsonData = {
                title: uploadForm.title.trim(),
                description: uploadForm.description.trim(),
                category: uploadForm.category,
                pgn_content: uploadForm.pgn_content.trim(),
                is_public: uploadForm.is_public
            };
            
            formData.append('data', JSON.stringify(jsonData));
            
            if (selectedFile) {
                formData.append('pgn_file', selectedFile);
            }
            
            console.log('Form data:', jsonData);
            
            // Try using the dedicated postFormData method from ApiService
            const response = await ApiService.postFormData('/pgn/upload.php', formData);
            
            if (response && response.message === "PGN uploaded successfully") {
                setShowUploadModal(false);
                fetchPGNs();
                setUploadForm({
                    title: '',
                    description: '',
                    category: 'opening',
                    pgn_content: '',
                    is_public: false
                });
                setSelectedFile(null);
                setError(null);
            } else {
                throw new Error('Upload failed: ' + (response?.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload PGN');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePGN = async (pgn) => {
        if (window.confirm(`Are you sure you want to delete "${pgn.title}"?`)) {
            try {
                await ApiService.deletePGN(pgn.id);
                fetchPGNs();
            } catch (error) {
                setError('Failed to delete PGN');
            }
        }
    };
    
    const openShareModal = (pgn) => {
        setSelectedPGNForShare(pgn);
        setSelectedTeachers([]);
        setSharePermission('view');
        setShareModalOpen(true);
        fetchTeachers();
    };
    
    const handleShareSubmit = async (e) => {
        e.preventDefault();
        if (selectedTeachers.length === 0) {
            setError('Please select at least one teacher');
            return;
        }

        try {
            await ApiService.sharePGN(selectedPGNForShare.id, selectedTeachers, sharePermission);
            setShareModalOpen(false);
            setError(null);
        } catch (error) {
            setError('Failed to share PGN');
        }
    };
    
    const toggleTeacherSelection = (teacherId) => {
        setSelectedTeachers(prev => 
            prev.includes(teacherId)
                ? prev.filter(id => id !== teacherId)
                : [...prev, teacherId]
        );
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">PGN Database</h1>
                    <div className="flex space-x-4">
                        <div className="flex bg-white rounded-lg p-1 shadow">
                            <button
                                onClick={() => setViewMode('own')}
                                className={`px-4 py-2 rounded-md ${viewMode === 'own' 
                                    ? 'bg-[#461fa3] text-white' 
                                    : 'text-[#461fa3] hover:bg-gray-100'}`}
                            >
                                My PGNs
                            </button>
                            <button
                                onClick={() => setViewMode('shared')}
                                className={`px-4 py-2 rounded-md ${viewMode === 'shared' 
                                    ? 'bg-[#461fa3] text-white' 
                                    : 'text-[#461fa3] hover:bg-gray-100'}`}
                            >
                                Shared with Me
                            </button>
                        </div>
                        {viewMode === 'own' && (
                            <button
                                onClick={() => setShowUploadModal(true)}
                                className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                            >
                                Upload PGN
                            </button>
                        )}
                    </div>
                </div>

                {/* Error display */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* PGN listing */}
                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : pgns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {viewMode === 'own' 
                            ? "You haven't uploaded any PGNs yet." 
                            : "No PGNs have been shared with you yet."}
                    </div>
                ) : (
                    <PGNList
                        pgns={pgns}
                        viewMode={viewMode}
                        onView={navigateToPGNViewer}
                        onShare={openShareModal}
                        onDelete={handleDeletePGN}
                    />
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <UploadModal
                        show={showUploadModal}
                        onClose={() => {
                            setShowUploadModal(false);
                            setError(null);
                        }}
                        uploadForm={uploadForm}
                        setUploadForm={setUploadForm}
                        handleFileChange={handleFileChange}
                        handleSubmit={handleUploadSubmit}
                        loading={loading}
                        error={error}
                    />
                )}

                {/* Share Modal */}
                {shareModalOpen && selectedPGNForShare && (
                    <ShareModal
                        show={shareModalOpen}
                        onClose={() => setShareModalOpen(false)}
                        pgn={selectedPGNForShare}
                        teacherList={teacherList}
                        selectedTeachers={selectedTeachers}
                        toggleTeacherSelection={toggleTeacherSelection}
                        sharePermission={sharePermission}
                        setSharePermission={setSharePermission}
                        handleSubmit={handleShareSubmit}
                        error={error}
                    />
                )}

                {/* Remove PGN Viewer Modal since we're navigating to a page instead */}
            </div>
        </div>
    );
};

export default PGNDatabase;

