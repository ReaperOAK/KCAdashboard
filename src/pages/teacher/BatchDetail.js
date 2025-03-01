import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import Modal from '../../components/common/Modal';

const BatchDetail = () => {
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: '',
    schedule: '',
    max_students: 10,
    status: 'active'
  });
  
  const { id } = useParams();
  const navigate = useNavigate();

  // Memoize the fetchBatchDetails function with useCallback
  const fetchBatchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBatchDetails(id);
      if (response.success) {
        setBatch(response.batch);
        setFormData({
          name: response.batch.name,
          description: response.batch.description || '',
          level: response.batch.level,
          schedule: response.batch.schedule,
          max_students: response.batch.max_students,
          status: response.batch.status
        });
        
        // Also fetch students for this batch
        const studentsResponse = await ApiService.getBatchStudents(id);
        if (studentsResponse.success) {
          setStudents(studentsResponse.students || []);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch batch details');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while fetching batch details');
      console.error('Error fetching batch details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]); // Add id as a dependency because it's used inside the function

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]); // Now include fetchBatchDetails in the dependency array

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.updateBatch(id, formData);
      if (response.success) {
        setShowEditModal(false);
        fetchBatchDetails(); // Refresh data
      } else {
        throw new Error(response.message || 'Failed to update batch');
      }
    } catch (error) {
      console.error('Error updating batch:', error);
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      try {
        const response = await ApiService.deleteBatch(id);
        if (response.success) {
          navigate('/teacher/batches');
        } else {
          throw new Error(response.message || 'Failed to delete batch');
        }
      } catch (error) {
        console.error('Error deleting batch:', error);
        alert(error.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#461fa3]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-6">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
        <div className="mt-4">
          <button 
            onClick={() => navigate('/teacher/batches')}
            className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
          >
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-[#f3f1f9] p-6">
        <div className="bg-white p-6 rounded-xl">
          <p>Batch not found</p>
          <button 
            onClick={() => navigate('/teacher/batches')}
            className="mt-4 px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
          >
            Back to Batches
          </button>
        </div>
      </div>
    );
  }

  const getBadgeColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1f9] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button 
              onClick={() => navigate('/teacher/batches')}
              className="mb-2 flex items-center text-sm text-[#461fa3] hover:text-[#7646eb]"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Batches
            </button>
            <h1 className="text-3xl font-bold text-[#200e4a]">{batch.name}</h1>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-[#461fa3] text-white rounded-lg hover:bg-[#7646eb]"
            >
              Edit Batch
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete Batch
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-600">{batch.description || 'No description provided.'}</p>
                <div className="mt-4 space-y-2">
                  <p><span className="font-semibold">Level:</span> {batch.level}</p>
                  <p><span className="font-semibold">Schedule:</span> {batch.schedule}</p>
                  <p><span className="font-semibold">Students:</span> {batch.student_count}/{batch.max_students}</p>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-xs ${getBadgeColor(batch.status)}`}>
                  {batch.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-[#200e4a] mb-4">Students</h2>
            {students.length === 0 ? (
              <p className="text-gray-500">No students enrolled in this batch yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(student.joined_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Batch Modal */}
      {showEditModal && (
        <Modal
          title="Edit Batch"
          onClose={() => setShowEditModal(false)}
        >
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Level</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Schedule</label>
                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Students</label>
                <input
                  type="number"
                  name="max_students"
                  value={formData.max_students}
                  onChange={handleChange}
                  min="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#461fa3] focus:ring-[#461fa3]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#461fa3] text-white rounded-md hover:bg-[#7646eb]"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BatchDetail;
