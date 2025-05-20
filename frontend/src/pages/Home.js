// src/pages/Home.js
import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, CardMedia, TextField, InputAdornment, Paper, Divider } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import StarIcon from '@mui/icons-material/Star';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

export default function Home() {
  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 60%, #64b5f6 100%)',
        color: 'white',
        textAlign: 'center',
        pb: 8
      }}>
        <img src="/logo.jpg" alt="Nuwara Eliya Cabs Logo" style={{ width: 90, marginBottom: 16 }} />
        <Typography variant="h2" fontWeight="bold" gutterBottom>
          Welcome to Nuwaraeliya Cabs
        </Typography>
        <Typography variant="h5" gutterBottom>
          Reliable, Fast, and Comfortable Cab Rentals in Nuwara Eliya
        </Typography>
        <Button variant="contained" color="secondary" size="large" href="/booking" sx={{ mt: 2 }}>
          Book Your Ride
        </Button>
      </Box>

      {/* Service Highlights */}
      <Grid container spacing={3} sx={{ mt: -6, mb: 6, px: 2 }} justifyContent="center">
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, textAlign: 'center', minHeight: 180 }}>
            <DirectionsCarIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6">Wide Range of Vehicles</Typography>
            <Typography variant="body2">From auto to manual, choose the perfect ride for your journey.</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, textAlign: 'center', minHeight: 180 }}>
            <StarIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="h6">Trusted by Customers</Typography>
            <Typography variant="body2">Rated 4.9/5 by hundreds of happy travelers in Nuwara Eliya.</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2, textAlign: 'center', minHeight: 180 }}>
            <img src="/images/car1.jpg" alt="Premium" style={{ width: 60, marginBottom: 8, borderRadius: 8 }} />
            <Typography variant="h6">Better Experience</Typography>
            <Typography variant="body2">Professional drivers, clean vehicles, and on-time service.</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* How It Works */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>How It Works</Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={3}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">1. Choose Vehicle</Typography><Typography variant="body2">Browse our fleet and pick your ride.</Typography></Card></Grid>
          <Grid item xs={12} md={3}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">2. Book Online</Typography><Typography variant="body2">Fill in your trip details and submit.</Typography></Card></Grid>
          <Grid item xs={12} md={3}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">3. Pay & Confirm</Typography><Typography variant="body2">Pay advance securely and get instant confirmation.</Typography></Card></Grid>
          <Grid item xs={12} md={3}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">4. Enjoy the Ride</Typography><Typography variant="body2">Sit back and relax while we drive you safely.</Typography></Card></Grid>
        </Grid>
      </Box>

      {/* Featured Vehicles */}
      <Box sx={{ maxWidth: 1100, mx: 'auto', mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>Featured Vehicles</Typography>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}><CardMedia component="img" image="/images/car2.png" alt="Sedan" sx={{ height: 160, objectFit: 'contain', mb: 1, borderRadius: 2 }} /><Typography align="center">Honda Fit</Typography></Grid>
          <Grid item xs={12} md={4}><CardMedia component="img" image="/images/car4.png" alt="Van" sx={{ height: 160, objectFit: 'contain', mb: 1, borderRadius: 2 }} /><Typography align="center">Nissan Leaf</Typography></Grid>
          <Grid item xs={12} md={4}><CardMedia component="img" image="/images/car7.png" alt="SUV" sx={{ height: 160, objectFit: 'contain', mb: 1, borderRadius: 2 }} /><Typography align="center">Honda Civic</Typography></Grid>
        </Grid>
      </Box>

      {/* Why Choose Us */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>Why Choose Us?</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">24/7 Service</Typography><Typography variant="body2">We’re always available for your travel needs.</Typography></Card></Grid>
          <Grid item xs={12} md={4}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">Best Rates</Typography><Typography variant="body2">Transparent pricing, no hidden fees.</Typography></Card></Grid>
          <Grid item xs={12} md={4}><Card sx={{ p: 2, textAlign: 'center' }}><Typography fontWeight="bold">Local Experts</Typography><Typography variant="body2">Our drivers know Nuwara Eliya inside out.</Typography></Card></Grid>
        </Grid>
      </Box>

      

      {/* Testimonials */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>What Our Customers Say</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}><Card sx={{ p: 2 }}><Typography>“Best cab service in Nuwara Eliya! Clean cars and friendly drivers.”</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>- Anushka P.</Typography></Card></Grid>
          <Grid item xs={12} md={4}><Card sx={{ p: 2 }}><Typography>“Booking was easy and the ride was comfortable. Highly recommend!”</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>- Kavindi S.</Typography></Card></Grid>
          <Grid item xs={12} md={4}><Card sx={{ p: 2 }}><Typography>“Professional and punctual. Will use again!”</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>- Michael D.</Typography></Card></Grid>
        </Grid>
      </Box>

      {/* Contact/Support Info */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6, p: 3, background: '#e3f2fd', borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom>Contact & Support</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }} elevation={0}><PhoneIcon color="primary" /><Typography>+94 77 123 4567</Typography></Paper></Grid>
          <Grid item xs={12} md={4}><Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }} elevation={0}><EmailIcon color="primary" /><Typography>info@nuwaraeliyacabs.com</Typography></Paper></Grid>
        </Grid>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}>
        <Typography variant="h4" align="center" gutterBottom>Frequently Asked Questions</Typography>
        <Divider sx={{ mb: 2 }} />
        <Typography fontWeight="bold">How do I book a cab?</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>Use our online booking form or call our hotline to reserve your ride.</Typography>
        <Typography fontWeight="bold">Can I book for a group?</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>Yes, we have cars for group travel. Select your preferred vehicle when booking.</Typography>
        <Typography fontWeight="bold">What payment methods do you accept?</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>We accept credit/debit cards and online payments via Stripe.</Typography>
      </Box>
    </Box>
  );
}
