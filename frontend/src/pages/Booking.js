// src/pages/Booking.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';

const vehicleOptions = [
  { id: 1, name: 'Toyota Prius' },
  { id: 2, name: 'Honda Fit' },
  { id: 3, name: 'Suzuki WagonR' }
];

export default function Booking() {
  const [form, setForm] = useState({
    vehicleId: '',
    startDate: '',
    endDate: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Send booking data to backend
    setSuccess(true);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Book a Vehicle</Typography>
      {success && <Alert severity="success">Booking successful!</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Select Vehicle"
          name="vehicleId"
          value={form.vehicleId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {vehicleOptions.map(v => (
            <MenuItem key={v.id} value={v.id}>{v.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Start Date & Time"
          name="startDate"
          type="datetime-local"
          value={form.startDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          label="End Date & Time"
          name="endDate"
          type="datetime-local"
          value={form.endDate}
          onChange={handleChange}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
        />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Book Now
        </Button>
      </form>
    </Box>
  );
}
