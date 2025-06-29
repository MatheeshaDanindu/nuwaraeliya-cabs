// LoginForm component handles user login, validation, and error display
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ForgotPasswordDialog from './ForgotPasswordDialog';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function LoginForm() {
  // State for form fields, error, loading, etc.
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const navigate = useNavigate(); // For redirecting after login

  // Handle input changes
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Toggle password visibility
  const handlePasswordVisibility = () => setShowPassword(v => !v);

  // Toggle remember me checkbox
  const handleRememberMe = e => setRememberMe(e.target.checked);

  // Handle form submission and login logic
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Input validation
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }
        // Redirect based on role
        if (data.user.role && data.user.role.trim().toLowerCase() === 'driver') {
          navigate('/driver-dashboard');
        } else if (data.user.role && data.user.role.trim().toLowerCase() === 'admin') {
          navigate('/AdminDashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        const err = await res.json();
        setError(err.error || 'Invalid credentials');
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
        <Typography variant="h5">Welcome Back!</Typography>
        <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      <form onSubmit={handleSubmit} autoComplete="on">
        <TextField
          label="Email"
          name="email"
          type="email"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.email}
          required
          autoFocus
        />
        <TextField
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.password}
          required
          InputProps={{
            endAdornment: (
              <Button onClick={handlePasswordVisibility} tabIndex={-1} sx={{ minWidth: 0, color: 'inherit' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </Button>
            )
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={handleRememberMe} style={{ marginRight: 8 }} />
          <label htmlFor="rememberMe" style={{ fontSize: 14 }}>Remember Me</label>
          <Button onClick={() => setForgotOpen(true)} size="small" sx={{ ml: 'auto', textTransform: 'none' }}>Forgot Password?</Button>
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
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Don't have an account?{' '}
        <a href="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
          Register here
        </a>
      </Typography>
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Box>
  );
}
