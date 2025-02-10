import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';

const StudyMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: '',
    link: '',
    description: ''
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/php/get_study_materials.php');
      const data = await response.json();
      if (data.success) {
        setMaterials(data.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
  };

  const handleCreateMaterial = async () => {
    try {
      const response = await fetch('/php/add_study_material.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMaterial)
      });
      
      const data = await response.json();
      if (data.success) {
        setMaterials([data.material, ...materials]);
        setOpenDialog(false);
        setNewMaterial({ title: '', type: '', link: '', description: '' });
      }
    } catch (error) {
      console.error('Error adding material:', error);
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
          Add Study Material
        </Button>
      </Box>

      <Grid container spacing={3}>
        {materials.map((material) => (
          <Grid item xs={12} md={4} key={material.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{material.title}</Typography>
                <Typography color="textSecondary">{material.type}</Typography>
                <Typography variant="body2">{material.description}</Typography>
                <Button 
                  href={material.link} 
                  target="_blank" 
                  sx={{ mt: 2 }}
                >
                  View Material
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add Study Material</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={newMaterial.title}
            onChange={(e) => setNewMaterial({...newMaterial, title: e.target.value})}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Type</InputLabel>
            <Select
              value={newMaterial.type}
              label="Type"
              onChange={(e) => setNewMaterial({...newMaterial, type: e.target.value})}
            >
              <MenuItem value="PDF">PDF</MenuItem>
              <MenuItem value="Video">Video</MenuItem>
              <MenuItem value="Link">Link</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Link"
            margin="normal"
            value={newMaterial.link}
            onChange={(e) => setNewMaterial({...newMaterial, link: e.target.value})}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={4}
            value={newMaterial.description}
            onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
          />
          <Button 
            variant="contained" 
            onClick={handleCreateMaterial}
            sx={{ mt: 2, bgcolor: '#461fa3' }}
          >
            Add Material
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default StudyMaterials;
