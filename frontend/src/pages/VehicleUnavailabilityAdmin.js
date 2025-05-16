import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

export default function VehicleUnavailabilityAdmin() {
  const [vehicles, setVehicles] = useState([]);
  const [unavailability, setUnavailability] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vehicle_id: '', start_time: '', end_time: '', reason: '' });

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data));
    fetch('http://localhost:5000/api/vehicle-unavailability')
      .then(res => res.json())
      .then(data => setUnavailability(Array.isArray(data) ? data : []));
  }, [open]);

  const handleOpen = () => {
    setForm({ vehicle_id: '', start_time: '', end_time: '', reason: '' });
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/vehicle-unavailability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || 'Failed to add unavailability.');
      return;
    }
    setOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Vehicle Unavailability (Admin)</Typography>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={handleOpen}>
        Add Unavailability
      </Button>
      <Grid container spacing={2}>
        {unavailability.map((ua, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">
                Vehicle: {vehicles.find(v => v.id === ua.vehicle_id)?.model || ua.vehicle_id}
              </Typography>
              <Typography>From: {ua.start_time}</Typography>
              <Typography>To: {ua.end_time}</Typography>
              <Typography>Reason: {ua.reason}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Add Vehicle Unavailability</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              select
              label="Vehicle"
              name="vehicle_id"
              value={form.vehicle_id}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              {vehicles.map(v => (
                <MenuItem key={v.id} value={v.id}>{v.model} ({v.number_plate})</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Start Time"
              name="start_time"
              type="datetime-local"
              value={form.start_time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="End Time"
              name="end_time"
              type="datetime-local"
              value={form.end_time}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Reason"
              name="reason"
              value={form.reason}
              onChange={handleChange}
              fullWidth
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
