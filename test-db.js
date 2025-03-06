import { pool } from './index.js';

async function testDB() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connection successful:', res.rows[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    pool.end();
  }
}

testDB();
