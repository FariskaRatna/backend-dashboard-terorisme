const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'fariska',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'terorisme',
  password: process.env.DB_PASSWORD || 'open123',
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;