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
      className="max-w-lg w-full px-2 sm:px-0 py-0 bg-background-light dark:bg-background-dark rounded-2xl shadow-2xl border border-gray-light animate-fade-in focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-300"
      overlayClassName="bg-black/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-label={mode === 'edit' ? 'Edit Batch Modal' : 'Create Batch Modal'}
    >
      <div className="p-4 sm:p-6">
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
      </div>
    </Modal>
  );
});

export default BatchModal;
