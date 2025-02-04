import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  Select,
  MenuItem,
  Button,
  TextField
} from '@mui/material';

const AttendanceTracking = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [students, setStudents] = useState([]);

  const markAttendance = (studentId, status) => {
    setStudents(students.map(student => 
      student.id === studentId ? { ...student, attendance: status } : student
    ));
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          type="date"
          label="Select Date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          sx={{ width: 200 }}
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControl sx={{ width: 200 }}>
          <Select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            displayEmpty
          >
            <MenuItem value="">Select Batch</MenuItem>
            <MenuItem value="batch1">Batch 1</MenuItem>
            <MenuItem value="batch2">Batch 2</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f3f1f9' }}>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.attendance || 'Not marked'}</TableCell>
                <TableCell>
                  <Button 
                    size="small" 
                    onClick={() => markAttendance(student.id, 'Present')}
                    sx={{ mr: 1 }}
                  >
                    Present
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => markAttendance(student.id, 'Absent')}
                  >
                    Absent
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default AttendanceTracking;
