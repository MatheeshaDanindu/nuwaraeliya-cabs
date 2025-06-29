// PayAdvance component: handles advance payment for a booking using Stripe Checkout
import React, { useState } from 'react';
import { Button, Alert, Box } from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';


const stripePromise = loadStripe("pk_test_51RPiww2ejiMatmVDt54lb3toNqF4zyXaZqhWr72r9ZQ3pj9xb9rUROV9EahGnjGyn0GCAY8DXev1U6HC9QDeC2h600ZCpNVynT");   

export default function PayAdvance({ booking, onPaid }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);




  // Simulate Stripe payment (replace with real Stripe Elements in production)
  const handlePay = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    const stripe = await stripePromise;
    const response = await fetch('http://localhost:5000/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: booking.advance_paid,
        bookingId: booking.id,
        status:booking.status,

       })
    });
    const session = await response.json();
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
    if(result.error) {
      alert(result.error.message);
    }

  };

  if (success) return <Alert severity="success">Advance payment successful! Your booking is now confirmed.</Alert>;

  return (
    <Box sx={{ my: 2 }}>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      <Button variant="contained" color="success" onClick={handlePay} disabled={loading}>
        {loading ? 'Processing...' : `Pay Advance (Rs. ${booking.advance_paid})`}
      </Button>
    </Box>
  );
}
