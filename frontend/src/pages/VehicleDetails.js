import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardHeader, Divider, Button, Grid, Paper, Rating, CardMedia } from '@mui/material';

export default function VehicleDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [packages, setPackages] = useState([]);
  const [vehicleReviews, setVehicleReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      // Fetch vehicle details
      const vRes = await fetch(`http://localhost:5000/api/vehicles`);
      const vData = vRes.ok ? await vRes.json() : [];
      const found = vData.find(v => String(v.id) === String(id));
      setVehicle(found || null);
      // Fetch packages
      const pRes = await fetch(`http://localhost:5000/api/vehicles/${id}/packages`);
      setPackages(pRes.ok ? await pRes.json() : []);
      // Fetch vehicle reviews
      const vehRevRes = await fetch(`http://localhost:5000/api/reviews/vehicle/${id}`);
      setVehicleReviews(vehRevRes.ok ? await vehRevRes.json() : []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <Box sx={{ p: 4 }}><Typography>Loading...</Typography></Box>;
  if (!vehicle) return <Box sx={{ p: 4 }}><Typography color="error">Vehicle not found.</Typography></Box>;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Vehicle Details</Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <CardMedia
              component="img"
              height="200"
              image={vehicle.image_url || "/images/car.png"}
              alt={vehicle.model}
              sx={{ borderRadius: 2, objectFit: 'cover', width: '100%' }}
            />
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h5">{vehicle.model}</Typography>
            <Typography>Number Plate: {vehicle.number_plate}</Typography>
            <Typography>Capacity: {vehicle.capacity}</Typography>
            <Typography>Status: {vehicle.status}</Typography>
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={() => navigate(`/booking?vehicle=${vehicle.id}`)}>
              Book Now
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Typography variant="h5" gutterBottom>Trip Packages</Typography>
      {packages.length === 0 ? (
        <Typography>No packages for this vehicle.</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {packages.map(pkg => (
            <Grid item xs={12} md={6} key={pkg.id}>
              <Card sx={{ background: '#f5f5f5' }}>
                <CardHeader title={pkg.name} />
                <Divider />
                <CardContent>
                  <Typography variant="subtitle1" color="primary">
                    Rs. {pkg.price.toLocaleString()} / {pkg.price_unit}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Includes: {pkg.included_km} {pkg.km_unit}
                  </Typography>
                  {pkg.description && (
                    <Typography variant="body2" color="text.secondary">
                      {pkg.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* Add link to driver details page if driver info is available */}
      {vehicle && vehicle.driver_id && (
        <Button
          variant="outlined"
          color="primary"
          sx={{ mb: 2 }}
          onClick={() => navigate(`/driver/${vehicle.driver_id}`)}
        >
          View Driver Details
        </Button>
      )}
      <Typography variant="h5" gutterBottom>Vehicle Reviews</Typography>
      {vehicleReviews.length === 0 ? (
        <Typography>No reviews for this vehicle yet.</Typography>
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {vehicleReviews.map((review, idx) => (
            <Grid item xs={12} md={6} key={idx}>
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
