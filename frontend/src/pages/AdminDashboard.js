// src/pages/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, MenuItem, Card, CardContent, CardHeader, Divider, Snackbar, Alert as MuiAlert, Dialog as MuiDialog } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ model: '', number_plate: '', capacity: '', status: 'available' });
  const [selectedId, setSelectedId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [driverForm, setDriverForm] = useState({ name: '', email: '', password: '' });
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [driverError, setDriverError] = useState('');
  const [driverSuccess, setDriverSuccess] = useState('');
  const [driverProfileFile, setDriverProfileFile] = useState(null);
  const [driverProfilePreview, setDriverProfilePreview] = useState(null);

  // --- Package Management State ---
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [packages, setPackages] = useState([]);
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [packageEditMode, setPackageEditMode] = useState(false);
  const [packageForm, setPackageForm] = useState({
    id: null, name: '', description: '', price: '', price_unit: 'Day', included_km: '', km_unit: 'Day'
  });
  const [packageError, setPackageError] = useState('');
  const [packageSuccess, setPackageSuccess] = useState('');
  const [packageDeleteDialog, setPackageDeleteDialog] = useState({ open: false, id: null });

  // --- Admin Reports State ---
  const [report, setReport] = useState({ totalBookings: 0, totalCancellations: 0, totalRevenue: 0 });
  const [vehicleUsage, setVehicleUsage] = useState([]);
  const [reportLoading, setReportLoading] = useState(true);
  const [reportError, setReportError] = useState('');

  // --- Analytics Period State ---
  const [analyticsPeriod, setAnalyticsPeriod] = useState('all'); // 'all', 'month', 'quarter', 'year'

  // --- Pending Customers State ---
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [actionError, setActionError] = useState({});

  useEffect(() => {
    fetchVehicles();
  }, [open]); // Refetch vehicles whenever dialog closes (after add/edit)

  useEffect(() => {
    async function fetchReports() {
      setReportLoading(true);
      setReportError('');
      try {
        const periodParam = analyticsPeriod !== 'all' ? `?period=${analyticsPeriod}` : '';
        const summaryRes = await fetch(`http://localhost:5000/api/reports/summary${periodParam}`);
        const usageRes = await fetch(`http://localhost:5000/api/reports/vehicle-usage${periodParam}`);
        if (!summaryRes.ok || !usageRes.ok) throw new Error('Failed to fetch reports');
        setReport(await summaryRes.json());
        setVehicleUsage(await usageRes.json());
      } catch (e) {
        setReportError('Failed to load reports');
      }
      setReportLoading(false);
    }
    fetchReports();
  }, [analyticsPeriod]);

  useEffect(() => {
    async function fetchPending() {
      setPendingLoading(true);
      setPendingError('');
      try {
        const res = await fetch('http://localhost:5000/api/users/pending');
        if (!res.ok) throw new Error('Failed to fetch pending users');
        setPendingUsers(await res.json());
      } catch (e) {
        setPendingError('Failed to load pending customers');
      }
      setPendingLoading(false);
    }
    fetchPending();
  }, []);

  const fetchVehicles = async () => {
    const res = await fetch('http://localhost:5000/api/vehicles');
    if (res.ok) setVehicles(await res.json());
  };

  const handleOpen = (vehicle = null) => {
    if (vehicle) {
      setEditMode(true);
      setForm({
        model: vehicle.model || '',
        number_plate: vehicle.number_plate || '',
        capacity: vehicle.capacity || '',
        status: vehicle.status || 'available'
      });
      setSelectedId(vehicle.id);
    } else {
      setEditMode(false);
      setForm({ model: '', number_plate: '', capacity: '', status: 'available' });
      setSelectedId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ model: '', number_plate: '', capacity: '', status: 'available' });
    setSelectedId(null);
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const vehicleData = { ...form, capacity: parseInt(form.capacity, 10) };
    try {
      let res;
      if (editMode) {
        res = await fetch(`http://localhost:5000/api/vehicles/${selectedId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
      } else {
        res = await fetch('http://localhost:5000/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
      }
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to save vehicle.');
        return;
      }
      fetchVehicles();
      handleClose();
    } catch (e) {
      alert('Network error. Could not save vehicle.');
    }
  };

  const handleDeleteRequest = id => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/vehicles/${deleteId}`, { method: 'DELETE' });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Failed to delete vehicle.');
      }
    } catch (e) {
      alert('Network error. Could not delete vehicle.');
    }
    setDeleteDialogOpen(false);
    setDeleteId(null);
    fetchVehicles();
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteId(null);
  };

  const handleDriverFormChange = e => setDriverForm({ ...driverForm, [e.target.name]: e.target.value });

  const handleDriverProfileFile = e => {
    const file = e.target.files[0];
    setDriverProfileFile(file);
    setDriverProfilePreview(file ? URL.createObjectURL(file) : null);
  };

  const openDriverDialog = () => {
    setDriverForm({ name: '', email: '', password: '' });
    setDriverError('');
    setDriverSuccess('');
    setDriverProfileFile(null);
    setDriverProfilePreview(null);
    setDriverDialogOpen(true);
  };

  const closeDriverDialog = () => setDriverDialogOpen(false);

  const handleAddDriver = async e => {
    e.preventDefault();
    setDriverError('');
    setDriverSuccess('');
    if (!driverForm.name || !driverForm.email || !driverForm.password) {
      setDriverError('All fields are required.');
      return;
    }
    if (!driverProfileFile) {
      setDriverError('Profile picture is required.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', driverForm.name);
      formData.append('email', driverForm.email);
      formData.append('password', driverForm.password);
      formData.append('role', 'driver');
      formData.append('profile_picture', driverProfileFile);
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setDriverSuccess('Driver added successfully!');
        setDriverForm({ name: '', email: '', password: '' });
        setDriverProfileFile(null);
        setDriverProfilePreview(null);
      } else {
        const err = await res.json();
        setDriverError(err.error || 'Failed to add driver.');
      }
    } catch {
      setDriverError('Network error.');
    }
  };

  const handleApprove = async (userId) => {
    setActionLoading(a => ({ ...a, [userId]: 'approve' }));
    setActionError(a => ({ ...a, [userId]: '' }));
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve user');
      setPendingUsers(users => users.filter(u => u.id !== userId));
    } catch (e) {
      setActionError(a => ({ ...a, [userId]: 'Failed to approve user' }));
    }
    setActionLoading(a => ({ ...a, [userId]: null }));
  };

  const handleReject = async (userId) => {
    if (!window.confirm('Are you sure you want to reject and delete this customer?')) return;
    setActionLoading(a => ({ ...a, [userId]: 'reject' }));
    setActionError(a => ({ ...a, [userId]: '' }));
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/reject`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reject user');
      setPendingUsers(users => users.filter(u => u.id !== userId));
    } catch (e) {
      setActionError(a => ({ ...a, [userId]: 'Failed to reject user' }));
    }
    setActionLoading(a => ({ ...a, [userId]: null }));
  };

  // Fetch packages for selected vehicle
  useEffect(() => {
    if (!selectedVehicleId) { setPackages([]); return; }
    fetch(`http://localhost:5000/api/vehicles/${selectedVehicleId}/packages`)
      .then(res => res.json())
      .then(data => setPackages(Array.isArray(data) ? data : []));
  }, [selectedVehicleId, packageDialogOpen]);

  // Handlers for package management
  const handleVehicleSelect = e => setSelectedVehicleId(e.target.value);
  const handlePackageDialogOpen = (pkg = null) => {
    if (pkg) {
      setPackageEditMode(true);
      setPackageForm({ ...pkg, price: pkg.price, included_km: pkg.included_km });
    } else {
      setPackageEditMode(false);
      setPackageForm({ id: null, name: '', description: '', price: '', price_unit: 'Day', included_km: '', km_unit: 'Day' });
    }
    setPackageError('');
    setPackageDialogOpen(true);
  };
  const handlePackageDialogClose = () => setPackageDialogOpen(false);
  const handlePackageFormChange = e => setPackageForm({ ...packageForm, [e.target.name]: e.target.value });
  const handlePackageDelete = id => {
    setPackageDeleteDialog({ open: true, id });
  };
  const confirmPackageDelete = async () => {
    const id = packageDeleteDialog.id;
    await fetch(`http://localhost:5000/api/packages/${id}`, { method: 'DELETE' });
    setPackages(pkgs => pkgs.filter(p => p.id !== id));
    setPackageDeleteDialog({ open: false, id: null });
    setPackageSuccess('Package deleted successfully!');
  };
  const cancelPackageDelete = () => setPackageDeleteDialog({ open: false, id: null });
  const handlePackageSubmit = async e => {
    e.preventDefault();
    setPackageError('');
    setPackageSuccess('');
    if (!packageForm.name || !packageForm.price || !packageForm.price_unit || !packageForm.included_km || !packageForm.km_unit) {
      setPackageError('All fields except description are required.');
      return;
    }
    if (Number(packageForm.price) <= 0 || Number(packageForm.included_km) <= 0) {
      setPackageError('Price and Included KM must be positive numbers.');
      return;
    }
    const payload = {
      name: packageForm.name,
      description: packageForm.description,
      price: packageForm.price,
      price_unit: packageForm.price_unit,
      included_km: packageForm.included_km,
      km_unit: packageForm.km_unit
    };
    let res;
    if (packageEditMode) {
      res = await fetch(`http://localhost:5000/api/packages/${packageForm.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`http://localhost:5000/api/vehicles/${selectedVehicleId}/packages`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
    }
    if (res.ok) {
      setPackageDialogOpen(false);
      setPackageSuccess(packageEditMode ? 'Package updated successfully!' : 'Package added successfully!');
    } else {
      const err = await res.json();
      setPackageError(err.error || 'Failed to save package.');
    }
  };

  // --- CSV & PDF Export Functions ---
  function downloadCSV(data, filename) {
    const csvRows = [];
    // Header
    csvRows.push('Vehicle,Bookings');
    // Data
    data.forEach(row => {
      csvRows.push(`${row.model},${row.booking_count}`);
    });
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function downloadPDF(data, filename) {
    const doc = new jsPDF();
    // Ensure autoTable is available
    if (typeof doc.autoTable !== 'function') {
      alert('PDF export failed: autoTable is not available. Please check jsPDF-Autotable installation.');
      return;
    }
    doc.text('Vehicle Usage Report', 14, 16);
    doc.autoTable({
      startY: 22,
      head: [['Vehicle', 'Bookings']],
      body: data.map(row => [row.model, row.booking_count]),
    });
    doc.save(filename);
  }

  // --- Chart Data Preparation ---
  const bookingsData = {
    labels: ['Total Bookings', 'Total Cancellations'],
    datasets: [
      {
        label: 'Bookings',
        data: [report.totalBookings, report.totalCancellations],
        backgroundColor: ['#1976d2', '#e53935'],
      },
    ],
  };
  const revenueData = {
    labels: ['Revenue'],
    datasets: [
      {
        label: 'Total Revenue',
        data: [report.totalRevenue],
        backgroundColor: ['#43a047'],
      },
    ],
  };
  const vehicleUsageData = {
    labels: vehicleUsage.map(v => v.model),
    datasets: [
      {
        label: 'Bookings',
        data: vehicleUsage.map(v => v.booking_count),
        backgroundColor: vehicleUsage.map((_, i) => `hsl(${i * 40}, 70%, 60%)`),
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Admin Dashboard</Typography>
      {/* --- Pending Customers Section --- */}
      <Box sx={{ mb: 4, p: 2, background: '#fffbe6', borderRadius: 2, border: '1px solid #ffe082' }}>
        <Typography variant="h5" gutterBottom>Pending Customer Approvals</Typography>
        {pendingLoading ? (
          <Typography>Loading pending customers...</Typography>
        ) : pendingError ? (
          <Typography color="error">{pendingError}</Typography>
        ) : pendingUsers.length === 0 ? (
          <Typography>No pending customers.</Typography>
        ) : (
          <Grid container spacing={2}>
            {pendingUsers.map(user => (
              <Grid item xs={12} md={6} lg={4} key={user.id}>
                <Paper sx={{ p: 2, mb: 2 }} elevation={3}>
                  <Typography variant="subtitle1"><b>{user.name}</b></Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{user.email}</Typography>
                  <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    <Box>
                      <Typography variant="caption">ID Card:</Typography><br />
                      <img src={`http://localhost:5000/uploads/${user.id_card_path}`} alt="ID Card" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4, border: '1px solid #ccc' }} />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        href={`http://localhost:5000/uploads/${user.id_card_path}`}
                        download={user.id_card_path}
                      >
                        Download
                      </Button>
                    </Box>
                    <Box>
                      <Typography variant="caption">Address Proof:</Typography><br />
                      <img src={`http://localhost:5000/uploads/${user.address_proof_path}`} alt="Address Proof" style={{ maxWidth: 120, maxHeight: 80, borderRadius: 4, border: '1px solid #ccc' }} />
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                        href={`http://localhost:5000/uploads/${user.address_proof_path}`}
                        download={user.address_proof_path}
                      >
                        Download
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      disabled={actionLoading[user.id] === 'approve'}
                      onClick={() => handleApprove(user.id)}
                    >
                      {actionLoading[user.id] === 'approve' ? 'Approving...' : 'Approve'}
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      disabled={actionLoading[user.id] === 'reject'}
                      onClick={() => handleReject(user.id)}
                    >
                      {actionLoading[user.id] === 'reject' ? 'Rejecting...' : 'Reject'}
                    </Button>
                  </Box>
                  {actionError[user.id] && <Typography color="error" sx={{ mt: 1 }}>{actionError[user.id]}</Typography>}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      {/* --- Reports Section --- */}
      <Box sx={{ mb: 4, p: 2, background: '#f5f5f5', borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>Reports</Typography>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Analytics Period"
            value={analyticsPeriod}
            onChange={e => setAnalyticsPeriod(e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="all">All Time</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="quarter">This Quarter</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </TextField>
          <Button variant="outlined" color="primary" onClick={() => downloadCSV(vehicleUsage, 'vehicle-usage-report.csv')}>Download CSV</Button>
        </Box>
        {reportLoading ? (
          <Typography>Loading reports...</Typography>
        ) : reportError ? (
          <Typography color="error">{reportError}</Typography>
        ) : (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography>Total Bookings vs Cancellations</Typography>
                  <Bar data={bookingsData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} height={180} />
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography>Total Revenue</Typography>
                  <Doughnut data={revenueData} options={{ plugins: { legend: { display: false } } }} height={180} />
                  <Typography variant="h6" sx={{ mt: 2 }}>Rs. {Number(report.totalRevenue).toLocaleString()}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography>Vehicle Usage</Typography>
                  <Pie data={vehicleUsageData} options={{ plugins: { legend: { display: true } } }} height={180} />
                </Paper>
              </Grid>
            </Grid>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Vehicle Usage Table</Typography>
            <Paper sx={{ p: 2, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th style={{ textAlign: 'left', padding: 8 }}>Vehicle</th>
                    <th style={{ textAlign: 'left', padding: 8 }}>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleUsage.map(v => (
                    <tr key={v.id}>
                      <td style={{ padding: 8 }}>{v.model}</td>
                      <td style={{ padding: 8 }}>{v.booking_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Paper>
          </>
        )}
      </Box>
      <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handleOpen()}>
        Add Vehicle
      </Button>
      <Button variant="contained" color="secondary" sx={{ mb: 2, ml: 2 }} onClick={openDriverDialog}>
        Add Driver
      </Button>
      <Grid container spacing={2}>
        {vehicles.map(vehicle => (
          <Grid item xs={12} sm={6} md={4} key={vehicle.id}>
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">{vehicle.model}</Typography>
              <Typography>Seats: {vehicle.capacity}</Typography>
              <Typography>Status: {vehicle.status}</Typography>
              <Box sx={{ mt: 1 }}>
                <IconButton color="primary" onClick={() => handleOpen(vehicle)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={() => handleDeleteRequest(vehicle.id)}><DeleteIcon /></IconButton>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editMode ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField label="Model" name="model" value={form.model} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Number Plate" name="number_plate" value={form.number_plate} onChange={handleChange} fullWidth margin="normal" required />
            <TextField label="Capacity" name="capacity" value={form.capacity} onChange={handleChange} fullWidth margin="normal" required />
            <TextField
              select
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            >
              <MenuItem value="available">Available</MenuItem>
              <MenuItem value="unavailable">Unavailable</MenuItem>
              <MenuItem value="maintenance">Maintenance</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">{editMode ? 'Update' : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this vehicle?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={driverDialogOpen} onClose={closeDriverDialog}>
        <DialogTitle>Add Driver</DialogTitle>
        <form onSubmit={handleAddDriver} encType="multipart/form-data">
          <DialogContent>
            <TextField label="Name" name="name" value={driverForm.name} onChange={handleDriverFormChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={driverForm.email} onChange={handleDriverFormChange} fullWidth margin="normal" required />
            <TextField label="Password" name="password" type="password" value={driverForm.password} onChange={handleDriverFormChange} fullWidth margin="normal" required />
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Upload Profile Picture</Typography>
              <Button component="label" variant="outlined" sx={{ mt: 1 }}>
                {driverProfileFile ? 'Change File' : 'Upload File'}
                <input type="file" accept="image/*" hidden onChange={handleDriverProfileFile} />
              </Button>
              {driverProfilePreview && <Box sx={{ mt: 1 }}><img src={driverProfilePreview} alt="Profile Preview" style={{ maxWidth: 80, maxHeight: 80, borderRadius: '50%' }} /></Box>}
            </Box>
            {driverError && <div style={{ color: 'red' }}>{driverError}</div>}
            {driverSuccess && <div style={{ color: 'green' }}>{driverSuccess}</div>}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDriverDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Add</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* --- Admin Package Management --- */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" gutterBottom>Manage Packages</Typography>
        <TextField
          select
          label="Select Vehicle"
          value={selectedVehicleId}
          onChange={handleVehicleSelect}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">-- Select a vehicle --</MenuItem>
          {vehicles.map(v => (
            <MenuItem key={v.id} value={v.id}>{v.model} ({v.number_plate})</MenuItem>
          ))}
        </TextField>
        {selectedVehicleId && (
          <Box>
            <Button variant="contained" color="primary" sx={{ mb: 2 }} onClick={() => handlePackageDialogOpen()}>Add Package</Button>
            {packages.length === 0 ? (
              <Typography>No packages for this vehicle.</Typography>
            ) : (
              <Grid container spacing={2}>
                {packages.map(pkg => (
                  <Grid item xs={12} md={6} key={pkg.id}>
                    <Card sx={{ background: '#f5f5f5' }}>
                      <CardHeader title={pkg.name} action={
                        <span>
                          <IconButton color="primary" onClick={() => handlePackageDialogOpen(pkg)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handlePackageDelete(pkg.id)}><DeleteIcon /></IconButton>
                        </span>
                      } />
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
          </Box>
        )}
        {/* Package Add/Edit Dialog */}
        <Dialog open={packageDialogOpen} onClose={handlePackageDialogClose}>
          <DialogTitle>{packageEditMode ? 'Edit Package' : 'Add Package'}</DialogTitle>
          <form onSubmit={handlePackageSubmit}>
            <DialogContent>
              <TextField label="Name" name="name" value={packageForm.name} onChange={handlePackageFormChange} fullWidth margin="normal" required />
              <TextField label="Description" name="description" value={packageForm.description} onChange={handlePackageFormChange} fullWidth margin="normal" />
              <TextField label="Price" name="price" type="number" value={packageForm.price} onChange={handlePackageFormChange} fullWidth margin="normal" required />
              <TextField label="Price Unit" name="price_unit" value={packageForm.price_unit} onChange={handlePackageFormChange} fullWidth margin="normal" required select>
                <MenuItem value="Day">Day</MenuItem>
                <MenuItem value="Hour">Hour</MenuItem>
                <MenuItem value="Trip">Trip</MenuItem>
              </TextField>
              <TextField label="Included KM" name="included_km" type="number" value={packageForm.included_km} onChange={handlePackageFormChange} fullWidth margin="normal" required />
              <TextField label="KM Unit" name="km_unit" value={packageForm.km_unit} onChange={handlePackageFormChange} fullWidth margin="normal" required select>
                <MenuItem value="Day">Day</MenuItem>
                <MenuItem value="Trip">Trip</MenuItem>
              </TextField>
              {packageError && <Typography color="error">{packageError}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={handlePackageDialogClose}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">{packageEditMode ? 'Update' : 'Add'}</Button>
            </DialogActions>
          </form>
        </Dialog>
        <MuiDialog open={packageDeleteDialog.open} onClose={cancelPackageDelete}>
          <DialogTitle>Delete Package</DialogTitle>
          <DialogContent>Are you sure you want to delete this package?</DialogContent>
          <DialogActions>
            <Button onClick={cancelPackageDelete}>Cancel</Button>
            <Button onClick={confirmPackageDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </MuiDialog>
        <Snackbar open={!!packageSuccess} autoHideDuration={3000} onClose={() => setPackageSuccess('')} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <MuiAlert onClose={() => setPackageSuccess('')} severity="success" sx={{ width: '100%' }}>
            {packageSuccess}
          </MuiAlert>
        </Snackbar>
      </Box>
    </Box>
  );
}
