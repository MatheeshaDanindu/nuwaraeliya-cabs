// Dashboard component: user dashboard with stats, bookings, reviews, analytics, and quick booking
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, CircularProgress, Avatar, Chip, LinearProgress, List, ListItem, ListItemText, Divider, Alert, Box as MuiBox, Paper, TextField, Rating } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from '../pages/AdminDashboard';
import ReviewDialog from './ReviewDialog';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ bookings: 0, vehicles: 0 });
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [analytics, setAnalytics] = useState({ totalRides: 0, totalSpent: 0, mostUsedVehicle: null });
  const [promotions, setPromotions] = useState([]);
  const navigate = useNavigate();

  // Quick Booking Widget state
  const [quickBooking, setQuickBooking] = useState({ pickup: '', drop: '', start_time: '', end_time: '' });
  const [quickBookingSuccess, setQuickBookingSuccess] = useState('');
  const [quickBookingError, setQuickBookingError] = useState('');

  const handleQuickBookingChange = e => setQuickBooking({ ...quickBooking, [e.target.name]: e.target.value });
  const handleQuickBooking = async e => {
    e.preventDefault();
    setQuickBookingSuccess('');
    setQuickBookingError('');
    const userData = localStorage.getItem('user');
    if (!userData) return setQuickBookingError('You must be logged in.');
    // For demo: assign a default vehicle and driver (extend as needed)
    try {
      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicle_id: 1, // TODO: let user select vehicle
          user_id: JSON.parse(userData).id,
          driver_id: 1, // TODO: assign driver properly
          package_id: 1, // TODO: let user select package
          start_time: quickBooking.start_time,
          end_time: quickBooking.end_time,
          notes: `Pickup: ${quickBooking.pickup}, Drop: ${quickBooking.drop}`
        })
      });
      if (res.ok) {
        setQuickBookingSuccess('Booking request submitted!');
        setQuickBooking({ pickup: '', drop: '', start_time: '', end_time: '' });
      } else {
        const err = await res.json();
        setQuickBookingError(err.error || 'Booking failed.');
      }
    } catch {
      setQuickBookingError('Network error.');
    }
  };

  // Add/remove favorites logic
  const saveFavorites = favs => {
    setFavorites(favs);
    localStorage.setItem('favorites', JSON.stringify(favs));
  };
  const handleAddFavorite = fav => {
    if (!favorites.some(f => f.id === fav.id && f.type === fav.type)) {
      saveFavorites([...favorites, fav]);
    }
  };
  const handleRemoveFavorite = fav => {
    saveFavorites(favorites.filter(f => !(f.id === fav.id && f.type === fav.type)));
  };

  const [editReview, setEditReview] = useState(null); // {review, open}
  const [reviewActionMsg, setReviewActionMsg] = useState('');
  const [reviewActionError, setReviewActionError] = useState('');

  const handleEditReview = review => {
    setEditReview({ review, open: true });
    setReviewActionMsg('');
    setReviewActionError('');
  };
  const handleCloseEditReview = () => setEditReview(null);
  const handleSubmitEditReview = async (updatedReview) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${updatedReview.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReview)
      });
      if (res.ok) {
        setReviews(reviews.map(r => r.id === updatedReview.id ? { ...r, ...updatedReview } : r));
        setReviewActionMsg('Review updated!');
        setEditReview(null);
      } else {
        setReviewActionError('Failed to update review.');
      }
    } catch {
      setReviewActionError('Network error.');
    }
  };
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId));
        setReviewActionMsg('Review deleted.');
      } else {
        setReviewActionError('Failed to delete review.');
      }
    } catch {
      setReviewActionError('Network error.');
    }
  };

  useEffect(() => {
    // Fetch user info from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      // Fetch latest user info from backend for up-to-date profile picture
      fetch(`http://localhost:5000/api/users/${userObj.id}`)
        .then(res => res.json())
        .then(data => setUser(data));
    }
    // Fetch dashboard stats from backend (mocked for now)
    async function fetchStats() {
      try {
        // Replace with your backend endpoints
        const bookingsRes = await fetch('http://localhost:5000/api/bookings/count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const vehiclesRes = await fetch('http://localhost:5000/api/vehicles/count', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const bookings = bookingsRes.ok ? (await bookingsRes.json()).count : 0;
        const vehicles = vehiclesRes.ok ? (await vehiclesRes.json()).count : 0;
        setStats({ bookings, vehicles });
      } catch {
        setStats({ bookings: 0, vehicles: 0 });
      }
      setLoading(false);
    }
    fetchStats();

    // Fetch user bookings
    if (userData) {
      const userObj = JSON.parse(userData);
      fetch(`http://localhost:5000/api/bookings/user/${userObj.id}`)
        .then(res => res.json())
        .then(data => setBookings(Array.isArray(data) ? data : []));
    }

    // Fetch user reviews
    if (userData) {
      const userObj = JSON.parse(userData);
      fetch(`http://localhost:5000/api/reviews/user/${userObj.id}`)
        .then(res => res.json())
        .then(data => setReviews(Array.isArray(data) ? data : []));
    }

    // Fetch user analytics
    if (userData) {
      const userObj = JSON.parse(userData);
      fetch(`http://localhost:5000/api/analytics/user/${userObj.id}`)
        .then(res => res.json())
        .then(data => setAnalytics(data));
    }

    // Load favorites from localStorage (for demo; in production, fetch from backend)
    const favs = localStorage.getItem('favorites');
    if (favs) setFavorites(JSON.parse(favs));

    // Fetch promotions (future: from backend)
    fetch('http://localhost:5000/api/promotions')
      .then(res => res.ok ? res.json() : [])
      .then(data => setPromotions(Array.isArray(data) ? data : []))
      .catch(() => setPromotions([]));
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/AdminDashboard', { replace: true });
    }
  }, [user, navigate]);

  // Split bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(b => new Date(b.end_time) >= now && b.status !== 'completed' && b.status !== 'cancelled');
  const pastBookings = bookings.filter(b => b.status === 'completed' || new Date(b.end_time) < now);

  // Notifications logic: find the most recent booking with a status change
  const sortedBookings = [...bookings].sort((a, b) => new Date(b.updated_at || b.end_time) - new Date(a.updated_at || a.end_time));
  let notification = null;
  if (sortedBookings.length > 0) {
    const latest = sortedBookings[0];
    if (latest.status === 'approved') {
      notification = { type: 'success', msg: `Your booking for ${latest.vehicle_model || latest.vehicle || ''} was approved!` };
    } else if (latest.status === 'cancelled') {
      notification = { type: 'error', msg: `Your booking for ${latest.vehicle_model || latest.vehicle || ''} was cancelled.` };
    } else if (latest.status === 'completed') {
      notification = { type: 'info', msg: `Your ride for ${latest.vehicle_model || latest.vehicle || ''} is completed.` };
    } else if (latest.status === 'pending') {
      notification = { type: 'warning', msg: `Your booking for ${latest.vehicle_model || latest.vehicle || ''} is pending admin approval.` };
    }
  }

  // Profile Completion Progress logic
  const profileFields = [user?.name, user?.email, user?.phone, user?.profile_picture_path];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
  const profileChecklist = [
    { label: 'Name', done: !!user?.name },
    { label: 'Email', done: !!user?.email },
    { label: 'Phone', done: !!user?.phone },
    { label: 'Profile Picture', done: !!user?.profile_picture_path }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user?.role === 'admin') {
    return null;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {/* Personalized Greeting and Profile */}
          <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={user?.profile_picture_path ? `http://localhost:5000/uploads/${user.profile_picture_path}` : undefined} sx={{ width: 64, height: 64 }}>
              {user?.profile_picture_path ? '' : user?.name?.[0]}
            </Avatar>
            <Box>
              <Typography variant="h5">Welcome, {user?.name}!</Typography>
              <Typography variant="body2">{user?.email}</Typography>
            </Box>
          </Paper>
          {/* Profile Completion Progress */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1">Profile Completion</Typography>
            <LinearProgress variant="determinate" value={profileCompletion} sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
              {profileChecklist.map(item => (
                <Chip key={item.label} label={item.label} color={item.done ? 'success' : 'default'} variant={item.done ? 'filled' : 'outlined'} />
              ))}
            </Box>
            <Typography variant="caption">{profileCompletion === 100 ? 'Profile complete!' : 'Complete your profile for a better experience.'}</Typography>
          </Paper>
          {/* Notifications */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            {notification ? (
              <Alert severity={notification.type}>{notification.msg}</Alert>
            ) : (
              <Alert severity="info">No new notifications.</Alert>
            )}
          </Paper>
          
          {/* Upcoming Bookings */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Upcoming Bookings</Typography>
            <List>
              {upcomingBookings.length === 0 && <ListItem><ListItemText primary="No upcoming bookings." /></ListItem>}
              {upcomingBookings.map(b => (
                <ListItem key={b.id}>
                  <ListItemText
                    primary={`${b.vehicle_model || b.vehicle || ''} - ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
                    secondary={`Status: ${b.status || 'N/A'} | Payment: ${b.payment_status || 'N/A'}`}
                  />
                  <Chip label={b.status} color={b.status === 'approved' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'cancelled' ? 'error' : 'default'} />
                  {b.status !== 'cancelled' && (
                    <Button size="small" sx={{ ml: 1 }}>Cancel</Button>
                  )}
                  {b.payment_status === 'unpaid' && b.status === 'approved' && (
                    <Button size="small" sx={{ ml: 1 }} variant="contained" color="success">Pay</Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
          {/* Past Bookings */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Past Bookings</Typography>
            <List>
              {pastBookings.length === 0 && <ListItem><ListItemText primary="No past bookings." /></ListItem>}
              {pastBookings.map(b => (
                <ListItem key={b.id}>
                  <ListItemText
                    primary={`${b.vehicle_model || b.vehicle || ''} - ${b.start_time?.slice(0, 16).replace('T', ' ')} to ${b.end_time?.slice(0, 16).replace('T', ' ')}`}
                    secondary={`Status: ${b.status || 'N/A'} | Payment: ${b.payment_status || 'N/A'}`}
                  />
                  <Chip label={b.status} color={b.status === 'completed' ? 'primary' : b.status === 'cancelled' ? 'error' : 'default'} />
                  {b.payment_status === 'paid' && b.payment_receipt_url && (
                    <Button size="small" sx={{ ml: 1 }} href={b.payment_receipt_url} target="_blank" rel="noopener">View Receipt</Button>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
          {/* Recent Reviews & Ratings */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Your Recent Reviews</Typography>
            {reviewActionMsg && <Alert severity="success" sx={{ mb: 1 }}>{reviewActionMsg}</Alert>}
            {reviewActionError && <Alert severity="error" sx={{ mb: 1 }}>{reviewActionError}</Alert>}
            <List>
              {reviews.length === 0 && <ListItem><ListItemText primary="You have not submitted any reviews yet." /></ListItem>}
              {reviews.slice(0, 3).map((review, idx) => (
                <ListItem key={idx} alignItems="flex-start" secondaryAction={
                  <>
                    <Button size="small" onClick={() => handleEditReview(review)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDeleteReview(review.id)}>Delete</Button>
                  </>
                }>
                  <Rating value={review.rating} readOnly max={5} />
                  <ListItemText primary={review.comment || 'No comment'} secondary={review.created_at ? new Date(review.created_at).toLocaleDateString() : ''} sx={{ ml: 2 }} />
                </ListItem>
              ))}
            </List>
            {editReview?.open && (
              <ReviewDialog
                open={editReview.open}
                review={editReview.review}
                onClose={handleCloseEditReview}
                onSubmit={handleSubmitEditReview}
                isEdit
              />
            )}
          </Paper>
          {/* Saved Vehicles / Favorite Drivers */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Favorites</Typography>
            <List>
              {favorites.length === 0 && <ListItem><ListItemText primary="No favorites yet. Add drivers or vehicles to favorites for quick access." /></ListItem>}
              {favorites.map((fav, idx) => (
                <ListItem key={idx} secondaryAction={
                  <Button size="small" color="error" onClick={() => handleRemoveFavorite(fav)}>Remove</Button>
                }>
                  <ListItemText primary={fav.type === 'driver' ? `Driver: ${fav.name}` : `Vehicle: ${fav.model}`} />
                  <Button size="small" onClick={() => navigate(fav.type === 'driver' ? `/driver/${fav.id}` : `/vehicles/${fav.id}`)}>View</Button>
                  <Button size="small" onClick={() => navigate(`/booking?${fav.type}=${fav.id}`)}>Book Again</Button>
                </ListItem>
              ))}
            </List>
          </Paper>
          {/* Analytics & Insights */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Your Ride Stats</Typography>
            <Typography>Total Rides: {analytics.totalRides}</Typography>
            <Typography>Total Spent: Rs. {analytics.totalSpent?.toLocaleString()}</Typography>
            <Typography>Most Used Vehicle: {analytics.mostUsedVehicle || 'N/A'}</Typography>
          </Paper>
          {/* Support & Help */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Support & Help</Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>Frequently Asked Questions</Typography>
            <List dense>
              <ListItem><ListItemText primary="How do I book a cab?" secondary="Use the Quick Booking widget or the Book a Cab button. Choose your vehicle, dates, and submit." /></ListItem>
              <ListItem><ListItemText primary="How do I pay?" secondary="Once your booking is approved, you can pay the advance online via Stripe." /></ListItem>
              <ListItem><ListItemText primary="How do I contact support?" secondary="Click the Contact Support button below to email us." /></ListItem>
              <ListItem><ListItemText primary="Can I cancel a booking?" secondary="Yes, you can cancel an upcoming booking from your dashboard." /></ListItem>
            </List>
            <Button variant="outlined" sx={{ mt: 2 }} href="mailto:matheeshadanindu@gmail.com?subject=Cab%20Booking%20Support">Contact Support</Button>
          </Paper>
          {/* Promotions & Offers */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Promotions & Offers</Typography>
            {promotions.length === 0 ? (
              <Alert severity="success">Get 10% off your next ride! Use code: CAB10</Alert>
            ) : (
              <List dense>
                {promotions.map((promo, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={promo.title} secondary={promo.description} />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
          {/* Downloadable Documents */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6">Downloadable Documents</Typography>
            <List>
              {pastBookings.filter(b => b.payment_status === 'paid' && b.payment_receipt_url).length === 0 && (
                <ListItem><ListItemText primary="No invoices available yet. Paid/completed bookings will appear here." /></ListItem>
              )}
              {pastBookings.filter(b => b.payment_status === 'paid' && b.payment_receipt_url).map(b => (
                <ListItem key={b.id}>
                  <ListItemText
                    primary={`Invoice for ${b.vehicle_model || b.vehicle || ''} (${b.start_time?.slice(0, 16).replace('T', ' ')})`}
                    secondary={`Amount Paid: Rs. ${b.advance_paid?.toLocaleString()}`}
                  />
                  <Button
                    variant="outlined"
                    href={b.payment_receipt_url}
                    target="_blank"
                    rel="noopener"
                  >
                    Download Invoice
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          {/* Sidebar: Profile, Quick Links, etc. */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6">Quick Links</Typography>
            <Button fullWidth sx={{ mb: 1 }} variant="contained" onClick={() => navigate('/Booking')}>Book a Cab</Button>
            <Button fullWidth sx={{ mb: 1 }} variant="outlined" onClick={() => navigate('/Profile')}>Manage Profile</Button>
            <Button fullWidth sx={{ mb: 1 }} variant="outlined" onClick={() => navigate('/Vehicles')}>View Vehicles</Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
