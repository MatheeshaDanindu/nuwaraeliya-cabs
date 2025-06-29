// Profile page: user info, edit profile, bookings, reviews, and profile picture
import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Paper, List, ListItem, ListItemText, Alert, Avatar } from '@mui/material';
import PayAdvance from '../components/PayAdvance';
import ReviewDialog from '../components/ReviewDialog';

export default function Profile() {
  // State for user profile, bookings, editing, reviews, and profile picture
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [editing, setEditing] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [reviewDialog, setReviewDialog] = useState({ open: false, bookingId: null });
  const [reviewedBookings, setReviewedBookings] = useState({});
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [userRole, setUserRole] = useState('');

  // Fetch user info and bookings on mount or when editing/success changes
  useEffect(() => {
    // Fetch user info from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role || '');
      fetch(`http://localhost:5000/api/users/${user.id}`)
        .then(res => res.json())
        .then(data => {
          setProfile({ name: data.name, email: data.email, phone: data.phone || '' });
          if (data.profile_picture_path) {
            setProfilePicturePreview(`http://localhost:5000/uploads/${data.profile_picture_path}`);
          }
        });
      fetch(`http://localhost:5000/api/bookings/user/${user.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []));
    }
  }, [editing, success]);

  // Fetch which bookings have reviews (only for completed bookings)
  useEffect(() => {
    async function fetchReviews() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;
      // Only check completed bookings
      const completed = bookings.filter(b => b.status === 'completed');
      const reviewMap = {};
      for (let b of completed) {
        try {
          const r = await fetch(`http://localhost:5000/api/reviews/booking/${b.id}`);
          reviewMap[b.id] = r.ok;
        } catch { reviewMap[b.id] = false; }
      }
      setReviewedBookings(reviewMap);
    }
    fetchReviews();
  }, [bookings]);

  const handleChange = e => setProfile({ ...profile, [e.target.name]: e.target.value });

  const handleEdit = () => setEditing(true);

  const handleProfilePictureFile = e => {
    const file = e.target.files[0];
    setProfilePicture(file);
    setProfilePicturePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      let res;
      if (profilePicture) {
        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('email', profile.email);
        formData.append('phone', profile.phone);
        formData.append('profile_picture', profilePicture);
        res = await fetch(`http://localhost:5000/api/users/${user.id}/profile-picture`, {
          method: 'PUT',
          body: formData
        });
      } else {
        res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        });
      }
      if (res.ok) {
        setSuccess('Profile updated successfully!');
        setEditing(false);
        setProfilePicture(null);
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to update profile.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  // Cancel booking handler for customers
  const handleCancelBooking = async (bookingId) => {
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to cancel booking.');
        return;
      }
      setSuccess('Booking cancelled successfully.');
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ p: 2, mb: 3, position: 'relative' }}>
        <form onSubmit={handleSave} encType="multipart/form-data">
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={profilePicturePreview} sx={{ width: 80, height: 80, mr: 2 }} />
            {editing && (
              <Button component="label" variant="outlined">
                {profilePicture ? 'Change Picture' : 'Upload Picture'}
                <input type="file" accept="image/*" hidden onChange={handleProfilePictureFile} disabled={!editing} />
              </Button>
            )}
          </Box>
          <TextField
            label="Name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editing}
          />
          <TextField
            label="Email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editing}
          />
          <TextField
            label="Phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={!editing}
          />
          {editing && (
            <Button type="submit" variant="contained" color="primary" sx={{ position: 'absolute', top: -16, right: 16 }}>
              Save
            </Button>
          )}
        </form>
        {!editing && (
          <Button variant="outlined" color="primary" sx={{ position: 'absolute', top: -16, right: 16 }} onClick={handleEdit}>
            Edit Profile
          </Button>
        )}
      </Paper>
      {/* Only show booking history for customers */}
      {userRole === 'customer' && (
        <>
          <Typography variant="h6" gutterBottom>Booking History</Typography>
          <List>
            {bookings.length === 0 && <ListItem><ListItemText primary="No bookings found." /></ListItem>}
            {bookings.map(b => (
              <ListItem key={b.id} divider secondaryAction={
                <>
                  {b.driver_id && (
                    <Button size="small" color="info" variant="outlined" sx={{ mr: 1 }} onClick={() => window.location.href = `/driver/${b.driver_id}`}>
                      View Driver
                    </Button>
                  )}
                  {b.status === 'approved' ? (
                    <PayAdvance booking={b} onPaid={() => {
                      setSuccess('Advance payment successful! Booking confirmed.');
                      // Refresh bookings
                      const user = JSON.parse(localStorage.getItem('user'));
                      fetch(`http://localhost:5000/api/bookings/user/${user.id}`)
                        .then(res => res.json())
                        .then(data => setBookings(Array.isArray(data) ? data : []));
                    }} />
                  ) : b.status === 'completed' ? (
                    !reviewedBookings[b.id] ? (
                      <Button size="small" color="primary" variant="contained" onClick={() => setReviewDialog({ open: true, bookingId: b.id })}>
                        Rate & Review
                      </Button>
                    ) : (
                      <Typography variant="body2" color="success.main">Reviewed</Typography>
                    )
                  ) : b.status !== 'cancelled' ? (
                    <Button size="small" color="error" variant="outlined" onClick={() => handleCancelBooking(b.id)}>
                      Cancel
                    </Button>
                  ) : null}
                </>
              }>
                <ListItemText
                  primary={`${b.vehicle_model || b.vehicle || ''} - ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
                  secondary={`Status: ${b.status || 'N/A'} | Payment: ${b.payment_status || 'N/A'}`}
                />
                {/* Show payment receipt if available */}
                {b.payment_status === 'paid' && b.payment_receipt_url && (
                  <Box sx={{ ml: 2, minWidth: 180 }}>
                    <Typography variant="body2" color="success.main">Advance Paid</Typography>
                    <Button href={b.payment_receipt_url} target="_blank" rel="noopener" size="small" variant="outlined" sx={{ mt: 0.5 }}>
                      View Receipt
                    </Button>
                    {b.paid_at && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Paid At: {new Date(b.paid_at).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                )}
              </ListItem>
            ))}
          </List>
        </>
      )}
      <ReviewDialog
        open={reviewDialog.open}
        bookingId={reviewDialog.bookingId}
        onClose={() => setReviewDialog({ open: false, bookingId: null })}
        onSubmit={() => setSuccess('Review submitted!')}
      />
    </Box>
  );
}
