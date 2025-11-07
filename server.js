const express = require("express");
const { Pool } = require("pg");
const app = express();
const port = 8080;

// Variables de entorno
const dbHost = process.env.DB_HOST || "localhost";
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || "retodb";
const dbUser = process.env.DB_USER || "reto_user";
const dbPassword = process.env.DB_PASSWORD || "reto_pass";

// Conexión a Postgres
const pool = new Pool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

app.get("/mensaje", async (req, res) => {
  try {
    const result = await pool.query("SELECT texto FROM mensajes LIMIT 1");
    if (result.rows.length > 0) {
      res.json({ texto: result.rows[0].texto });
    } else {
      res.json({ texto: "No hay mensaje en la base de datos aún." });
    }
  } catch (err) {
    console.error("Error al consultar DB:", err);
    res.json({ texto: "Error al conectar con la base de datos." });
  }
});

app.listen(port, () => {
  console.log(`Backend-data escuchando en puerto ${port}`);
});