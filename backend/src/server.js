/**
 * Servidor PlagaControl - Inicia Express y conecta a PostgreSQL
 */
const app = require('./app');
const db = require('./models');

const PORT = process.env.PORT || 3000;
const DB_RETRY_MS = 5000;
const DB_RETRIES = 30;

async function waitForDb() {
  for (let i = 0; i < DB_RETRIES; i++) {
    try {
      await db.sequelize.authenticate();
      return;
    } catch (err) {
      console.warn(`Intento ${i + 1}/${DB_RETRIES}: Base de datos no disponible, reintentando en ${DB_RETRY_MS / 1000}s...`);
      await new Promise((r) => setTimeout(r, DB_RETRY_MS));
    }
  }
  throw new Error('No se pudo conectar a PostgreSQL después de varios intentos.');
}

async function start() {
  await waitForDb();
  console.log('Base de datos PostgreSQL conectada.');
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PlagaControl API escuchando en http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
