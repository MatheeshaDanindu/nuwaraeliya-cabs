// src/components/BookingForm.js
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';

export default function BookingForm({ vehicleId }) {
  const [form, setForm] = useState({
    start_time: '',
    end_time: '',
    notes: ''
  });
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    // Add authentication token if needed
    const res = await fetch('http://localhost:5000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicle_id: vehicleId, ...form })
    });
    if (res.ok) setSuccess(true);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Book Your Ride</Typography>
      {success ? (
        <Typography color="success.main">Booking successful! Check your email for confirmation.</Typography>
      ) : (
        <form onSubmit={handleSubmit}>
          <TextField
            label="Start Date & Time"
            name="start_time"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={handleChange}
            required
          />
          <TextField
            label="End Date & Time"
            name="end_time"
            type="datetime-local"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={handleChange}
            required
          />
          <TextField
            label="Notes"
            name="notes"
            fullWidth
            margin="normal"
            multiline
            rows={2}
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
            Confirm Booking
          </Button>
        </form>
      )}
    </Box>
  );
}
