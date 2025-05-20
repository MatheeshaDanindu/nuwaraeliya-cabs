// src/pages/Booking.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, MenuItem, Alert, Card, CardContent, CardHeader, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Booking() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [packages, setPackages] = useState([]);
  const [advance, setAdvance] = useState(null);
  const [form, setForm] = useState({
    vehicleId: '',
    startDate: '',
    endDate: '',
    driverId: '',
    packageId: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  // Helper to get current datetime in 'YYYY-MM-DDTHH:MM' format for min attribute
  const getNowForInput = () => {
    const now = new Date();
    now.setSeconds(0, 0); // Remove seconds/milliseconds
    const tzOffset = -now.getTimezoneOffset();
    const diff = tzOffset >= 0 ? '+' : '-';
    const pad = n => n.toString().padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  };

  // Redirect to login if not logged in
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch available vehicles and drivers when dates change
  useEffect(() => {
    async function fetchVehiclesAndDrivers() {
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
      // Fetch only available drivers for the selected date range
      let driversUrl = 'http://localhost:5000/api/users?role=driver';
      if (form.startDate && form.endDate) {
        driversUrl = `http://localhost:5000/api/drivers/available?start=${encodeURIComponent(form.startDate)}&end=${encodeURIComponent(form.endDate)}`;
      }
      const driversRes = await fetch(driversUrl);
      if (driversRes.ok) {
        setDrivers(await driversRes.json());
      } else {
        setDrivers([]);
      }
    }
    fetchVehiclesAndDrivers();
  }, [form.startDate, form.endDate]);

  // Fetch packages when vehicle changes
  useEffect(() => {
    async function fetchPackages() {
      setPackages([]);
      setForm(f => ({ ...f, packageId: '' }));
      if (!form.vehicleId) return;
      const res = await fetch(`http://localhost:5000/api/vehicles/${form.vehicleId}/packages`);
      if (res.ok) {
        setPackages(await res.json());
      } else {
        setPackages([]);
      }
    }
    fetchPackages();
    // eslint-disable-next-line
  }, [form.vehicleId]);

  // Fetch advance when package changes
  useEffect(() => {
    async function fetchAdvance() {
      setAdvance(null);
      if (!form.packageId) return;
      const res = await fetch(`http://localhost:5000/api/packages/${form.packageId}/advance`);
      if (res.ok) {
        const data = await res.json();
        setAdvance(data.advance);
      }
    }
    fetchAdvance();
  }, [form.packageId]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError('');
    setSuccess(false);
    setInfo('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setInfo('');
    if (!form.packageId) {
      setError('Please select a package.');
      setLoading(false);
      return;
    }
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      setError('End date/time cannot be before start date/time.');
      setLoading(false);
      return;
    }
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
          user_id: user.id,
          driver_id: form.driverId,
          package_id: form.packageId
        })
      });
      if (res.ok) {
        setSuccess(true);
        setInfo('Your booking request has been submitted. An admin will review and approve your booking. Once approved, you will be able to pay the advance from your profile.');
        setForm({ vehicleId: '', startDate: '', endDate: '', driverId: '', packageId: '' });
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
      {info && <Alert severity="info">{info}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      <form onSubmit={handleSubmit}>
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
          inputProps={{ min: getNowForInput() }}
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
          inputProps={{ min: form.startDate ? form.startDate : getNowForInput() }}
          error={Boolean(error) || (form.startDate && form.endDate && form.endDate < form.startDate)}
          helperText={
            form.startDate && form.endDate && form.endDate < form.startDate
              ? 'End date/time cannot be before start date/time.'
              : undefined
          }
        />
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
        {/* Package selection */}
        <TextField
          select
          label="Select Package"
          name="packageId"
          value={form.packageId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          disabled={!form.vehicleId || packages.length === 0}
          error={!!error && !form.packageId}
          helperText={
            !form.vehicleId ? 'Select a vehicle first.' :
            (packages.length === 0 ? 'No packages for this vehicle. Please contact admin.' : 'Choose a package for your trip.')
          }
        >
          {packages.length === 0 && <MenuItem value="" disabled>No packages available</MenuItem>}
          {packages.map(p => (
            <MenuItem key={p.id} value={p.id}>
              {p.name} - Rs. {p.price.toLocaleString()} / {p.price_unit}, {p.included_km} {p.km_unit}
            </MenuItem>
          ))}
        </TextField>
        {/* Detailed package display */}
        {form.packageId && packages.length > 0 && (() => {
          const selected = packages.find(p => String(p.id) === String(form.packageId));
          if (!selected) return null;
          return (
            <Card sx={{ my: 2, background: '#f5f5f5' }}>
              <CardHeader title={selected.name} sx={{ pb: 0 }} />
              <Divider />
              <CardContent>
                <Typography variant="subtitle1" color="primary">
                  Rs. {selected.price.toLocaleString()} / {selected.price_unit}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Includes: {selected.included_km} {selected.km_unit}
                </Typography>
                {selected.description && (
                  <Typography variant="body2" color="text.secondary">
                    {selected.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          );
        })()}
        {/* Show advance payment info */}
        {advance !== null && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Advance Payment Required: <b>Rs. {advance.toLocaleString()}</b>
          </Alert>
        )}
        <TextField
          select
          label="Select Driver"
          name="driverId"
          value={form.driverId || ''}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        >
          {drivers.length === 0 && <MenuItem value="" disabled>No drivers available</MenuItem>}
          {drivers.map(d => (
            <MenuItem key={d.id} value={d.id}>{d.name} ({d.email})</MenuItem>
          ))}
        </TextField>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading || !form.packageId || packages.length === 0}
        >
          {loading ? 'Booking...' : 'Book Now'}
        </Button>
      </form>
    </Box>
  );
}
