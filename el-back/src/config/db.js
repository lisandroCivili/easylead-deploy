const { Pool } = require('pg');
require('dotenv').config();

// En la nube usamos DATABASE_URL, en local usamos las variables sueltas
const pool = new Pool(
    process.env.DATABASE_URL 
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false } // Requisito de DigitalOcean para conexiones seguras
          }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
          }
);

module.exports = pool;