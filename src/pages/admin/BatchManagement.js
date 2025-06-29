import React, { useState, useEffect } from 'react';

import ApiService from '../../utils/api';
import Modal from '../../components/common/Modal';
import CreateBatchForm from '../../components/batches/CreateBatchForm';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);


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



  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const resetForm = () => {
    setSelectedBatch(null);
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
        <Modal
          title={selectedBatch ? 'Edit Batch' : 'Create New Batch'}
          onClose={() => setShowModal(false)}
        >
          <CreateBatchForm
            mode={selectedBatch ? 'edit' : 'create'}
            initialValues={selectedBatch ? selectedBatch : {}}
            teachers={teachers}
            onClose={() => setShowModal(false)}
            onSubmit={async (data) => {
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
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default BatchManagement;
