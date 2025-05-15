// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ bookings: 0, vehicles: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    // Fetch dashboard stats from backend (mocked for now)
    async function fetchStats() {
      try {
        // Replace with your backend endpoints
        const bookingsRes = await fetch('http://localhost:5000/api/bookings/count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const vehiclesRes = await fetch('http://localhost:5000/api/vehicles/count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const bookings = bookingsRes.ok ? (await bookingsRes.json()).count : 0;
        const vehicles = vehiclesRes.ok ? (await vehiclesRes.json()).count : 0;
        setStats({ bookings, vehicles });
      } catch {
        setStats({ bookings: 0, vehicles: 0 });
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Role-based dashboard rendering
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Welcome{user ? `, ${user.name}` : ''}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Bookings</Typography>
              <Typography variant="h3" color="primary">{stats.bookings}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Available Vehicles</Typography>
              <Typography variant="h3" color="primary">{stats.vehicles}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Profile</Typography>
              <Typography>Name: {user?.name}</Typography>
              <Typography>Email: {user?.email}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" color="primary" onClick={() => navigate('/Booking')}>
          Book a Cab
        </Button>
        <Button variant="outlined" color="primary" onClick={() => navigate('/Profile')}>
          Manage Profile
        </Button>
        <Button variant="outlined" color="secondary" onClick={() => navigate('/Vehicles')}>
          View Vehicles
        </Button>
      </Box>
    </Box>
  );
}
