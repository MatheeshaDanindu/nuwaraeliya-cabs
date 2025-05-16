// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link, useLocation } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, [location]);

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setLogoutDialogOpen(false);
    window.location.href = '/login';
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  const isAdmin = user && user.role && user.role.trim().toLowerCase() === 'admin';
  const isDriver = user && user.role && user.role.trim().toLowerCase() === 'driver';
  const isLoggedIn = !!user;

  return (
    <AppBar position="sticky" color="primary" elevation={2}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Nuwaraeliya Cabs
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/vehicles">Vehicles</Button>
        {isLoggedIn && (
          <>
            {!isDriver && <Button color="inherit" component={Link} to="/booking">Book Now</Button>}
            <Button color="inherit" component={Link} to="/profile">Profile</Button>
            <Button color="inherit" component={Link} to={isDriver ? "/driver-dashboard" : "/dashboard"}>Dashboard</Button>
            {isDriver && (
              <Button color="inherit" component={Link} to="/driver-availability">My Unavailability</Button>
            )}
            {isAdmin && (
              <>
                <Button color="inherit" component={Link} to="/vehicle-unavailability-admin">Block Vehicle</Button>
                <Button color="inherit" component={Link} to="/admin-bookings">Manage Bookings</Button>
              </>
            )}
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
            <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
              <DialogTitle>Confirm Logout</DialogTitle>
              <DialogContent>Are you sure you want to log out?</DialogContent>
              <DialogActions>
                <Button onClick={cancelLogout}>Cancel</Button>
                <Button onClick={confirmLogout} color="error" variant="contained">Logout</Button>
              </DialogActions>
            </Dialog>
          </>
        )}
        {!isLoggedIn && (
          <Button color="inherit" component={Link} to="/login">Login</Button>
        )}
      </Toolbar>
    </AppBar>
  );
}
