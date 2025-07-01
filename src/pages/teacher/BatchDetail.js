
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ApiService from '../../utils/api';
import Modal from '../../components/common/Modal';

// Status badge (theme, accessible)
const StatusBadge = React.memo(function StatusBadge({ status }) {
  const badgeClass = useMemo(() => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-light text-primary';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  }, [status]);
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badgeClass}`} aria-label={`Batch status: ${status}`} role="status">{status}</span>
  );
});

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="min-h-screen bg-background-light p-6 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" aria-label="Loading" />
  </div>
);

// Error alert
const ErrorAlert = ({ error, onBack }) => (
  <div className="min-h-screen bg-background-light p-6">
    <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-lg" role="alert">{error}</div>
    <div className="mt-4">
      <button onClick={onBack} className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent">Back to Batches</button>
    </div>
  </div>
);

// Not found state
const NotFound = ({ onBack }) => (
  <div className="min-h-screen bg-background-light p-6">
    <div className="bg-white p-6 rounded-xl">
      <p>Batch not found</p>
      <button onClick={onBack} className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent">Back to Batches</button>
    </div>
  </div>
);

// Students table
const StudentsTable = React.memo(function StudentsTable({ students }) {
  if (!students.length) return <p className="text-gray-dark">No students enrolled in this batch yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-light" aria-label="Batch students">
        <thead className="bg-background-light">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Joined</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {students.map((student) => (
            <tr key={student.id}>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-primary">{student.full_name}</span></td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-dark">{student.email}</span></td>
              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-dark">{new Date(student.joined_at).toLocaleDateString()}</span></td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-light text-primary'}`}>{student.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

// Batch info card
const BatchInfoCard = React.memo(function BatchInfoCard({ batch }) {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-light overflow-hidden mb-6">
      <div className="p-6 flex justify-between items-start">
        <div>
          <p className="text-gray-dark">{batch.description || 'No description provided.'}</p>
          <div className="mt-4 space-y-2 text-sm text-gray-dark">
            <p><span className="font-semibold">Level:</span> {batch.level}</p>
            <p><span className="font-semibold">Schedule:</span> {batch.schedule}</p>
            <p><span className="font-semibold">Students:</span> {batch.student_count}/{batch.max_students}</p>
          </div>
        </div>
        <StatusBadge status={batch.status} />
      </div>
    </div>
  );
});

// Edit batch modal form
const EditBatchModal = React.memo(function EditBatchModal({ open, onClose, formData, onChange, onSubmit }) {
  if (!open) return null;
  return (
    <Modal title="Edit Batch" onClose={onClose}>
      <form onSubmit={onSubmit} className="space-y-4" aria-label="Edit batch form">
        <div>
          <label className="block text-sm font-medium text-primary">Batch Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
            aria-label="Batch name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={onChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
            aria-label="Batch description"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-primary">Level</label>
            <select
              name="level"
              value={formData.level}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Batch level"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={onChange}
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Batch status"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Schedule</label>
            <input
              type="text"
              name="schedule"
              value={formData.schedule}
              onChange={onChange}
              required
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Batch schedule"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-primary">Max Students</label>
            <input
              type="number"
              name="max_students"
              value={formData.max_students}
              onChange={onChange}
              min="1"
              required
              className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
              aria-label="Max students"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-light rounded-md text-primary hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
});

export const BatchDetail = () => {
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
    status: 'active',
  });
  const { id } = useParams();
  const navigate = useNavigate();

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
          status: response.batch.status,
        });
        const studentsResponse = await ApiService.getBatchStudents(id);
        if (studentsResponse.success) {
          setStudents(studentsResponse.students || []);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch batch details');
      }
    } catch (error) {
      setError(error.message || 'An error occurred while fetching batch details');
      // eslint-disable-next-line no-console
      console.error('Error fetching batch details:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBatchDetails();
  }, [fetchBatchDetails]);

  const handleEdit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const response = await ApiService.updateBatch(id, formData);
      if (response.success) {
        setShowEditModal(false);
        fetchBatchDetails();
      } else {
        throw new Error(response.message || 'Failed to update batch');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error updating batch:', error);
      alert(error.message);
    }
  }, [id, formData, fetchBatchDetails]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this batch? This action cannot be undone.')) {
      try {
        const response = await ApiService.deleteBatch(id);
        if (response.success) {
          navigate('/teacher/batches');
        } else {
          throw new Error(response.message || 'Failed to delete batch');
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting batch:', error);
        alert(error.message);
      }
    }
  }, [id, navigate]);

  const handleBack = useCallback(() => navigate('/teacher/batches'), [navigate]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorAlert error={error} onBack={handleBack} />;
  if (!batch) return <NotFound onBack={handleBack} />;

  return (
    <div className="min-h-screen bg-background-light p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button
              onClick={handleBack}
              className="mb-2 flex items-center text-sm text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Back to Batches"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Batches
            </button>
            <h1 className="text-3xl font-bold text-primary">{batch.name}</h1>
          </div>
          <div className="space-x-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Edit Batch
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Delete Batch
            </button>
          </div>
        </div>
        <BatchInfoCard batch={batch} />
        <div className="bg-white rounded-xl shadow-md border border-gray-light overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Students</h2>
            <StudentsTable students={students} />
          </div>
        </div>
      </div>
      <EditBatchModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleEdit}
      />
    </div>
  );
};

export default BatchDetail;
