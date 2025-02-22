import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'beginner',
    schedule: JSON.stringify({
      days: [],
      time: '09:00',
      duration: 60
    }),
    max_students: 10,
    teacher_id: '',
    status: 'active'
  });

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBatches();
      if (response.success && response.batches) {
        setBatches(response.batches);
      } else {
        throw new Error(response.message || 'Failed to fetch batches');
      }
    } catch (error) {
      console.error('Failed to fetch batches:', error);
      // Consider adding a toast notification here
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await ApiService.get('/users/get-teachers.php');
      if (response.success && response.teachers) {
        setTeachers(response.teachers);
      } else {
        throw new Error(response.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
      // Consider adding a toast notification here
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate schedule
      if (!formData.schedule) {
        throw new Error('Schedule is required');
      }

      const response = selectedBatch 
        ? await ApiService.updateBatch(selectedBatch.id, formData)
        : await ApiService.createBatch(formData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to save batch');
      }

      setShowModal(false);
      fetchBatches();
      resetForm();
    } catch (error) {
      console.error('Failed to save batch:', error);
      alert(error.message); // Show error to user
    }
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setFormData({
      name: batch.name,
      description: batch.description,
      level: batch.level,
      schedule: batch.schedule,
      max_students: batch.max_students,
      teacher_id: batch.teacher_id,
      status: batch.status
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedBatch(null);
    setFormData({
      name: '',
      description: '',
      level: 'beginner',
      schedule: JSON.stringify({
        days: [],
        time: '09:00',
        duration: 60
      }),
      max_students: 10,
      teacher_id: '',
      status: 'active'
    });
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#200e4a]">Batch Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#461fa3] text-white px-4 py-2 rounded-lg hover:bg-[#7646eb]"
        >
          Create New Batch
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id}>
                  <td className="px-6 py-4">{batch.name}</td>
                  <td className="px-6 py-4">{batch.teacher_name}</td>
                  <td className="px-6 py-4 capitalize">{batch.level}</td>
                  <td className="px-6 py-4">{batch.current_students}/{batch.max_students}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      batch.status === 'active' ? 'bg-green-100 text-green-800' :
                      batch.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="text-[#461fa3] hover:text-[#7646eb] mr-3"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-[#200e4a] mb-4">
              {selectedBatch ? 'Edit Batch' : 'Create New Batch'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <select
                    value={formData.teacher_id}
                    onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Schedule</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const schedule = JSON.parse(formData.schedule || '{"days":[]}');
                        return (
                          <button
                            key={day}
                            type="button"
                            className={`px-2 py-1 rounded ${
                              schedule.days.includes(day)
                                ? 'bg-[#461fa3] text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                            onClick={() => {
                              const currentSchedule = JSON.parse(formData.schedule || '{"days":[]}');
                              const newDays = currentSchedule.days.includes(day)
                                ? currentSchedule.days.filter(d => d !== day)
                                : [...currentSchedule.days, day];
                              setFormData({
                                ...formData,
                                schedule: JSON.stringify({
                                  ...currentSchedule,
                                  days: newDays
                                })
                              });
                            }}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600">Time</label>
                        <input
                          type="time"
                          value={JSON.parse(formData.schedule || '{"time":"09:00"}').time}
                          onChange={(e) => {
                            const currentSchedule = JSON.parse(formData.schedule || '{"days":[],"time":"09:00","duration":60}');
                            setFormData({
                              ...formData,
                              schedule: JSON.stringify({
                                ...currentSchedule,
                                time: e.target.value
                              })
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Duration (minutes)</label>
                        <input
                          type="number"
                          min="30"
                          step="30"
                          value={JSON.parse(formData.schedule || '{"duration":60}').duration}
                          onChange={(e) => {
                            const currentSchedule = JSON.parse(formData.schedule || '{"days":[],"time":"09:00","duration":60}');
                            setFormData({
                              ...formData,
                              schedule: JSON.stringify({
                                ...currentSchedule,
                                duration: parseInt(e.target.value)
                              })
                            });
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Max Students</label>
                  <input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) => setFormData({...formData, max_students: parseInt(e.target.value)})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#461fa3] hover:bg-[#7646eb]"
                >
                  {selectedBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchManagement;
