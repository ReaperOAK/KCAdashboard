import React from 'react';
import { useParams } from 'react-router-dom';
import SecureFileViewer from '../../components/common/SecureFileViewer';

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
  if (!resourceId || !fileType) return <div>Invalid file viewer request.</div>;
  return (
    <div style={{padding:24}}>
      <SecureFileViewer resourceId={resourceId} fileType={fileType} />
    </div>
  );
};

export default UploadsViewerPage;
