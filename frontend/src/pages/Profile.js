// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, Alert } from '@mui/material';

export default function Profile() {
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch user info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      fetch(`http://localhost:5000/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => setProfile({ name: data.name, email: data.email, phone: data.phone || '' }));
      fetch(`http://localhost:5000/api/bookings/user/${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []));
    }
  }, [editing, success]);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleEdit = () => setEditing(true);

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to update profile.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
        <form onSubmit={handleSave}>
          <TextField
            label="Name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editing}
          />
          <TextField
            label="Email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editing}
          />
          <TextField
            label="Phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editing}
          />
          {/* Save button at the bottom right, only in edit mode */}
          {editing && (
            <Button type="submit" variant="contained" color="primary" sx={{ position: 'absolute', top: -16, right: 16 }}>
              Save
            </Button>
          )}
        </form>
        {/* Edit Profile button at the top right, only when not editing */}
        {!editing && (
          <Button variant="outlined" color="primary" sx={{ position: 'absolute', top: -16, right: 16 }} onClick={handleEdit}>
            Edit Profile
          </Button>
        )}
      </Paper>
      <Typography variant="h6" gutterBottom>Booking History</Typography>
      <List>
        {bookings.length === 0 && <ListItem><ListItemText primary="No bookings found." /></ListItem>}
        {bookings.map(b => (
          <ListItem key={b.id} divider>
            <ListItemText
              primary={`${b.vehicle_model || b.vehicle || ''} - ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
              secondary={`Status: ${b.status || 'N/A'} | Payment: ${b.payment_status || 'N/A'}`}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
