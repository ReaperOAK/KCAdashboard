



import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { CheckCircle, Info, Users, User, Calendar, Clock, Hash, BookText } from 'lucide-react';

const defaultSchedule = { days: [], time: '09:00', duration: 60 };

const LEVELS = Object.freeze([
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]);

const STATUS_OPTIONS = Object.freeze([
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
]);

const DAYS = Object.freeze(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);

const validationSchema = Yup.object({
  name: Yup.string().required('Batch name is required'),
  description: Yup.string().max(500, 'Description too long'),
  level: Yup.string().oneOf(LEVELS.map(l => l.value)),
  max_students: Yup.number().min(1).max(100).required('Max students required'),
  teacher_id: Yup.string().required('Teacher is required'),
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


// Error alert for form errors (with icon and animation)
export const ErrorAlert = React.memo(function ErrorAlert({ error }) {
  if (!error) return null;
  return (
    <div className="bg-error/10 text-error border border-error p-3 rounded-lg mb-4 flex items-center gap-2 animate-fade-in" role="alert">
      <Info className="w-5 h-5 text-error flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
});


// Schedule picker for batch schedule (with icons and improved accessibility)
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
    <fieldset className="space-y-4" aria-label="Batch schedule">
      <legend className="sr-only">Batch schedule</legend>
      <label className="text-sm font-medium text-primary flex items-center gap-1"><Calendar className="w-4 h-4" /> Select Days</label>
      <div
        className="grid grid-cols-7 gap-2 w-full mb-2"
        role="group"
        aria-label="Days of week"
      >
        {DAYS.map((day) => (
          <button
            key={day}
            type="button"
            tabIndex={0}
            aria-pressed={schedule.days.includes(day)}
            aria-label={day}
            className={
              `w-full py-2 rounded-lg font-semibold shadow-sm border transition-all focus:outline-none focus:ring-2 focus:ring-accent text-center ` +
              (schedule.days.includes(day)
                ? 'bg-secondary text-white border-secondary scale-105 drop-shadow-md animate-bounce-in'
                : 'bg-gray-100 text-primary border-gray-300 hover:bg-accent hover:text-white')
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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <div className="flex-1">
          <label htmlFor="schedule-time" className="block text-xs font-medium text-gray-dark mb-1 flex items-center gap-1"><Clock className="w-4 h-4" /> Time</label>
          <input
            id="schedule-time"
            type="time"
            value={schedule.time || '09:00'}
            onChange={e => handleFieldChange('time', e.target.value)}
            className="block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary px-2 py-2 bg-white"
            aria-label="Batch time"
          />
          <span className="text-xs text-gray-dark">Start time for the batch session.</span>
        </div>
        <div className="flex-1">
          <label htmlFor="schedule-duration" className="block text-xs font-medium text-gray-dark mb-1 flex items-center gap-1"><Hash className="w-4 h-4" /> Duration (minutes)</label>
          <input
            id="schedule-duration"
            type="number"
            min="30"
            step="30"
            value={schedule.duration || 60}
            onChange={e => handleFieldChange('duration', parseInt(e.target.value, 10))}
            className="block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary px-2 py-2 bg-white"
            aria-label="Batch duration in minutes"
          />
          <span className="text-xs text-gray-dark">Typical session: 30-120 min.</span>
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
  currentTeacherId = null,
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
    teacher_id: (teachers === null && currentTeacherId) ? currentTeacherId : '',
    status: 'active',
    ...initialValues,
    schedule: initialValues.schedule
      ? (typeof initialValues.schedule === 'string' ? initialValues.schedule : JSON.stringify(initialValues.schedule))
      : JSON.stringify(defaultSchedule)
  }), [initialValues, teachers, currentTeacherId]);

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

  // Memoized field components for performance
  const NameField = React.useMemo(() => () => (
    <div>
      <label htmlFor="name" className="block text-sm font-medium text-primary flex items-center gap-1"><BookText className="w-4 h-4" /> Batch Name</label>
      <Field
        id="name"
        name="name"
        type="text"
        required
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-required="true"
        aria-label="Batch name"
      />
      <span className="text-xs text-gray-dark">Give your batch a unique, descriptive name.</span>
      <ErrorMessage name="name" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  ), []);

  const DescriptionField = React.useMemo(() => () => (
    <div>
      <label htmlFor="description" className="block text-sm font-medium text-primary flex items-center gap-1"><Info className="w-4 h-4" /> Description</label>
      <Field
        as="textarea"
        id="description"
        name="description"
        rows={3}
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Batch description"
      />
      <span className="text-xs text-gray-dark">Optional. Max 500 characters.</span>
      <ErrorMessage name="description" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  ), []);

  const LevelField = React.useMemo(() => () => (
    <div>
      <label htmlFor="level" className="block text-sm font-medium text-primary flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Level</label>
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
      <span className="text-xs text-gray-dark">Choose the skill level for this batch.</span>
      <ErrorMessage name="level" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  ), []);

  const MaxStudentsField = React.useMemo(() => () => (
    <div>
      <label htmlFor="max_students" className="block text-sm font-medium text-primary flex items-center gap-1"><Users className="w-4 h-4" /> Max Students</label>
      <Field
        id="max_students"
        name="max_students"
        type="number"
        min={1}
        className="mt-1 block w-full rounded-md border-gray-light shadow-sm focus:border-secondary focus:ring-secondary"
        aria-label="Maximum students"
      />
      <span className="text-xs text-gray-dark">Maximum number of students allowed (1-100).</span>
      <ErrorMessage name="max_students" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  ), []);

  const TeacherField = React.useMemo(() => () => (
    <div>
      <label htmlFor="teacher_id" className="block text-sm font-medium text-primary flex items-center gap-1"><User className="w-4 h-4" /> Teacher</label>
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
      <span className="text-xs text-gray-dark">Assign a teacher to this batch.</span>
      <ErrorMessage name="teacher_id" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  ), [teachers]);

  const StatusField = React.useMemo(() => () => (
    <div>
      <label htmlFor="status" className="block text-sm font-medium text-primary flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Status</label>
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
      <span className="text-xs text-gray-dark">Set the current status of this batch.</span>
      <ErrorMessage name="status" component="div" className="text-xs text-red-600 mt-1" />
    </div>
  ), []);

  const Actions = React.useMemo(() => ({ isSubmitting }) => (
    <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-2 sm:pt-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 border border-gray-light rounded-md text-primary bg-white hover:bg-gray-light focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 w-full sm:w-auto flex items-center gap-2"
      >
        <span>Cancel</span>
      </button>
      <button
        type="submit"
        disabled={isSubmitting || externalLoading}
        className="px-4 py-2 bg-accent text-white rounded-md shadow-md hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 w-full sm:w-auto flex items-center gap-2"
        aria-busy={isSubmitting || externalLoading}
      >
        {isSubmitting || externalLoading
          ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-1 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              {mode === 'edit' ? 'Saving...' : 'Creating...'}
            </>
          )
          : (
            <>
              <CheckCircle className="w-4 h-4" />
              {mode === 'edit' ? 'Save Changes' : 'Create Batch'}
            </>
          )}
      </button>
    </div>
  ), [externalLoading, mode, onClose]);

  return (
    <Formik
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={handleFormikSubmit}
      enableReinitialize
    >
      {({ values, isSubmitting, setFieldValue }) => (
        <Form className="space-y-3 sm:space-y-4 p-2 sm:p-4 bg-background-light dark:bg-background-dark rounded-xl shadow-md animate-fade-in" aria-label="Create or edit batch form">
          <ErrorAlert error={error} />
          <h2 className="text-2xl text-primary font-semibold mb-2 text-center flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            {mode === 'edit' ? 'Edit Batch' : 'Create New Batch'}
          </h2>
          <NameField />
          <DescriptionField />
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-4">
            <LevelField />
            <MaxStudentsField />
          </div>
          {teachers && <TeacherField />}
          <SchedulePicker value={values.schedule} onChange={val => setFieldValue('schedule', val)} />
          {values.status !== undefined && <StatusField />}
          <Actions isSubmitting={isSubmitting} />
        </Form>
      )}
    </Formik>
  );
});

export default CreateBatchForm;
