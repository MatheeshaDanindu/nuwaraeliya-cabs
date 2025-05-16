import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []));
  }, [dialogOpen]);

  const handleAction = (booking, actionType) => {
    setSelected(booking);
    setAction(actionType);
    setDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selected) return;
    await fetch(`http://localhost:5000/api/bookings/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: action === 'approve' ? 'confirmed' : 'cancelled' })
    });
    setDialogOpen(false);
  };

  const handleClose = () => setDialogOpen(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>All Bookings</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Vehicle</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map(b => (
              <TableRow key={b.id}>
                <TableCell>{b.id}</TableCell>
                <TableCell>{b.user_name}</TableCell>
                <TableCell>{b.user_email}</TableCell>
                <TableCell>{b.vehicle_model}</TableCell>
                <TableCell>{b.start_time?.replace('T', ' ').slice(0, 16)}</TableCell>
                <TableCell>{b.end_time?.replace('T', ' ').slice(0, 16)}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell>
                  {b.status === 'pending' && (
                    <>
                      <Button color="success" variant="contained" size="small" sx={{ mr: 1 }} onClick={() => handleAction(b, 'approve')}>Approve</Button>
                      <Button color="error" variant="contained" size="small" onClick={() => handleAction(b, 'cancel')}>Cancel</Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <Button color="error" variant="outlined" size="small" onClick={() => handleAction(b, 'cancel')}>Cancel</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>{action === 'approve' ? 'Approve Booking' : 'Cancel Booking'}</DialogTitle>
        <DialogContent>
          Are you sure you want to {action} this booking?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={handleConfirm} color={action === 'approve' ? 'success' : 'error'} variant="contained">Yes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}