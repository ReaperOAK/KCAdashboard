import React, { useEffect, useState } from 'react';
import { ResourcesApi } from '../../api/resources';

/**
 * SecureFileViewer component
 * Props:
 *   resourceId: number (required)
 *   fileType: 'pdf' | 'img' (required)
 *   token: string (optional, for auth)
 */

const SecureFileViewer = ({ resourceId, fileType, token }) => {
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resourceId || !fileType) return;
    setError(null);
    setFileUrl(null);
    // Fetch the file as a blob from the API (via ResourcesApi)
    const fetchFile = async () => {
      try {
        const blob = await ResourcesApi.getResourceFileBlob(resourceId, token);
        setFileUrl(URL.createObjectURL(blob));
      } catch (e) {
        setError(e.message);
      }
    };
    fetchFile();
    // Cleanup blob URL
    return () => { if (fileUrl) URL.revokeObjectURL(fileUrl); };
    // eslint-disable-next-line
  }, [resourceId, fileType, token]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 bg-background-light dark:bg-background-dark rounded-xl border border-red-800 animate-fade-in" role="alert" aria-live="assertive">
        <svg className="w-8 h-8 text-red-700 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 1 1 3 12a9 9 0 0 1 18 0Z" /></svg>
        <span className="text-red-700 font-semibold mb-1">Error loading file</span>
        <span className="text-red-700 text-sm">{error}</span>
      </div>
    );
  }
  if (!fileUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 bg-background-light dark:bg-background-dark rounded-xl animate-pulse" role="status" aria-busy="true">
        <div className="h-8 w-8 rounded-full border-4 border-accent border-t-transparent animate-spin mb-3"></div>
        <span className="text-accent dark:text-secondary font-medium">Loading file...</span>
      </div>
    );
  }

  if (fileType === 'img') {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[40vh] bg-background-light dark:bg-background-dark rounded-xl">
        <img
          src={fileUrl}
          alt="Resource"
          className="max-w-full max-h-[80vh] rounded shadow-md border border-gray-light dark:border-gray-dark"
          style={{ objectFit: 'contain' }}
        />
      </div>
    );
  }
  if (fileType === 'pdf') {
    return (
      <div className="w-full h-[80vh] bg-background-light dark:bg-background-dark rounded-xl overflow-hidden border border-gray-light dark:border-gray-dark">
        <iframe
          src={fileUrl}
          title="PDF Viewer"
          className="w-full h-full border-none rounded"
          aria-label="PDF file preview"
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 bg-background-light dark:bg-background-dark rounded-xl border border-gray-light dark:border-gray-dark animate-fade-in">
      <span className="text-gray-dark dark:text-gray-light font-semibold">Unsupported file type</span>
    </div>
  );
};

export default SecureFileViewer;
