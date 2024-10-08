import env from "dotenv";
import mysql from 'mysql2/promise';
env.config();
const db = await mysql.createConnection(process.env.URL);
try {
  await db.connect()
  console.log('Database connection successful')
} catch (error) {
  console.log('Database connection failed', error);
}
export default db;
