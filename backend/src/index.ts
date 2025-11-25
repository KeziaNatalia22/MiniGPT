import dotenv from 'dotenv';
// Load environment variables as early as possible so other modules can read them
dotenv.config();

import express from 'express';
import cors from 'cors';
import aiRoute from './routes/ai';
import roomsRoute from './routes/rooms'
import { initDb } from './models'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/ai', aiRoute);
app.use('/api/rooms', roomsRoute)

async function setupDb() {
  try {
    await initDb({ sync: process.env.DB_SYNC === 'true' })
    console.log('DB initialized')
  } catch (e) {
    console.warn('DB init failed (continuing):', e)
  }
}

const PORT = process.env.PORT || 4000;

setupDb().then(() => {
  app.listen(Number(PORT), () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
  });
})
