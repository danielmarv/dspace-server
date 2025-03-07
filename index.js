import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';
import dspaceRoutes from './routes/dspaceRoutes.js';
import cors from 'cors'; 

const { Pool } = pkg;

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

export const pool = new Pool({
  user: process.env.DB_USER || 'dspace',
  host: process.env.DB_HOST || '10.10.0.45',
  database: process.env.DB_NAME || 'dspace',
  password: process.env.DB_PASSWORD || 'dspace',
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  } else {
    console.log('Database connection successful:', res.rows[0]);
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the DSpace API!');
});

app.use('/api', dspaceRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
