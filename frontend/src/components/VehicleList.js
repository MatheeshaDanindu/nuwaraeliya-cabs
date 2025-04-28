// src/components/VehicleList.js
import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button } from '@mui/material';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => setVehicles(data))
      .catch(error => console.error('Fetch error:', error));
  }, []);

  return (
    <Grid container spacing={3} sx={{ padding: 4 }}>
      {vehicles.map(vehicle => (
        <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
          <Card>
            <CardMedia
              component="img"
              height="160"
              image={vehicle.image_url || "/car-placeholder.jpg"}
              alt={vehicle.model}
            />
            <CardContent>
              <Typography variant="h6">{vehicle.model}</Typography>
              <Typography color="text.secondary">Seats: {vehicle.capacity}</Typography>
              <Typography color={vehicle.status === 'available' ? 'green' : 'red'}>
                {vehicle.status.charAt(0).toUpperCase() + vehicle.status.slice(1)}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                href={`/booking?vehicle=${vehicle.id}`}
                disabled={vehicle.status !== 'available'}
                sx={{ mt: 2 }}
              >
                Book Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
