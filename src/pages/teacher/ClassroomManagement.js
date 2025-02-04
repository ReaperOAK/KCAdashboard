import React, { useState } from 'react';
import { Tabs, Tab, Box, Container } from '@mui/material';
import BatchManagement from '../../components/teacher/BatchManagement';
import StudyMaterials from '../../components/teacher/StudyMaterials';
import AttendanceTracking from '../../components/teacher/AttendanceTracking';

const ClassroomManagement = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ bgcolor: '#f3f1f9', borderRadius: 2, p: 3 }}>
        <h1 className="text-2xl font-bold text-primary mb-6">Classroom Management</h1>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Batch Management" />
            <Tab label="Study Materials" />
            <Tab label="Attendance" />
          </Tabs>
        </Box>

        {activeTab === 0 && <BatchManagement />}
        {activeTab === 1 && <StudyMaterials />}
        {activeTab === 2 && <AttendanceTracking />}
      </Box>
    </Container>
  );
};

export default ClassroomManagement;