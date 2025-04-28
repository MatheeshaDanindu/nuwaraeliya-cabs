// src/pages/Dashboard.js
import React from 'react';
import { Box, Typography, Paper, Grid, List, ListItem, ListItemText } from '@mui/material';

export default function Dashboard() {
  // Example static data
  const stats = [
    { label: 'Total Bookings', value: 3 },
    { label: 'Upcoming Bookings', value: 1 },
    { label: 'Completed Rides', value: 2 }
  ];
  const recentBookings = [
    { id: 1, vehicle: 'Toyota Prius', date: '2025-04-22', status: 'Upcoming' },
    { id: 2, vehicle: 'Honda Fit', date: '2025-03-15', status: 'Completed' }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={2}>
        {stats.map((stat, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{stat.label}</Typography>
              <Typography variant="h4" color="primary">{stat.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Bookings</Typography>
        <List>
          {recentBookings.map(b => (
            <ListItem key={b.id} divider>
              <ListItemText
                primary={`${b.vehicle} - ${b.date}`}
                secondary={b.status}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
