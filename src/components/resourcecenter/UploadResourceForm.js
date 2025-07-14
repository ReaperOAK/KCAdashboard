
import React, { useMemo } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

/**
 * UploadResourceForm: Beautiful, responsive, single-responsibility upload form
 * - Uploads a new resource with validation
 * - Responsive, color tokens, accessible, mobile friendly
 */
const UploadResourceForm = React.memo(function UploadResourceForm({
  resourceTypes,
  categories,
  difficultyLevels,
  onSubmit,
  uploading,
  uploadError,
  onCancel,
}) {
  const initialValues = useMemo(() => ({
    title: '',
    description: '',
    category: 'openings',
    type: 'link',
    url: '',
    tags: '',
    difficulty: 'beginner',
    file: null,
  }), []);

  const validationSchema = useMemo(() => Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string(),
    category: Yup.string().required('Category is required'),
    type: Yup.string().required('Type is required'),
    url: Yup.string().when('type', {
      is: (val) => val === 'link' || val === 'video',
      then: Yup.string().url('Must be a valid URL').required('URL is required'),
      otherwise: Yup.string(),
    }),
    tags: Yup.string(),
    difficulty: Yup.string().required('Difficulty is required'),
    file: Yup.mixed().when('type', {
      is: (val) => val !== 'link' && val !== 'video',
      then: Yup.mixed().required('File is required'),
      otherwise: Yup.mixed(),
    }),
  }), []);

  return (
    <section className="bg-background-light dark:bg-background-dark rounded-2xl shadow-md p-6 md:p-8 mb-8 border border-gray-light w-full max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-2xl text-primary font-semibold mb-4">Upload New Resource</h2>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ setFieldValue, values }) => (
          <Form className="space-y-5" aria-label="Upload Resource Form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-text-dark mb-1 font-medium" htmlFor="title">Title</label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
                  required
                  aria-required="true"
                />
                <ErrorMessage name="title" component="div" className="text-error text-xs mt-1" />
              </div>
              <div>
                <label className="block text-text-dark mb-1 font-medium" htmlFor="type">Resource Type</label>
                <Field
                  as="select"
                  id="type"
                  name="type"
                  className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
                >
                  {resourceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="type" component="div" className="text-error text-xs mt-1" />
              </div>
              <div>
                <label className="block text-text-dark mb-1 font-medium" htmlFor="category">Category</label>
                <Field
                  as="select"
                  id="category"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
                >
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>{category.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="category" component="div" className="text-error text-xs mt-1" />
              </div>
              <div>
                <label className="block text-text-dark mb-1 font-medium" htmlFor="difficulty">Difficulty</label>
                <Field
                  as="select"
                  id="difficulty"
                  name="difficulty"
                  className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
                >
                  {difficultyLevels.map(level => (
                    <option key={level.id} value={level.id}>{level.label}</option>
                  ))}
                </Field>
                <ErrorMessage name="difficulty" component="div" className="text-error text-xs mt-1" />
              </div>
            </div>
            <div>
              <label className="block text-text-dark mb-1 font-medium" htmlFor="description">Description</label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="3"
                className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
              />
              <ErrorMessage name="description" component="div" className="text-error text-xs mt-1" />
            </div>
            <div>
              <label className="block text-text-dark mb-1 font-medium" htmlFor="tags">Tags (comma separated)</label>
              <Field
                id="tags"
                name="tags"
                type="text"
                placeholder="e.g. sicilian, dragon, attack"
                className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
              />
              <ErrorMessage name="tags" component="div" className="text-error text-xs mt-1" />
            </div>
            {values.type === 'link' || values.type === 'video' ? (
              <div>
                <label className="block text-text-dark mb-1 font-medium" htmlFor="url">URL</label>
                <Field
                  id="url"
                  name="url"
                  type="url"
                  className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
                  required={values.type === 'link' || values.type === 'video'}
                  aria-required={values.type === 'link' || values.type === 'video'}
                />
                <ErrorMessage name="url" component="div" className="text-error text-xs mt-1" />
              </div>
            ) : (
              <div>
                <label className="block text-text-dark mb-1 font-medium" htmlFor="file">File</label>
                <input
                  id="file"
                  name="file"
                  type="file"
                  className="w-full px-3 py-2 border border-gray-light rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 shadow-sm"
                  required={values.type !== 'link' && values.type !== 'video'}
                  aria-required={values.type !== 'link' && values.type !== 'video'}
                  onChange={e => setFieldValue('file', e.currentTarget.files[0])}
                />
                <ErrorMessage name="file" component="div" className="text-error text-xs mt-1" />
              </div>
            )}
            {uploadError && (
              <div className="text-error text-sm">{uploadError}</div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-light rounded-lg bg-white text-text-dark hover:bg-gray-light focus:ring-2 focus:ring-accent focus:outline-none transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className={`px-4 py-2 bg-primary text-white rounded-lg transition-all duration-200 font-medium focus:ring-2 focus:ring-accent focus:outline-none ${uploading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-secondary'}`}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </section>
  );
});

export default UploadResourceForm;
