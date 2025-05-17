// src/components/VehicleList.js
import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Button, Box, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function VehicleList() {
  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [dates, setDates] = useState({ start: '', end: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        setVehicles(data);
        setFiltered(data.filter(v => v.status === 'available'));
      })
      .catch(error => console.error('Fetch error:', error));
  }, []);

  const handleDateChange = e => {
    const { name, value } = e.target;
    const newDates = { ...dates, [name]: value };
    setDates(newDates);
    if (newDates.start && newDates.end) {
      // Fetch available vehicles for the selected dates
      fetch(`http://localhost:5000/api/vehicles/available?start=${encodeURIComponent(newDates.start)}&end=${encodeURIComponent(newDates.end)}`)
        .then(res => res.json())
        .then(data => setFiltered(data))
        .catch(() => setFiltered([]));
    } else {
      setFiltered(vehicles.filter(v => v.status === 'available'));
    }
  };

  const handleClear = () => {
    setDates({ start: '', end: '' });
    setFiltered(vehicles.filter(v => v.status === 'available'));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Start Date & Time"
          name="start"
          type="datetime-local"
          value={dates.start}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date & Time"
          name="end"
          type="datetime-local"
          value={dates.end}
          onChange={handleDateChange}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" color="secondary" onClick={handleClear} sx={{ alignSelf: 'center', height: 40 }}>
          Clear
        </Button>
      </Box>
      <Grid container spacing={3} sx={{ padding: 4 }}>
        {filtered.map(vehicle => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <Card
              sx={{ cursor: 'pointer' }}
              onClick={() => navigate(`/vehicles/${vehicle.id}`)}
            >
              <CardMedia
                component="img"
                height="160"
                image={vehicle.image_url || "/images/car.png"}
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
                  onClick={e => { e.stopPropagation(); navigate(`/booking?vehicle=${vehicle.id}`); }}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
