
import React from 'react';
import { useParams } from 'react-router-dom';
import SecureFileViewer from '../../components/common/SecureFileViewer';
import { DocumentMagnifyingGlassIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

/**
 * Route: /uploads/view/:resourceId
 * Query: ?type=pdf|img
 *
 * This page renders the SecureFileViewer for a given resource.
 */
const UploadsViewerPage = () => {
  const { resourceId } = useParams();
  const params = new URLSearchParams(window.location.search);
  const fileType = params.get('type');

  if (!resourceId || !fileType) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mb-4" aria-hidden="true" />
        <h2 className="text-xl font-semibold text-primary mb-2">Invalid file viewer request</h2>
        <p className="text-gray-dark mb-4">The requested file could not be found or the type is missing.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[60vh] flex flex-col items-center justify-center bg-background-light px-2 py-8"
    >
      <div className="flex flex-col items-center mb-6">
        <DocumentMagnifyingGlassIcon className="h-14 w-14 text-primary mb-2" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-primary mb-2">File Viewer</h1>
        <p className="text-gray-dark text-sm mb-4">Securely viewing your uploaded file</p>
      </div>
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 md:p-8 border border-accent/10">
        <SecureFileViewer resourceId={resourceId} fileType={fileType} />
      </div>
    </motion.div>
  );
};

export default UploadsViewerPage;
