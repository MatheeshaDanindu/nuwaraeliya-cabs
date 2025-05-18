import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";

export default function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const sessionId = searchParams.get("session_id");
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [amount, setAmount] = useState(null);
  const [paidAt, setPaidAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      if (!bookingId || !sessionId) return;
      setLoading(true);
      setError("");
      try {
        // Fetch the Stripe session details from the backend (secure proxy)
        const stripeRes = await fetch(`http://localhost:5000/api/stripe/session/${sessionId}`);
        if (!stripeRes.ok) throw new Error("Failed to fetch payment session");
        const session = await stripeRes.json();
        // Stripe session: expand payment_intent and charges
        let payment_intent = session.payment_intent?.id || session.payment_intent;
        let receipt_url = session.payment_intent?.charges?.data?.[0]?.receipt_url || null;
        let paid = session.payment_status === 'paid';
        let paid_at = session.payment_intent?.charges?.data?.[0]?.created
          ? new Date(session.payment_intent.charges.data[0].created * 1000)
          : null;
        let amount_paid = session.amount_total ? session.amount_total / 100 : null;
        setReceiptUrl(receipt_url);
        setAmount(amount_paid);
        setPaidAt(paid_at);
        // Send payment details to backend
        await fetch(`http://localhost:5000/api/bookings/${bookingId}/confirm-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ payment_intent, receipt_url, amount: amount_paid })
        });
      } catch (err) {
        setError("Payment processed, but failed to fetch receipt details.");
        // Fallback: just update status if details can't be fetched
        await fetch(`http://localhost:5000/api/payment/update-booking-status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, status: "confirmed" })
        });
      }
      setLoading(false);
    };
    if (bookingId && sessionId) {
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
      {loading && <Typography>Processing payment and fetching receipt...</Typography>}
      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
      {receiptUrl && (
        <Box sx={{ my: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Payment Receipt</Typography>
          <Typography>Amount Paid: <b>Rs. {amount?.toLocaleString()}</b></Typography>
          {paidAt && <Typography>Paid At: {paidAt.toLocaleString()}</Typography>}
          <Button href={receiptUrl} target="_blank" rel="noopener" variant="outlined" sx={{ mt: 1 }}>
            View Stripe Receipt
          </Button>
        </Box>
      )}
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