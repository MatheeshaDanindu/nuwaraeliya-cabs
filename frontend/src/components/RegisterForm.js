// RegisterForm component: handles user registration, validation, and file uploads
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default function RegisterForm() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [addressFile, setAddressFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [addressPreview, setAddressPreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'name') {
      // Only allow letters and spaces
      if (!/^[a-zA-Z\s]*$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
  };

  const handlePasswordChange = e => {
    const value = e.target.value;
    setForm(f => ({ ...f, password: value }));
    // Password strength logic
    if (value.length < 6) setPasswordStrength('Weak');
    else if (value.match(/[A-Z]/) && value.match(/[0-9]/) && value.length >= 8) setPasswordStrength('Strong');
    else setPasswordStrength('Medium');
  };

  const handleIdFile = e => {
    const file = e.target.files[0];
    setIdFile(file);
    setIdPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleAddressFile = e => {
    const file = e.target.files[0];
    setAddressFile(file);
    setAddressPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleProfileFile = e => {
    const file = e.target.files[0];
    setProfileFile(file);
    setProfilePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Input validation
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(form.name.trim())) {
      setError('Name can only contain letters and spaces.');
      return;
    }
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!idFile) {
      setError('Please upload a copy of your ID card.');
      return;
    }
    if (!addressFile) {
      setError('Please upload a document that proves your address.');
      return;
    }
    if (!profileFile) {
      setError('Please upload a profile picture.');
      return;
    }
    if (!agreed) {
      setError('You must agree to the Terms and Privacy Policy.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('email', form.email);
      formData.append('password', form.password);
      formData.append('id_card', idFile);
      formData.append('address_proof', addressFile);
      formData.append('profile_picture', profileFile);
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setSuccess('Registration submitted! Awaiting admin approval.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const err = await res.json();
        setError(err.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <img src="/logo.jpg" alt="Nuwara Eliya Cabs Logo" style={{ width: 64, marginBottom: 8 }} />
        <Typography variant="h5">Create Your Account</Typography>
        <Typography variant="body2" color="text.secondary">Join Nuwara Eliya Cabs for the best ride experience</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ my: 2 }}>{success}</Alert>}
      <form onSubmit={handleSubmit} autoComplete="on" encType="multipart/form-data">
        <TextField
          label="Name"
          name="name"
          type="text"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.name}
          required
          autoFocus
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.email}
          required
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          onChange={handlePasswordChange}
          value={form.password}
          required
          InputProps={{
            
          }}
        />
        {form.password && (
          <Typography variant="caption" sx={{ color: passwordStrength === 'Strong' ? 'green' : passwordStrength === 'Medium' ? 'orange' : 'red', ml: 1 }}>
            Password strength: {passwordStrength}
          </Typography>
        )}
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.confirmPassword}
          required
          InputProps={{
            
          }}
        />
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Upload ID Card (NIC/Passport)</Typography>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
            {idFile ? 'Change File' : 'Upload File'}
            <input type="file" accept="image/*,application/pdf" hidden onChange={handleIdFile} />
          </Button>
          {idPreview && <Box sx={{ mt: 1 }}><img src={idPreview} alt="ID Preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4 }} /></Box>}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Upload Address Proof (Utility Bill, Bank Statement, etc.)</Typography>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
            {addressFile ? 'Change File' : 'Upload File'}
            <input type="file" accept="image/*,application/pdf" hidden onChange={handleAddressFile} />
          </Button>
          {addressPreview && <Box sx={{ mt: 1 }}><img src={addressPreview} alt="Address Preview" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4 }} /></Box>}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2">Upload Profile Picture</Typography>
          <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} sx={{ mt: 1 }}>
            {profileFile ? 'Change File' : 'Upload File'}
            <input type="file" accept="image/*" hidden onChange={handleProfileFile} />
          </Button>
          {profilePreview && <Box sx={{ mt: 1 }}><img src={profilePreview} alt="Profile Preview" style={{ maxWidth: 80, maxHeight: 80, borderRadius: '50%' }} /></Box>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginRight: 8 }} />
          <label htmlFor="agree" style={{ fontSize: 14 }}>
            I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms</a> and <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
          </label>
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
          Login here
        </a>
      </Typography>
    </Box>
  );
}
