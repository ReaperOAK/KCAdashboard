


import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const defaultSchedule = { days: [], time: '09:00', duration: 60 };

const LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const validationSchema = Yup.object({
  name: Yup.string().required('Batch name is required'),
  description: Yup.string().max(500, 'Description too long'),
  level: Yup.string().oneOf(LEVELS.map(l => l.value)),
  max_students: Yup.number().min(1).max(100).required('Max students required'),
  teacher_id: Yup.string().when('teachers', {
    is: (teachers) => !!teachers,
    then: Yup.string().required('Teacher is required'),
    otherwise: Yup.string(),
  }),
  status: Yup.string().oneOf(STATUS_OPTIONS.map(s => s.value)),
  schedule: Yup.string().test('valid-schedule', 'Invalid schedule', value => {
    try {
      const obj = JSON.parse(value);
      return Array.isArray(obj.days) && obj.time && obj.duration;
    } catch {
      return false;
    }
  }),
});

// Error alert for form errors
export const ErrorAlert = React.memo(function ErrorAlert({ error }) {
  if (!error) return null;
  return (
    <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg mb-4" role="alert">
      {error}
    </div>
  );
});

// Schedule picker for batch schedule
export const SchedulePicker = React.memo(function SchedulePicker({ value, onChange }) {
  const schedule = useMemo(() => {
    try {
      return JSON.parse(value) || defaultSchedule;
    } catch {
      return defaultSchedule;
    }
  }, [value]);

  const handleDayToggle = useCallback(
    (day) => {
      const days = schedule.days.includes(day)
        ? schedule.days.filter((d) => d !== day)
        : [...schedule.days, day];
      onChange(JSON.stringify({ ...schedule, days }));
    },
    [onChange, schedule]
  );

  const handleFieldChange = useCallback(
    (field, val) => {
      onChange(JSON.stringify({ ...schedule, [field]: val }));
    },
    [onChange, schedule]
  );

  return (
    <fieldset className="space-y-2" aria-label="Batch schedule">
      <legend className="sr-only">Batch schedule</legend>
      <div className="flex items-center gap-2" role="group" aria-label="Days of week">
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            tabIndex={0}
            aria-pressed={schedule.days.includes(day)}
            aria-label={day}
            className={
              `px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-accent transition-colors ` +
              (schedule.days.includes(day)
                ? 'bg-secondary text-white'
                : 'bg-gray-light text-primary hover:bg-gray-dark hover:text-white')
            }
            onClick={() => handleDayToggle(day)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDayToggle(day);
              }
            }}
          >
            {day}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label htmlFor="schedule-time" className="text-xs text-gray-dark">Time</label>
          <input
            id="schedule-time"
            type="time"
            value={schedule.time || '09:00'}
            onChange={e => handleFieldChange('time', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
            aria-label="Batch time"
          />
        </div>
        <div>
          <label htmlFor="schedule-duration" className="text-xs text-gray-dark">Duration (minutes)</label>
          <input
            id="schedule-duration"
            type="number"
            min="30"
            step="30"
            value={schedule.duration || 60}
            onChange={e => handleFieldChange('duration', parseInt(e.target.value, 10))}
            className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
            aria-label="Batch duration in minutes"
          />
        </div>
      </div>
    </fieldset>
  );
});





export const CreateBatchForm = React.memo(function CreateBatchForm({
  onClose,
  onSubmit,
  initialValues = {},
  teachers = null,
  mode = 'create',
  loading: externalLoading = false,
  error: externalError = ''
}) {
  const [error, setError] = useState('');

  useEffect(() => {
    setError(externalError);
  }, [externalError]);

  const initialFormValues = useMemo(() => ({
    name: '',
    description: '',
    level: 'beginner',
    max_students: 10,
    teacher_id: '',
    status: 'active',
    ...initialValues,
    schedule: initialValues.schedule
      ? (typeof initialValues.schedule === 'string' ? initialValues.schedule : JSON.stringify(initialValues.schedule))
      : JSON.stringify(defaultSchedule)
  }), [initialValues]);

  const handleFormikSubmit = useCallback(
    async (values, { setSubmitting }) => {
      setError('');
      try {
        await onSubmit({ ...values, schedule: values.schedule });
        onClose();
      } catch (err) {
        setError(err.message || 'Failed to save batch');
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, onClose]
  );

  // Form fields as subcomponents for clarity and maintainability
  const NameField = () => (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-primary">Batch Name</label>
      <Field
        id="name"
        name="name"
        type="text"
        required
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-required="true"
        aria-label="Batch name"
      />
      <ErrorMessage name="name" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const DescriptionField = () => (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-primary">Description</label>
      <Field
        as="textarea"
        id="description"
        name="description"
        rows={3}
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Batch description"
      />
      <ErrorMessage name="description" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const LevelField = () => (
    <div>
      <label htmlFor="level" className="block text-sm font-medium text-primary">Level</label>
      <Field
        as="select"
        id="level"
        name="level"
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Batch level"
      >
        {LEVELS.map(l => (
          <option key={l.value} value={l.value}>{l.label}</option>
        ))}
      </Field>
      <ErrorMessage name="level" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const MaxStudentsField = () => (
    <div>
      <label htmlFor="max_students" className="block text-sm font-medium text-primary">Max Students</label>
      <Field
        id="max_students"
        name="max_students"
        type="number"
        min={1}
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Maximum students"
      />
      <ErrorMessage name="max_students" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const TeacherField = () => (
    <div>
      <label htmlFor="teacher_id" className="block text-sm font-medium text-primary">Teacher</label>
      <Field
        as="select"
        id="teacher_id"
        name="teacher_id"
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Teacher"
        required
      >
        <option value="">Select Teacher</option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.id}>
            {teacher.full_name}
          </option>
        ))}
      </Field>
      <ErrorMessage name="teacher_id" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const ScheduleField = ({ values, setFieldValue }) => (
    <div>
      <label className="block text-sm font-medium text-primary">Schedule</label>
      <SchedulePicker
        value={values.schedule}
        onChange={val => setFieldValue('schedule', val)}
      />
      <ErrorMessage name="schedule" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const StatusField = () => (
    <div>
      <label htmlFor="status" className="block text-sm font-medium text-primary">Status</label>
      <Field
        as="select"
        id="status"
        name="status"
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Batch status"
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Field>
      <ErrorMessage name="status" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  );

  const Actions = ({ isSubmitting }) => (
    <div className="flex justify-end space-x-3 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-gray-light rounded-md text-primary hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting || externalLoading}
        className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
        aria-busy={isSubmitting || externalLoading}
      >
        {isSubmitting || externalLoading
          ? (mode === 'edit' ? 'Saving...' : 'Creating...')
          : (mode === 'edit' ? 'Save Changes' : 'Create Batch')}
      </button>
    </div>
  );

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={handleFormikSubmit}
      enableReinitialize
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form className="space-y-4" aria-label="Create or edit batch form">
          <ErrorAlert error={error} />
          <NameField />
          <DescriptionField />
          <div className="grid grid-cols-2 gap-4">
            <LevelField />
            <MaxStudentsField />
          </div>
          {teachers && <TeacherField />}
          <ScheduleField values={values} setFieldValue={setFieldValue} />
          {values.status !== undefined && <StatusField />}
          <Actions isSubmitting={isSubmitting} />
        </Form>
      )}
    </Formik>
  );
});

export default CreateBatchForm;
