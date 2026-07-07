require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log('DATABASE_URL present:', Boolean(connectionString));
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const res = await client.query(`SELECT current_database(), current_user, current_schema();`);
    console.log('DB info:', res.rows[0]);
    const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`);
    console.log('Public tables:', tables.rows);
  } catch (error) {
    console.error('DB connection failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
