import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { BatchesApi } from '../../api/batches';
import BatchList from '../../components/batches/BatchList';
import Modal from '../../components/common/Modal';
import BatchModal from '../../components/batches/BatchModal';
import StudentSearch from '../../components/batches/StudentSearch';

// --- Skeleton Loader ---
const BatchSkeleton = React.memo(() => (
  <div className="flex justify-center items-center h-64" role="status" aria-live="polite">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-accent border-opacity-80" />
  </div>
));

// --- Error Alert ---
const ErrorAlert = React.memo(({ message }) => (
  <div className="w-full max-w-md mx-auto bg-error/10 text-error border border-error p-6 rounded-xl shadow-md flex flex-col items-center mb-4" role="alert">
    <svg className="w-8 h-8 mb-2 text-error" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
    </svg>
    <div className="text-lg font-semibold text-error mb-2 text-center">Error</div>
    <div className="text-base text-error text-center">{message}</div>
  </div>
));

// --- Empty State ---
const EmptyState = React.memo(() => (
  <div className="bg-white rounded-xl p-8 text-center text-gray-dark shadow-md border border-gray-light flex flex-col items-center gap-2">
    <svg className="w-12 h-12 mb-2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" />
    </svg>
    <p className="text-xl font-semibold text-primary mb-1">No batches found</p>
    <p className="text-gray-dark">Create your first batch to get started.</p>
  </div>
));

// --- Manage Students Modal Content ---
const ManageStudentsModal = React.memo(({
  batch, students, addingStudent, selectedStudent,
  onAddStudent, onStudentSelect, onConfirmAddStudent, onCancelAddStudent, onRemoveStudent
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
        <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 0 0-3-3.87M9 20H4v-2a4 4 0 0 1 3-3.87M16 3.13a4 4 0 1 1-8 0M12 7v13" /></svg>
        Current Students <span className="text-base font-normal text-gray-dark">({students.length}/{batch.max_students})</span>
      </h3>
      {!addingStudent && (
        <button
          type="button"
          onClick={onAddStudent}
          className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
            className="inline-flex items-center gap-1 px-3 py-1 border border-gray-light rounded-md text-primary bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmAddStudent}
            disabled={!selectedStudent}
            className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent transition-all disabled:opacity-50"
            aria-disabled={!selectedStudent}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
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
              className="py-3 flex justify-between items-center group"
            >
              <div>
                <p className="font-medium text-primary">{student.full_name}</p>
                <p className="text-sm text-gray-dark">{student.email}</p>
              </div>
              <button
                type="button"
                onClick={() => onRemoveStudent(student.id)}
                className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all"
                aria-label={`Remove ${student.full_name} from batch`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
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
  const { user } = useAuth();
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
      const response = await BatchesApi.getBatches();
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
      const response = await BatchesApi.getBatchStudents(batch.id);
      if (response && response.success) {
        setStudents(response.students || []);
      }
    } catch (err) {
      // Optionally set error state for student fetch
    } finally {
      setShowStudentModal(true);
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
      await BatchesApi.addStudentToBatch(selectedBatch.id, selectedStudent.id);
      const response = await BatchesApi.getBatchStudents(selectedBatch.id);
      if (response && response.success) {
        setStudents(response.students || []);
      }
      setAddingStudent(false);
      setSelectedStudent(null);
      setShowStudentModal(true); // Ensure modal stays open and updates
    } catch (err) {
      alert(err.message || 'Failed to add student');
    }
  }, [selectedBatch, selectedStudent]);

  const handleRemoveStudent = useCallback(async (studentId) => {
    try {
      await BatchesApi.removeStudentFromBatch(selectedBatch.id, studentId);
      const response = await BatchesApi.getBatchStudents(selectedBatch.id);
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
    <main className="min-h-screen bg-background-light p-2 sm:p-6 flex flex-col animate-fade-in">
      <div className="max-w-7xl w-full mx-auto flex-1 flex flex-col">
        <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
          <h1 className="text-3xl font-bold text-primary tracking-tight drop-shadow-sm text-center sm:text-left flex items-center gap-2">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" /></svg>
            Batch Management
          </h1>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent text-base font-semibold shadow-md transition-colors w-full sm:w-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create New Batch
          </button>
        </section>

        <section className="flex-1 flex flex-col">
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
        </section>

        {/* Create/Edit Batch Modal (shared) */}
        {showCreateModal && (
          <BatchModal
            open={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSubmit={async (data) => {
              await BatchesApi.createBatch(data);
              handleCreateSuccess();
            }}
            mode="create"
            currentTeacherId={user && user.role === 'teacher' ? user.id : null}
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
    </main>
  );
}
