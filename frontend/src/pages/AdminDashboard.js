// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ model: '', number_plate: '', capacity: '', status: 'available' });
  const [selectedId, setSelectedId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, [open]); // Refetch vehicles whenever dialog closes (after add/edit)

  const fetchVehicles = async () => {
    const res = await fetch('http://localhost:5000/api/vehicles');
    if (res.ok) setVehicles(await res.json());
  };

  const handleOpen = (vehicle = null) => {
    if (vehicle) {
      setEditMode(true);
      setForm({
        model: vehicle.model || '',
        number_plate: vehicle.number_plate || '',
        capacity: vehicle.capacity || '',
        status: vehicle.status || 'available'
      });
      setSelectedId(vehicle.id);
    } else {
      setEditMode(false);
      setForm({ model: '', number_plate: '', capacity: '', status: 'available' });
      setSelectedId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ model: '', number_plate: '', capacity: '', status: 'available' });
    setSelectedId(null);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const vehicleData = { ...form, capacity: parseInt(form.capacity, 10) };
    try {
      let res;
      if (editMode) {
        res = await fetch(`http://localhost:5000/api/vehicles/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
      } else {
        res = await fetch('http://localhost:5000/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
      }
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save vehicle.');
        return;
      }
      fetchVehicles();
      handleClose();
    } catch (e) {
      alert('Network error. Could not save vehicle.');
    }
  };

  const handleDeleteRequest = id => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to delete vehicle.');
      }
    } catch (e) {
      alert('Network error. Could not delete vehicle.');
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
    fetchVehicles();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>
        Add Vehicle
      </Button>
      <Grid container spacing={2}>
        {vehicles.map(vehicle => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{vehicle.model}</Typography>
              <Typography>Seats: {vehicle.capacity}</Typography>
              <Typography>Status: {vehicle.status}</Typography>
              <Box sx={{ mt: 1 }}>
                <IconButton color="primary" onClick={() => handleOpen(vehicle)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={() => handleDeleteRequest(vehicle.id)}><DeleteIcon /></IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField label="Model" name="model" value={form.model} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Number Plate" name="number_plate" value={form.number_plate} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Capacity" name="capacity" value={form.capacity} onChange={handleChange} fullWidth margin="normal" required />
            <TextField
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">{editMode ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vehicle?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
