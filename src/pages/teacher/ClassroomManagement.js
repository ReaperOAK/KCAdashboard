import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../../components/Navigation';
import ApiService from '../../utils/api';

const ClassroomManagement = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showMaterialsModal, setShowMaterialsModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        title: '',
        date: '',
        time: '',
        duration: 60,
        type: 'offline',
        meeting_link: '',
        description: ''
    });
    const [materialForm, setMaterialForm] = useState({
        title: '',
        type: 'document',
        content: '',
        file: null
    });

    const handleScheduleChange = (e) => {
        const { name, value } = e.target;
        setScheduleForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMaterialChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setMaterialForm(prev => ({
                ...prev,
                file: files[0]
            }));
        } else {
            setMaterialForm(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const fetchClassrooms = useCallback(async () => {
        try {
            const response = await ApiService.get('/classroom/get-teacher-classes.php');
            setClassrooms(response.classes);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch classrooms');
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClassrooms();
    }, [fetchClassrooms]);

    const handleScheduleSubmit = async (e) => {
        e.preventDefault();
        try {
            await ApiService.post('/classroom/add-session.php', {
                classroom_id: selectedClass.id,
                ...scheduleForm
            });
            setShowScheduleModal(false);
            fetchClassrooms();
        } catch (error) {
            setError('Failed to schedule class');
        }
    };

    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('classroom_id', selectedClass.id);
            formData.append('title', materialForm.title);
            formData.append('type', materialForm.type);
            formData.append('content', materialForm.content);
            if (materialForm.file) {
                formData.append('file', materialForm.file);
            }

            await ApiService.post('/classroom/add-material.php', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setShowMaterialsModal(false);
            fetchClassrooms();
        } catch (error) {
            setError('Failed to upload material');
        }
    };

    return (
        <div className="min-h-screen bg-[#f3f1f9]">
            <Navigation />
            <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-[#200e4a]">Classroom Management</h1>
                </div>

                {loading ? (
                    <div className="text-center py-8">Loading...</div>
                ) : error ? (
                    <div className="text-red-500 py-8">{error}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {classrooms.map((classroom) => (
                            <div key={classroom.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-[#461fa3] mb-2">
                                        {classroom.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{classroom.description}</p>
                                    <div className="text-sm text-gray-500">
                                        <p><span className="font-semibold">Students:</span> {classroom.student_count}</p>
                                        <p><span className="font-semibold">Next Class:</span> {classroom.next_session || 'Not scheduled'}</p>
                                    </div>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t flex justify-between">
                                    <button
                                        onClick={() => {
                                            setSelectedClass(classroom);
                                            setShowScheduleModal(true);
                                        }}
                                        className="text-[#461fa3] hover:text-[#7646eb]"
                                    >
                                        Schedule Class
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSelectedClass(classroom);
                                            setShowMaterialsModal(true);
                                        }}
                                        className="text-[#461fa3] hover:text-[#7646eb]"
                                    >
                                        Add Materials
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Schedule Modal */}
                {showScheduleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Schedule Class</h2>
                            <form onSubmit={handleScheduleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={scheduleForm.title}
                                        onChange={handleScheduleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={scheduleForm.date}
                                            onChange={handleScheduleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Time</label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={scheduleForm.time}
                                            onChange={handleScheduleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            name="duration"
                                            value={scheduleForm.duration}
                                            onChange={handleScheduleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Type</label>
                                        <select
                                            name="type"
                                            value={scheduleForm.type}
                                            onChange={handleScheduleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        >
                                            <option value="offline">Offline</option>
                                            <option value="online">Online</option>
                                        </select>
                                    </div>
                                </div>
                                {scheduleForm.type === 'online' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Meeting Link</label>
                                        <input
                                            type="url"
                                            name="meeting_link"
                                            value={scheduleForm.meeting_link}
                                            onChange={handleScheduleChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <textarea
                                        name="description"
                                        value={scheduleForm.description}
                                        onChange={handleScheduleChange}
                                        rows={3}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    />
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowScheduleModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                                    >
                                        Schedule
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Materials Modal */}
                {showMaterialsModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-xl p-6 max-w-lg w-full">
                            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">Add Study Material</h2>
                            <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={materialForm.title}
                                        onChange={handleMaterialChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        name="type"
                                        value={materialForm.type}
                                        onChange={handleMaterialChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                    >
                                        <option value="document">Document</option>
                                        <option value="video">Video Link</option>
                                        <option value="assignment">Assignment</option>
                                    </select>
                                </div>
                                {materialForm.type === 'video' ? (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Video URL</label>
                                        <input
                                            type="url"
                                            name="content"
                                            value={materialForm.content}
                                            onChange={handleMaterialChange}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Upload File</label>
                                        <input
                                            type="file"
                                            onChange={handleMaterialChange}
                                            className="mt-1 block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-medium
                                                file:bg-[#461fa3] file:text-white
                                                hover:file:bg-[#7646eb]"
                                        />
                                    </div>
                                )}
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowMaterialsModal(false)}
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
            </div>
        </div>
    );
};

export default ClassroomManagement;
