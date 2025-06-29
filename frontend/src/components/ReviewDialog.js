// ReviewDialog component: modal for submitting a review and rating for a booking
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Rating, TextField, Alert } from '@mui/material';

export default function ReviewDialog({ open, onClose, onSubmit, bookingId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setSuccess(''); setLoading(true);
    if (!rating) { setError('Please provide a rating.'); setLoading(false); return; }
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId, rating, comment, user: user.id })
      });
      if (res.ok) {
        setSuccess('Review submitted!');
        setTimeout(() => { onSubmit(); onClose(); }, 1000);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to submit review.');
      }
    } catch {
      setError('Network error.');
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate Your Ride</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Rating value={rating} onChange={(_, v) => setRating(v)} max={5} sx={{ mb: 2 }} />
        <TextField
          label="Comment (optional)"
          value={comment}
          onChange={e => setComment(e.target.value)}
          fullWidth
          multiline
          minRows={2}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || !rating}>Submit</Button>
      </DialogActions>
    </Dialog>
  );
}
