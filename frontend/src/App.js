import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './components/Dashboard';
import VehicleUnavailabilityAdmin from './pages/VehicleUnavailabilityAdmin';
import AdminBookings from './pages/AdminBookings';
import DriverDashboard from './pages/DriverDashboard';
import DriverAvailability from './pages/DriverAvailability';
import VehicleDetails from './pages/VehicleDetails';
import DriverDetails from './pages/DriverDetails';
import Success from './pages/success';
import Footer from './components/Footer';

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data));
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vehicles" element={<Vehicles />} />
        <Route path="/vehicles/:id" element={<VehicleDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vehicle-unavailability-admin" element={<VehicleUnavailabilityAdmin />} />
        <Route path="/admin-bookings" element={<AdminBookings />} />
        <Route path="/driver-dashboard" element={<DriverDashboard />} />
        <Route path="/driver/:id" element={<DriverDetails />} />
        <Route path="/driver-availability" element={<DriverAvailability />} />
        <Route path ="/success" element={<Success />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
