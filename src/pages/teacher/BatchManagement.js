import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../utils/api';
import BatchList from '../../components/batches/BatchList';
import Modal from '../../components/common/Modal';
import BatchModal from '../../components/batches/BatchModal';
import StudentSearch from '../../components/batches/StudentSearch';

// --- Skeleton Loader ---
const BatchSkeleton = React.memo(() => (
  <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary" />
  </div>
));

// --- Error Alert ---
const ErrorAlert = React.memo(({ message }) => (
  <div className="bg-red-700 border border-red-800 text-white p-4 rounded-lg mb-4" role="alert">
    {message}
  </div>
));

// --- Empty State ---
const EmptyState = React.memo(() => (
  <div className="bg-white rounded-xl p-8 text-center text-gray-dark">
    <p>No batches found. Create your first batch to get started.</p>
  </div>
));

// --- Manage Students Modal Content ---
const ManageStudentsModal = React.memo(({
  batch, students, addingStudent, selectedStudent,
  onAddStudent, onStudentSelect, onConfirmAddStudent, onCancelAddStudent, onRemoveStudent
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">
        Current Students ({students.length}/{batch.max_students})
      </h3>
      {!addingStudent && (
        <button
          type="button"
          onClick={onAddStudent}
          className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent"
        >
          Add Student
        </button>
      )}
    </div>
    {addingStudent ? (
      <div className="space-y-4">
        <StudentSearch
          onSelectStudent={onStudentSelect}
          maxStudents={batch.max_students}
          currentCount={students.length}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelAddStudent}
            className="px-3 py-1 border border-gray-light rounded-md text-gray-dark hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmAddStudent}
            disabled={!selectedStudent}
            className="px-3 py-1 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            aria-disabled={!selectedStudent}
          >
            Add Selected Student
          </button>
        </div>
      </div>
    ) : (
      students.length === 0 ? (
        <p className="text-center text-gray-dark py-4">No students enrolled in this batch yet.</p>
      ) : (
        <div className="divide-y">
          {students.map(student => (
            <div
              key={student.id}
              className="py-3 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">{student.full_name}</p>
                <p className="text-sm text-gray-dark">{student.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveStudent(student.id)}
                className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-600"
                aria-label={`Remove ${student.full_name} from batch`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )
    )}
  </div>
));

// --- Main Component ---
export default function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [addingStudent, setAddingStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.getBatches();
      if (response && response.success) {
        setBatches(response.batches || []);
      } else {
        throw new Error(response?.message || 'Failed to fetch batches');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching batches');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches();
  }, [fetchBatches]);

  const handleManageStudents = useCallback(async (batch) => {
    setSelectedBatch(batch);
    try {
      const response = await ApiService.getBatchStudents(batch.id);
      if (response && response.success) {
        setStudents(response.students || []);
      }
      setShowStudentModal(true);
    } catch (err) {
      // Optionally set error state for student fetch
    }
  }, []);

  const handleAddStudent = useCallback(() => {
    setAddingStudent(true);
  }, []);

  const handleStudentSelect = useCallback((student) => {
    setSelectedStudent(student);
  }, []);

  const handleConfirmAddStudent = useCallback(async () => {
    if (!selectedStudent) return;
    try {
      await ApiService.addStudentToBatch(selectedBatch.id, selectedStudent.id);
      const response = await ApiService.getBatchStudents(selectedBatch.id);
      if (response && response.success) {
        setStudents(response.students || []);
      }
      setAddingStudent(false);
      setSelectedStudent(null);
    } catch (err) {
      alert(err.message || 'Failed to add student');
    }
  }, [selectedBatch, selectedStudent]);

  const handleRemoveStudent = useCallback(async (studentId) => {
    try {
      await ApiService.removeStudentFromBatch(selectedBatch.id, studentId);
      const response = await ApiService.getBatchStudents(selectedBatch.id);
      if (response && response.success) {
        setStudents(response.students || []);
      }
    } catch (err) {
      alert(err.message || 'Failed to remove student');
    }
  }, [selectedBatch]);

  const handleCreateSuccess = useCallback(() => {
    fetchBatches();
    setShowCreateModal(false);
  }, [fetchBatches]);

  const handleCancelAddStudent = useCallback(() => {
    setAddingStudent(false);
    setSelectedStudent(null);
  }, []);

  return (
    <div className="min-h-screen bg-background-light p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-primary">Batch Management</h1>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="px-3 sm:px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base w-full sm:w-auto"
          >
            Create New Batch
          </button>
        </div>

        {loading ? (
          <BatchSkeleton />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : batches.length === 0 ? (
          <EmptyState />
        ) : (
          <BatchList
            batches={batches}
            onManageStudents={handleManageStudents}
          />
        )}

        {/* Create/Edit Batch Modal (shared) */}
        {showCreateModal && (
          <BatchModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (data) => {
              await ApiService.createBatch(data);
              handleCreateSuccess();
            }}
            mode="create"
          />
        )}

        {/* Manage Students Modal */}
        {showStudentModal && selectedBatch && (
          <Modal
            title={`Manage Students - ${selectedBatch.name}`}
            onClose={() => {
              setShowStudentModal(false);
              setAddingStudent(false);
              setSelectedStudent(null);
            }}
          >
            <ManageStudentsModal
              batch={selectedBatch}
              students={students}
              addingStudent={addingStudent}
              selectedStudent={selectedStudent}
              onAddStudent={handleAddStudent}
              onStudentSelect={handleStudentSelect}
              onConfirmAddStudent={handleConfirmAddStudent}
              onCancelAddStudent={handleCancelAddStudent}
              onRemoveStudent={handleRemoveStudent}
            />
          </Modal>
        )}
      </div>
    </div>
  );
}
