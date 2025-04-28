// src/pages/Profile.js
import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function Profile() {
  // Example static user data
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0712345678'
  });
  const [editing, setEditing] = useState(false);

  const [bookings] = useState([
    { id: 1, vehicle: 'Toyota Prius', date: '2025-04-22', status: 'Upcoming' },
    { id: 2, vehicle: 'Honda Fit', date: '2025-03-15', status: 'Completed' }
  ]);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleEdit = () => setEditing(true);

  const handleSave = e => {
    e.preventDefault();
    // TODO: Save updated profile to backend
    setEditing(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
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
          {editing ? (
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
              Save
            </Button>
          ) : (
            <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={handleEdit}>
              Edit Profile
            </Button>
          )}
        </form>
      </Paper>
      <Typography variant="h6" gutterBottom>Booking History</Typography>
      <List>
        {bookings.map(b => (
          <ListItem key={b.id} divider>
            <ListItemText
              primary={`${b.vehicle} - ${b.date}`}
              secondary={b.status}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
