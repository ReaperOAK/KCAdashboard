

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BatchesApi } from '../../api/batches';
import LoadingSkeleton from '../../components/batches/LoadingSkeleton';
import ErrorAlert from '../../components/batches/ErrorAlert';
import NotFound from '../../components/batches/NotFound';
import StudentsTable from '../../components/batches/StudentsTable';
import BatchInfoCard from '../../components/batches/BatchInfoCard';
import EditBatchModal from '../../components/batches/EditBatchModal';

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
      const response = await BatchesApi.getBatchDetails(id);
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
        const studentsResponse = await BatchesApi.getBatchStudents(id);
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
      const response = await BatchesApi.updateBatch(id, formData);
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
        const response = await BatchesApi.deleteBatch(id);
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
    <div className="min-h-screen bg-background-light p-2 sm:p-6">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
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
            <h1 className="text-2xl sm:text-3xl font-bold text-primary break-words">{batch.name}</h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 w-full sm:w-auto">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent w-full sm:w-auto"
            >
              Edit Batch
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
            >
              Delete Batch
            </button>
          </div>
        </div>
        <BatchInfoCard batch={batch} />
        <div className="bg-white rounded-xl shadow-md border border-gray-light overflow-hidden">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-4">Students</h2>
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
