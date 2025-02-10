import React, { useState, useEffect } from 'react';
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

  const fetchBatches = async () => {
    try {
      const response = await fetch('/php/batches/manage_batches.php');
      const data = await response.json();
      if (response.ok) {
        setBatches(data);
      } else {
        console.error('Failed to fetch batches:', data.error);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async () => {
    try {
      const response = await fetch('/php/batches/manage_batches.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBatch)
      });
      const data = await response.json();
      
      if (response.ok) {
        fetchBatches();
        setOpenDialog(false);
        setNewBatch({ name: '', schedule: '', teacher: '' });
      } else {
        console.error('Failed to create batch:', data.error);
      }
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  };

  const handleDeleteBatch = async (id) => {
    if (window.confirm('Are you sure you want to delete this batch?')) {
      try {
        const response = await fetch(`/php/batches/manage_batches.php?id=${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        
        if (response.ok) {
          fetchBatches();
        } else {
          console.error('Failed to delete batch:', data.error);
        }
      } catch (error) {
        console.error('Error deleting batch:', error);
      }
    }
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
                  <Button 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteBatch(batch.id)}
                  >
                    Delete
                  </Button>
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
