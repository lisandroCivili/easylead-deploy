// src/config/db.js
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'easy_lead',
    password: process.env.DB_PASSWORD || 'holachau123',
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;