import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import dspaceRoutes from './routes/dspaceRoutes.js';

const { Pool } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL database connection
export const pool = new Pool({
  user: process.env.DB_USER || 'dspace',
  host: process.env.DB_HOST || '10.10.0.45',
  database: process.env.DB_NAME || 'dspace',
  password: process.env.DB_PASSWORD || 'dspace',
  port: process.env.DB_PORT || 5432,
});

// Test the database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1); // Exit if the database connection fails
  } else {
    console.log('Database connection successful:', res.rows[0]);
  }
});

// Middleware
app.use(express.json());

// Root route (optional, to avoid the "Cannot GET /" error)
app.get('/', (req, res) => {
  res.send('Welcome to the DSpace API!');
});

// Import routes
app.use('/api', dspaceRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
