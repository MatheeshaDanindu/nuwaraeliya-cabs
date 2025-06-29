
// Database connection pool for PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Create a new pool using environment variables for credentials
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Export the pool for use in other modules
module.exports = pool;
