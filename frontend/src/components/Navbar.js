// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, [location]);

  const isAdmin = user && user.role && user.role.trim().toLowerCase() === 'admin';

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Nuwaraeliya Cabs
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/vehicles">Vehicles</Button>
        <Button color="inherit" component={Link} to="/booking">Book Now</Button>
        <Button color="inherit" component={Link} to="/profile">Profile</Button>
        <Button color="inherit" component={Link} to="/login">Login</Button>
        <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
        {isAdmin && (
          <Button color="inherit" component={Link} to="/vehicle-unavailability-admin">Block Vehicle</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
