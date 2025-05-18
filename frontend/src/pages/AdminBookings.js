import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState('');
  const [meterDialog, setMeterDialog] = useState({ open: false, booking: null, type: null });
  const [meterForm, setMeterForm] = useState({ start_meter: '', actual_start_time: '', end_meter: '', actual_end_time: '' });
  const [meterResult, setMeterResult] = useState(null);
  const [meterError, setMeterError] = useState('');
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    fetch('http://localhost:5000/api/bookings')
      .then(res => res.json())
      .then(data => setBookings(Array.isArray(data) ? data : []));
  }, [dialogOpen, refreshFlag]);

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
      body: JSON.stringify({ status: action === 'approve' ? 'approved' : 'cancelled' })
    });
    setDialogOpen(false);
  };

  const handleClose = () => setDialogOpen(false);

  const openMeterDialog = (booking, type) => {
    setMeterDialog({ open: true, booking, type });
    setMeterForm({
      start_meter: booking.start_meter || '',
      actual_start_time: booking.actual_start_time ? booking.actual_start_time.slice(0, 16) : '',
      end_meter: booking.end_meter || '',
      actual_end_time: booking.actual_end_time ? booking.actual_end_time.slice(0, 16) : '',
    });
    setMeterResult(null);
    setMeterError('');
  };

  const closeMeterDialog = () => setMeterDialog({ open: false, booking: null, type: null });

  const handleMeterChange = e => setMeterForm({ ...meterForm, [e.target.name]: e.target.value });

  const handleMeterSubmit = async e => {
    e.preventDefault();
    setMeterError('');
    setMeterResult(null);
    const { booking, type } = meterDialog;
    if (type === 'start') {
      if (!meterForm.start_meter || !meterForm.actual_start_time) {
        setMeterError('Start meter and time required');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}/start`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_meter: meterForm.start_meter, actual_start_time: meterForm.actual_start_time })
      });
      if (res.ok) {
        setMeterDialog({ ...meterDialog, open: false });
        setRefreshFlag(f => f + 1);
      } else {
        const err = await res.json();
        setMeterError(err.error || 'Failed to save start meter.');
      }
    } else if (type === 'end') {
      if (!meterForm.end_meter || !meterForm.actual_end_time) {
        setMeterError('End meter and time required');
        return;
      }
      const res = await fetch(`http://localhost:5000/api/bookings/${booking.id}/end`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_meter: meterForm.end_meter, actual_end_time: meterForm.actual_end_time })
      });
      if (res.ok) {
        const data = await res.json();
        setMeterResult(data);
        setRefreshFlag(f => f + 1);
      } else {
        const err = await res.json();
        setMeterError(err.error || 'Failed to save end meter.');
      }
    }
  };

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
              <TableCell>Driver</TableCell>
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Advance Paid</TableCell>
              <TableCell>Total Fee</TableCell>
              <TableCell>Balance Due</TableCell>
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
                <TableCell>{b.driver_name ? `${b.driver_name} (${b.driver_email})` : 'N/A'}</TableCell>
                <TableCell>{b.start_time?.replace('T', ' ').slice(0, 16)}</TableCell>
                <TableCell>{b.end_time?.replace('T', ' ').slice(0, 16)}</TableCell>
                <TableCell>{b.status}</TableCell>
                <TableCell>{b.payment_status === 'paid' && b.advance_paid ? `Rs. ${Number(b.advance_paid).toLocaleString()}` : b.payment_status === 'unpaid' ? 'Unpaid' : '-'}</TableCell>
                <TableCell>{b.total_fee ? `Rs. ${Number(b.total_fee).toLocaleString()}` : '-'}</TableCell>
                <TableCell>{b.total_fee && b.advance_paid ? `Rs. ${(Number(b.total_fee) - Number(b.advance_paid)).toLocaleString()}` : '-'}</TableCell>
                <TableCell>
                  {b.payment_status !== 'paid' && (
                    <Button color="success" variant="outlined" size="small" sx={{ mb: 1 }} onClick={async () => {
                      await fetch(`http://localhost:5000/api/bookings/${b.id}/confirm-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ payment_intent: b.payment_intent_id, amount: b.advance_paid })
                      });
                      setRefreshFlag(f => f + 1);
                    }}>Mark as Paid</Button>
                  )}
                  {b.payment_status === 'paid' && b.payment_receipt_url && (
                    <Button href={b.payment_receipt_url} target="_blank" rel="noopener" size="small" variant="outlined" sx={{ mb: 1 }}>
                      View Receipt
                    </Button>
                  )}
                  {b.status === 'pending' && (
                    <>
                      <Button color="success" variant="contained" size="small" sx={{ mr: 1 }} onClick={() => handleAction(b, 'approve')}>Approve</Button>
                      <Button color="error" variant="contained" size="small" onClick={() => handleAction(b, 'cancel')}>Cancel</Button>
                    </>
                  )}
                  {b.status === 'confirmed' && (
                    <>
                      <Button color="info" variant="outlined" size="small" sx={{ mr: 1 }} onClick={() => openMeterDialog(b, 'start')}>Start Trip</Button>
                      <Button color="warning" variant="outlined" size="small" onClick={() => openMeterDialog(b, 'end')}>End Trip</Button>
                      <Button color="error" variant="outlined" size="small" onClick={() => handleAction(b, 'cancel')}>Cancel</Button>
                    </>
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
      <Dialog open={meterDialog.open} onClose={closeMeterDialog}>
        <DialogTitle>{meterDialog.type === 'start' ? 'Start Trip' : 'End Trip'}</DialogTitle>
        <form onSubmit={handleMeterSubmit}>
          <DialogContent>
            {meterDialog.type === 'start' ? (
              <>
                <TextField label="Start Meter" name="start_meter" type="number" value={meterForm.start_meter} onChange={handleMeterChange} fullWidth margin="normal" required />
                <TextField label="Actual Start Time" name="actual_start_time" type="datetime-local" value={meterForm.actual_start_time} onChange={handleMeterChange} fullWidth margin="normal" required />
              </>
            ) : (
              <>
                <TextField label="End Meter" name="end_meter" type="number" value={meterForm.end_meter} onChange={handleMeterChange} fullWidth margin="normal" required />
                <TextField label="Actual End Time" name="actual_end_time" type="datetime-local" value={meterForm.actual_end_time} onChange={handleMeterChange} fullWidth margin="normal" required />
                {meterResult && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <div>Total Distance: <b>{meterResult.total_km} km</b></div>
                    <div>Total Hours: <b>{meterResult.total_hours?.toFixed(2)}</b></div>
                    <div>Extra KM: <b>{meterResult.extra_km}</b> (Fee: Rs. {meterResult.extra_km_fee})</div>
                    <div>Extra Hours: <b>{meterResult.extra_hours}</b> (Fee: Rs. {meterResult.extra_hour_fee})</div>
                    <div><b>Total Fee: Rs. {meterResult.total_fee}</b></div>
                  </Alert>
                )}
              </>
            )}
            {meterError && <Alert severity="error" sx={{ mt: 2 }}>{meterError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeMeterDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}