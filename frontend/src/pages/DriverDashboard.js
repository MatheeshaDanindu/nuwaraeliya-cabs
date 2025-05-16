// src/pages/DriverDashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

export default function DriverDashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      fetch(`http://localhost:5000/api/bookings/driver/${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []))
        .catch(() => setError('Failed to fetch schedule.'));
    }
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Schedule</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Paper sx={{ p: 2 }}>
        <List>
          {bookings.length === 0 && <ListItem><ListItemText primary="No bookings assigned." /></ListItem>}
          {bookings.map(b => (
            <ListItem key={b.id} divider>
              <ListItemText
                primary={`${b.vehicle_model} | ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
                secondary={`Customer: ${b.customer_name} (${b.customer_email}) | Status: ${b.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
}
