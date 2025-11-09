const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 8080;

// Pool de conexión a la BD usando las vars de entorno
const pool = new Pool({
  host: process.env.DB_HOST,     // database-svc
  port: process.env.DB_PORT,     // 5432
  database: process.env.DB_NAME, // retodb
  user: process.env.DB_USER,     // reto_user
  password: process.env.DB_PASSWORD, // reto_pass
});

// Función para inicializar la BD (crear tabla y registro si no existen)
async function initDb() {
  // 1) Crear tabla si no existe
  await pool.query(`
    CREATE TABLE IF NOT EXISTS mensajes (
      id SERIAL PRIMARY KEY,
      texto VARCHAR(255)
    )
  `);

  // 2) Comprobar si ya hay datos
  const res = await pool.query('SELECT COUNT(*) AS total FROM mensajes');
  const total = parseInt(res.rows[0].total, 10);

  // 3) Si está vacía, insertar un mensaje por defecto
  if (total === 0) {
    await pool.query(
      'INSERT INTO mensajes (texto) VALUES ($1)',
      ['Hola desde backend-data (mensaje traído desde PostgreSQL)']
    );
  }

  console.log('Base de datos inicializada correctamente');
}

// Endpoint que leerá el mensaje desde la BD
app.get('/mensaje', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT texto FROM mensajes ORDER BY id LIMIT 1'
    );

    if (result.rows.length === 0) {
      return res.json({ texto: 'No hay mensajes en la base de datos.' });
    }

    res.json({ texto: result.rows[0].texto });
  } catch (err) {
    console.error('Error consultando la BD:', err);
    res.status(500).json({ texto: 'Error al consultar la base de datos.' });
  }
});

// Arrancar servidor y luego inicializar la BD
app.listen(port, () => {
  console.log(`backend-data escuchando en puerto ${port}`);
  initDb().catch(err => {
    console.error('Error inicializando la BD:', err);
  });
});