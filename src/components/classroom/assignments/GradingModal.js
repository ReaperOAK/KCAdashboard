import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { XCircle, CheckCircle2 } from 'lucide-react';

const GradingModal = React.memo(({ open, onClose, onSubmit, initialValues, studentName }) => {
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[9999] " role="dialog" aria-modal="true">
      <div className="bg-background-light dark:bg-background-dark rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative flex flex-col gap-2" tabIndex={-1}>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-dark dark:text-gray-light hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="Close grading modal"
        >
          <XCircle className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-semibold text-primary dark:text-text-light mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6 text-accent" /> Grade Submission - {studentName}
        </h2>
        <Formik
          initialValues={initialValues}
          validationSchema={Yup.object({
            grade: Yup.number().min(0).max(100).required('Grade is required'),
            feedback: Yup.string().max(1000, 'Feedback too long'),
          })}
          onSubmit={onSubmit}
          enableReinitialize
        >
          {({ isSubmitting, isValid, dirty }) => (
            <Form className="space-y-5">
              <div>
                <label htmlFor="grade" className="block text-sm font-medium text-gray-dark dark:text-gray-light">Grade</label>
                <Field
                  id="grade"
                  name="grade"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-light dark:border-gray-dark shadow-sm focus:border-secondary focus:ring-secondary bg-white dark:bg-background-dark text-text-dark dark:text-text-light"
                  placeholder="Enter grade (0-100)"
                  aria-required="true"
                />
                <ErrorMessage name="grade" component="div" className="text-red-600 text-xs mt-1" />
              </div>
              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-dark dark:text-gray-light">Feedback</label>
                <Field
                  as="textarea"
                  id="feedback"
                  name="feedback"
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-light dark:border-gray-dark shadow-sm focus:border-secondary focus:ring-secondary bg-white dark:bg-background-dark text-text-dark dark:text-text-light"
                  placeholder="Provide feedback for the student..."
                  aria-required="false"
                />
                <ErrorMessage name="feedback" component="div" className="text-red-600 text-xs mt-1" />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-light dark:border-gray-dark rounded-md shadow-sm text-sm font-medium text-gray-dark dark:text-gray-light bg-background-light dark:bg-background-dark hover:bg-gray-light dark:hover:bg-gray-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid || !dirty}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:bg-secondary focus:bg-secondary disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-all"
                >
                  Submit Grade
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
});

export default GradingModal;
