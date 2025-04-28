// src/pages/Home.js
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

export default function Home() {
  return (
    <Box sx={{
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1976d2 60%, #64b5f6 100%)',
      color: 'white',
      textAlign: 'center'
    }}>
      <Typography variant="h2" fontWeight="bold" gutterBottom>
        Welcome to Nuwaraeliya Cabs
      </Typography>
      <Typography variant="h5" gutterBottom>
        Reliable, Fast, and Comfortable Cab Rentals in Nuwara Eliya
      </Typography>
      <Button variant="contained" color="secondary" size="large" href="/booking">
        Book Your Ride
      </Button>
    </Box>
  );
}
