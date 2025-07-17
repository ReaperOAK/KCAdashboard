

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
    <main className="min-h-screen bg-background-light p-2 sm:p-6 flex flex-col animate-fade-in">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header & Actions */}
        <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <button
              onClick={handleBack}
              className="mb-1 flex items-center text-sm text-secondary hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent transition-colors"
              aria-label="Back to Batches"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="font-medium">Back to Batches</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary break-words drop-shadow-sm transition-colors">
              {batch.name}
            </h1>
          </div>
          <div className="flex flex-row gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg shadow hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6v-6l9.293-9.293a1 1 0 0 0-1.414-1.414L9 11z" /></svg>
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 transition-all duration-200 w-full sm:w-auto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              <span>Delete</span>
            </button>
          </div>
        </section>

        {/* Batch Info Card */}
        <BatchInfoCard batch={batch} />

        {/* Students Table Section */}
        <section className="bg-white rounded-xl shadow-lg border border-gray-light overflow-hidden transition-all duration-200 mb-8">
          <header className="p-4 sm:p-6 border-b border-gray-light flex items-center gap-2">
            <svg className="w-6 h-6 text-accent mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 1 1-8 0M12 7v13" /></svg>
            <h2 className="text-lg sm:text-xl font-bold text-primary mb-0">Students</h2>
          </header>
          <div className="p-4 sm:p-6">
            <StudentsTable students={students} />
          </div>
        </section>
      </div>
      {/* Edit Modal */}
      <EditBatchModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleEdit}
      />
    </main>
  );
};

export default BatchDetail;
