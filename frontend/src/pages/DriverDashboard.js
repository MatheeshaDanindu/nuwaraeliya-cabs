// src/pages/DriverDashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function DriverDashboard() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      fetch(`http://localhost:5000/api/bookings/driver/${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []))
        .catch(() => setError('Failed to fetch schedule.'));
    }
  }, []);

  const now = new Date();
  // Only show upcoming rides that are NOT completed or cancelled
  const upcoming = bookings.filter(b => new Date(b.end_time) >= now && b.status !== 'completed' && b.status !== 'cancelled');
  // Completed rides: status === 'completed'
  const completed = bookings.filter(b => b.status === 'completed');

  const handleMarkCompleted = async (bookingId) => {
    setActionError('');
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });
      if (!res.ok) {
        const err = await res.json();
        setActionError(err.error || 'Failed to mark as completed.');
        return;
      }
      // Refresh bookings (wait for update before fetching)
      const user = JSON.parse(localStorage.getItem('user'));
      const bookingsRes = await fetch(`http://localhost:5000/api/bookings/driver/${user.id}`);
      const data = await bookingsRes.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setActionError('Network error.');
    }
  };

  // Customer cancel booking
  const handleCancelBooking = async (bookingId) => {
    setActionError('');
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) {
        const err = await res.json();
        setActionError(err.error || 'Failed to cancel booking.');
        return;
      }
      // Refresh bookings
      const user = JSON.parse(localStorage.getItem('user'));
      const bookingsRes = await fetch(`http://localhost:5000/api/bookings/driver/${user.id}`);
      const data = await bookingsRes.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setActionError('Network error.');
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBooking(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Rides</Typography>
      {error && <Typography color="error">{error}</Typography>}
      {actionError && <Typography color="error">{actionError}</Typography>}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Upcoming Rides</Typography>
        <List>
          {upcoming.length === 0 && <ListItem><ListItemText primary="No upcoming rides." /></ListItem>}
          {upcoming.map(b => (
            <ListItem key={b.id} divider secondaryAction={
              <Box sx={{ display: 'flex', gap: 1 }}>
                {b.status !== 'completed' && b.status !== 'cancelled' && (
                  <>
                    <Button size="small" color="success" variant="contained" onClick={() => handleMarkCompleted(b.id)}>
                      Mark as Completed
                    </Button>
                    {/* Only show Cancel button if user is a customer */}
                    {JSON.parse(localStorage.getItem('user'))?.role === 'customer' && (
                      <Button size="small" color="error" variant="outlined" onClick={() => handleCancelBooking(b.id)}>
                        Cancel
                      </Button>
                    )}
                  </>
                )}
                <Button size="small" color="primary" variant="outlined" onClick={() => handleViewDetails(b)}>
                  View Details
                </Button>
              </Box>
            }>
              <ListItemText
                primary={`${b.vehicle_model} | ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
                secondary={`Customer: ${b.customer_name} (${b.customer_email}) | Status: ${b.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>Completed Rides</Typography>
        <List>
          {completed.length === 0 && <ListItem><ListItemText primary="No completed rides." /></ListItem>}
          {completed.map(b => (
            <ListItem key={b.id} divider secondaryAction={
              <Button size="small" color="primary" variant="outlined" onClick={() => handleViewDetails(b)}>
                View Details
              </Button>
            }>
              <ListItemText
                primary={`${b.vehicle_model} | ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
                secondary={`Customer: ${b.customer_name} (${b.customer_email}) | Status: ${b.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      <Dialog open={detailsOpen} onClose={handleCloseDetails}>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography><b>Vehicle:</b> {selectedBooking.vehicle_model}</Typography>
              <Typography><b>Start:</b> {selectedBooking.start_time?.replace('T', ' ').slice(0, 16)}</Typography>
              <Typography><b>End:</b> {selectedBooking.end_time?.replace('T', ' ').slice(0, 16)}</Typography>
              <Typography><b>Customer:</b> {selectedBooking.customer_name} ({selectedBooking.customer_email})</Typography>
              <Typography><b>Status:</b> {selectedBooking.status}</Typography>
              {selectedBooking.notes && <Typography><b>Notes:</b> {selectedBooking.notes}</Typography>}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
