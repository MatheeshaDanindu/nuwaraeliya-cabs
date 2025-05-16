// src/pages/Booking.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Booking() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicleId: '',
    startDate: '',
    endDate: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect to login if not logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch available vehicles when dates change
  useEffect(() => {
    async function fetchVehicles() {
      let url = 'http://localhost:5000/api/vehicles';
      if (form.startDate && form.endDate) {
        url = `http://localhost:5000/api/vehicles/available?start=${encodeURIComponent(form.startDate)}&end=${encodeURIComponent(form.endDate)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        setVehicles(await res.json());
      } else {
        setVehicles([]);
      }
    }
    fetchVehicles();
  }, [form.startDate, form.endDate]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        setError('You must be logged in to book a vehicle.');
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: form.vehicleId,
          start_time: form.startDate,
          end_time: form.endDate,
          user_id: user.id
        })
      });
      if (res.ok) {
        setSuccess(true);
        setForm({ vehicleId: '', startDate: '', endDate: '' });
      } else {
        const err = await res.json();
        setError(err.error || 'Booking failed.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>Book a Vehicle</Typography>
      {success && <Alert severity="success">Booking successful!</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
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
          {vehicles.length === 0 && <MenuItem value="" disabled>No vehicles available</MenuItem>}
          {vehicles.map(v => (
            <MenuItem key={v.id} value={v.id}>{v.model} ({v.number_plate})</MenuItem>
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
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Booking...' : 'Book Now'}
        </Button>
      </form>
    </Box>
  );
}
