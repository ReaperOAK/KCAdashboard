import React from 'react';
import Modal from '../common/Modal';
import CreateBatchForm from './CreateBatchForm';

/**
 * BatchModal - shared modal for create/edit batch
 * @param {object} props
 * @param {boolean} props.open - Whether modal is open
 * @param {function} props.onClose - Close handler
 * @param {function} props.onSubmit - Submit handler
 * @param {object} [props.initialValues] - Initial values for the form
 * @param {string} [props.mode] - 'create' or 'edit'
 * @param {array} [props.teachers] - List of teachers (optional)
 * @param {boolean} [props.loading] - Loading state (optional)
 * @param {string} [props.error] - Error message (optional)
 */
const BatchModal = React.memo(function BatchModal({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  mode = 'create',
  teachers = null,
  loading = false,
  error = '',
  currentTeacherId = null,
}) {
  if (!open) return null;
  return (
    <Modal
      title={mode === 'edit' ? 'Edit Batch' : 'Create New Batch'}
      onClose={onClose}
      className="max-w-lg w-full p-0 sm:p-0 bg-background-light rounded-2xl shadow-2xl border border-gray-light animate-fade-in"
      overlayClassName="bg-black/40 backdrop-blur-sm"
    >
      <CreateBatchForm
        onClose={onClose}
        onSubmit={onSubmit}
        initialValues={initialValues}
        teachers={teachers}
        currentTeacherId={currentTeacherId}
        mode={mode}
        loading={loading}
        error={error}
      />
    </Modal>
  );
});

export default BatchModal;
