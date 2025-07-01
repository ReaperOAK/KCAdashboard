
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ApiService from '../../utils/api';
import Modal from '../../components/common/Modal';
import CreateBatchForm from '../../components/batches/CreateBatchForm';

// Status badge (memoized)
const StatusBadge = React.memo(function StatusBadge({ status }) {
  const badgeClass = useMemo(() => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-light text-primary';
    }
  }, [status]);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>{status}</span>
  );
});

// Table row (memoized)
const BatchTableRow = React.memo(function BatchTableRow({ batch, onEdit }) {
  return (
    <tr>
      <td className="px-6 py-4">{batch.name}</td>
      <td className="px-6 py-4">{batch.teacher_name}</td>
      <td className="px-6 py-4 capitalize">{batch.level}</td>
      <td className="px-6 py-4">{batch.current_students}/{batch.max_students}</td>
      <td className="px-6 py-4"><StatusBadge status={batch.status} /></td>
      <td className="px-6 py-4">
        <button
          onClick={() => onEdit(batch)}
          className="text-secondary hover:text-accent mr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={`Edit batch ${batch.name}`}
        >
          Edit
        </button>
      </td>
    </tr>
  );
});

// Table (memoized)
const BatchTable = React.memo(function BatchTable({ batches, onEdit }) {
  if (!batches.length) {
    return <div className="text-center py-8 text-gray-dark">No batches found.</div>;
  }
  return (
    <div className="bg-white rounded-xl shadow-md overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-light">
        <thead className="bg-background-light">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase">Teacher</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase">Level</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase">Students</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-dark uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-light">
          {batches.map((batch) => (
            <BatchTableRow key={batch.id} batch={batch} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const fetchBatches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getBatches();
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
      const response = await ApiService.get('/users/get-teachers.php');
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
      response = await ApiService.updateBatch(selectedBatch.id, data);
    } else {
      response = await ApiService.createBatch(data);
    }
    if (!response.success) {
      throw new Error(response.message || 'Failed to save batch');
    }
    fetchBatches();
    setSelectedBatch(null);
    setShowModal(false);
  }, [selectedBatch, fetchBatches]);

  return (
    <div className="min-h-screen bg-background-light p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Batch Management</h1>
        <button
          onClick={handleCreate}
          className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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
