const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Nuwaraeliya Cabs API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/api/vehicles', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM vehicles WHERE status = $1', ['available']);
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const result = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, email, hashedPassword, role]
      );
      res.json({ user: result.rows[0] });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
});

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
  