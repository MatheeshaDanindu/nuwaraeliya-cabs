import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { loadStripe } from '@stripe/stripe-js';

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const sessionId = searchParams.get("session_id"); // Stripe may redirect with this param

  useEffect(() => {
    const confirmPayment = async () => {
      if (!bookingId || !sessionId) return;
      try {
        // Fetch the Stripe session details from the backend (you may need to add a backend endpoint for this)
        const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_STRIPE_SECRET_KEY}` // You may need to proxy this via backend for security
          }
        });
        const session = await stripeRes.json();
        const payment_intent = session.payment_intent;
        const receipt_url = session.payment_status === 'paid' && session.payment_intent ? session.charges?.data?.[0]?.receipt_url : null;
        const amount = session.amount_total / 100;
        // Send payment details to backend
        await fetch(`http://localhost:5000/api/bookings/${bookingId}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_intent, receipt_url, amount })
        });
      } catch (err) {
        // Fallback: just update status if details can't be fetched
        await fetch(`http://localhost:5000/api/payment/update-booking-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, status: "confirmed" })
        });
      }
    };
    if (bookingId) {
      confirmPayment();
    }
  }, [bookingId, sessionId]);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, textAlign: "center" }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Booking Successful!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Your booking has been successfully completed. Thank you for choosing us!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
      >
        Go to Home
      </Button>
    </Box>
  );
}