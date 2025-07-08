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

  if (error) return <div style={{color:'red'}}>Error: {error}</div>;
  if (!fileUrl) return <div>Loading...</div>;

  if (fileType === 'img') {
    return <img src={fileUrl} alt="Resource" style={{maxWidth:'100%', maxHeight:'80vh'}} />;
  }
  if (fileType === 'pdf') {
    return <iframe src={fileUrl} title="PDF Viewer" style={{width:'100%', height:'80vh', border:'none'}} />;
  }
  return <div>Unsupported file type</div>;
};

export default SecureFileViewer;
