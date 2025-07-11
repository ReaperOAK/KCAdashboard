
import React, { useState, useEffect, useCallback } from 'react';
import { BatchesApi } from '../../api/batches';
import { UsersApi } from '../../api/users';
import Modal from '../../components/common/Modal';
import CreateBatchForm from '../../components/batches/CreateBatchForm';
import BatchTable from '../../components/batches/BatchTable';

function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await BatchesApi.getBatches();
      if (response.success && response.batches) {
        setBatches(response.batches);
      } else {
        throw new Error(response.message || 'Failed to fetch batches');
      }
    } catch (error) {
      // Optionally add toast notification here
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const response = await UsersApi.getTeachers();
      if (response.success && response.teachers) {
        setTeachers(response.teachers);
      } else {
        throw new Error(response.message || 'Failed to fetch teachers');
      }
    } catch (error) {
      // Optionally add toast notification here
    }
  }, []);

  useEffect(() => {
    fetchBatches();
    fetchTeachers();
  }, [fetchBatches, fetchTeachers]);

  const handleEdit = useCallback((batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedBatch(null);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setSelectedBatch(null);
  }, []);

  const handleFormSubmit = useCallback(async (data) => {
    let response;
    if (selectedBatch) {
      response = await BatchesApi.updateBatch(selectedBatch.id, data);
    } else {
      response = await BatchesApi.createBatch(data);
    }
    if (!response.success) {
      throw new Error(response.message || 'Failed to save batch');
    }
    fetchBatches();
    setSelectedBatch(null);
    setShowModal(false);
  }, [selectedBatch, fetchBatches]);

  return (
    <div className="min-h-screen bg-background-light px-2 sm:px-4 md:px-8 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Batch Management</h1>
        <button
          onClick={handleCreate}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent w-full sm:w-auto"
          aria-label="Create new batch"
        >
          Create New Batch
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8 text-gray-dark">Loading...</div>
      ) : (
        <BatchTable batches={batches} onEdit={handleEdit} />
      )}
      {showModal && (
        <Modal
          title={selectedBatch ? 'Edit Batch' : 'Create New Batch'}
          onClose={handleModalClose}
        >
          <CreateBatchForm
            mode={selectedBatch ? 'edit' : 'create'}
            initialValues={selectedBatch ? selectedBatch : {}}
            teachers={teachers}
            onClose={handleModalClose}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}
    </div>
  );
}

export default React.memo(BatchManagement);
