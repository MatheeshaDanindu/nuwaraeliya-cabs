import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Paper, Rating, Avatar } from '@mui/material';

export default function DriverDetails() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch driver details
      const dRes = await fetch(`http://localhost:5000/api/users/${id}`);
      const dData = dRes.ok ? await dRes.json() : null;
      setDriver(dData);
      // Fetch driver reviews
      const rRes = await fetch(`http://localhost:5000/api/reviews/driver/${id}`);
      setReviews(rRes.ok ? await rRes.json() : []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  useEffect(() => {
    async function fetchVehicles() {
      const vRes = await fetch('http://localhost:5000/api/vehicles');
      if (vRes.ok) {
        const allVehicles = await vRes.json();
        // If your schema has driver_id in vehicles, filter by driver_id
        const assigned = allVehicles.filter(v => String(v.driver_id) === String(id));
        setVehicles(assigned);
      }
    }
    fetchVehicles();
  }, [id]);

  if (loading) return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;
  if (!driver) return <Box sx={{ p: 4 }}><Typography color="error">Driver not found.</Typography></Box>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            {driver.profile_picture_path ? (
              <Avatar sx={{ width: 80, height: 80 }} src={`http://localhost:5000/uploads/${driver.profile_picture_path}`} />
            ) : (
              <Avatar sx={{ width: 80, height: 80 }}>{driver.name?.[0]}</Avatar>
            )}
          </Grid>
          <Grid item xs>
            <Typography variant="h5">{driver.name}</Typography>
            <Typography>Email: {driver.email}</Typography>
            {driver.phone && <Typography>Phone: {driver.phone}</Typography>}
          </Grid>
        </Grid>
      </Paper>
     
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {vehicles.map(vehicle => (
            <Grid item xs={12} md={6} key={vehicle.id}>
              <Card sx={{ background: '#f5f5f5' }}>
                <CardContent>
                  <Typography variant="h6">{vehicle.model}</Typography>
                  <Typography>Number Plate: {vehicle.number_plate}</Typography>
                  <Typography>Capacity: {vehicle.capacity}</Typography>
                  <Typography>Status: {vehicle.status}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
    
      <Typography variant="h5" gutterBottom>Driver Reviews</Typography>
      {reviews.length === 0 ? (
        <Typography>No reviews for this driver yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {reviews.map((review, idx) => (
            <Grid item xs={12} key={idx}>
              <Card>
                <CardContent>
                  <Rating value={review.rating} readOnly max={5} />
                  <Typography variant="body2">{review.comment}</Typography>
                  <Typography variant="caption" color="text.secondary">{review.created_at ? new Date(review.created_at).toLocaleString() : ''}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
