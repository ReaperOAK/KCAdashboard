import React, { useState, useEffect, useCallback } from 'react';

import ApiService from '../../utils/api';

const PGNDatabase = () => {
    const [pgns, setPgns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showViewerModal, setShowViewerModal] = useState(false);
    const [selectedPGN, setSelectedPGN] = useState(null);
    const [uploadForm, setUploadForm] = useState({
        title: '',
        description: '',
        category: 'opening',
        pgn_content: '',
        is_public: false
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const fetchPGNs = useCallback(async () => {
        try {
            const response = await ApiService.get('/pgn/get-teacher-pgns.php');
            setPgns(response.pgns);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch PGNs');
            setLoading(false);
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
            const formData = new FormData();
            const jsonData = {
                title: uploadForm.title,
                description: uploadForm.description,
                category: uploadForm.category,
                pgn_content: uploadForm.pgn_content,
                is_public: uploadForm.is_public
            };
            
            formData.append('data', JSON.stringify(jsonData));
            
            if (selectedFile) {
                formData.append('pgn_file', selectedFile);
            }

            // Log the form data for debugging
            console.log('Form data:', Object.fromEntries(formData));

            const response = await ApiService.post('/pgn/upload.php', formData, {
                headers: {
                    // Don't set Content-Type here, browser will set it with boundary
                }
            });

            if (response.message === "PGN uploaded successfully") {
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
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message || 'Failed to upload PGN');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">PGN Database</h1>
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
                    >
                        Upload PGN
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pgns.map((pgn) => (
                            <div key={pgn.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#461fa3] mb-2">
                                        {pgn.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{pgn.description}</p>
                                    <div className="text-sm text-gray-500">
                                        <p><span className="font-semibold">Category:</span> {pgn.category}</p>
                                        <p><span className="font-semibold">Created:</span> {new Date(pgn.created_at).toLocaleDateString()}</p>
                                        <p><span className="font-semibold">Access:</span> {pgn.is_public ? 'Public' : 'Private'}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                                    <button
                                        onClick={() => {
                                            setSelectedPGN(pgn);
                                            setShowViewerModal(true);
                                        }}
                                        className="text-[#461fa3] hover:text-[#7646eb]"
                                    >
                                        View Analysis
                                    </button>
                                    <a
                                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(pgn.pgn_content)}`}
                                        download={`${pgn.title}.pgn`}
                                        className="text-[#461fa3] hover:text-[#7646eb]"
                                    >
                                        Download PGN
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Upload Modal */}
                {showUploadModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Upload PGN</h2>
                            <form onSubmit={handleUploadSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        value={uploadForm.title}
                                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        value={uploadForm.description}
                                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        rows={2}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Category</label>
                                    <select
                                        value={uploadForm.category}
                                        onChange={(e) => setUploadForm({...uploadForm, category: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    >
                                        <option value="opening">Opening</option>
                                        <option value="middlegame">Middlegame</option>
                                        <option value="endgame">Endgame</option>
                                        <option value="tactics">Tactics</option>
                                        <option value="strategy">Strategy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">PGN Content</label>
                                    <textarea
                                        value={uploadForm.pgn_content}
                                        onChange={(e) => setUploadForm({...uploadForm, pgn_content: e.target.value})}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3] font-mono"
                                        rows={6}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Upload PGN File</label>
                                    <input
                                        type="file"
                                        accept=".pgn"
                                        onChange={handleFileChange}
                                        className="mt-1 block w-full text-sm text-gray-500
                                            file:mr-4 file:py-2 file:px-4
                                            file:rounded-md file:border-0
                                            file:text-sm file:font-medium
                                            file:bg-[#461fa3] file:text-white
                                            hover:file:bg-[#7646eb]"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={uploadForm.is_public}
                                        onChange={(e) => setUploadForm({...uploadForm, is_public: e.target.checked})}
                                        className="rounded border-gray-300 text-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                    <label htmlFor="is_public" className="ml-2 text-sm text-gray-700">
                                        Make this PGN public to all students
                                    </label>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                    >
                                        Upload
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* PGN Viewer Modal */}
                {showViewerModal && selectedPGN && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-4xl w-full h-[80vh] flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-bold text-[#200e4a]">{selectedPGN.title}</h2>
                                <button
                                    onClick={() => setShowViewerModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto">
                                <iframe
                                    title="Lichess Analysis Board"
                                    src={`https://lichess.org/analysis/pgn/${encodeURIComponent(selectedPGN.pgn_content)}`}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PGNDatabase;
