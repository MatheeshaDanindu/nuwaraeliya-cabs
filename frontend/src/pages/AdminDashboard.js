// src/pages/AdminDashboard.js
import React from 'react';
import { Box, Typography, Grid, Paper, Button } from '@mui/material';

export default function AdminDashboard() {
  // Example static data
  const metrics = [
    { label: 'Total Vehicles', value: 5 },
    { label: 'Active Bookings', value: 2 },
    { label: 'Pending Payments', value: 1 },
    { label: 'Drivers', value: 3 }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      <Grid container spacing={2}>
        {metrics.map((m, idx) => (
          <Grid item xs={12} sm={3} key={idx}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{m.label}</Typography>
              <Typography variant="h4" color="secondary">{m.value}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Quick Actions</Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button variant="contained" color="primary" href="/vehicles">Manage Vehicles</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" href="/bookings">Manage Bookings</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" href="/payments">Manage Payments</Button>
          </Grid>
          <Grid item>
            <Button variant="contained" color="primary" href="/drivers">Manage Drivers</Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
