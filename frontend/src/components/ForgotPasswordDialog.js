// ForgotPasswordDialog component: modal for requesting a password reset link
import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';

export default function ForgotPasswordDialog({ open, onClose }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    setError('');
    // Simulate API call
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1200);
    // In real app, POST to /api/forgot-password
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Forgot Password</DialogTitle>
      <DialogContent>
        {sent ? (
          <Alert severity="success">If this email is registered, a reset link has been sent.</Alert>
        ) : (
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
        )}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {!sent && <Button onClick={handleSend} disabled={loading || !email} variant="contained">{loading ? 'Sending...' : 'Send Reset Link'}</Button>}
      </DialogActions>
    </Dialog>
  );
}
