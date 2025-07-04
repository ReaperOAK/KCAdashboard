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
const BatchModal = ({
  open,
  onClose,
  onSubmit,
  initialValues = {},
  mode = 'create',
  teachers = null,
  loading = false,
  error = '',
}) => {
  if (!open) return null;
  return (
    <Modal
      title={mode === 'edit' ? 'Edit Batch' : 'Create New Batch'}
      onClose={onClose}
    >
      <CreateBatchForm
        onClose={onClose}
        onSubmit={onSubmit}
        initialValues={initialValues}
        teachers={teachers}
        mode={mode}
        loading={loading}
        error={error}
      />
    </Modal>
  );
};

export default React.memo(BatchModal);
