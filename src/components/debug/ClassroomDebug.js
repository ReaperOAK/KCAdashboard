import React, { useState, useEffect } from 'react';
import ApiService from '../../utils/api';

const ClassroomDebug = () => {
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDebugInfo = async (classroomId = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.debugClassroom(classroomId);
      setDebugInfo(response.debug_info);
    } catch (err) {
      setError(err.message);
      console.error('Debug error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    try {
      setLoading(true);
      const response = await ApiService.post('/classroom/create-test-data.php');
      alert('Test data created: ' + response.message);
      // Refresh debug info
      await fetchDebugInfo();
    } catch (err) {
      alert('Error creating test data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  if (loading) {
    return <div>Loading debug information...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Classroom Debug Information</h2>
      
      <button onClick={() => fetchDebugInfo()}>Refresh Debug Info</button>
      <button onClick={() => fetchDebugInfo(1)} style={{ marginLeft: '10px' }}>
        Debug Classroom ID 1
      </button>
      <button onClick={createTestData} style={{ marginLeft: '10px' }}>
        Create Test Data
      </button>
      
      {debugInfo && (
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '10px', 
          marginTop: '20px',
          overflow: 'auto',
          maxHeight: '80vh'
        }}>
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default ClassroomDebug;
