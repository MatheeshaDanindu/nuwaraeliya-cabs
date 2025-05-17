const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize Express app FIRST
const app = express();

// Configure CORS properly
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));  // <-- Only CORS configuration needed
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Test endpoint
app.get('/', (req, res) => {
  res.send('Nuwaraeliya Cabs API is running!');
});

// Vehicles endpoint
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add vehicle
app.post('/api/vehicles', async (req, res) => {
  const { model, number_plate, capacity, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vehicles (model, number_plate, capacity, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [model, number_plate, capacity, status]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update vehicle
app.put('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  const { model, number_plate, capacity, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE vehicles SET model = $1, number_plate = $2, capacity = $3, status = $4 WHERE id = $5 RETURNING *',
      [model, number_plate, capacity, status, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete vehicle (prevent if bookings exist)
app.delete('/api/vehicles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Check for existing bookings
    const bookings = await pool.query('SELECT 1 FROM bookings WHERE vehicle_id = $1 LIMIT 1', [id]);
    if (bookings.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete vehicle with existing bookings.' });
    }
    await pool.query('DELETE FROM vehicles WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Trip Packages Endpoints ---
// Get all packages for a vehicle
app.get('/api/vehicles/:vehicleId/packages', async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM packages WHERE vehicle_id = $1 ORDER BY price',
      [vehicleId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a package for a vehicle
app.post('/api/vehicles/:vehicleId/packages', async (req, res) => {
  const { vehicleId } = req.params;
  const { name, description, price, price_unit, included_km, km_unit } = req.body;
  if (!name || !price || !price_unit || !included_km || !km_unit) {
    return res.status(400).json({ error: 'All fields except description are required.' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO packages (vehicle_id, name, description, price, price_unit, included_km, km_unit) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [vehicleId, name, description || '', price, price_unit, included_km, km_unit]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update a package
app.put('/api/packages/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price, price_unit, included_km, km_unit } = req.body;
  try {
    const result = await pool.query(
      'UPDATE packages SET name = $1, description = $2, price = $3, price_unit = $4, included_km = $5, km_unit = $6 WHERE id = $7 RETURNING *',
      [name, description, price, price_unit, included_km, km_unit, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a package
app.delete('/api/packages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM packages WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get a single package by id
app.get('/api/packages/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM packages WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Package not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Calculate advance payment for a package (e.g., 20% of package price)
function calculateAdvance(packageObj) {
  return Math.round((Number(packageObj.price) * 0.2) * 100) / 100;
}

// Endpoint to get advance payment for a package
app.get('/api/packages/:id/advance', async (req, res) => {
  const { id } = req.params;
  const pkg = await pool.query('SELECT * FROM packages WHERE id = $1', [id]);
  if (!pkg.rows.length) return res.status(404).json({ error: 'Package not found' });
  const advance = calculateAdvance(pkg.rows[0]);
  res.json({ advance });
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, hashedPassword, role]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to get available vehicles for a date range
app.get('/api/vehicles/available', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'Start and end dates required' });
  try {
    // Find vehicles that are available (not booked) for the given range
    const result = await pool.query(`
      SELECT * FROM vehicles v
      WHERE v.status = 'available'
        AND v.id NOT IN (
          SELECT b.vehicle_id FROM bookings b
          WHERE NOT (b.end_time <= $1 OR b.start_time >= $2)
        )
        AND v.id NOT IN (
          SELECT vu.vehicle_id FROM vehicle_unavailability vu
          WHERE NOT (vu.end_time <= $1 OR vu.start_time >= $2)
        )
    `, [start, end]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint to add a vehicle unavailability period
app.post('/api/vehicle-unavailability', async (req, res) => {
  const { vehicle_id, start_time, end_time, reason } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO vehicle_unavailability (vehicle_id, start_time, end_time, reason) VALUES ($1, $2, $3, $4) RETURNING *',
      [vehicle_id, start_time, end_time, reason]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Endpoint to get unavailable vehicles for a date range
app.get('/api/vehicle-unavailability', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) return res.status(400).json({ error: 'Start and end dates required' });
  try {
    const result = await pool.query(
      'SELECT vehicle_id FROM vehicle_unavailability WHERE NOT (end_time <= $1 OR start_time >= $2)',
      [start, end]
    );
    res.json(result.rows.map(r => r.vehicle_id));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a booking
app.post('/api/bookings', async (req, res) => {
  const { vehicle_id, start_time, end_time, user_id, driver_id, package_id } = req.body;
  if (!vehicle_id || !start_time || !end_time || !user_id || !driver_id || !package_id) {
    return res.status(401).json({ error: 'All fields including driver and package are required to book a vehicle.' });
  }
  try {
    // Check for overlapping bookings
    const overlap = await pool.query(
      `SELECT 1 FROM bookings WHERE vehicle_id = $1 AND NOT (end_time <= $2 OR start_time >= $3)`,
      [vehicle_id, start_time, end_time]
    );
    if (overlap.rows.length > 0) {
      return res.status(400).json({ error: 'Vehicle is already booked for the selected time.' });
    }
    // Check for vehicle unavailability
    const unavailable = await pool.query(
      `SELECT 1 FROM vehicle_unavailability WHERE vehicle_id = $1 AND NOT (end_time <= $2 OR start_time >= $3)`,
      [vehicle_id, start_time, end_time]
    );
    if (unavailable.rows.length > 0) {
      return res.status(400).json({ error: 'Vehicle is unavailable for the selected time.' });
    }
    // Get package and calculate advance
    const pkg = await pool.query('SELECT * FROM packages WHERE id = $1', [package_id]);
    if (!pkg.rows.length) return res.status(400).json({ error: 'Invalid package' });
    const advance = calculateAdvance(pkg.rows[0]);
    // Insert booking with advance_paid
    const result = await pool.query(
      'INSERT INTO bookings (vehicle_id, user_id, driver_id, package_id, start_time, end_time, status, advance_paid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [vehicle_id, user_id, driver_id, package_id, start_time, end_time, 'pending', advance]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Admin: Set trip start meter and time
app.put('/api/bookings/:id/start', async (req, res) => {
  const { id } = req.params;
  const { start_meter, actual_start_time } = req.body;
  if (start_meter == null || !actual_start_time) return res.status(400).json({ error: 'Start meter and time required' });
  const result = await pool.query(
    'UPDATE bookings SET start_meter = $1, actual_start_time = $2 WHERE id = $3 RETURNING *',
    [start_meter, actual_start_time, id]
  );
  res.json(result.rows[0]);
});

// Admin: Set trip end meter and time, calculate total fee
app.put('/api/bookings/:id/end', async (req, res) => {
  const { id } = req.params;
  const { end_meter, actual_end_time } = req.body;
  if (end_meter == null || !actual_end_time) return res.status(400).json({ error: 'End meter and time required' });
  // Get booking, package
  const bookingRes = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
  if (!bookingRes.rows.length) return res.status(404).json({ error: 'Booking not found' });
  const booking = bookingRes.rows[0];
  const pkgRes = await pool.query('SELECT * FROM packages WHERE id = $1', [booking.package_id]);
  if (!pkgRes.rows.length) return res.status(400).json({ error: 'Package not found' });
  const pkg = pkgRes.rows[0];
  // Calculate trip details
  const total_km = end_meter - (booking.start_meter || 0);
  let total_hours = (new Date(actual_end_time) - new Date(booking.actual_start_time || booking.start_time)) / (1000 * 60 * 60);
  total_hours = Math.round(total_hours * 100) / 100; // Round to 2 decimal places
  const extra_km = Math.max(0, total_km - (pkg.included_km || 0));
  const extra_hours = Math.max(0, total_hours - (pkg.included_hours || 0));
  const extra_km_fee = extra_km * (pkg.per_km_rate || 0);
  const extra_hour_fee = extra_hours * (pkg.per_hour_rate || 0);
  const total_fee = Number(pkg.price) + extra_km_fee + extra_hour_fee;
  // Update booking
  const result = await pool.query(
    'UPDATE bookings SET end_meter = $1, actual_end_time = $2, total_fee = $3 WHERE id = $4 RETURNING *',
    [end_meter, actual_end_time, total_fee, id]
  );
  res.json({ ...result.rows[0], total_km, total_hours, extra_km, extra_hours, extra_km_fee, extra_hour_fee });
});

// Get user profile
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING id, name, email, phone',
      [name, email, phone, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get users by role (e.g., all drivers)
app.get('/api/users', async (req, res) => {
  const { role } = req.query;
  try {
    if (!role) return res.status(400).json({ error: 'Role is required' });
    const result = await pool.query('SELECT id, name, email FROM users WHERE role = $1', [role]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for a user
app.get('/api/bookings/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      `SELECT b.*, v.model as vehicle_model FROM bookings b JOIN vehicles v ON b.vehicle_id = v.id WHERE b.user_id = $1 ORDER BY b.start_time DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get bookings for a driver (driver schedule)
app.get('/api/bookings/driver/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const result = await pool.query(
      `SELECT b.*, v.model as vehicle_model, u.name as customer_name, u.email as customer_email
       FROM bookings b
       JOIN vehicles v ON b.vehicle_id = v.id
       JOIN users u ON b.user_id = u.id
       WHERE b.driver_id = $1
       ORDER BY b.start_time DESC`,
      [driverId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all bookings (admin)
app.get('/api/bookings', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, v.model as vehicle_model, u.name as user_name, u.email as user_email,
             d.name as driver_name, d.email as driver_email
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      JOIN users u ON b.user_id = u.id
      LEFT JOIN users d ON b.driver_id = d.id
      ORDER BY b.start_time DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status (approve/cancel/complete)
app.put('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'pending', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all availability slots for a driver
app.get('/api/driver-availability/:driverId', async (req, res) => {
  const { driverId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM driver_availability WHERE driver_id = $1 ORDER BY start_time',
      [driverId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new availability slot for a driver
app.post('/api/driver-availability', async (req, res) => {
  const { driver_id, start_time, end_time } = req.body;
  if (!driver_id || !start_time || !end_time) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  try {
    // Check for overlap
    const overlap = await pool.query(
      `SELECT 1 FROM driver_availability WHERE driver_id = $1 AND NOT (end_time <= $2 OR start_time >= $3)`,
      [driver_id, start_time, end_time]
    );
    if (overlap.rows.length > 0) {
      return res.status(400).json({ error: 'This slot overlaps with an existing availability slot.' });
    }
    const result = await pool.query(
      'INSERT INTO driver_availability (driver_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
      [driver_id, start_time, end_time]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update an availability slot (for drag-and-drop/resize)
app.patch('/api/driver-availability/:id', async (req, res) => {
  const { id } = req.params;
  const { start_time, end_time } = req.body;
  if (!start_time || !end_time) {
    return res.status(400).json({ error: 'Start and end time required.' });
  }
  try {
    // Get driver_id for this slot
    const slotRes = await pool.query('SELECT driver_id FROM driver_availability WHERE id = $1', [id]);
    if (slotRes.rows.length === 0) return res.status(404).json({ error: 'Slot not found' });
    const driver_id = slotRes.rows[0].driver_id;
    // Check for overlap (exclude this slot)
    const overlap = await pool.query(
      `SELECT 1 FROM driver_availability WHERE driver_id = $1 AND id != $2 AND NOT (end_time <= $3 OR start_time >= $4)`,
      [driver_id, id, start_time, end_time]
    );
    if (overlap.rows.length > 0) {
      return res.status(400).json({ error: 'This slot overlaps with an existing availability slot.' });
    }
    const result = await pool.query(
      'UPDATE driver_availability SET start_time = $1, end_time = $2 WHERE id = $3 RETURNING *',
      [start_time, end_time, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an availability slot
app.delete('/api/driver-availability/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM driver_availability WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
