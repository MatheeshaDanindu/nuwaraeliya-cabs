// Navbar component: top navigation bar with links, user menu, theme toggle, and responsive drawer
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
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useThemeMode } from '../ThemeContext';

// Handles navigation, user authentication menu, and theme switching
export default function Navbar() {
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const notifications = [
    { id: 1, text: 'Booking #123 approved' },
    { id: 2, text: 'New promotion: 10% off!' }
  ];

  useEffect(() => {
    // Only force redirect and clear user on first load after server restart, not on every navigation
    // Use a sessionStorage flag to ensure this only happens once per browser session
    if (!sessionStorage.getItem('initialRedirectDone')) {
      if (window.location.pathname !== '/') {
        window.location.replace('/');
        setUser(null);
        localStorage.removeItem('user');
      }
      sessionStorage.setItem('initialRedirectDone', 'true');
    } else {
      // Normal navigation: just update user state
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    }
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

  const handleAvatarMenu = (event) => setAnchorEl(event.currentTarget);
  const handleAvatarMenuClose = () => setAnchorEl(null);
  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);
  const handleNotifMenu = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifMenuClose = () => setNotifAnchorEl(null);

  const { darkMode, setDarkMode } = useThemeMode();
  const handleThemeToggle = () => setDarkMode((prev) => !prev);

  const isAdmin = user && user.role && user.role.trim().toLowerCase() === 'admin';
  const isDriver = user && user.role && user.role.trim().toLowerCase() === 'driver';
  const isLoggedIn = !!user;

  const theme = useTheme();
  const appliedDarkMode = darkMode;

  const navbarContent = (
    <AppBar position="sticky" color="primary" elevation={2} sx={{ zIndex: 1201 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 1, display: { xs: 'inline-flex', md: 'none' } }} onClick={handleDrawerToggle}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} component={Link} to="/">
          <img src="/logo.jpg" alt="Logo" style={{ height: 32, verticalAlign: 'middle', marginRight: 8 }} />
          Nuwaraeliya Cabs
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', flexGrow: 1 }}>
          <Button color="inherit" component={Link} to="/">Home</Button>
          <Button color="inherit" component={Link} to="/vehicles">Vehicles</Button>
          {isLoggedIn && !isDriver && !isAdmin && <Button color="inherit" component={Link} to="/booking">Book Now</Button>}
          {isAdmin && <Button color="inherit" component={Link} to="/admin-bookings">Manage Bookings</Button>}
          {isAdmin && <Button color="inherit" component={Link} to="/vehicle-unavailability-admin">Block Vehicle</Button>}
          
          
          {isDriver && <Button color="inherit" component={Link} to="/driver-availability">My Unavailability</Button>}
          
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={appliedDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton color="inherit" onClick={handleThemeToggle} aria-label="Toggle dark mode">
              {appliedDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <IconButton color="inherit" onClick={handleNotifMenu} aria-label="Notifications">
            <Badge badgeContent={notifications.length} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifMenuClose}>
            {notifications.length === 0 ? (
              <MenuItem disabled>No notifications</MenuItem>
            ) : notifications.map(n => (
              <MenuItem key={n.id}>{n.text}</MenuItem>
            ))}
          </Menu>
          {isLoggedIn ? (
            <>
              <IconButton color="inherit" onClick={handleAvatarMenu} sx={{ ml: 1 }}>
                <Avatar src={user?.profile_picture_path ? `/uploads/${user.profile_picture_path}` : undefined}>
                  {user?.profile_picture_path ? '' : user?.name?.[0]}
                </Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleAvatarMenuClose}>
                <MenuItem component={Link} to="/profile" onClick={handleAvatarMenuClose}>Profile</MenuItem>
                <MenuItem component={Link} to={isAdmin ? "/AdminDashboard" : isDriver ? "/driver-dashboard" : "/dashboard"} onClick={handleAvatarMenuClose}>Dashboard</MenuItem>
                <MenuItem onClick={() => { handleAvatarMenuClose(); handleLogout(); }}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/login">Login</Button>
          )}
        </Box>
      </Toolbar>
      <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
        <Box sx={{ width: 240 }} role="presentation" onClick={handleDrawerToggle}>
          <List>
            <ListItemButton component={Link} to="/">
              <ListItemIcon><img src="/logo.png" alt="Logo" style={{ height: 24 }} /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton component={Link} to="/vehicles"><ListItemText primary="Vehicles" /></ListItemButton>
            {isLoggedIn && !isDriver && <ListItemButton component={Link} to="/booking"><ListItemText primary="Book Now" /></ListItemButton>}
            {isLoggedIn && <ListItemButton component={Link} to="/profile"><ListItemText primary="Profile" /></ListItemButton>}
            {isLoggedIn && <ListItemButton component={Link} to={isAdmin ? "/admin-dashboard" : isDriver ? "/driver-dashboard" : "/dashboard"}><ListItemText primary="Dashboard" /></ListItemButton>}
            {isDriver && <ListItemButton component={Link} to="/driver-dashboard"><ListItemText primary="Driver Dashboard" /></ListItemButton>}
            {isDriver && <ListItemButton component={Link} to="/driver-availability"><ListItemText primary="My Unavailability" /></ListItemButton>}
            {isDriver && <ListItemButton component={Link} to="/admin-bookings"><ListItemText primary="My Bookings" /></ListItemButton>}
            {isAdmin && <ListItemButton component={Link} to="/admin-dashboard"><ListItemText primary="Admin Dashboard" /></ListItemButton>}
            {isAdmin && <ListItemButton component={Link} to="/admin-bookings"><ListItemText primary="Manage Bookings" /></ListItemButton>}
            {isAdmin && <ListItemButton component={Link} to="/vehicle-unavailability-admin"><ListItemText primary="Block Vehicle" /></ListItemButton>}
            {isAdmin && <ListItemButton component={Link} to="/vehicles"><ListItemText primary="Manage Vehicles" /></ListItemButton>}
            {isAdmin && <ListItemButton component={Link} to="/dashboard"><ListItemText primary="Analytics" /></ListItemButton>}
            {isLoggedIn && <ListItemButton onClick={handleLogout}><ListItemText primary="Logout" /></ListItemButton>}
            {!isLoggedIn && <ListItemButton component={Link} to="/login"><ListItemText primary="Login" /></ListItemButton>}
          </List>
        </Box>
      </Drawer>
      <Dialog open={logoutDialogOpen} onClose={cancelLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={cancelLogout}>Cancel</Button>
          <Button onClick={confirmLogout} color="error" variant="contained">Logout</Button>
        </DialogActions>
      </Dialog>
    </AppBar>
  );

  return navbarContent;
}
