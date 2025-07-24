import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/solid';

const DocumentVerification = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, verified, rejected

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      // This would be an admin API endpoint
      const response = await fetch('/api/admin/get-documents.php', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVerifyDocument = useCallback(async (documentId, status, comments = '') => {
    try {
      const response = await fetch('/api/admin/verify-document.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          document_id: documentId,
          status: status,
          comments: comments
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh documents list
        fetchDocuments();
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Error verifying document:', error);
    }
  }, [fetchDocuments]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'pending') return !doc.is_verified && !doc.is_rejected;
    if (filter === 'verified') return doc.is_verified;
    if (filter === 'rejected') return doc.is_rejected;
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">Document Verification</h1>
        <p className="text-gray-600">Review and verify student documents</p>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'verified', 'rejected'].map(filterType => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterType
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(document => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-sm">
                    {document.document_type.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {document.is_verified ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  ) : document.is_rejected ? (
                    <XCircleIcon className="h-5 w-5 text-red-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full bg-yellow-400"></div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <UserIcon className="h-4 w-4" />
                  <span>{document.user_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => window.open(`/api/${document.file_path}`, '_blank')}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  <EyeIcon className="h-4 w-4" />
                  View
                </button>
                
                {!document.is_verified && !document.is_rejected && (
                  <>
                    <button
                      onClick={() => handleVerifyDocument(document.id, 'verified')}
                      className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                      Verify
                    </button>
                    <button
                      onClick={() => handleVerifyDocument(document.id, 'rejected')}
                      className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      <XCircleIcon className="h-4 w-4" />
                      Reject
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredDocuments.length === 0 && !loading && (
        <div className="text-center py-8">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No documents found for the selected filter</p>
        </div>
      )}
    </div>
  );
};

export default DocumentVerification;
