import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField
} from '@mui/material';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newBatch, setNewBatch] = useState({
    name: '',
    schedule: '',
    teacher: ''
  });

  const handleCreateBatch = () => {
    setBatches([...batches, { ...newBatch, id: Date.now() }]);
    setOpenDialog(false);
    setNewBatch({ name: '', schedule: '', teacher: '' });
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          onClick={() => setOpenDialog(true)}
          sx={{ bgcolor: '#461fa3' }}
        >
          Create New Batch
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f3f1f9' }}>
            <TableRow>
              <TableCell>Batch Name</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Teacher</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell>{batch.name}</TableCell>
                <TableCell>{batch.schedule}</TableCell>
                <TableCell>{batch.teacher}</TableCell>
                <TableCell>
                  <Button size="small" color="primary">Edit</Button>
                  <Button size="small" color="error">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Create New Batch</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Batch Name"
            margin="normal"
            value={newBatch.name}
            onChange={(e) => setNewBatch({...newBatch, name: e.target.value})}
          />
          <TextField
            fullWidth
            label="Schedule"
            margin="normal"
            value={newBatch.schedule}
            onChange={(e) => setNewBatch({...newBatch, schedule: e.target.value})}
          />
          <TextField
            fullWidth
            label="Teacher"
            margin="normal"
            value={newBatch.teacher}
            onChange={(e) => setNewBatch({...newBatch, teacher: e.target.value})}
          />
          <Button 
            variant="contained" 
            onClick={handleCreateBatch}
            sx={{ mt: 2, bgcolor: '#461fa3' }}
          >
            Create
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BatchManagement;
